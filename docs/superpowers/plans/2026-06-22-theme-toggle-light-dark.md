# Light/Dark Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible, mobile-safe light/dark theme toggle backed by a genuinely crisp warm-paper light palette.

**Architecture:** Theme is a `light`/`dark` class on `<html>` driven by CSS-variable tokens. We add a real `.light` palette, an adaptive "overlay" token pair so translucent lines/fills flip white→black, convert the load-bearing raw `white/[x]` utilities to semantic tokens, relocate the existing toggle into the live design-system `Nav` (always visible, desktop + mobile), and fix the mobile nav so inline links don't overflow.

**Tech Stack:** Next.js 15 App Router, Tailwind (class dark mode, CSS-var tokens), Playwright (E2E).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-22-theme-toggle-light-dark-design.md`.
- Emerald accent `#10b981` is the brand constant; never recolor it per theme.
- DESIGN.md forbids pure-white backgrounds — light surfaces are warm off-whites.
- Default theme is dark; `<html className="dark">` in `app/layout.tsx` and the `beforeInteractive` `public/theme.js` no-flash script stay.
- Run Playwright via `npm test` or `./node_modules/.bin/playwright` — NEVER `npx playwright` (binds a mismatched instance → "did not expect test.describe()").
- Playwright runs serial (`workers: 1`, already configured); `reducedMotion: "reduce"`.
- Conversion mapping (applied in Tasks 2–3), used verbatim everywhere:
  | current utility | replacement |
  | --- | --- |
  | `border-white/[0.06]` | `border-border` |
  | `border-white/10`, `border-t border-white/10`, `border-b border-white/10`, `border-l border-white/[0.08]`, `border-t border-white/[0.06]` | `border-border-strong` (solid 1px lines) / `border-border` (hairline 0.06) — match the alpha: 0.06→`border`, 0.08/10→`border-strong` |
  | `ring-white/10` | `ring-border-strong` |
  | `divide-white/[0.06]` | `divide-border` |
  | `bg-white/[0.04]`, `bg-white/[0.025]`, `bg-white/[0.02]`, `bg-white/5` | `bg-overlay` |
  | `bg-white/[0.08]`, `bg-white/[0.05]`, `bg-white/10` | `bg-overlay-strong` |
  | `hover:bg-white/[0.04]` | `hover:bg-overlay` |
  | `hover:bg-white/[0.08]` | `hover:bg-overlay-strong` |
  | `hover:border-white/[0.10]` | `hover:border-border-strong` |
  | `h-px bg-white/[0.06]` (divider) | `h-px bg-border` |

---

### Task 1: Light palette + overlay tokens

**Files:**
- Modify: `frontend/app/globals.css` (add `.light` block; add overlay tokens to `:root` and `.dark`)
- Modify: `frontend/tailwind.config.js` (add `overlay` / `overlay-strong` colors)
- Create: `frontend/tests/theme.spec.ts` (token-value test; extended in later tasks)

**Interfaces:**
- Produces: CSS variables resolving to warm-paper values under `.light`; Tailwind classes `bg-overlay`, `bg-overlay-strong`, `border-overlay` etc. bound to `--overlay-weak` / `--overlay-strong`.

- [ ] **Step 1: Write the failing token test**

Create `frontend/tests/theme.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Theme tokens", () => {
  test("light mode resolves a warm-paper background and dark borders", async ({ page }) => {
    await page.goto("/");
    const dark = await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    });
    const light = await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      const cs = getComputedStyle(document.documentElement);
      return {
        bg: cs.getPropertyValue("--bg").trim(),
        border: cs.getPropertyValue("--border").trim(),
        overlay: cs.getPropertyValue("--overlay-weak").trim(),
      };
    });
    expect(dark).toBe("#050505");
    expect(light.bg).toBe("#faf8f4");           // warm paper, not pure white
    expect(light.border).toContain("0, 0, 0");   // borders flip to black-translucent
    expect(light.overlay).toContain("0, 0, 0");  // overlay fills flip to black-translucent
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && ./node_modules/.bin/playwright test tests/theme.spec.ts`
Expected: FAIL — `light.bg` is `#050505` (no `.light` block yet, falls back to dark `:root`).

