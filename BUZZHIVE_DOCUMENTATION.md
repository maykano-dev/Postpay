# BuzzHive — Full Project Documentation
**Version:** 1.0.0 (Production)
**Stack:** Next.js · Supabase · ImgBB · Moolre · Gemini 1.5 Flash

---

## 1. Project Overview

BuzzHive is a crowdsourced WhatsApp Status advertising network built for Ghana. Businesses buy guaranteed impressions from a verified network of real users ("Broadcasters") who post flyers on their WhatsApp Status and get paid per verified view — directly to their MoMo wallet.

**The model in one sentence:**
> Businesses pay for reach. Broadcasters earn for posting. BuzzHive takes the spread.

---

## 2. Full File Structure

```
buzzhive/
├── .env.local                        # All secrets (never commit)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── page.tsx                  # Landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login page
│   │   │   └── register/page.tsx     # Registration (user type selector)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx              # Dashboard home (role-based redirect)
│   │   │   │
│   │   │   ├── broadcaster/
│   │   │   │   ├── page.tsx          # Broadcaster home (earnings overview)
│   │   │   │   ├── campaigns/page.tsx # Browse & claim active campaigns
│   │   │   │   ├── submit/[id]/page.tsx # Screenshot submission form
│   │   │   │   └── wallet/page.tsx   # Balance + withdrawal request
│   │   │   │
│   │   │   └── business/
│   │   │       ├── page.tsx          # Business home (campaign overview)
│   │   │       ├── campaigns/
│   │   │       │   ├── page.tsx      # List all campaigns
│   │   │       │   ├── new/page.tsx  # Create new campaign
│   │   │       │   └── [id]/page.tsx # Campaign detail + live stats
│   │   │       └── billing/page.tsx  # Top up account balance
│   │   │
│   │   └── api/
│   │       ├── verify-screenshot/route.ts  # Gemini AI audit endpoint
│   │       ├── moolre/
│   │       │   ├── pay-in/route.ts         # Receive payment from business
│   │       │   ├── pay-out/route.ts        # Disburse to broadcaster MoMo
│   │       │   └── webhook/route.ts        # Moolre payment confirmation
│   │       └── imgbb/upload/route.ts       # Proxy ImgBB upload (hides API key)
│   │
│   ├── components/
│   │   ├── ui/                        # Reusable base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── broadcaster/
│   │   │   ├── CampaignCard.tsx       # Campaign tile in browse view
│   │   │   ├── SubmitProof.tsx        # Screenshot upload + preview
│   │   │   └── EarningsChart.tsx      # Weekly earnings graph
│   │   │
│   │   └── business/
│   │       ├── CampaignForm.tsx       # New campaign wizard
│   │       ├── StatsPanel.tsx         # Live view count + reach gauge
│   │       └── FlyerUpload.tsx        # ImgBB upload component
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server-side Supabase client (SSR)
│   │   │   └── middleware.ts          # Auth session refresh
│   │   │
│   │   ├── imgbb.ts                   # ImgBB upload helper
│   │   ├── gemini.ts                  # Gemini AI verification logic
│   │   ├── moolre.ts                  # Moolre API wrapper
│   │   └── utils.ts                   # Shared utilities
│   │
│   ├── hooks/
│   │   ├── useUser.ts                 # Auth user context
│   │   ├── useCampaigns.ts            # Real-time campaign data
│   │   └── useWallet.ts               # Live balance subscription
│   │
│   └── types/
│       ├── database.ts                # Supabase generated types
│       └── index.ts                   # Shared app types
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_init_schema.sql        # Tables + constraints
│   │   ├── 002_rls_policies.sql       # Row Level Security
│   │   ├── 003_functions.sql          # DB functions + triggers
│   │   └── 004_seed.sql               # Dev seed data
│   └── config.toml
│
└── docs/
    ├── BUZZHIVE_DOCUMENTATION.md      # This file
    ├── API_REFERENCE.md
    └── DEPLOYMENT.md
```

---

## 3. Environment Variables (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server only, never expose

# ImgBB
IMGBB_API_KEY=your-imgbb-api-key                  # Server only

# Gemini AI
GEMINI_API_KEY=your-gemini-key                    # Server only

# Moolre
MOOLRE_API_KEY=your-moolre-key                    # Server only
MOOLRE_WEBHOOK_SECRET=your-webhook-secret         # Verify Moolre callbacks

