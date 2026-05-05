# Bug Fix Plan — HotelEco Pro

## Bugs Found

### Bug 1 — `HomePage.jsx`: `t()` used as an object (CRITICAL)
Lines 45–87. The `t` from `useTranslation()` is a **function**, not an object.
But the code calls `{t.hero}`, `{t.sub}`, `{t.book}`, `{t.destination}`, `{t.type}`, `{t.checkin}`, `{t.checkout}`, `{t.guests}`, `{t.search}` — all wrong (they are `undefined`).

**Fix:** Replace all `{t.key}` with `{t("namespace.key")}` using the correct keys from `en.json`.

---

### Bug 2 — `index.js`: Missing i18n initialisation import (CRITICAL)
`src/index.js` imports `App` but never imports `../data/i18next`. Without importing the i18n init file, `react-i18next` is never initialised. Every call to `t()` will fail with missing translations or crash.

**Fix:** Add `import './data/i18next';` to `src/index.js`.

---

### Bug 3 — `package.json`: Missing i18n packages (CRITICAL)
`i18next`, `react-i18next`, and `i18next-browser-languagedetector` are used everywhere but are NOT listed as dependencies in `package.json`. If a fresh `npm install` is run, these packages won't be installed and the app will crash.

**Fix:** Add the three packages to the `dependencies` section of `package.json`.

---

### Bug 4 — `train/main.py`: Wrong CSV path (Bug already partially fixed)
The script reads `"data/Hotel Data set.csv"` relative to its working directory, but there is no such file next to the script in `train/`. A dummy CSV was created in `train/data/` as a workaround.

**Fix (already done):** Dummy CSV file exists. No further action needed here.

---

## Files to Modify

| File | Change |
|---|---|
| `src/index.js` | Add i18n import |
| `src/pages/HomePage.jsx` | Fix all `t.key` → `t("ns.key")` calls |
| `package.json` | Add missing i18n dependencies |

## Verification
- Build `npm run build` should compile with 0 errors
- All text on HomePage should appear in the selected language