- [ ] **Step 3: Add overlay tokens to `:root` and `.dark`**

In `frontend/app/globals.css`, inside the `:root { … }` block (after the `--scrollbar-hover` line ~60) add:

```css
    /* Adaptive translucent fills (flip white→black in light) */
    --overlay-weak: rgba(255, 255, 255, 0.04);
    --overlay-strong: rgba(255, 255, 255, 0.08);
```

Add the identical two lines inside the `.dark { … }` block (after its `--scrollbar-hover` line ~136).

- [ ] **Step 4: Add the `.light` palette block**

In `frontend/app/globals.css`, immediately after the closing `}` of the `.dark` block (~line 137), add:

```css
  .light {
    --bg: #faf8f4;
    --surface: #fbf9f5;
    --surface-2: #f3efe7;
    --surface-3: #ece7dd;
    --fg: #1a1714;
    --text-body: #3a3531;
    --text-secondary: #6b645c;
    --text-tertiary: #8c857b;
    --accent: #10b981;
    --accent-dim: rgba(16, 185, 129, 0.45);
    --accent-hover: #059669;
    --border: rgba(0, 0, 0, 0.08);
    --border-strong: rgba(0, 0, 0, 0.12);
    --shadow-color: rgba(0, 0, 0, 0.1);
    --vignette: rgba(16, 185, 129, 0.05);
    --overlay-weak: rgba(0, 0, 0, 0.04);
    --overlay-strong: rgba(0, 0, 0, 0.06);
    --bezel-bg: rgba(0, 0, 0, 0.04);
    --bezel-ring: rgba(0, 0, 0, 0.1);
    --hairline: rgba(0, 0, 0, 0.08);
    --pill-bg: #059669;
    --pill-bg-hover: #047857;
    --nav-active-bg: rgba(16, 185, 129, 0.1);
    --nav-active-text: #059669;
    --nav-dot-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
    --muted: #6b645c;
    --badge-high-bg: rgba(244, 63, 94, 0.1);
    --badge-high-text: #e11d48;
    --badge-high-border: rgba(244, 63, 94, 0.22);
    --badge-medium-bg: rgba(245, 158, 11, 0.12);
    --badge-medium-text: #b45309;
    --badge-medium-border: rgba(245, 158, 11, 0.24);
    --badge-low-bg: rgba(113, 113, 122, 0.1);
    --badge-low-text: #52525b;
    --badge-low-border: rgba(113, 113, 122, 0.22);
    --selection-bg: rgba(16, 185, 129, 0.2);
    --selection-fg: #1a1714;
    --caret: #10b981;
    --scrollbar: rgba(0, 0, 0, 0.18);
    --scrollbar-hover: rgba(0, 0, 0, 0.3);
  }
```

- [ ] **Step 5: Add Tailwind overlay colors**

In `frontend/tailwind.config.js`, in `theme.extend.colors` (after the `"border-strong"` line), add:

```js
        overlay: "var(--overlay-weak)",
        "overlay-strong": "var(--overlay-strong)",
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd frontend && ./node_modules/.bin/playwright test tests/theme.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/globals.css frontend/tailwind.config.js frontend/tests/theme.spec.ts
git commit -m "feat(theme): add warm-paper light palette and overlay tokens"
```

---

### Task 2: Functional toggle — no-flash precedence, hardened toggle, mounted in Nav, mobile-safe

