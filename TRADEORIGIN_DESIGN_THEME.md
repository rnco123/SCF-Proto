# TradeOrigin Design Theme

Use this document when building or revamping UI so any agent keeps TradeOrigin’s visual language consistent.

**Source of truth:** `app/globals.css` (Tailwind v4 `@theme`), shared components in `components/ui/`, and newer flows in `components/registration/`.

---

## 1. Brand identity

| Item | Value |
|------|--------|
| Product name | **TradeOrigin** (logo wordmark: **Trade** bold + Origin light) |
| Logo | `/images/logo.svg` |
| Onboarding watermark | `/TROnboardingBgIcon.svg` (bottom-right, decorative) |
| Personality | Professional B2B trade-finance platform — clean, trustworthy, purple-accented, not playful |
| Primary audience | Corporates, banks, funders (trade finance) |

---

## 2. Tech stack (UI)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"`) |
| New UI primitives | **Radix UI** (Popover, Switch, etc.) + `components/ui/*` |
| Icons | **lucide-react** (preferred for new work) |
| Forms | react-hook-form + yup (legacy); plain controlled state OK for demo flows |
| Tables (legacy) | MUI DataGrid — do not restyle heavily; wrap in TradeOrigin borders |
| Legacy | MUI still exists in older screens — **new screens should use Tailwind + Radix**, not MUI Dialog/Menu |

**Rule for agents:** Prefer extending `components/ui/button`, `StepCard`, `OnboardingShell`, etc. Match existing Tailwind token names (`primaryCol`, `borderCol`, …).

---

## 3. Color palette

### Core brand tokens (Tailwind classes)

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|--------|
| Primary | `#5625F2` | `text-primaryCol`, `bg-primaryCol`, `border-primaryCol` | CTAs, active tabs, links, focus rings, key icons |
| Primary tint | `#5625F20A` (~4% opacity) | `bg-[#5625F20A]` | Selected card backgrounds (legacy role cards) |
| Primary soft bg | `#F5F1FF` / `#F8F6FF` | `bg-[#F5F1FF]`, `bg-[#F8F6FF]` | Active tab row, info chips, hover states |
| Counter / accent purple | `#B69FFE` | `text-counterCol` | Secondary purple accents |
| Link blue | `#0062FF` | `text-text` | Legacy link color (some forms) |

### Neutrals & surfaces

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|--------|
| Page background | `#F5F7F9` / `#F6F7F7` | `bg-bg`, `bg-[#F6F7F7]` | App shell, onboarding pages |
| Card surface | `#FFFFFF` | `bg-white` | Cards, modals, form panels |
| Subtle surface | `#FAFAFD` | `bg-[#FAFAFD]` | Card footers, upload zones |
| Muted panel | `#F5F7F9` | `bg-[#F5F7F9]` | In-card sections, disabled-adjacent areas |
| Border | `#E2E2EA` | `border-borderCol` | **Default border everywhere** |
| Body text | `#1A1A26` | `text-[#1A1A26]` | Headings, primary labels |
| Secondary text | `#92929D` | `text-para` | Descriptions, hints, metadata |
| Muted label | `#44444F` | `text-lightGray` | Legacy form labels |
| Placeholder | `#A7A7A8` | `placeholder:text-[#A7A7A8]` | Input placeholders |
| Disabled text | `#B5B5BE` / `#92929D` | `disabled:text-[#92929D]` | Disabled buttons |

### Semantic colors

| Meaning | Hex | Tailwind | Usage |
|---------|-----|----------|--------|
| Success | `#29C084` | `text-green`, `bg-green` | Paid, approved, checked checkbox |
| Success bg | `#E8F8F1` | `bg-[#E8F8F1]` | Success banners |
| Error | `#D20000` | `text-darkRed` | Required asterisk, validation errors |
| Warning | `#F2994A` / `#9A6B00` | `text-[#9A6B00]`, `bg-[#FFF4E8]` | Pending payment, KYC warnings |
| Destructive (shadcn) | `#EF4444` | `destructive` | Rare; prefer `darkRed` for forms |

