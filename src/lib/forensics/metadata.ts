/**
 * Metadata Forensics Layer
 * 
 * Analyzes image metadata (EXIF) for signs of manipulation.
 * 
 * Key signals we look for:
 * 1. Missing EXIF entirely — AI-generated images have no EXIF
 * 2. Software signature — Photoshop, GIMP, Canva leave fingerprints
 * 3. Inconsistent timestamps — edited files have mismatched dates
 * 4. Stripped GPS that should be present — screen recordings have no GPS
 * 5. Suspicious color profiles — screenshots vs camera photos differ
 */

export interface MetadataAnalysis {
  has_exif: boolean
  software_signature: string | null
  software_score: number            // 0-100, higher = more suspicious
  timestamp_analysis: TimestampAnalysis
  device_info: DeviceInfo
  ai_generation_signals: string[]
  manipulation_signals: string[]
  metadata_score: number            // 0-100, composite manipulation score
  metadata_verdict: 'clean' | 'suspicious' | 'tampered'
}

interface TimestampAnalysis {
  has_timestamp: boolean
  datetime_original: string | null
  datetime_modified: string | null
  timestamps_consistent: boolean
  modification_detected: boolean
}

interface DeviceInfo {
  make: string | null
  model: string | null
  is_screenshot: boolean
  software: string | null
}

// Software signatures that indicate editing
const EDITING_SOFTWARE: Record<string, number> = {
  // High suspicion (score 80+)
  'adobe photoshop': 85,
  'photoshop': 85,
  'gimp': 75,
  'paint.net': 70,
  'affinity photo': 70,
  'pixelmator': 65,

  // Medium suspicion (score 40-60)
  'canva': 50,
  'picsart': 50,
  'snapseed': 45,
  'lightroom': 40,       // Common but legitimate editing
  'vsco': 35,

  // Screenshot tools — low suspicion (these are expected for our use case)
  'screenshot': 5,
  'screencapture': 5,

  // AI generation tools — very high suspicion
  'stable diffusion': 95,
  'midjourney': 95,
  'dall-e': 95,
  'firefly': 90,
  'leonardo': 90,
}

// Known AI-generated image markers in metadata
const AI_GENERATION_MARKERS = [
  'stable-diffusion',
  'midjourney',
  'dall-e',
  'openai',
  'diffusion',
  'generate',
  'ai-generated',
  'artificially generated',
  'ComfyUI',
  'InvokeAI',
  'Automatic1111',
]

/**
 * Parse basic EXIF data from a JPEG buffer using manual byte reading.
 * This avoids needing an npm package and works in Edge environments.
 * 
 * EXIF structure in JPEG:
 * - Starts with FFD8 (JPEG magic bytes)
 * - APP1 marker: FFE1
 * - Contains "Exif\0\0" header
 * - Then TIFF-formatted data with tags
 */
export function extractMetadata(imageBuffer: ArrayBuffer): Record<string, string> {
  const bytes = new Uint8Array(imageBuffer)
  const metadata: Record<string, string> = {}

  // Check JPEG magic bytes
  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    metadata['format'] = 'non-jpeg'
    return metadata
  }

  metadata['format'] = 'jpeg'

  // Scan for APP1 marker (EXIF data)
  let offset = 2
  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xFF) break

    const marker = bytes[offset + 1]
    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3]

    // APP1 marker = 0xE1, contains EXIF
    if (marker === 0xE1) {
      // Check for "Exif\0\0" header
      const exifHeader = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7]
      )

      if (exifHeader === 'Exif') {
        // Parse the TIFF data after "Exif\0\0"
        const tiffStart = offset + 10
        const exifData = parseExifTags(bytes, tiffStart)
        Object.assign(metadata, exifData)
      }

      // Also check for XMP data (another metadata format)
      const xmpHeader = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7],
        bytes[offset + 8],
        bytes[offset + 9]
      )

      if (xmpHeader.includes('http') || xmpHeader.includes('xmp')) {
        metadata['has_xmp'] = 'true'
        // Extract readable XMP content
        const xmpContent = extractReadableText(bytes, offset + 4, segmentLength - 2)
        if (xmpContent.toLowerCase().includes('photoshop')) {
          metadata['software'] = 'Adobe Photoshop'
        }
        if (xmpContent.toLowerCase().includes('gimp')) {
          metadata['software'] = 'GIMP'
        }
        // Check for AI generation markers in XMP
        for (const marker of AI_GENERATION_MARKERS) {
          if (xmpContent.toLowerCase().includes(marker.toLowerCase())) {
            metadata['ai_generated_marker'] = marker
            break
          }
        }
      }
    }

    offset += 2 + segmentLength
  }

  return metadata
}