**Files:**
- Modify: `frontend/public/theme.js` (system-preference precedence)
- Modify: `frontend/components/theme-toggle.tsx` (≥40px tap target; adaptive tokens)
- Modify: `frontend/components/design-system/nav.tsx` (mount toggle desktop+mobile; hide inline links on mobile; convert nav white utilities)
- Modify: `frontend/components/primitives.tsx` (remove the relocated `<ThemeToggle />` and its wrapper from `GlassNav`)
- Modify: `frontend/tests/theme.spec.ts` (add toggle-behavior + mobile-overflow tests)

**Interfaces:**
- Consumes: `--overlay-*`, `--bezel-*`, `--muted` tokens from Task 1; `ThemeToggle` from `components/theme-toggle.tsx`.
- Produces: `<Nav>` renders `<ThemeToggle />` on all pages; mobile bar = logo + toggle + hamburger.

- [ ] **Step 1: Write failing toggle-behavior tests**

Append to `frontend/tests/theme.spec.ts`:

```ts
test.describe("Theme toggle", () => {
  test("toggles the html class and persists across reload", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(html).toHaveClass(/light/);
    await expect(html).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("toggle is visible and tappable on mobile with no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
    for (const cls of ["dark", "light"]) {
      await page.evaluate((c) => {
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(c);
      }, cls);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd frontend && ./node_modules/.bin/playwright test tests/theme.spec.ts -g "Theme toggle"`
Expected: FAIL — no toggle in the live `Nav`; mobile bar overflows (inline links + hamburger).

- [ ] **Step 3: Update `public/theme.js` precedence**

Replace the body of `frontend/public/theme.js` with:

```js
(function () {
  try {
    const stored = localStorage.getItem("theme");
    const prefersLight =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = stored || (prefersLight ? "light" : "dark");
    const el = document.documentElement;
    if (theme === "light") {
      el.classList.remove("dark");
      el.classList.add("light");
    } else {
      el.classList.add("dark");
      el.classList.remove("light");
    }
  } catch (e) {}
})();
```

- [ ] **Step 4: Harden `ThemeToggle` (tap target + tokens)**

In `frontend/components/theme-toggle.tsx`, change the mounted-placeholder and the live button to a ≥40px target. Replace the placeholder `className` (line ~34) and the live button `className` (line ~45):

Placeholder button className →
```
"w-10 h-10 rounded-full ring-1 flex items-center justify-center"
```
and give it `style={{ background: "var(--bezel-bg)", borderColor: "var(--bezel-ring)", color: "var(--muted)" }}`.

Live button className (line ~45) →
```
"w-10 h-10 rounded-full flex items-center justify-center transition-colors ring-1"
```
(the inline `style` already uses `var(--bezel-bg)/--bezel-ring/--muted`, which now adapt — leave it.) Icon SVGs stay 14px.

- [ ] **Step 5: Mount toggle in `Nav` and fix mobile layout**

In `frontend/components/design-system/nav.tsx`:

1. Add import at top: `import { ThemeToggle } from "@/components/theme-toggle";`
2. Convert nav white utilities per the mapping:
   - line 50: `border-b border-white/[0.06]` → `border-b border-border`
   - line 85: `hover:bg-white/[0.04]` → `hover:bg-overlay`
   - line 100: `border-l border-white/[0.08]` → `border-l border-border-strong`
   - line 108: `hover:bg-white/[0.08]` → `hover:bg-overlay-strong`
   - line 142: `hover:bg-white/[0.08]` → `hover:bg-overlay-strong`
   - line 173: `border-t border-white/10` → `border-t border-border-strong`
3. Wrap the inline links `items.map(...)` block so it is `hidden md:flex`. Concretely, replace the opening of the right-hand container (line ~72) and wrap only the links:

```tsx
          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              {items.map((item) => {
                /* unchanged link JSX */
              })}
            </div>

            {actions ? (
              <div className="hidden md:flex items-center ml-2 pl-2 border-l border-border-strong">
                {actions}
              </div>
            ) : null}

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-ink hover:bg-overlay-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <MenuIcon />
            </button>
          </div>
```