### Gradients (hero / marketing)

```text
from-[#5625f2]/10 via-[#E2E2FF]/40 to-white     — dashboard hero
from-[#2A0F8C] via-primaryCol to-[#7A4DFF]      — optional brand panel (if used)
```

### Stat / accent icon backgrounds

```text
bg-[#F3EFFF]   — purple stat icon
bg-[#FFF4E8]   — orange / in-progress
bg-[#E8F8F1]   — green / executed
```

---

## 4. Typography

| Role | Font | Class / note |
|------|------|----------------|
| Default UI | **Poppins** (local) | Applied on `<body>` via `poppins.className` |
| Secondary / forms | **Roboto** | `font-roboto` or `--font-roboto` variable |
| Page title | Poppins semibold | `text-3xl font-semibold tracking-tight text-[#1A1A26] sm:text-4xl` |
| Section title | | `text-xl font-semibold text-[#1A1A26]` |
| Card title | | `text-2xl font-semibold text-[#1A1A26]` |
| Body | | `text-sm text-para` or `text-base text-para` |
| Eyebrow / label | | `text-xs font-semibold uppercase tracking-wide text-para` |
| Logo wordmark | | `text-2xl font-light` with **Trade** in `font-semibold` |

**Do not** introduce new font families without explicit approval.

---

## 5. Spacing, layout & breakpoints

| Item | Value |
|------|--------|
| Container max (marketing) | `max-w-6xl` |
| Form card max | `max-w-xl` – `max-w-2xl` |
| Onboarding content | `max-w-4xl` |
| Dashboard content padding | `px-4 py-6 2xl:px-10` |
| Card padding | `px-6 py-5` (header), `px-6 py-6` (body) |
| Grid gaps | `gap-4` – `gap-6` |
| Breakpoints | Tailwind defaults + `xs: 450px` (`--screen-xs`) |
| Full-width tables | `w-full min-w-0 overflow-x-auto` on wrapper |

---

## 6. Border radius & elevation

| Element | Radius | Shadow (examples) |
|---------|--------|-------------------|
| Inputs | `rounded-lg` (8px) or `rounded-xl` (12px) | — |
| Cards | `rounded-xl` – `rounded-2xl` | `shadow-[0_8px_28px_rgba(26,26,38,0.05)]` |
| Modals / signup card | `rounded-3xl` | `shadow-[0_20px_60px_-16px_rgba(86,37,242,0.2)]` |
| Buttons | `rounded-lg` – `rounded-xl` | Primary CTA: `shadow-[0_10px_28px_-10px_rgba(86,37,242,0.55)]` |
| Pills / badges | `rounded-full` | — |
| Stat cards | `rounded-xl` | `shadow-[0_8px_24px_rgba(26,26,38,0.04)]` |

**Border default:** always `border border-borderCol` unless semantic (success/error).

---

## 7. Components

### 7.1 Primary button

```tsx
<Button className="h-11 gap-2 rounded-lg bg-primaryCol px-6 text-white hover:bg-primaryCol/90 disabled:bg-borderCol disabled:text-[#92929D]">
  Label
</Button>
```

Large CTA (signup):

```tsx
className="h-12 w-full rounded-xl bg-primaryCol text-base font-medium text-white shadow-[0_10px_28px_-10px_rgba(86,37,242,0.55)] hover:bg-primaryCol/90"
```

### 7.2 Secondary / outline button

```tsx
className="h-11 rounded-lg border-borderCol bg-white text-[#1A1A26] hover:border-primaryCol/30 hover:bg-[#F8F6FF]"
```

### 7.3 Ghost / back link

```tsx
className="text-xs font-medium text-para hover:text-[#1A1A26]"
```

### 7.4 Text inputs (standard)

```tsx
className="h-11 w-full rounded-lg border border-borderCol bg-white px-3 text-sm text-[#1A1A26] placeholder:text-[#A7A7A8] outline-none focus:border-primaryCol focus:ring-2 focus:ring-primaryCol/15"
```