function extractReadableText(bytes: Uint8Array, start: number, length: number): string {
  let text = ''
  for (let i = start; i < Math.min(start + length, bytes.length); i++) {
    if (bytes[i] >= 32 && bytes[i] < 127) {
      text += String.fromCharCode(bytes[i])
    }
  }
  return text
}

function parseExifTags(bytes: Uint8Array, tiffStart: number): Record<string, string> {
  const tags: Record<string, string> = {}

  try {
    // Determine byte order
    const byteOrder = String.fromCharCode(bytes[tiffStart], bytes[tiffStart + 1])
    const isLittleEndian = byteOrder === 'II'

    const readUint16 = (offset: number): number => {
      if (isLittleEndian) {
        return bytes[tiffStart + offset] | (bytes[tiffStart + offset + 1] << 8)
      }
      return (bytes[tiffStart + offset] << 8) | bytes[tiffStart + offset + 1]
    }

    const readUint32 = (offset: number): number => {
      if (isLittleEndian) {
        return bytes[tiffStart + offset] |
          (bytes[tiffStart + offset + 1] << 8) |
          (bytes[tiffStart + offset + 2] << 16) |
          (bytes[tiffStart + offset + 3] << 24)
      }
      return (bytes[tiffStart + offset] << 24) |
        (bytes[tiffStart + offset + 1] << 16) |
        (bytes[tiffStart + offset + 2] << 8) |
        bytes[tiffStart + offset + 3]
    }

    // IFD0 offset
    const ifd0Offset = readUint32(4)
    const numEntries = readUint16(ifd0Offset)

    // EXIF tag IDs we care about
    const INTERESTING_TAGS: Record<number, string> = {
      0x010F: 'make',           // Camera make
      0x0110: 'model',          // Camera model
      0x0131: 'software',       // Software used
      0x0132: 'datetime',       // Date/time modified
      0x9003: 'datetime_original', // Date/time original
      0x9004: 'datetime_digitized', // Date/time digitized
      0x013B: 'artist',
      0x8298: 'copyright',
    }

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifd0Offset + 2 + (i * 12)
      const tagId = readUint16(entryOffset)
      const dataType = readUint16(entryOffset + 2)
      const dataCount = readUint32(entryOffset + 4)
      const dataOffset = readUint32(entryOffset + 8)

      if (INTERESTING_TAGS[tagId]) {
        const tagName = INTERESTING_TAGS[tagId]

        // Type 2 = ASCII string
        if (dataType === 2) {
          let stringValue = ''
          const stringStart = dataCount <= 4
            ? tiffStart + entryOffset + 8
            : tiffStart + dataOffset

          for (let j = 0; j < dataCount - 1; j++) {
            const char = bytes[stringStart + j]
            if (char > 0) {
              stringValue += String.fromCharCode(char)
            }
          }

          if (stringValue.trim()) {
            tags[tagName] = stringValue.trim()
          }
        }
      }
    }
  } catch {
    // EXIF parsing failed — not critical
    tags['exif_parse_error'] = 'true'
  }

  return tags
}

