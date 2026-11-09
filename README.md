# Terviq AI — Corporate Website

A responsive, multi-page corporate website for Terviq AI, an agricultural technology and artificial intelligence company.

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Custom responsive CSS design system
- Lucide icons
- Vercel production deployment

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production checks

```bash
npm run lint
npm run build
```

The `lint` script runs the TypeScript compiler in no-emit mode.

## Main routes

- `/` — Corporate homepage
- `/about` — Company overview
- `/mission` — Mission and vision
- `/solutions` — Agricultural AI capabilities
- `/industries` — Target sectors
- `/work` — Work and capability overview
- `/investors` — Investor and partner information
- `/faq` — Frequently asked questions
- `/contact` — Contact information and inquiry-channel status
- `/privacy` and `/terms` — Website policies

## Deployment

The `main` branch is connected to the Vercel production project. Successful commits trigger production builds.

Primary domain: https://terviqai.com

Vercel project alias: https://terviqai.vercel.app

## Launch items requiring company input

- **DNS:** The custom domain is attached to Vercel, but the external DNS zone still needs the A and CNAME records shown in Vercel's domain configuration before the custom domain resolves to this deployment.
- **Inquiry delivery:** The contact form is intentionally not represented as operational until an approved company recipient or CRM/email delivery service is configured.
- **Account access:** Login and registration routes are informational placeholders; no authentication provider or user database is connected.
- **Brand imagery:** Current agricultural photography is external placeholder imagery. Replace it with approved, licensed Terviq AI assets in the project’s local public asset directory.
- **Legal review:** Privacy and terms copy should be reviewed and completed with the company’s legal entity, data-controller details, retention rules and applicable jurisdiction before being treated as final legal notices.

## Content integrity

The site avoids invented customer logos, project case studies, performance metrics and investment-return claims. Update public claims only when they can be supported by approved company information.
