# Terviq AI — Member Opportunity & Agricultural AI Website

A responsive Next.js website presenting Terviq AI's member opportunity experience first, supported by its Norwegian-rooted agricultural technology and artificial intelligence business.

## Technology

- Supabase Auth and PostgreSQL (member authentication, profiles, wallet balances, investments, referrals, notifications and transaction history)
- Supabase SSR cookie-based sessions

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
- `/investment-plans` — Six supplied plan schedules, flexible/locked comparison and projection calculator
- `/investment-selection` — Non-transactional selection/confirmation preview
- `/deposits` — Bank-transfer placeholders, crypto deposit preview and 9% calculation
- `/cryptocurrency` — BTC, LTC, USDT TRC20/BEP20, BNB and TRX information
- `/ways-to-earn` — Opportunity directory and participation framework
- `/how-it-works` — Intended member journey
- `/referrals` — Referral programme information
- `/withdrawals` — Withdrawal and payment policy information
- `/faq` — Searchable, category-based member FAQ
- `/login` and `/signup` — Member access form previews
- `/dashboard` — Member home, portfolio balances and recent activity\n- `/dashboard/invest` — Investment plan cards and portfolio totals\n- `/dashboard/referral` — Personal referral code, link, referral totals and commission information\n- `/dashboard/profile` — Profile editing, settings, password recovery and transaction history
- `/compliance` — Regulatory claim and documentation status

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

## Member dashboard and Supabase setup

The dashboard is organised under `app/dashboard/`. Its nested layout deliberately removes the public website header and footer. The member navigation is a fixed bottom bar with Home, Invest, Referral and Profile; the Profile screen uses a responsive account menu and does not show the bottom bar.

### Connect Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` for local development.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase project API settings. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` locally and `https://terviqai.com` on Vercel.
4. Run `app/dashboard/database/schema.sql` in the Supabase SQL Editor.
5. Add the same two environment variables to the existing Vercel project for Production, Preview and Development, then redeploy.
6. In Supabase Authentication URL Configuration, set the site URL to `https://terviqai.com` and add `https://terviqai.com/auth/callback` to the allowed redirect URLs (also add `http://localhost:3000/auth/callback` locally).
7. Enable the email confirmation and password policies you want to use in Supabase Auth.

When Supabase environment variables are present, the dashboard requires an authenticated Supabase session and reads the signed-in member's profile, wallet, investments, referrals and transactions. Without those variables, the dashboard remains available in frontend preview mode with the requested ₦50 balance examples.

### Dashboard data and security

- Supabase Auth handles member sign-up, sign-in, sign-out and password reset.
- Profile changes are saved to the signed-in member's own profile.
- The database schema enables Row Level Security and member-scoped read/update policies.
- The member signup referral code is attributed to the referrer by the database signup trigger.
- The SQL function `record_first_investment_referral` credits 10% of the referee's first eligible investment. It is executable only by the Supabase `service_role`; call it only from a trusted server workflow after payment/investment verification.
- The public anon key is used by the browser and is safe only with the supplied RLS policies. Never expose a Supabase service-role key in client code or a `NEXT_PUBLIC_` environment variable.
- Wallet credits/debits, investment creation, bank/crypto payment verification and withdrawal processing must be implemented as trusted server-side workflows before real transactions are enabled.

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

Login and registration use Supabase Auth when the project environment variables are configured. The dashboard requires an authenticated Supabase session in that mode.

The dashboard reads member balances and transaction records from Supabase when configured. The requested ₦50 available and referral balances are frontend preview values only until real wallet balances are present in the member wallet table.

## Other launch items

- **Contact delivery:** The website inquiry channel is not connected to an approved company inbox or CRM.
- **Legal review:** Privacy and terms copy requires completion with the company's legal entity, data-controller details, lawful bases, retention schedule, processors and applicable jurisdiction.
- **Brand assets:** Existing approved brand assets remain in the repository; verify image rights and replace any external placeholders as appropriate.
- **DNS:** The custom domain may still require the external DNS records specified in the Vercel project settings.

## Content integrity

The site distinguishes ordinary members, referral participants and investors. Membership is not presented as an investment. No fixed returns, guaranteed earnings, fabricated customer statistics, testimonials or payout claims are used.

## Financial content and calculations

The six plan amounts, terms and percentage figures are reproduced from the business information supplied for this website. Flexible/locked projected profit amounts and total returns are displayed as supplied and have been checked arithmetically. The calculator uses the same schedule.

- Crypto discount: 9% off the original entry amount; the illustrative discounted cost is calculated as 91% of the entry amount and displayed to two decimal places where needed.
- Standard withdrawal illustration: 15% fee; fee-free scenarios for the 30th of the month and referral earnings.
- Referral commission information: supplied 10% rate; no multi-level structure is represented.
- Withdrawal information: supplied Monday–Friday processing days, ₦5,000 minimum, ₦2,500,000 daily maximum, bank estimate of 2–3 business days and referral fee exemption.

These figures are not evidence of a licensed, solvent or currently operating investment product. The site clearly labels projections and company-supplied rules as unverified/pending legal documentation. No guarantee, transaction, payment, wallet credit, withdrawal or referral commission is represented as completed.

## Regulatory evidence review

The repository tree was inspected for authorization, registration, license, certification and compliance documents. No supporting files, license numbers, legal-entity identifiers or regulator decisions were found in the repository. The new `/compliance` page therefore identifies the Norwegian FSA, CySEC and MiCA claims as unverified, and describes the EU AI Act as a regulatory framework rather than a financial license or generic certification. The exact legal entity and evidence are required before any regulatory badge or claim can be published.

## Payment and account integration status

- No bank account details or cryptocurrency wallet addresses are configured.
- Deposit and withdrawal forms are informational previews only; no payment gateway, blockchain watcher, custody wallet, reconciliation or bank integration is connected.
- Supabase Auth, profile and member dashboard tables are scaffolded. Investment purchase, payment settlement, wallet ledger posting, KYC/AML and withdrawal execution still require trusted transaction workflows and operational integrations.
- Signup referral attribution and a restricted first-investment 10% commission SQL function are included. The trusted investment/payment workflow that invokes the function after verification remains to be implemented.
- Weekend/public-holiday treatment for a 30th-of-month free withdrawal day must be defined in final terms.
- Bybit, Busha and Spenda are named only as examples from the supplied brief, not as partners, endorsements or confirmed available providers.
