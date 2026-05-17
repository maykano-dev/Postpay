/**
 * Composite Forensics Scorer
 * 
 * Combines ELA + Metadata + Gemini results into a single
 * final_score and decision.
 * 
 * Weighting:
 * - ELA:      35% (pixel-level analysis)
 * - Metadata: 25% (file-level signals)
 * - Gemini:   40% (semantic understanding)
 * 
 * The composite approach means:
 * - One layer alone can FLAG but not auto-REJECT
 * - Two layers agreeing can auto-REJECT
 * - All three agreeing = definite reject
 */

import type { AdPlatform } from '@/types'
import { PLATFORM_FRAUD_THRESHOLDS } from '@/types'

export interface ForensicsInput {
  // From ELA layer
  ela_manipulation_score: number    // 0-100
  ela_verdict: 'clean' | 'suspicious' | 'tampered'
  ela_region_count: number
  ela_suspicious_pixel_percentage: number

  // From Metadata layer
  metadata_score: number            // 0-100
  metadata_verdict: 'clean' | 'suspicious' | 'tampered'
  software_signature: string | null
  ai_generation_signals: string[]
  manipulation_signals: string[]

  // From Gemini layer
  gemini_fraud_score: number        // 1-10 (Gemini's scale)
  gemini_is_valid: boolean
  gemini_platform_confirmed: boolean
  gemini_rejection_reason: string | null
  gemini_views: number
  gemini_timestamp_visible: boolean

  // Context
  platform: AdPlatform
}

export interface ForensicsResult {
  // Final decision
  final_score: number               // 0-100 (higher = more suspicious)
  decision: 'approve' | 'flag' | 'reject'
  confidence: 'high' | 'medium' | 'low'

  // Layer scores
  ela_contribution: number
  metadata_contribution: number
  gemini_contribution: number

  // Evidence summary
  reasons: string[]
  positive_signals: string[]

  // Data for the verification record
  views: number
  platform_confirmed: boolean
}

export function computeForensicsScore(input: ForensicsInput): ForensicsResult {
  const reasons: string[] = []
  const positiveSignals: string[] = []

  // ── Normalize Gemini score to 0-100 ─────────────────────
  const geminiNormalized = (input.gemini_fraud_score / 10) * 100

  // ── ELA Contribution (35%) ───────────────────────────────
  const elaWeight = 0.35
  const elaContribution = input.ela_manipulation_score * elaWeight

  if (input.ela_verdict === 'tampered') {
    reasons.push(`ELA detected image manipulation (${input.ela_region_count} suspicious regions, ${input.ela_suspicious_pixel_percentage.toFixed(1)}% suspicious pixels)`)
  } else if (input.ela_verdict === 'suspicious') {
    reasons.push(`ELA flagged potential editing (${input.ela_region_count} regions of concern)`)
  } else {
    positiveSignals.push('Error Level Analysis shows consistent compression — image appears unedited')
  }

  // ── Metadata Contribution (25%) ──────────────────────────
  const metadataWeight = 0.25
  const metadataContribution = input.metadata_score * metadataWeight

  if (input.ai_generation_signals.length > 0) {
    reasons.push(...input.ai_generation_signals.map(s => `AI generation: ${s}`))
  }
  if (input.manipulation_signals.length > 0) {
    reasons.push(...input.manipulation_signals)
  }
  if (input.software_signature) {
    const softwareLower = input.software_signature.toLowerCase()
    if (softwareLower.includes('photoshop') || softwareLower.includes('gimp')) {
      reasons.push(`Editing software signature found: ${input.software_signature}`)
    }
  }
  if (input.metadata_verdict === 'clean') {
    positiveSignals.push('File metadata shows no editing software signatures')
  }

  // ── Gemini Contribution (40%) ────────────────────────────
  const geminiWeight = 0.40
  const geminiContribution = geminiNormalized * geminiWeight

  if (!input.gemini_is_valid) {
    reasons.push(`Verification engine: ${input.gemini_rejection_reason || 'Screenshot failed validation'}`)
  }
  if (!input.gemini_platform_confirmed) {
    reasons.push(`Verification engine could not confirm ${input.platform} UI elements in screenshot`)
  }
  if (input.gemini_fraud_score >= 7) {
    reasons.push(`Verification engine flagged high manipulation probability (score: ${input.gemini_fraud_score}/10)`)
  }
  if (input.gemini_fraud_score <= 2 && input.gemini_is_valid && input.gemini_platform_confirmed) {
    positiveSignals.push(`Verification engine verified clean ${input.platform} screenshot with ${input.gemini_views} views`)
  }

  // ── Composite Score ──────────────────────────────────────
  let finalScore = elaContribution + metadataContribution + geminiContribution

  // ── Bonus penalties for agreement between layers ─────────
  // If 2+ layers agree something is wrong, add 15 penalty points
  const suspiciousLayers = [
    input.ela_verdict !== 'clean' ? 1 : 0,
    input.metadata_verdict !== 'clean' ? 1 : 0,
    input.gemini_fraud_score > 5 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  if (suspiciousLayers >= 2) {
    finalScore = Math.min(finalScore + 15, 100)
    reasons.push(`Multiple forensics layers agree: ${suspiciousLayers}/3 layers flagged this image`)
  }

  // If AI generation detected in metadata, always escalate to near-reject
  if (input.ai_generation_signals.length > 0) {
    finalScore = Math.max(finalScore, 85)
    reasons.push('AI-generated image detected — this is not a real screenshot')
  }

  // If Gemini says valid AND ELA is clean, reduce score
  if (input.gemini_is_valid && input.gemini_platform_confirmed && input.ela_verdict === 'clean') {
    finalScore = Math.min(finalScore, 40)
  }

  finalScore = Math.min(Math.round(finalScore), 100)

  // ── Decision ─────────────────────────────────────────────
  const thresholds = PLATFORM_FRAUD_THRESHOLDS[input.platform]
  // Convert platform thresholds (1-10 scale) to 0-100 scale
  const approveThreshold = thresholds.approve * 10
  const flagThreshold = thresholds.flag * 10

  let decision: 'approve' | 'flag' | 'reject'
  let confidence: 'high' | 'medium' | 'low'

  if (!input.gemini_is_valid || finalScore >= flagThreshold) {
    decision = 'reject'
    confidence = finalScore >= 80 ? 'high' : 'medium'
  } else if (finalScore >= approveThreshold) {
    decision = 'flag'
    confidence = 'medium'
  } else {
    decision = 'approve'
    confidence = finalScore < 15 ? 'high' : 'medium'
  }

  // Force reject if platform not confirmed
  if (!input.gemini_platform_confirmed) {
    decision = 'reject'
    confidence = 'high'
  }

  return {
    final_score: finalScore,
    decision,
    confidence,
    ela_contribution: Math.round(elaContribution),
    metadata_contribution: Math.round(metadataContribution),
    gemini_contribution: Math.round(geminiContribution),
    reasons,
    positive_signals: positiveSignals,
    views: input.gemini_views,
    platform_confirmed: input.gemini_platform_confirmed,
  }
}