**With leading icon:** `pl-10`, icon in `absolute left-3 text-primaryCol`.

### 7.5 Select

Same as input; add `appearance-none` and custom chevron if needed.

### 7.6 Field label

```tsx
<span className="mb-1.5 block text-sm font-medium text-[#1A1A26]">
  Label<span className="ml-0.5 text-darkRed">*</span>
</span>
```

### 7.7 Step card (onboarding sections)

Use `components/registration/StepCard.tsx`:

- Outer: `rounded-2xl border border-borderCol bg-white shadow-[0_8px_28px_rgba(26,26,38,0.05)]`
- Header: `border-b border-borderCol px-6 py-5`
- Footer: `border-t border-borderCol bg-[#FAFAFD] px-6 py-4`

### 7.8 Option / role cards (selectable)

**Selected:**

```text
border-primaryCol ring-2 ring-primaryCol/20 shadow-[0_18px_40px_rgba(86,37,242,0.18)]
```

**Unselected:**

```text
border-borderCol hover:border-primaryCol/30
```

**Disabled:**

```text
opacity-60 cursor-not-allowed
```

### 7.9 Tabs (incremental onboarding)

Use `OnboardingTabs`:

- Active tab: `bg-[#F5F1FF]` + bottom bar `h-0.5 bg-primaryCol`
- Completed: purple circle with white check, `bg-primaryCol`
- Locked: lock icon, `opacity-60`, not clickable
- Grid: `repeat(N, minmax(0, 1fr))` — tabs always fill full width

### 7.10 Modal overlay

```tsx
// Backdrop
className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]"
// Panel
className="relative z-[101] max-w-2xl rounded-2xl border border-borderCol bg-white shadow-[0_24px_64px_rgba(26,26,38,0.18)]"
```

### 7.11 Switch (Radix)

Checked: `bg-[#08AF3B]` · Unchecked: `bg-[#A7A7A8]`

### 7.12 Checkbox (native, global CSS)

Checked: green `#29C084` border + fill, white checkmark.

### 7.13 Purple CTA sidebar card

```text
bg-primaryCol rounded-lg py-4 px-4 text-white text-center
```

White button inside: `bg-white text-primaryCol hover:bg-white/90 rounded-lg`

### 7.14 Info / warning callouts

| Type | Classes |
|------|---------|
| Info (purple) | `rounded-xl bg-[#F8F6FF] px-4 py-3 text-sm text-primaryCol` |
| Warning (amber) | `rounded-xl bg-[#FFF7E8] px-4 py-3 text-sm text-[#9A6B00]` |
| Success | `rounded-xl border border-green/30 bg-[#E8F8F1] text-green` |

### 7.15 Status pills

```text
Paid:     bg-[#E8F8F1] text-green
Pending:  bg-[#FFF4E8] text-[#9A6B00]
```

---

## 8. Icons

- Library: **lucide-react**
- Default size: `size-4` (inline), `size-5`–`size-7` (feature icons)
- Color: `text-primaryCol` on white surfaces; `text-white` on purple backgrounds
- Do not mix random icon sets in new UI

---

## 9. Interaction states

| State | Pattern |
|-------|---------|
| Hover (primary btn) | `hover:bg-primaryCol/90` |
| Hover (outline) | `hover:border-primaryCol/40 hover:bg-[#F8F6FF]` |
| Focus (inputs) | `focus:border-primaryCol focus:ring-2 focus:ring-primaryCol/15` |
| Disabled button | `disabled:bg-borderCol disabled:text-[#92929D] disabled:shadow-none` |
| Error field | `text-darkRed` message below; avoid red borders unless legacy LG steps |
| Loading | `Loader2` from lucide with `animate-spin` |

---

## 10. Page patterns

### Public / auth shell (`OnboardingShell`)

- Background: `bg-[#F6F7F7]`
- Header: white, `border-b border-borderCol`, logo + sign-in link (`text-primaryCol`)
- Decorative: `TROnboardingBgIcon.svg` bottom-right, `opacity-90`, `pointer-events-none`

