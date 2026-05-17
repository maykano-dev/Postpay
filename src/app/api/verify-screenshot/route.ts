import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getPlatformPrompt } from '@/lib/prompts'
import { analyzeMetadata } from '@/lib/forensics/metadata'
import { computeForensicsScore } from '@/lib/forensics/scorer'
import { PLATFORM_FRAUD_THRESHOLDS } from '@/types'
import type { AdPlatform, GeminiAuditResponse } from '@/types'

export async function POST(req: Request) {
  try {
    const { slotId, screenshotUrl, screenshotHash, platform } = await req.json()

    if (!platform) {
      return Response.json({ error: 'Platform is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // ── Check if user is authenticated ───────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Verify that the user owns this slot ──────────────────
    const { data: slot } = await supabase
      .from('ad_slots')
      .select('broadcaster_id')
      .eq('id', slotId)
      .single()

    if (!slot || slot.broadcaster_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── 1. Duplicate screenshot check ───────────────────────
    const { data: dupe } = await supabase
      .from('verifications')
      .select('id')
      .eq('screenshot_hash', screenshotHash)
      .single()

    if (dupe) {
      return Response.json(
        { error: 'Duplicate screenshot. This image has already been submitted.' },
        { status: 400 }
      )
    }

    // ── 2. Fetch image ───────────────────────────────────────
    const imgResponse = await fetch(screenshotUrl)
    if (!imgResponse.ok) {
      return Response.json({ error: 'Failed to fetch screenshot' }, { status: 400 })
    }

    const imageBuffer = await imgResponse.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg'

    // ── 3. Run all three forensics layers in parallel ────────
    const [elaResult, metadataResult, geminiResult] = await Promise.allSettled([
      // Layer 1: ELA (calls our Python Netlify Function)
      runELA(base64),
      // Layer 2: Metadata forensics (runs in-process)
      Promise.resolve(analyzeMetadata(imageBuffer)),
      // Layer 3: Gemini AI (calls Google API)
      runGemini(base64, mimeType, platform as AdPlatform),
    ])

    // Fail secure if core services are down/errored
    if (elaResult.status === 'rejected') {
      console.error('ELA Forensics Layer Failed:', elaResult.reason)
      return Response.json(
        { error: 'Forensics verification service temporarily offline. Please try again shortly.' },
        { status: 503 }
      )
    }

    if (geminiResult.status === 'rejected') {
      console.error('Gemini AI Layer Failed:', geminiResult.reason)
      return Response.json(
        { error: 'AI verification service temporarily offline. Please try again shortly.' },
        { status: 503 }
      )
    }

    // Extract results
    const ela = elaResult.value
    const metadata = metadataResult.status === 'fulfilled'
      ? metadataResult.value
      : { metadata_score: 0, metadata_verdict: 'clean' as const, software_signature: null, ai_generation_signals: [], manipulation_signals: [] }

    const gemini = geminiResult.value

    // ── 4. Compute composite forensics score ─────────────────
    const forensics = computeForensicsScore({
      // ELA
      ela_manipulation_score: ela.manipulation_score || 0,
      ela_verdict: ela.ela_verdict || 'clean',
      ela_region_count: ela.region_count || 0,
      ela_suspicious_pixel_percentage: ela.suspicious_pixel_percentage || 0,
      // Metadata
      metadata_score: metadata.metadata_score,
      metadata_verdict: metadata.metadata_verdict,
      software_signature: metadata.software_signature,
      ai_generation_signals: metadata.ai_generation_signals,
      manipulation_signals: metadata.manipulation_signals,
      // Gemini
      gemini_fraud_score: gemini.fraud_score,
      gemini_is_valid: gemini.is_valid,
      gemini_platform_confirmed: gemini.platform_confirmed,
      gemini_rejection_reason: gemini.rejection_reason,
      gemini_views: gemini.views,
      gemini_timestamp_visible: gemini.timestamp_visible,
      // Context
      platform: platform as AdPlatform,
    })

    // ── 5. Map decision to Supabase verification status ──────
    const statusMap = {
      approve: 'approved',
      flag: 'flagged',
      reject: 'rejected',
    } as const

    const verificationStatus = statusMap[forensics.decision]

    // ── 6. Save full verification record ────────────────────
    await supabase.from('verifications').insert({
      slot_id: slotId,
      platform,
      screenshot_url: screenshotUrl,
      screenshot_hash: screenshotHash,
      gemini_raw_response: {
        gemini,
        ela_summary: {
          score: ela.manipulation_score,
          verdict: ela.ela_verdict,
          regions: ela.region_count,
        },
        metadata_summary: {
          score: metadata.metadata_score,
          verdict: metadata.metadata_verdict,
          software: metadata.software_signature,
          ai_signals: metadata.ai_generation_signals,
        },
        composite: forensics,
      },
      views_extracted: forensics.views,
      is_valid: forensics.decision !== 'reject',
      fraud_score: Math.round(forensics.final_score / 10), // Convert back to 1-10 for DB
      rejection_reason: forensics.decision === 'reject'
        ? forensics.reasons.join('; ')
        : null,
      status: verificationStatus,
    })

    // ── 7. If approved, update slot and trigger payout ───────
    if (forensics.decision === 'approve') {
      await supabase
        .from('ad_slots')
        .update({ views_verified: forensics.views })
        .eq('id', slotId)

      await supabase.rpc('approve_verification', { p_slot_id: slotId })
    }

    // ── 8. Return result to client ───────────────────────────
    return Response.json({
      status: verificationStatus,
      views: forensics.views,
      final_score: forensics.final_score,
      confidence: forensics.confidence,
      platform_confirmed: forensics.platform_confirmed,
      reasons: forensics.reasons,
      positive_signals: forensics.positive_signals,
      layer_scores: {
        ela: forensics.ela_contribution,
        metadata: forensics.metadata_contribution,
        gemini: forensics.gemini_contribution,
      },
    })

  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}

// ── Helper: Call ELA Python Function ──────────────────────────
async function runELA(base64: string): Promise<{
  manipulation_score: number
  ela_verdict: 'clean' | 'suspicious' | 'tampered'
  region_count: number
  suspicious_pixel_percentage: number
  suspicious_regions?: any[]
}> {
  const elaUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/.netlify/functions/ela-analyze`
    : 'http://localhost:8888/.netlify/functions/ela-analyze'

  try {
    const res = await fetch(elaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64 }),
    })

    if (!res.ok) {
      throw new Error(`ELA forensic analysis returned status ${res.status}`)
    }

    return res.json()
  } catch (err) {
    console.error(`Failed to execute ELA forensic analysis at ${elaUrl}:`, err)
    throw err
  }
}

// ── Helper: Call Gemini Flash ─────────────────────────────────
async function runGemini(
  base64: string,
  mimeType: string,
  platform: AdPlatform
): Promise<GeminiAuditResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  // Use Gemini 2.5 Flash for advanced speed + reasoning
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: getPlatformPrompt(platform),
    generationConfig: {
      temperature: 0.1,          // Low temperature = more consistent output
      responseMimeType: 'application/json',  // Force JSON output
    },
  })

  const result = await model.generateContent([
    {
      inlineData: {
        data: base64,
        mimeType: mimeType as any,
      },
    },
    `Analyze this ${platform} screenshot for authenticity. Return only valid JSON.`,
  ])

  const raw = result.response.text().replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(raw)
  } catch {
    return {
      is_valid: false,
      views: 0,
      fraud_score: 8,
      rejection_reason: 'Failed to parse AI response',
      timestamp_visible: false,
      platform_confirmed: false,
      platform_detected: 'unknown',
    }
  }
}