# App
NEXT_PUBLIC_APP_URL=https://buzzhive.com
```

---

## 4. Supabase Database Schema

### `001_init_schema.sql`

```sql
-- USERS / PROFILES
create type user_role as enum ('broadcaster', 'business', 'admin');
create type account_status as enum ('active', 'suspended', 'pending_verification');

create table profiles (
  id              uuid primary key references auth.users on delete cascade,
  full_name       text not null,
  email           text unique not null,
  momo_number     text unique,                   -- Required for broadcasters
  role            user_role not null,
  status          account_status default 'active',
  trust_score     integer default 100,           -- Starts at 100, drops on fraud flags
  total_earned    numeric(12,2) default 0,
  balance         numeric(12,2) default 0,       -- Available for withdrawal
  created_at      timestamptz default now()
);

-- CAMPAIGNS
create type campaign_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
create type campaign_category as enum ('campus', 'general', 'food', 'fashion', 'tech', 'events', 'services');

create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  flyer_url       text not null,                 -- ImgBB hosted URL
  flyer_thumb_url text,                          -- ImgBB thumbnail
  category        campaign_category not null,
  target_views    integer not null,
  views_delivered integer default 0,
  budget_ghs      numeric(10,2) not null,        -- Total paid by business
  cpm_rate        numeric(8,2) not null default 250, -- GHS per 1000 views
  broadcaster_cpm numeric(8,2) not null default 120, -- What broadcaster earns
  status          campaign_status default 'draft',
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz default now()
);

-- AD SLOTS (claimed by broadcasters)
create type slot_status as enum ('claimed', 'posted', 'submitted', 'approved', 'rejected', 'expired');

create table ad_slots (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid references campaigns(id) on delete cascade,
  broadcaster_id  uuid references profiles(id) on delete cascade,
  status          slot_status default 'claimed',
  claimed_at      timestamptz default now(),
  must_post_by    timestamptz generated always as (claimed_at + interval '2 hours') stored,
  submitted_at    timestamptz,
  approved_at     timestamptz,
  views_verified  integer,                       -- Set by AI after verification
  payout_amount   numeric(8,2),                  -- Calculated after verification
  unique(campaign_id, broadcaster_id)            -- One slot per broadcaster per campaign
);

-- VERIFICATIONS (AI audit log)
create type verification_status as enum ('pending', 'approved', 'rejected', 'flagged');

create table verifications (
  id                  uuid primary key default gen_random_uuid(),
  slot_id             uuid references ad_slots(id) on delete cascade,
  screenshot_url      text not null,             -- ImgBB hosted screenshot
  screenshot_hash     text not null,             -- SHA-256 to detect duplicates
  gemini_raw_response jsonb,                     -- Full AI response stored for audit
  views_extracted     integer,
  is_valid            boolean,
  fraud_score         integer,                   -- 1-10, higher = more suspicious
  rejection_reason    text,
  status              verification_status default 'pending',
  verified_at         timestamptz default now()
);

-- LEDGER (immutable financial record)
create type ledger_type as enum ('campaign_topup', 'campaign_spend', 'broadcaster_earn', 'broadcaster_withdraw', 'platform_fee', 'refund');

create table ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  slot_id         uuid references ad_slots(id),
  campaign_id     uuid references campaigns(id),
  type            ledger_type not null,
  amount          numeric(12,2) not null,
  description     text,
  moolre_ref      text,                          -- Moolre transaction reference
  created_at      timestamptz default now()
);
```

### `002_rls_policies.sql`

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table campaigns enable row level security;
alter table ad_slots enable row level security;
alter table verifications enable row level security;
alter table ledger enable row level security;

-- PROFILES: Users see only their own profile
create policy "profiles_self_only" on profiles
  for all using (auth.uid() = id);

-- CAMPAIGNS: Businesses manage their own; broadcasters read active ones
create policy "campaigns_business_manage" on campaigns
  for all using (auth.uid() = business_id);

create policy "campaigns_broadcaster_read" on campaigns
  for select using (status = 'active');

-- AD_SLOTS: Broadcasters manage their own slots
create policy "slots_broadcaster_own" on ad_slots
  for all using (auth.uid() = broadcaster_id);

-- Businesses read slots for their campaigns
create policy "slots_business_read" on ad_slots
  for select using (
    campaign_id in (select id from campaigns where business_id = auth.uid())
  );

-- LEDGER: Users see their own transactions only
create policy "ledger_self_only" on ledger
  for select using (auth.uid() = user_id);

-- VERIFICATIONS: Broadcasters see their own
create policy "verifications_self_only" on verifications
  for select using (
    slot_id in (select id from ad_slots where broadcaster_id = auth.uid())
  );
```

