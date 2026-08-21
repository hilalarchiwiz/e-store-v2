# Qaam.pk E-Commerce

Qaam.pk is a full-stack e-commerce application for refurbished and consumer technology. It combines a public storefront, authenticated customer accounts, a role-based administration panel, order and inventory management, content management, email notifications, Azure Blob media storage, and partially implemented payment-provider integrations.

> Security notice: the repository was audited on 2026-08-11. Critical issues were identified in role assignment, admin order actions, checkout invariants, and legacy payment verification. Do not deploy or expose this build as-is. Start with [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) and [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md).

## Features

### Customer storefront

- Home, shop, category/brand filtering, search, product details, and recently viewed products
- Anonymous cart and wishlist
- Email/password and Google authentication through Better Auth
- Profile, password, address, wishlist, and order-history pages
- Coupon validation and checkout using cash on delivery or bank transfer
- Order confirmation, contact, FAQ, blog, dynamic pages, and newsletter subscription
- Product reviews and profile-image uploads

### Administration

- Dashboard and ERP sold-item review
- Products, inventory, pricing, grading, categories, subcategories, and brands
- Orders, invoices, payment recording, and order/payment status
- Users, customers, roles, and permission arrays
- Sliders, banners, blogs, FAQs, dynamic pages, and About-page content
- Coupons, subscribers, contact messages, settings, and audit/login-log views

Some screens and action modules are incomplete or duplicated. The repository, not the UI, is the source of truth; see the architecture and audit documents for reachability and security qualifications.

## Technology stack

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, TipTap, React Quill, Framer Motion, Swiper, Lucide |
| State | React state and Redux Toolkit |
| Authentication | Better Auth with database sessions, email/password, and Google OAuth |
| Database | PostgreSQL through Prisma 7 and `@prisma/adapter-pg` |
| Validation | Zod, applied inconsistently |
| Media | Azure Blob Storage; Sharp image processing |
| Email | Nodemailer/SMTP |
| Payments | Safepay callback and PayFast/APS prototype code; active checkout currently offers COD/bank transfer |
| External integration | Archiwiz ERP product/sold-item lookup |

The detailed component, trust-boundary, and data-flow description is in [ARCHITECTURE_AND_DATA_FLOW.md](ARCHITECTURE_AND_DATA_FLOW.md).

## Repository structure

```text
app/
  (site)/                 Public and authenticated customer routes
  (admin)/admin/          Admin, admin-auth, and invoice route groups
  api/                    Better Auth, products, payment, and test APIs
components/               Customer and admin React components
lib/
  action/                 Customer, checkout, content, and upload server actions
  payments/               Payment prototype/helper code
  auth.ts                 Better Auth server configuration
  prisma.ts               Prisma client and audit-log extension
prisma/
  schema.prisma           Database schema
  migrations/             Incomplete migration history; see audit
  seed.ts                 Banner seed script; validate before use
redux/                    Client state
public/                   Static assets
backup/                   Tracked, build-excluded legacy components
testing-product-python/   Standalone third-party product scraper/import utility
```

## Prerequisites

- A supported Node.js LTS release and npm
- PostgreSQL reachable over TLS
- Azure Blob Storage when uploads are enabled
- SMTP credentials when password reset and order email are enabled
- Google OAuth credentials when social login is enabled

No container, cloud deployment manifest, CI workflow, or complete database bootstrap migration is committed. Those must be supplied by the deployment owner.

## Environment configuration

Create an untracked `.env` for Prisma and local development. Never commit it. Use a managed secret store in production.

```env
# Core
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=<postgresql-connection-string-with-tls>

# Better Auth
BETTER_AUTH_SECRET=<at-least-32-bytes-from-a-csprng>
BETTER_AUTH_URL=http://localhost:3000

# Optional Google login
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=<google-callback-url>

# Email
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
SMTP_FROM_NAME=Qaam.pk Support

# Media
AZURE_STORAGE_CONNECTION_STRING=<azure-storage-connection-string>
AZURE_STORAGE_CONTAINER_NAME=<container-name>

# Optional storefront/integration settings
NEXT_PUBLIC_WHATSAPP_NUMBER=<public-whatsapp-number>
ERP_API_BASE_URL=<trusted-erp-api-base-url>

# Payment prototypes: leave disabled until SEC-003 is remediated and reviewed
SAFEPAY_PUBLIC_KEY=<safepay-public-key>
SAFEPAY_SECRET_KEY=<safepay-secret-key>
PAYFAST_MERCHANT_ID=<payfast-merchant-id>
PAYFAST_SECURED_KEY=<payfast-secret-key>
```

`NEXT_PUBLIC_*` values are delivered to browsers and must never contain secrets. Rotate a credential immediately if it appears in a ticket, chat, log, screenshot, or commit—even if the local `.env` is ignored.