(The `<ThemeToggle />` sits between actions and the hamburger, so it is visible on both desktop and mobile.)

4. In the mobile menu actions footer (line ~173) keep `{actions}` but its border becomes `border-t border-border-strong`.

- [ ] **Step 6: Remove the toggle from legacy `GlassNav`**

In `frontend/components/primitives.tsx`, remove the `<ThemeToggle />` wrapper div (lines ~353-358) and the now-unused `import { ThemeToggle } from "./theme-toggle";` (line 5). GlassNav is unused by live pages; this prevents a duplicate toggle if it is ever revived.

- [ ] **Step 7: Run the toggle tests + token test**

Run: `cd frontend && ./node_modules/.bin/playwright test tests/theme.spec.ts`
Expected: PASS (token + both toggle tests).

- [ ] **Step 8: Commit**

```bash
git add frontend/public/theme.js frontend/components/theme-toggle.tsx frontend/components/design-system/nav.tsx frontend/components/primitives.tsx frontend/tests/theme.spec.ts
git commit -m "feat(theme): mount toggle in nav, mobile-safe, system-pref no-flash"
```

---

### Task 3: Crisp conversion of remaining components and pages

**Files (apply the Global Constraints mapping at each listed line):**
- Modify: `frontend/components/design-system/button.tsx` (line 36 `border-white/10`→`border-border-strong`; line 121 `wellBg` → `variant === "primary" ? "bg-white/15" : "bg-overlay-strong"` — primary's well sits on the constant emerald fill and stays light)
- Modify: `frontend/components/design-system/typography.tsx` (line 17 `ring-white/10`→`ring-border-strong`, `bg-white/[0.025]`→`bg-overlay`)
- Modify: `frontend/components/intake/message.tsx` (line 13 `border-white/[0.06]`→`border-border`; line 31 `border-white/[0.08]`→`border-border-strong`)
- Modify: `frontend/components/intake/review-card.tsx` (line 26 `divide-white/[0.06]`→`divide-border`; line 41 `border-white/10`→`border-border-strong`)
- Modify: `frontend/components/intake/inputs/stakeholders-input.tsx` (line 77 `border-white/[0.06]`→`border-border`, `hover:border-white/[0.10]`→`hover:border-border-strong`; line 101 `border-white/10`→`border-border-strong`, `bg-white/[0.02]`→`bg-overlay`)
- Modify: `frontend/components/landing/sample-output.tsx` (line 37 `border-white/10`→`border-border-strong`; lines 60-62 `bg-white/10`→`bg-overlay-strong`; lines 67-81 `bg-white/5`→`bg-overlay`; line 84 `border-t border-white/10`→`border-t border-border-strong`)
- Modify: `frontend/components/landing/footer.tsx` (line 7 `border-t border-white/10`→`border-t border-border-strong`)
- Modify: `frontend/app/review/page.tsx` (lines 109,122 `border-white/[0.06]`→`border-border`; lines 200,592,1058 `ring-white/10`→`ring-border-strong`; line 480 `border-white/10`→`border-border-strong`; lines 617,663,966,1114 `border-t/-white/[0.06]`→`border-border`; line 689 `ring-white/10`→`ring-border-strong`, `hover:bg-white/[0.08]`→`hover:bg-overlay-strong`; line 887 `border-r border-white/[0.06]`→`border-r border-border`; line 901 `hover:bg-white/[0.08]`→`hover:bg-overlay-strong`; line 930 `hover:bg-white/[0.04]`→`hover:bg-overlay`)
- Modify: `frontend/app/export/page.tsx` (line 207 `h-px bg-white/[0.06]`→`h-px bg-border`; line 218 `bg-white/[0.06]`→`bg-overlay`)
- Modify: `frontend/tests/theme.spec.ts` (add cross-page light-mode smoke test)

**Interfaces:**
- Consumes: `bg-overlay`, `bg-overlay-strong`, `border-border`, `border-border-strong`, `ring-border-strong`, `divide-border` from Task 1.

- [ ] **Step 1: Write the failing cross-page light-mode test**

Append to `frontend/tests/theme.spec.ts`:

```ts
test.describe("Light mode has no overflow across pages", () => {
  for (const path of ["/", "/intake"]) {
    test(`no horizontal overflow on ${path} in light mode (mobile)`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      await expect(page.locator("html")).toHaveClass(/light/);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
      // a primary CTA / heading remains visible (not washed out to invisibility)
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }
});
```

- [ ] **Step 2: Run to verify it fails or is flaky-pre-conversion**

Run: `cd frontend && ./node_modules/.bin/playwright test tests/theme.spec.ts -g "no overflow"`
Expected: This may PASS for overflow already (Task 2 fixed nav) but the conversion is still required for visual correctness; if it passes, proceed — the conversion steps below are verified by Step 4's full run + the screenshot check. (If it FAILS on overflow, the conversions below resolve it.)

- [ ] **Step 3: Apply the conversion mapping at every line listed in this task's Files block**

Edit each file at the listed lines, replacing the current utility with its mapping target. Do not change any non-color classes. After editing, confirm none remain:

Run: `cd frontend && ./node_modules/.bin/playwright test --list >/dev/null; grep -rEn "white/\[|white/[0-9]|ring-white|border-white|bg-white|divide-white" components app | grep -v primitives.tsx`
Expected: no output (every load-bearing white utility converted; `primitives.tsx` legacy is intentionally excluded).

- [ ] **Step 4: Type-check, run the full suite, build**

Run: `cd frontend && ./node_modules/.bin/tsc --noEmit && npm test && npm run lint && npm run build`
Expected: tsc clean; all Playwright specs pass (serial); lint exit 0; build compiles.

- [ ] **Step 5: Visual confirmation (light mode, mobile + desktop)**

Capture screenshots of `/`, `/intake`, `/review`, `/export` in light mode at 375px and 1280px and eyeball for washed-out borders / distortion. (Use a throwaway Playwright script that sets `localStorage.theme="light"`, navigates each route, and `page.screenshot`.) Delete the script after.

- [ ] **Step 6: Commit**

```bash
git add frontend/components frontend/app frontend/tests/theme.spec.ts
git commit -m "feat(theme): convert white-overlay utilities to adaptive tokens for light mode"
```

---

## Self-Review

**Spec coverage:**
- Light palette (warm paper) → Task 1 `.light` block. ✓
- Overlay tokens for white-overlay fills → Task 1 (`--overlay-*` + Tailwind colors). ✓
- Component conversion (crisp) → Tasks 2 (nav) + 3 (all remaining incl. landing + review/export pages). ✓
- Toggle in real Nav, always visible, ≥40px mobile → Task 2. ✓
- Mobile nav fix (hide inline links) → Task 2 Step 5. ✓
- No-flash + system preference → Task 2 Step 3. ✓
- Remove toggle from legacy GlassNav → Task 2 Step 6. ✓
- Tests: class flip + persist + both viewports + no overflow + mobile visible/tappable → theme.spec.ts across Tasks 1–3. ✓
- Regression gate (serial suite, tsc, lint, build) → Task 3 Step 4. ✓

**Placeholder scan:** No TBD/TODO; each code step has literal content or an explicit line-by-line mapping with verbatim source strings. Light hex values are pinned.

**Type/name consistency:** Tailwind colors `overlay`/`overlay-strong` defined in Task 1 are the exact class roots (`bg-overlay`, `bg-overlay-strong`) used in Tasks 2–3. `border`/`border-strong`/`ring`/`divide` token classes already exist in `tailwind.config.js`. `ThemeToggle` is a named export imported the same way in `nav.tsx` (Task 2) as it was in `primitives.tsx`.
