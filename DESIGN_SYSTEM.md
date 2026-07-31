# Anther Academy - Design System

## 🎨 Color Palette

The design system uses a professional Navy + Gold palette optimized for finance and education sectors.

### Primary: Navy
Professional, trustworthy, and authoritative. Used for primary actions, headings, and core UI elements.

```
navy-50   #f8fafc (Lightest - backgrounds)
navy-100  #f1f5fb
navy-200  #e2ecf7
navy-300  #cfe1f0
navy-400  #a8c8e1
navy-500  #2c5aa0 ⭐ Primary Brand Color
navy-600  #1e3a52
navy-700  #1a2f42
navy-800  #152438
navy-900  #0f1829 (Darkest - text)
```

**Usage:**
- Primary buttons: `bg-navy-500 hover:bg-navy-600`
- Navigation bars: `bg-navy-500` or `bg-navy-900`
- Primary headings: `text-navy-900`
- Primary text: `text-navy-700`

### Accent: Brass/Champagne (formerly "Gold")
Prestige and excellence — deliberately muted rather than a saturated yellow, which reads as cheap/templated. Used for highlights, CTAs, and premium features.

```
gold-50   #faf7f0 (Lightest - subtle backgrounds)
gold-100  #f3ecda
gold-200  #e6d4ab
gold-300  #cfa958 ⭐ Primary Accent
gold-400  #b3903f
gold-500  #96762f
gold-600  #7a5f27
gold-700  #5f4a1f
gold-800  #453516
gold-900  #2b210d (Darkest - rarely used)
```

**Usage:**
- Accent buttons: `bg-gold-300 hover:bg-gold-400`
- Important badges: `bg-gold-300`
- Icons/accents: `text-gold-300`
- Premium labels: `text-gold-600`

### Secondary: Forest Green
Growth, stability, and trust. Used for success states, secondary CTAs, and supporting elements.

```
forest-50   #f5faf8 (Lightest)
forest-100  #e8f3f0
forest-200  #d1e8e3
forest-300  #a8d9cd
forest-400  #2d6a5c ⭐ Secondary Accent
forest-500  #1e4d42
forest-600  #163d34
forest-700  #0f2f28
forest-800  #0a211e
forest-900  #051513 (Darkest)
```

**Usage:**
- Success states: `bg-forest-400`
- Growth indicators: `text-forest-500`
- Alternative accents: `border-forest-400`

### Neutral: Slate
Clean, professional grays for typography, backgrounds, and UI elements.

```
slate-50   #f9fafb (Lightest - page backgrounds)
slate-100  #f3f4f6
slate-200  #e5e7eb
slate-300  #d1d5db
slate-400  #9ca3af (Light gray)
slate-500  #6b7280 (Medium gray)
slate-600  #4b5563 (Medium-dark)
slate-700  #374151 (Secondary text)
slate-800  #1f2937 (Primary text)
slate-900  #111827 (Darkest - rarely used)
```

**Usage:**
- Page background: `bg-slate-50`
- Card backgrounds: `bg-white`
- Primary text: `text-slate-900`
- Secondary text: `text-slate-600`
- Borders: `border-slate-200`

### Semantic Colors
Status and feedback indicators:

```
success: #10b981  (Green - for successful actions)
warning: #f59e0b  (Amber - for alerts and cautions)
error:   #ef4444  (Red - for errors and destructive actions)
info:    #3b82f6  (Blue - for informational messages)
```

## 🔤 Typography

### Font Families
- **Sans Serif**: Inter (body, UI, nav)
  - Fallbacks: Segoe UI, Roboto, system sans-serif
- **Display Serif**: Fraunces (`font-display` - all headings h1–h4, section titles, prices)
  - Fallback: Georgia
  - This is the single biggest lever for the "premium/editorial" feel vs. the old all-sans-bold look.

### Font Sizes & Weights

```css
/* Headings */
h1 { @apply text-4xl font-bold text-navy-900; }
h2 { @apply text-3xl font-bold text-navy-900; }
h3 { @apply text-2xl font-bold text-navy-900; }
h4 { @apply text-xl font-bold text-navy-900; }

/* Body */
body { font-family: 'Inter', sans-serif; }
p { @apply text-base text-slate-900; }

/* Small text */
small { @apply text-sm text-slate-600; }
```

## 🧩 Component Styles

All components use Tailwind utilities and custom classes defined in `client/src/index.css`.

### Buttons

Buttons are deliberately understated — no default drop shadow (shadow only appears on hover), smaller radius, tracked-out label. A flat, shadow-heavy button is one of the clearest "generic template" tells.