### `003_functions.sql`

```sql
-- Auto-expire unclaimed slots after 2 hours
create or replace function expire_stale_slots()
returns void language plpgsql as $$
begin
  update ad_slots
  set status = 'expired'
  where status = 'claimed'
    and must_post_by < now();
end;
$$;

-- Called after verification is approved: update balances atomically
create or replace function approve_verification(p_slot_id uuid)
returns void language plpgsql security definer as $$
declare
  v_slot      ad_slots%rowtype;
  v_campaign  campaigns%rowtype;
  v_payout    numeric;
begin
  select * into v_slot from ad_slots where id = p_slot_id;
  select * into v_campaign from campaigns where id = v_slot.campaign_id;

  v_payout := (v_slot.views_verified::numeric / 1000.0) * v_campaign.broadcaster_cpm;

  -- Credit broadcaster
  update profiles
  set balance = balance + v_payout,
      total_earned = total_earned + v_payout
  where id = v_slot.broadcaster_id;

  -- Update campaign views
  update campaigns
  set views_delivered = views_delivered + v_slot.views_verified
  where id = v_slot.campaign_id;

  -- Mark slot
  update ad_slots
  set status = 'approved',
      approved_at = now(),
      payout_amount = v_payout
  where id = p_slot_id;

  -- Log to ledger
  insert into ledger (user_id, slot_id, campaign_id, type, amount, description)
  values (
    v_slot.broadcaster_id, p_slot_id, v_slot.campaign_id,
    'broadcaster_earn', v_payout,
    v_slot.views_verified || ' verified views on campaign ' || v_slot.campaign_id
  );
end;
$$;
```

---

## 5. API Routes

### `POST /api/verify-screenshot`
Receives a screenshot URL (from ImgBB), runs it through Gemini, and triggers the approval function.

```typescript
// src/app/api/verify-screenshot/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are a fraud detection auditor for BuzzHive, a WhatsApp advertising platform.
Analyze this screenshot and return ONLY valid JSON with no other text:
{
  "is_valid": boolean,
  "views": number,
  "fraud_score": number (1-10, 10 = definite fraud),
  "rejection_reason": string | null,
  "timestamp_visible": boolean
}
Rules:
- Confirm the screenshot shows WhatsApp Status views (eye icon + number present)
- Check for signs of image editing (blurring, pixel inconsistency around numbers)
- If the views number is not visible, set is_valid to false
- fraud_score 1-3 = clean, 4-6 = suspicious (flag for review), 7-10 = reject`;

export async function POST(req: Request) {
  const { slotId, screenshotUrl, screenshotHash } = await req.json();

  // 1. Duplicate check
  const supabase = createClient();
  const { data: dupe } = await supabase
    .from("verifications")
    .select("id")
    .eq("screenshot_hash", screenshotHash)
    .single();

  if (dupe) {
    return Response.json({ error: "Duplicate screenshot detected" }, { status: 400 });
  }

  // 2. Fetch image and convert to base64
  const imgResponse = await fetch(screenshotUrl);
  const buffer = await imgResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  // 3. Gemini audit
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: "image/jpeg" } },
    "Analyze this WhatsApp Status screenshot.",
  ]);

  const raw = result.response.text();
  const audit = JSON.parse(raw);

  const status = audit.fraud_score >= 7
    ? "rejected"
    : audit.fraud_score >= 4
    ? "flagged"
    : audit.is_valid
    ? "approved"
    : "rejected";

  // 4. Save verification record
  await supabase.from("verifications").insert({
    slot_id: slotId,
    screenshot_url: screenshotUrl,
    screenshot_hash: screenshotHash,
    gemini_raw_response: audit,
    views_extracted: audit.views,
    is_valid: audit.is_valid,
    fraud_score: audit.fraud_score,
    rejection_reason: audit.rejection_reason,
    status,
  });

  // 5. If approved, trigger payout function
  if (status === "approved") {
    await supabase.rpc("approve_verification", { p_slot_id: slotId });
  }

  return Response.json({ status, views: audit.views, fraud_score: audit.fraud_score });
}
```

### `POST /api/imgbb/upload`
Proxies ImgBB uploads to keep the API key server-side.

```typescript
// src/app/api/imgbb/upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const body = new URLSearchParams();
  body.append("key", process.env.IMGBB_API_KEY!);
  body.append("image", base64);
  body.append("expiration", "0"); // Never expire

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body,
  });

  const data = await response.json();
  return Response.json({
    url: data.data.url,
    thumb: data.data.thumb.url,
    delete_url: data.data.delete_url,
  });
}
```

### `POST /api/moolre/webhook`
Handles Moolre payment confirmations.

```typescript
// src/app/api/moolre/webhook/route.ts
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-moolre-signature");

  // Verify webhook authenticity
  const expected = crypto
    .createHmac("sha256", process.env.MOOLRE_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const supabase = createClient();

  if (payload.status === "success" && payload.type === "campaign_topup") {
    // Activate campaign and credit business
    await supabase
      .from("campaigns")
      .update({ status: "active", starts_at: new Date().toISOString() })
      .eq("id", payload.metadata.campaign_id);

    await supabase.from("ledger").insert({
      user_id: payload.metadata.business_id,
      campaign_id: payload.metadata.campaign_id,
      type: "campaign_topup",
      amount: payload.amount,
      moolre_ref: payload.reference,
      description: "Campaign funded via MoMo",
    });
  }

  return new Response("OK", { status: 200 });
}
```

---

## 6. Key Library Files

### `src/lib/imgbb.ts`
```typescript
export async function uploadToImgBB(file: File): Promise<{
  url: string;
  thumb: string;
  delete_url: string;
}> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/imgbb/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
}

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