### Registration role select (`/register`)

- Background: `bg-[#F6F7F7]`
- Uses `LandingPageHeader` on role page
- 2×2 grid of role cards, primary CTA full width `max-w-md`

### Signup form (`/register/corporate`, `/register/bank`)

- Single centered card: `max-w-xl rounded-3xl border border-borderCol bg-white`
- Eyebrow chip: `bg-[#F5F1FF] text-primaryCol rounded-full`
- No split purple panel (removed) — one modal-style card only

### Dashboard (private app)

- Layout: `DashboardLayout` + sidebar + header
- Section hero: gradient banner + stat cards in `grid-cols-3`
- Tables: full width, toolbar with outline actions + `primaryCol` accents

### Forfait supplier dashboard

- Hero: `rounded-2xl border border-borderCol` + purple gradient header
- Stats: `StatCard` pattern (white card, colored icon tile)
- Sidebar: setup purple card OR create-request CTA when program ready

---

## 11. Copy & tone

- Clear, professional, B2B
- Buttons: action verbs — “Continue”, “Save & continue”, “Submit for admin approval”, “Mark invoice as paid”
- Demo flows may say “demo” explicitly in helper text
- i18n: use `useTranslation()` and existing keys where possible (`register:`, `corporateOnboarding:`, etc.)

---

## 12. Agent checklist (do / don’t)

### Do

- Use `primaryCol`, `borderCol`, `text-para`, `text-[#1A1A26]` tokens
- Reuse `components/ui/button`, `StepCard`, `OnboardingShell`, `OnboardingTabs`
- Use lucide icons at `size-4`
- Keep cards white on light gray page background
- Use purple focus rings on inputs
- Make incremental steps locked until previous step completes
- Use `cn()` from `@/lib/utils` for conditional classes

### Don’t

- Don’t introduce new primary colors (no blue CTAs, no green primary buttons)
- Don’t use Material UI Dialog/Menu for **new** features
- Don’t use harsh pure black (`#000`) for text — use `#1A1A26`
- Don’t use heavy box shadows without the soft rgba pattern above
- Don’t skip `border-borderCol` on cards
- Don’t create full-width purple pages without a white content card
- Don’t change logo spelling (**TradeOrigin**, not Trade Origin in UI)

---

## 13. Quick reference — copy-paste classes

```text
/* Page */
min-h-screen bg-[#F6F7F7]

/* Card */
rounded-2xl border border-borderCol bg-white shadow-[0_8px_28px_rgba(26,26,38,0.05)]

/* Primary CTA */
h-11 rounded-lg bg-primaryCol px-6 text-white hover:bg-primaryCol/90

/* Input */
h-11 w-full rounded-lg border border-borderCol bg-white px-3 text-sm focus:border-primaryCol focus:ring-2 focus:ring-primaryCol/15

/* Muted footer strip */
border-t border-borderCol bg-[#FAFAFD]

/* Active tab */
bg-[#F5F1FF] + border-b-2 or inset-x-0 bottom-0 h-0.5 bg-primaryCol
```

---

## 14. File references

| Purpose | Path |
|---------|------|
| CSS tokens | `app/globals.css` |
| Button | `components/ui/button.tsx` |
| Switch | `components/ui/switch.tsx` |
| Onboarding shell | `components/registration/OnboardingShell.tsx` |
| Step card + inputs | `components/registration/StepCard.tsx` |
| Tabs | `components/registration/OnboardingTabs.tsx` |
| Signup form | `components/registration/BasicSignupForm.tsx` |
| Role cards (legacy) | `components/helpers/Role-card.tsx` |
| Fonts | `utils/localFonts.ts` |
| Dashboard example | `components/forfait/ForfaitSupplierDashboard.tsx` |

---

## 15. Version note

Extracted from branch `design-onboard-web` (June 2026). When tokens change in `globals.css`, update this file in the same PR.
