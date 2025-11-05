# Orario Standalone

This folder contains an extracted copy of the `orario` section from the main portfolio.
Use this as a starting point for a separate Next.js app (subdomain).

Paths copied here:
- `app/orario` -> `app/orario`
- `app/components/orario` -> `app/components/orario`
- `lib/orario` -> `lib/orario`
- `public/orario` -> `public/orario`
- any `json/*orario*` -> `json/`

What to check after extraction:
1. Update `package.json` and Next.js config if you want to run this folder as a separate app.
2. Verify any cross-app imports (e.g., shared theme, global CSS) — you may need to copy `globals.css` or provide a lightweight replacement.
3. Check references to root-level assets or modules and adjust import paths.
4. If the section used global stores or context in the main app, copy those stores or re-implement minimal state inside this project.

Quick local run (recommended steps):
- Create a new project root or move this folder to a new repo.
- Add `package.json` with Next.js and Tailwind (match versions from main project) or run `npm init -y` then install:

```bash
npm install next react react-dom tailwindcss
# then set up tailwind config as needed
```

npm install next react react-dom tailwindcss