## Installation and local development

```bash
npm ci
npx prisma generate
npm run dev
```

Open `http://localhost:3000`.

Do not point local or test runs at production data. Use a dedicated database and storage container. Several server actions mutate orders, inventory, settings, and media, and the audit intentionally did not run exploit tests against the configured database because it appeared production-facing.

## Database setup

For an established environment, apply reviewed migrations with:

```bash
npx prisma migrate deploy
```

The repository currently contains only one narrow migration while `schema.prisma` defines the full application. A clean database cannot be assumed reproducible from committed migrations. Before provisioning a new environment:

1. Create and review a baseline migration for the full schema.
2. Test it against an empty disposable PostgreSQL database.
3. Back up and rehearse rollback for existing environments.
4. Run migrations with a dedicated deployment identity, not the application runtime identity.

Avoid `prisma db push` in production. Validate `prisma/seed.ts` against the current schema before running `npx prisma db seed`.

## Quality and security checks

```bash
npx tsc --noEmit --pretty false
npx eslint .
npm audit --omit=dev
npm run build
```

Audit baseline on 2026-08-11:

- TypeScript: pass, zero compiler errors
- ESLint: fail, 673 findings (357 errors and 316 warnings)
- Production dependency audit: fail, 58 vulnerable package entries (4 critical, 25 high, 28 moderate, 1 low)
- Automated unit/integration/end-to-end tests: none found

The project has no `lint`, `test`, or CI script. Treat the commands above as diagnostic until a reviewed baseline and blocking CI policy are introduced.

## Production deployment considerations

Before production deployment:

- Complete Phase 1 of [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md).
- Rotate the database credential disclosed in the audit context and review database access logs.
- Disable the test product-import and legacy payment endpoints until secured.
- Use HTTPS end-to-end, HSTS, a tested CSP, frame protection, MIME sniffing protection, a referrer policy, and a permissions policy.
- Put rate limiting in a shared store or gateway; the current in-memory limiter is not distributed.
- Use separate least-privilege identities for runtime, migrations, PostgreSQL, SMTP, ERP, and Azure Storage.
- Run migrations as a release step and back up PostgreSQL and Blob Storage with tested restore procedures.
- Disable public blob/container access unless a specific asset must be public; isolate customer avatars from CMS/product assets.
- Add centralized, redacted security logs and alerting without storing payment signatures, full orders, addresses, or credentials.
- Confirm provider contracts, data locations, retention, incident response, privacy notices, and PCI scope with legal/compliance owners.
- Run an authorized staging penetration test after remediation. Do not test production destructively.

## Security model

- Better Auth owns account and database-session handling.
- Customer dashboard routes require a server-side session.
- Admin pages generally use a role/permission lookup through `hasPermission`/`RoleGuard`.
- Sensitive admin server actions are intended to use `withPermission`; the audit found important exceptions.
- Prisma parameterization limits conventional SQL injection risk; no raw SQL calls were found.
- Checkout recalculates product prices on the server, but quantity, discount, race, and payment-state defects remain.
- Server Actions and Better Auth supply framework request protections, but the pinned Next.js/Better Auth versions have known advisories and must be upgraded.

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for the required development and release controls.

## Troubleshooting

### Prisma cannot connect

- Confirm `DATABASE_URL` is available to Prisma's process, not only the browser-facing Next.js environment.
- Require TLS and verify the server certificate.
- Check database firewall rules and use a non-production database locally.

### Uploads fail at module load

`lib/action/FileUpload.tsx` and `lib/azure-upload.ts` require `AZURE_STORAGE_CONNECTION_STRING` when imported. Configure a dedicated development storage account/container. Do not reuse production storage.

### Password reset or order email fails

Set all SMTP variables, verify the sender domain, and confirm SPF/DKIM/DMARC outside the repository. The current reset redirect path also requires remediation under SEC-022.

### Build succeeds while quality checks fail

`next.config.ts` currently sets `typescript.ignoreBuildErrors: true`; run `npx tsc --noEmit` independently. ESLint is not part of `npm run build` and currently fails its baseline.

### A new database is missing tables

The committed migration history is incomplete. Establish a reviewed baseline migration rather than improvising schema changes against production.

## Audit documents

- [Security audit report](SECURITY_AUDIT_REPORT.md)
- [Compliance review](COMPLIANCE_REVIEW.md)
- [Prioritized remediation plan](REMEDIATION_PLAN.md)
- [Architecture and data flow](ARCHITECTURE_AND_DATA_FLOW.md)
- [Developer security checklist](SECURITY_CHECKLIST.md)

## License and content provenance

No software license file was found. The standalone scraper imports third-party product text and images; ownership, licensing, terms-of-service permission, and attribution were not verifiable from source. Resolve both before distribution or production import.