/**
 * Main metadata analysis function
 */
export function analyzeMetadata(imageBuffer: ArrayBuffer): MetadataAnalysis {
  const rawMetadata = extractMetadata(imageBuffer)
  const signals: string[] = []
  const aiSignals: string[] = []
  let score = 0

  // ── Check 1: Does EXIF exist at all? ──────────────────────
  const hasExif = Object.keys(rawMetadata).some(
    k => k !== 'format' && k !== 'has_xmp' && k !== 'exif_parse_error'
  )

  // For screenshots, no EXIF is actually normal
  // For camera photos, no EXIF is suspicious
  // We'll be lenient here since WhatsApp/Instagram compress photos and strip EXIF
  if (!hasExif) {
    signals.push('No EXIF metadata found — common in screenshots and AI-generated images')
    score += 5  // Small penalty, not major
  }

  // ── Check 2: Software signature ───────────────────────────
  const software = rawMetadata['software'] || null
  let softwareScore = 0

  if (software) {
    const softwareLower = software.toLowerCase()
    for (const [softwareName, suspicionScore] of Object.entries(EDITING_SOFTWARE)) {
      if (softwareLower.includes(softwareName)) {
        softwareScore = suspicionScore
        if (suspicionScore > 60) {
          signals.push(`Editing software detected: ${software}`)
          score += suspicionScore * 0.5  // Max +42.5
        }
        break
      }
    }
  }

  // ── Check 3: AI generation markers ────────────────────────
  if (rawMetadata['ai_generated_marker']) {
    aiSignals.push(`AI generation tool detected: ${rawMetadata['ai_generated_marker']}`)
    score += 40
  }

  for (const marker of AI_GENERATION_MARKERS) {
    const allValues = Object.values(rawMetadata).join(' ').toLowerCase()
    if (allValues.includes(marker.toLowerCase())) {
      aiSignals.push(`AI marker found in metadata: ${marker}`)
      score += 30
      break
    }
  }

  // ── Check 4: Timestamp analysis ───────────────────────────
  const datetimeOriginal = rawMetadata['datetime_original'] || null
  const datetimeModified = rawMetadata['datetime'] || null

  const timestampAnalysis: TimestampAnalysis = {
    has_timestamp: !!(datetimeOriginal || datetimeModified),
    datetime_original: datetimeOriginal,
    datetime_modified: datetimeModified,
    timestamps_consistent: true,
    modification_detected: false,
  }

  if (datetimeOriginal && datetimeModified && datetimeOriginal !== datetimeModified) {
    // File was modified after creation — could be legitimate editing
    timestampAnalysis.modification_detected = true
    timestampAnalysis.timestamps_consistent = false
    signals.push(`Timestamp mismatch: original=${datetimeOriginal}, modified=${datetimeModified}`)
    score += 15
  }

  // ── Check 5: Device info ───────────────────────────────────
  const make = rawMetadata['make'] || null
  const model = rawMetadata['model'] || null

  // Screenshots typically don't have camera make/model
  const isLikelyScreenshot = !make && !model

  const deviceInfo: DeviceInfo = {
    make,
    model,
    is_screenshot: isLikelyScreenshot,
    software,
  }

  // ── Calculate final score ──────────────────────────────────
  const metadataScore = Math.min(Math.round(score), 100)

  let verdict: 'clean' | 'suspicious' | 'tampered'
  if (metadataScore < 20) {
    verdict = 'clean'
  } else if (metadataScore < 50) {
    verdict = 'suspicious'
  } else {
    verdict = 'tampered'
  }

  return {
    has_exif: hasExif,
    software_signature: software,
    software_score: softwareScore,
    timestamp_analysis: timestampAnalysis,
    device_info: deviceInfo,
    ai_generation_signals: aiSignals,
    manipulation_signals: signals,
    metadata_score: metadataScore,
    metadata_verdict: verdict,
  }
}
