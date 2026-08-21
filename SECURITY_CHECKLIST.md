# Reusable E-commerce Security Checklist

Use this checklist for feature review, pull requests, release approval, and periodic control testing. An unchecked item is not automatically a vulnerability, but it requires evidence, a documented non-applicability rationale, or a time-bound risk acceptance. Perform destructive and payment tests only in an isolated environment with synthetic data.

## Scope and release evidence

- [ ] Record the reviewed commit, build artifact, environment, domain, date, reviewers, and deployment owner.
- [ ] Inventory public pages, route handlers, server actions, admin functions, scheduled jobs, webhooks, storage paths, and external integrations.
- [ ] Identify legacy, experimental, test, backup, and undocumented endpoints; remove or explicitly restrict them.
- [ ] Document trust boundaries and each sensitive-data flow from collection through deletion.
- [ ] Link requirements and tests to each material threat and prior audit finding.
- [ ] Track exceptions with severity, rationale, compensating control, owner, approval, and expiry.

## Authentication and sessions

- [ ] Public sign-up/update schemas cannot set role, permission, verification, balance, discount, or other privileged fields.
- [ ] Password hashing, reset tokens, verification tokens, and session tokens use maintained library defaults and adequate entropy.
- [ ] Login, registration, recovery, verification, and MFA responses resist account enumeration.
- [ ] Rate limits are durable across replicas and cover identity plus appropriate network/device signals.
- [ ] Administrative and high-impact accounts require phishing-resistant MFA where feasible.
- [ ] Sensitive account/payment/address changes require recent authentication and notify the user.
- [ ] Session cookies explicitly use `Secure`, `HttpOnly`, appropriate `SameSite`, narrow path/domain, and finite lifetime.
- [ ] Login, privilege, password, and account-status changes rotate or revoke relevant sessions.
- [ ] Logout, global logout, expiry, password reset, disabled-account, and stolen-session scenarios are tested.
- [ ] Redirect/callback destinations accept only approved same-origin relative paths or strict allowlisted origins.
- [ ] OAuth state/nonce/PKCE, callback origins, account linking, and provider configuration are reviewed.

## Authorization and administration

- [ ] Every server route/action performs authorization internally; layouts, middleware, hidden buttons, and client state are not treated as controls.
- [ ] The application denies by default and obtains identity/role/permissions from trusted server-side state.
- [ ] Each object read/write is scoped in the database query to the authenticated owner, tenant, or explicit permission.
- [ ] Admin reads and mutations use distinct least-privilege permissions where their impact differs.
- [ ] Permission names are centrally defined and tested against the role-permission matrix.
- [ ] Anonymous, customer, limited-admin, full-admin, disabled-user, and cross-tenant/cross-user negative cases are tested.
- [ ] Bulk operations, exports, reports, settings, CMS, user management, order/payment state, and file deletion have explicit authorization.
- [ ] Privileged role changes require separation of duties or enhanced approval and generate an alert.
- [ ] Periodic privileged-account and permission reviews are evidenced.

## Input validation, output encoding, and browser security

- [ ] Every route/action parses untrusted input with a server-side schema and rejects unknown or privileged fields.
- [ ] IDs, enums, strings, arrays, dates, URLs, quantities, money, and pagination have type, length, range, and cardinality bounds.
- [ ] Rich HTML is sanitized with an allowlist at a documented boundary and tested against stored/reflected XSS payloads.
- [ ] Output is encoded for its exact HTML, attribute, URL, JavaScript, JSON-LD, email, CSV, and log context.
- [ ] JSON embedded in `<script>` cannot terminate the element (for example through an unescaped `<` or `</script>`).
- [ ] Mutating browser requests have an explicit CSRF strategy consistent with cookie and origin behavior.
- [ ] CORS allows only required origins, methods, headers, and credentials.
- [ ] CSP is deployed and tested; inline/eval allowances have a documented need and migration plan.
- [ ] HSTS, anti-framing, MIME sniffing, referrer, permissions, and cache-control headers are appropriate per route.
- [ ] User-facing errors are generic and stable; stack traces, SQL/provider detail, tokens, and internal paths remain server-side.

