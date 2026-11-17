# Admin integrations

The Users administration features use these server-side environment variables. Add them in the Vercel project settings for Production, Preview and Development as appropriate, then redeploy.

## Transactional email (Resend)

- `RESEND_API_KEY`: API key for the Resend account.
- `TERVIQ_EMAIL_FROM`: verified sender, for example `Terviq AI <notifications@your-verified-domain>`.

The Send Email action and KYC request email use Resend. Dashboard alerts are written to Supabase notifications independently, so they still appear if email credentials are not configured. The admin action reports the email configuration issue rather than claiming an email was sent.

## KYC document uploads (Cloudinary)

- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret (server-only; never prefix with `NEXT_PUBLIC_`).

The application signs upload parameters on the server and uploads directly from the member's browser using Cloudinary's authenticated delivery type. Only Cloudinary secure URLs/document metadata are saved in Supabase; document file bytes are not uploaded to Supabase Storage or Postgres.

Configure Cloudinary account security and retention policies for identity documents. Do not make the KYC folder public. Keep the API secret only in Vercel server environment variables.