**.btn-primary**
```css
@apply px-6 py-3 bg-navy-500 text-white rounded-md font-medium tracking-wide
       hover:bg-navy-600 transition-colors duration-200 shadow-none hover:shadow-md;
```
**Use for:** Primary actions, main CTAs, form submissions

**.btn-secondary**
```css
@apply px-6 py-3 bg-gold-300 text-navy-900 rounded-md font-medium tracking-wide
       hover:bg-gold-400 transition-colors duration-200 shadow-none hover:shadow-md;
```
**Use for:** Secondary actions, alternate CTAs, premium features

**.btn-outline**
```css
@apply px-6 py-3 border border-navy-500 text-navy-500 rounded-md
       font-medium tracking-wide hover:bg-navy-50 transition-colors duration-200;
```
**Use for:** Tertiary actions, cancel buttons, less prominent actions

### Cards & Editorial Layout

**.card**
```css
@apply bg-white rounded-md border border-slate-200 hover:border-slate-300
       transition-colors duration-200;
```
**Use for:** Content containers, course cards, list items — no default shadow.

Avoid stamping `.card` in a uniform 3-col grid for every "features/values/reasons" section — that repeated icon-title-description card pattern is the single most common "generic template" signal. Prefer hairline-divided grids (`divide-x`/`divide-y` or `border-t border-l` + `border-b border-r` on children) or numbered/asymmetric layouts instead. See `HomePage.jsx` "Why Choose Us" or `AboutPage.jsx` "Core Values" for the pattern.

**.eyebrow**
```css
@apply text-xs uppercase tracking-[0.2em] font-semibold text-gold-600;
```
Small tracked-out label placed above a headline (e.g. "Our Mission", "Featured Courses") — a standard editorial/premium-brand signal. Use on every section intro instead of a plain centered `<h2>`.

**Icons:** always `lucide-react` (already a dependency), thin stroke (`strokeWidth={1.5}`), never raw emoji.

### Form Elements

**.input-field**
```css
@apply w-full px-4 py-2.5 border border-slate-300 rounded-lg 
       focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent 
       transition-all;
```
**Use for:** All text inputs, textareas, select elements

### Typography Helpers

**.section-title**
```css
@apply text-3xl font-bold text-navy-900 mb-2;
```

**.section-subtitle**
```css
@apply text-lg text-slate-600 mb-8;
```

## 🎯 Usage Examples

### Hero Section
```html
<div class="bg-gradient-to-r from-navy-500 to-navy-600 text-white">
  <h1 class="text-4xl font-bold">Welcome to Anther Academy</h1>
  <p class="text-navy-100">Professional Accounting Training</p>
  <button class="btn-secondary">Get Started</button>
</div>
```

### Card Grid
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div class="card p-6">
    <div class="w-12 h-12 bg-gold-300 rounded-lg flex items-center justify-center">
      <span class="text-2xl">📚</span>
    </div>
    <h3 class="text-navy-900 font-bold mt-4">Courses</h3>
    <p class="text-slate-600 mt-2">Learn from expert instructors</p>
  </div>
</div>
```

### Form
```html
<form class="space-y-4">
  <label class="block text-slate-700 font-medium">Email</label>
  <input type="email" class="input-field" placeholder="you@example.com" />
  
  <button type="submit" class="btn-primary w-full">Sign Up</button>
  <button type="reset" class="btn-outline w-full">Clear</button>
</form>
```

### Status Badges
```html
<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
  Enrolled
</span>
<span class="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm">
  Premium
</span>
```

## 📐 Spacing System

Tailwind's default spacing scale (4px base):
```
0   = 0px
1   = 4px
2   = 8px
3   = 12px
4   = 16px (xs)
6   = 24px (sm)
8   = 32px (md)
12  = 48px (lg)
16  = 64px (xl)
```

Common patterns:
- Padding: `p-4`, `px-6`, `py-2`
- Margin: `m-4`, `mx-auto`, `mb-8`
- Gap: `gap-4`, `gap-8`

## 🌙 Dark Mode (Future)

The design system is built to support dark mode when needed. Add to `tailwind.config.js`:

```js
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

## ✅ Accessibility

- All colors meet WCAG AA contrast ratios
- Navy on white: 10.8:1 contrast ratio ✅
- Gold on navy: 5.2:1 contrast ratio ✅
- Semantic HTML for screen readers
- Focus states on all interactive elements
- Meaningful alt text for images

## 🔗 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Inter Font](https://rsms.me/inter/)
- [Merriweather Font](https://ebgaramond.org/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Hunt Palette](https://colorhunt.co/)