## API and availability controls

- [ ] API inventory identifies authentication, authorization, sensitivity, rate, body-size, and response-size requirements for each endpoint.
- [ ] List/search/export APIs use bounded pagination and field projection; no endpoint permits unbounded database or memory work.
- [ ] Request bodies, multipart files, decompressed data, image pixels, arrays, and batch operations have enforceable limits.
- [ ] Rate limits and quotas cover costly operations and cannot be bypassed with superficial header changes.
- [ ] Timeouts, cancellation, retries with jitter, and circuit breakers are defined for database and external calls.
- [ ] Retries are limited to safe/idempotent operations and cannot duplicate orders, payments, emails, or inventory changes.
- [ ] SSRF-sensitive fetches use approved schemes/hosts and block redirects and private/link-local metadata ranges.
- [ ] API version/deprecation policy prevents forgotten legacy endpoints from remaining indefinitely.

## Cart, pricing, discounts, and checkout

- [ ] Quantity is a bounded positive integer at cart, checkout, server action, API, and database boundaries.
- [ ] Product ID, active state, price, tax, shipping, inventory, and discount eligibility are loaded from trusted server data.
- [ ] Money uses integer minor units or fixed precision; rounding rules are documented and tested per currency.
- [ ] Discounts cannot exceed eligible value or produce a negative/non-payable total unless explicitly designed.
- [ ] Coupon validity, usage limits, user eligibility, stacking, refund behavior, and redemption are enforced atomically.
- [ ] Inventory reservation/decrement is conditional and atomic; concurrent checkout cannot oversell or make stock negative.
- [ ] Checkout uses a unique idempotency key and duplicate submissions return the original outcome.
- [ ] The final order records an immutable price/tax/shipping/discount snapshot needed for reconciliation.
- [ ] Client manipulation, negative/fractional/huge quantity, stale price, expired coupon, duplicate request, and concurrency tests pass.
- [ ] Returns, refunds, cancellations, partial fulfillment, and manual admin overrides follow valid state transitions.

## Payment processing

- [ ] A server-created order/payment defines expected merchant, amount, currency, and allowed next state before redirecting to a provider.
- [ ] Browser return URLs never establish payment success by themselves.
- [ ] Webhook authenticity uses the provider-documented signature over the exact required payload with constant-time comparison where applicable.
- [ ] Webhook processing verifies provider transaction, merchant/account, order reference, exact amount, currency, and current state.
- [ ] Provider event/transaction IDs are unique and webhook processing is atomic and idempotent.
- [ ] Replays, duplicates, delays, out-of-order events, invalid signatures, changed amounts, and changed order IDs are tested.
- [ ] Refund/capture/cancel operations require permission, recent authentication where warranted, and reconciliation evidence.
- [ ] No cardholder data, CVV, provider secret, full signed payload, or sensitive token appears in application logs or analytics.
- [ ] Merchant/provider PCI responsibilities and the applicable PCI DSS scope are documented by qualified owners.
- [ ] Production keys, webhook URLs, allowlists, and provider modes are verified separately from sandbox configuration.

## Database and data integrity

- [ ] The application uses parameterized ORM/query APIs; any raw SQL receives focused injection review.
- [ ] Database roles are environment-specific, least privilege, non-owner for runtime, and unable to administer unrelated schemas/databases.
- [ ] Foreign keys, unique keys, not-null rules, positive/range checks, and lifecycle constraints enforce critical invariants.
- [ ] Owner/tenant scoping is represented in indexes/constraints where appropriate and covered by query tests.
- [ ] Multi-step financial, inventory, coupon, and authorization-sensitive writes use correct transactions and isolation/locking.
- [ ] Schema changes use reviewed, versioned migrations with backup, rehearsal, compatibility, rollback, and post-check plans.
- [ ] Backups are encrypted, access-controlled, lifecycle-managed, and regularly restore-tested.
- [ ] Production data is not copied to development/test unless minimized, masked, approved, and lifecycle-controlled.
- [ ] Database network exposure, TLS verification, credential rotation, monitoring, and alerting are evidenced.

