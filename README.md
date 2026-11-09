# Terviq AI — Member Opportunity & Agricultural AI Website

A responsive Next.js website presenting Terviq AI's member opportunity experience first, supported by its Norwegian-rooted agricultural technology and artificial intelligence business.

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

## Main routes

### Member experience
- `/` — Opportunity-led homepage
- `/ways-to-earn` — Opportunity directory and participation framework
- `/how-it-works` — Intended member journey
- `/referrals` — Referral programme information
- `/withdrawals` — Withdrawal and payment policy information
- `/faq` — Searchable, category-based member FAQ
- `/login` and `/signup` — Member access form previews
- `/dashboard` — Illustrative member dashboard

### Company and technology
- `/about` — Company overview
- `/agricultural-ai` and `/solutions` — Agricultural AI capabilities
- `/investors` — Investors and strategic partners
- `/industries`, `/work`, `/mission` — Company information
- `/contact`, `/privacy`, `/terms` — Contact and policy pages

## Production checks

```bash
npm run lint
npm run build
```

The `lint` script runs the TypeScript compiler in no-emit mode.

## Deployment

The `main` branch is connected to the existing Vercel production project.

Primary domain: https://terviqai.com

Vercel project alias: https://terviqai.vercel.app

## Business information required before member launch

The repository does not currently contain approved member programme documentation. The website therefore avoids inventing:
- Actual earning activities, task schedules or reward values
- Referral commission percentages, qualifying conditions or payment timing
- Minimum/maximum withdrawal limits, supported banks or mobile-money services
- Withdrawal fees, processing times or verification requirements
- Country eligibility, registration pricing or account policies
- Revenue figures, payout statistics, testimonials or customer counts

The opportunity directory and policy pages are structured so approved details can be added when supplied by the company. FAQ answers explicitly identify information that is not yet published.

## Account and payment status

Login and registration pages include responsive forms, browser validation, password visibility and a strength indicator. They do not create or authenticate accounts. The form feedback makes clear that details are not submitted or saved.

The dashboard and referral panels are illustrative UI only. They do not display real member balances, transactions, commissions or payment evidence. No payment processing or withdrawal system is implemented.

## Other launch items

- **Contact delivery:** The website inquiry channel is not connected to an approved company inbox or CRM.
- **Legal review:** Privacy and terms copy requires completion with the company's legal entity, data-controller details, lawful bases, retention schedule, processors and applicable jurisdiction.
- **Brand assets:** Existing approved brand assets remain in the repository; verify image rights and replace any external placeholders as appropriate.
- **DNS:** The custom domain may still require the external DNS records specified in the Vercel project settings.

## Content integrity

The site distinguishes ordinary members, referral participants and investors. Membership is not presented as an investment. No fixed returns, guaranteed earnings, fabricated customer statistics, testimonials or payout claims are used.
