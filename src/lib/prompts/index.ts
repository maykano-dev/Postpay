import { AdPlatform } from '@/types'

// Base rules applied to ALL platforms
const BASE_RULES = `
Return ONLY valid JSON. No markdown, no explanation, no backticks.
Schema:
{
  "is_valid": boolean,
  "views": number,
  "fraud_score": number,
  "rejection_reason": string | null,
  "timestamp_visible": boolean,
  "platform_confirmed": boolean,
  "platform_detected": string
}

Fraud score guide:
1-3 = Clean, auto-approve
4-6 = Suspicious, flag for human review  
7-10 = Definite fraud, auto-reject

Common fraud signals (raise score by 2-3 each):
- Blurred or smudged area around the view count number
- Font weight/size inconsistent with the rest of the UI
- Pixel artifacts or halo around numbers
- Screenshot dimensions inconsistent with a real phone
- Background color doesn't match the platform's actual color
- View count suspiciously round (e.g. exactly 1000, 500, 5000)
- Timestamp missing or inconsistent
`

const PLATFORM_PROMPTS: Record<AdPlatform, string> = {
  whatsapp: `
You are a fraud detection auditor for PostPay. You are verifying a WHATSAPP STATUS screenshot.

WhatsApp Status UI verification checklist:
- Background must be BLACK (WhatsApp status background is always black)
- There must be an EYE icon (👁) in the bottom-left corner of the screen
- Next to the eye icon must be a numeric view count (e.g. "247")
- The top of the screen should show the status progress bar(s) — thin white lines
- There should be a profile avatar and name in the top-left
- The "X" close button should be in the top-right
- platform_confirmed = true ONLY if ALL of the above are present
- platform_detected = "whatsapp" if it looks like WhatsApp, otherwise name what platform you see

\${BASE_RULES}
`,

  instagram: `
You are a fraud detection auditor for PostPay. You are verifying an INSTAGRAM STORIES INSIGHTS screenshot.

Instagram Stories Insights UI verification checklist:
- The screenshot should show the Instagram story INSIGHTS view (not just the story itself)
- There must be an eye icon and a "Seen by" or numeric count visible
- Alternatively: the story itself showing the viewer count in the bottom-left
- The Instagram UI uses white/light text on a dark gradient background
- There should be Instagram's characteristic rounded story progress bars at the top
- platform_confirmed = true ONLY if the UI is clearly Instagram
- platform_detected = "instagram" if it looks like Instagram, otherwise name what you see

IMPORTANT: A screenshot of just an Instagram post (not a story) is INVALID. Stories only.

\${BASE_RULES}
`,

  snapchat: `
You are a fraud detection auditor for PostPay. You are verifying a SNAPCHAT STORY screenshot.

Snapchat Story UI verification checklist:
- Background is typically the story content (photo/video)
- There must be a view count visible — shown as an eye icon with a number OR just a number
- Snapchat uses a distinctive yellow (#FFFC00) color in UI elements
- The Snapchat ghost logo or "Snapchat" text may be visible
- Story controls (forward, reply) typically visible at the bottom
- The "My Story" or friend's name visible at the top
- platform_confirmed = true ONLY if the UI is clearly Snapchat
- platform_detected = "snapchat" if it looks like Snapchat, otherwise name what you see

FRAUD NOTE: Snapchat UIs are relatively easy to recreate. Be extra vigilant.
Raise fraud score by 3 if you cannot confirm platform-specific UI elements.

\${BASE_RULES}
`,

  tiktok: `
You are a fraud detection auditor for PostPay. You are verifying a TIKTOK VIDEO screenshot.

TikTok UI verification checklist:
- The TikTok watermark (logo + @username) should be visible on the video
- There must be a play count or view count visible (eye icon + number OR just large number)
- TikTok uses a distinctive black background with white text for most UI
- The right sidebar should show like, comment, share, and follow icons
- The bottom should show the caption and audio track name
- platform_confirmed = true ONLY if the UI is clearly TikTok
- platform_detected = "tiktok" if it looks like TikTok, otherwise name what you see

FRAUD NOTE: TikTok is the hardest platform to verify. Be extremely vigilant.
Raise fraud score by 4 if you cannot confirm the TikTok watermark is present.
If view count looks edited or the watermark is suspiciously positioned, raise fraud score to 8+.

\${BASE_RULES}
`,

  facebook: `
You are a fraud detection auditor for PostPay. You are verifying a FACEBOOK STORIES screenshot.

Facebook Stories UI verification checklist:
- The Facebook Stories UI has a distinctive progress bar at the top (similar to Instagram)
- There must be a view count or "Seen by X people" visible
- Facebook uses its characteristic blue (#1877F2) in UI elements
- The Facebook logo or "Facebook" text may be visible
- The poster's profile name and avatar should be in the top-left
- platform_confirmed = true ONLY if the UI is clearly Facebook Stories
- platform_detected = "facebook" if it looks like Facebook, otherwise name what you see

IMPORTANT: A screenshot of a regular Facebook post (not a Story) is INVALID. Stories only.

\${BASE_RULES}
`,
}

export function getPlatformPrompt(platform: AdPlatform): string {
  return PLATFORM_PROMPTS[platform]
}

// Instructions shown to the broadcaster BEFORE they post
export const PLATFORM_POSTING_INSTRUCTIONS: Record<AdPlatform, string[]> = {
  whatsapp: [
    'Download the flyer and save it to your phone.',
    'Open WhatsApp → tap the camera/+ icon next to Status.',
    'Upload the flyer image as your Status.',
    'After 24 hours, open your Status and tap the eye icon at the bottom.',
    'Take a screenshot clearly showing the eye icon AND the view count number.',
    'Upload that screenshot here for verification.',
  ],
  instagram: [
    'Download the flyer and save it to your camera roll.',
    'Open Instagram → tap your profile picture to add a Story.',
    'Upload the flyer as your Story.',
    'After 24 hours, open your Story → swipe UP to see viewers.',
    'Take a screenshot of the Insights screen showing the view count.',
    'Upload that screenshot here for verification.',
  ],
  snapchat: [
    'Download the flyer and save it to your camera roll.',
    'Open Snapchat → tap the camera, select the flyer from your gallery.',
    'Post it to "My Story".',
    'After 24 hours, tap your Story → swipe up to see view count.',
    'Take a screenshot clearly showing the Snapchat UI and view count.',
    'Upload that screenshot here for verification.',
  ],
  tiktok: [
    'Download the flyer image.',
    'Open TikTok → tap the + button → upload the flyer as a video or photo post.',
    'Add a caption mentioning the business.',
    'After 24 hours, go to your post → tap the three dots → View Stats.',
    'Take a screenshot showing the play count clearly.',
    'Upload that screenshot here for verification.',
  ],
  facebook: [
    'Download the flyer and save it to your phone.',
    'Open Facebook → tap "Add to Story" on your feed.',
    'Upload the flyer as your Story.',
    'After 24 hours, open your Story → tap "Seen by" at the bottom.',
    'Take a screenshot showing the viewer count.',
    'Upload that screenshot here for verification.',
  ],
}