## File upload and object storage

- [ ] Upload and delete operations authenticate the caller and verify permission plus object ownership/scope.
- [ ] The server validates decoded content against a narrow allowlist; extension and client MIME are not trusted.
- [ ] Byte size, image dimensions/pixels, frame/page count, compression ratio, processing time, and user quota are limited.
- [ ] Filenames and blob keys are server-generated, normalized, non-executable, and resistant to overwrite/collision/path traversal.
- [ ] Active formats such as SVG/HTML are rejected or sanitized and served with safe headers from a separate origin where possible.
- [ ] Files are scanned/quarantined when the risk model requires it; publication occurs only after validation.
- [ ] Object storage is private by default or public exposure is intentional, minimal, documented, and tested.
- [ ] Deletion, replacement, signed URL, cache, lifecycle, and orphan cleanup behaviors are tested.

## Secrets and configuration

- [ ] No credential, token, private key, connection string, or secret-bearing environment file is present in source, history, logs, build output, tickets, or client bundles.
- [ ] Secrets are stored in an approved manager, injected only into required workloads, and separated by environment.
- [ ] Rotation/revocation procedures are tested; exposures trigger incident handling and old values are proven invalid.
- [ ] Build-time/public environment variables are allowlisted and reviewed for accidental client exposure.
- [ ] Development fallbacks cannot silently enable insecure production behavior.
- [ ] Debug, source maps, test routes, seed/import tools, and verbose errors are disabled or access-controlled in production.

## Dependencies and software supply chain

- [ ] Direct and transitive production dependencies are scanned against current advisories and license policy.
- [ ] Critical/high advisories are upgraded or have documented compensating controls, owner, approval, and expiry.
- [ ] Lockfiles are committed; CI uses deterministic install commands and trusted registries.
- [ ] Package scripts, new maintainers, typosquatting risk, install-time behavior, and large dependency additions receive review.
- [ ] Framework, authentication, payment, image, editor, email, ORM, and build-tool upgrades receive focused regression tests.
- [ ] CI artifacts and deployments are attributable to reviewed commits and protected workflows; secret-bearing forks cannot run privileged jobs.
- [ ] An SBOM and dependency update cadence are maintained for production releases.

## Logging, monitoring, and incident response

- [ ] Logs exclude passwords, secrets, reset/session tokens, signatures, raw payment payloads, full addresses, and unnecessary personal data.
- [ ] Central redaction covers structured fields and free text; log forging/newline injection is prevented.
- [ ] Security events include login abuse, recovery/MFA change, role/permission change, admin mutation, product/price change, order/payment override, upload/delete, and secret/config change.
- [ ] Events carry trustworthy actor, target, result, timestamp, request/correlation ID, and minimal network context.
- [ ] Audit trails are access-controlled, integrity-protected, retained by policy, and monitored; failure to log is observable.
- [ ] Alerts have owners, severity thresholds, runbooks, escalation paths, and periodic response tests.
- [ ] Incident procedures cover credential exposure, account takeover, payment manipulation, PII disclosure, malware upload, and dependency compromise.

## Privacy and compliance

