# Autism Signals

Autism Signals is an Astro + Vue project for an adult autism trait self-check.

## Local development

```bash
cd /Users/kylesandstrom/Documents/spectrum-compass
nvm use
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Analytics

This project supports two code-based analytics options through public environment variables:

- Plausible
  - Set `PUBLIC_PLAUSIBLE_DOMAIN=autismsignals.com`
- Google Analytics 4
  - Set `PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

Only enable the provider you actually want to use.

For local development, copy `.env.example` to `.env` and fill in the value you want.

If you prefer Netlify Web Analytics, you can also enable that directly in the Netlify UI with no code changes.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22.12.0`

`netlify.toml` already includes the matching build settings.

If you use Plausible or GA4 on Netlify, add the same environment variables in:

- Site configuration
- Environment variables

### Plausible custom events

This project now emits these Plausible custom events:

- `Start Reflection`
- `Assessment Completed`
- `Summary Copied`
- `Clicked Resource`

`Clicked Resource` includes a non-sensitive custom property:

- `resource`

To see these in Plausible:

1. Open your site in Plausible
2. Go to `Site Settings` -> `Goals`
3. Add a `Custom event` goal for each event name above

For `Clicked Resource`, you can optionally narrow the goal using the `resource` property if you want separate goals for each resource card.

## GitHub

This folder should live in its own git repo, separate from the unrelated parent repo on this machine.

Typical next step after creating a GitHub repo:

```bash
git remote add origin <your-github-repo-url>
git add .
git commit -m "Initial commit"
git push -u origin main
```