### `src/lib/moolre.ts`
```typescript
const MOOLRE_BASE = "https://api.moolre.com/v1"; // Update with real base URL

export async function initiateCampaignPayment(params: {
  amount: number;
  campaignId: string;
  businessId: string;
  momoNumber: string;
}) {
  const res = await fetch(`${MOOLRE_BASE}/collect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MOOLRE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: "GHS",
      phone: params.momoNumber,
      description: `BuzzHive Campaign ${params.campaignId}`,
      metadata: {
        campaign_id: params.campaignId,
        business_id: params.businessId,
        type: "campaign_topup",
      },
    }),
  });
  return res.json();
}

export async function disburseToBroadcaster(params: {
  amount: number;
  momoNumber: string;
  broadcasterId: string;
  slotId: string;
}) {
  const res = await fetch(`${MOOLRE_BASE}/disburse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MOOLRE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: "GHS",
      phone: params.momoNumber,
      description: `BuzzHive Earnings Withdrawal`,
      metadata: {
        broadcaster_id: params.broadcasterId,
        slot_id: params.slotId,
      },
    }),
  });
  return res.json();
}
```

---

## 7. Pricing & Economics

| Metric | Amount |
|---|---|
| Business pays per 1,000 views | GHS 250 |
| Broadcaster earns per 1,000 views | GHS 120 |
| Platform margin per 1,000 views | GHS 130 (52%) |
| Minimum broadcaster withdrawal | GHS 50 |
| Referral bonus (one-time) | GHS 5 |

**Daily projection (200 broadcasters × 400 avg views):**
- Views processed: 80,000
- Revenue: GHS 20,000
- Payout: GHS 9,600
- **Platform profit: GHS 10,400**

---

## 8. Anti-Fraud Rules

| Rule | Implementation |
|---|---|
| Duplicate screenshots | SHA-256 hash stored per verification |
| Re-used old screenshots | Gemini checks timestamp visibility |
| Photoshop/edited numbers | Gemini fraud_score ≥ 7 = auto reject |
| Multiple accounts, same MoMo | DB unique constraint on momo_number |
| Click farms | Trust score system — repeated flags suspend account |
| Slot hoarding | 2-hour auto-expiry if not posted |

---

## 9. Deployment Checklist

- [ ] Push to GitHub
- [ ] Connect repo to Netlify
- [ ] Set all env variables in Netlify dashboard
- [ ] Run Supabase migrations (`supabase db push`)
- [ ] Enable Supabase Auth with email provider
- [ ] Register Moolre webhook URL: `https://buzzhive.com/api/moolre/webhook`
- [ ] Test end-to-end with real GHS 1 transaction
- [ ] Set up Sentry for error monitoring (free tier)
- [ ] Register business with Ghana Registrar General
- [ ] Add Privacy Policy page (required by Data Protection Act 2012)

---

## 10. Tech Stack Summary

| Layer | Tool | Cost |
|---|---|---|
| Frontend + Hosting | Next.js on Netlify | Free |
| Database + Auth + Realtime | Supabase | Free |
| Image Storage | ImgBB | Free |
| AI Verification | Gemini 1.5 Flash | Free (15 req/min) |
| Payments | Moolre | % per transaction |
| Error Monitoring | Sentry | Free |
| **Total monthly infra cost** | | **GHS 0** |

---

*BuzzHive — Built in Ghana, for Ghana.*