- [ ] The data inventory states what is collected, purpose/lawful basis, source, location, recipients/processors, retention, and deletion method.
- [ ] Collection is necessary and proportionate; optional marketing/analytics consent is distinguishable and recorded where required.
- [ ] Privacy and cookie notices match actual code, providers, transfers, retention, rights, and contact channels.
- [ ] Authenticated workflows support applicable access/export, correction, deletion, restriction, objection/opt-out, and appeal/complaint rights.
- [ ] Identity verification for privacy requests is proportionate and does not expose another person's records.
- [ ] Retention and deletion apply to primary records, blobs, logs, caches, exports, vendors, and backup lifecycle with documented exceptions.
- [ ] Processor agreements, subprocessors, cross-border transfer mechanisms, breach duties, and data-subject request SLAs are reviewed by legal/privacy owners.
- [ ] Children's data, sensitive data, automated decisions, and targeted advertising/sale/sharing are assessed where applicable.
- [ ] PCI DSS applicability and evidence are determined with the payment provider/acquirer; source review alone is not represented as compliance.

## CI/CD and deployment

- [ ] CI blocks failed type checks, lint, unit/integration/security tests, migrations, secret scans, and configured dependency thresholds.
- [ ] Branch protection requires review and prevents untrusted users from changing workflows, deployment settings, or production secrets unilaterally.
- [ ] Environments use separate accounts/projects, databases, storage, domains, keys, providers, and access policies.
- [ ] Production TLS, HSTS, CDN/WAF, firewall/private networking, DNS, certificates, headers, and origin access are independently tested.
- [ ] Runtime identities and cloud resources follow least privilege; administrative changes and denied access are monitored.
- [ ] Deployment supports safe rollback without schema/data loss, and emergency disablement exists for checkout/payment/admin routes.
- [ ] Health checks expose no sensitive information; monitoring covers latency, errors, auth abuse, checkout/payment anomalies, stock, queues, and provider failures.
- [ ] Disaster recovery objectives, backup restores, region/provider failure, and secret compromise scenarios are exercised.

## Security test suite and release decision

- [ ] Unit tests cover validators, money arithmetic, permission predicates, state machines, signatures, sanitization, and redaction.
- [ ] Integration tests exercise the real database constraints/transactions and all external-provider adapters in sandbox or mocks.
- [ ] End-to-end negative tests bypass the UI and directly call every route/action as unauthorized roles.
- [ ] Concurrency tests cover stock, coupon redemption, order creation, payment webhooks, refunds, and retries.
- [ ] Dependency, secret, static analysis, and dynamic scans are reviewed by a human and false positives are documented.
- [ ] A safe staging penetration test covers access control, business logic, payments, uploads, XSS/CSRF, SSRF, rate limits, and deployment configuration.
- [ ] Previously fixed findings are regression-tested against the exact release candidate.
- [ ] Release approval records the residual findings, evidence, risk owners, time-bound exceptions, rollback plan, and final decision.

## Current Qaam.pk release blockers

The following boxes should remain unchecked until objective retest evidence exists:

- [ ] SEC-005: the disclosed database credential has been revoked and reviewed as a security incident.
- [ ] SEC-001: public auth payloads cannot assign/change roles and existing privileged identities/sessions were reviewed.
- [ ] SEC-002/SEC-008: every admin read/mutation enforces exact server-side authorization.
- [ ] SEC-003: legacy payment endpoints are blocked or a provider-bound, amount-bound, idempotent flow passes sandbox tests.
- [ ] SEC-004/SEC-011/SEC-019: checkout invariants and concurrent inventory/coupon/order behavior are enforced in code and database.
- [ ] SEC-006: the public test importer is absent or securely restricted in the deployed artifact.
- [ ] SEC-007: customer objects are always session-owned and legacy caller-supplied identity paths are unreachable or removed.
- [ ] SEC-009/SEC-010: storage mutations and CMS/JSON-LD rendering pass authorization, file, and XSS tests.
- [ ] SEC-012/SEC-021: dependency, type, lint, and automated security gates meet the approved release policy.
- [ ] Production cloud, payment-provider, privacy/legal, and PCI evidence identified as “Needs Verification” has been independently reviewed.
