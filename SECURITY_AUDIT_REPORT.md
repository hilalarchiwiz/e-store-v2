# Security Audit Report

**Application:** Qaam.pk e-commerce  
**Review date:** 2026-08-11 (Asia/Karachi)  
**Repository state:** `master` at `a39db8c338a7d0a8c3df03296473aff091ef666b`, including the uncommitted working tree present during review  
**Assessment type:** Authenticated source-code/configuration/dependency review; no destructive or production dynamic testing  
**Overall posture:** **High risk / not production-ready**

## Executive summary

The application has several good foundations: Prisma ORM rather than raw SQL, database-backed Better Auth sessions, server-side product-price recalculation, session-scoped customer order reads, address ownership checks, transaction-wrapped order creation, a package lock, and broad use of permission wrappers on newer admin actions.

Those controls are undermined by four critical paths. A public Better Auth field permits role assignment, order administration actions disclose all order/customer data and change payment/order status without authorization, legacy payment confirmation is not bound to an order or amount, and checkout accepts invalid quantity/discount states that can create negative totals or increase inventory. The audit also confirmed unauthenticated product import, storage mutation, multiple admin action gaps, object-level authorization failures, XSS sinks, concurrency defects, and a materially vulnerable dependency baseline.

Immediate production controls should be: rotate the disclosed database credential; block `/api/test-upload`, `/api/payfast/init`, and `/api/checkout/confirm`; disable checkout until positive-quantity/non-negative-total controls are deployed; prevent client input to `roleName`; revoke and inspect privileged sessions/accounts; and protect every admin action server-side.

### Finding counts

| Severity | Count |
| --- | ---: |
| Critical | 4 |
| High | 8 |
| Medium | 9 |
| Low | 1 |
| Informational | 1 |
| **Total** | **23** |

The dependency scanner separately reported 4 critical, 25 high, 28 moderate, and 1 low production package entries. Those package entries are deduplicated into SEC-012 and are not added one-for-one to the application finding table.

### Prioritized Top 10

| Rank | ID | Finding | Severity | Affected area | Recommended action |
| ---: | --- | --- | --- | --- | --- |
| 1 | SEC-005 | Database credential disclosed in supplied context | High | Secrets/PostgreSQL | Rotate now, revoke old credential, inspect logs |
| 2 | SEC-001 | Client-writable role enables privilege escalation | Critical | Authentication/RBAC | Make role non-input, force server default, audit users/sessions |
| 3 | SEC-002 | Order admin actions lack authorization | Critical | Orders/PII/payments | Wrap all reads/mutations in exact permissions; add tests |
| 4 | SEC-004 | Checkout accepts invalid numeric states | Critical | Cart/checkout/inventory | Enforce positive integer quantities and non-negative money in app/DB |
| 5 | SEC-003 | Payment confirmation is replayable and not order-bound | Critical | Payments/orders | Disable routes; rebuild using provider verification and idempotent webhooks |
| 6 | SEC-006 | Public endpoint creates active products | High | Product/pricing integrity | Remove route or require dedicated authenticated import capability |
| 7 | SEC-008 | Admin settings/content/grading actions are unguarded | High | Admin/CMS/settings | Centralize action authorization; use mutation-specific permissions |
| 8 | SEC-007 | Cart/wishlist/history and legacy checkout have BOLA flaws | High | Customer data/commerce | Derive subject from session/cookie; verify row ownership atomically |
| 9 | SEC-009 | Upload/delete actions lack authorization and robust validation | High | Azure/media | Authenticate, validate bytes/limits, record ownership, isolate storage |
| 10 | SEC-012 | Production dependency tree contains known vulnerabilities | High | Supply chain/runtime | Upgrade Next, Better Auth, Sharp, Swiper, Inngest, mail/toolchain packages |

## Scope

Reviewed areas include:

- 613 tracked files and 343 source/schema files under `app`, `components`, `lib`, `prisma`, `redux`, `hooks`, and `types`
- Public, authenticated-customer, admin, invoice, authentication, API, checkout, order, payment, upload, content, and external-integration paths
- Prisma schema, the single committed migration, audit extension, session/anonymous cookies, role permissions, email, Azure, ERP, and scraper tooling
- `package.json`, `package-lock.json`, Next/TypeScript/ESLint/Prisma configuration, `.gitignore`, current tracked files, and 54-commit secret-path history
- Existing backup/dead-code directories as code-quality and attack-surface indicators

Unavailable: cloud/IaC configuration, deployed responses and cookies, database/cloud IAM, provider dashboards/contracts, backups, monitoring, WAF/CDN, production traffic/logs, organizational policies, and a safe staging environment.

## Methodology and commands

- Manual data-flow and trust-boundary review, following caller input through Route Handlers/Server Actions to Prisma, storage, email, and payment sinks
- Server-side authorization review of 38 files containing `use server`
- Route/page/action/schema/configuration inventory with `rg`, Git, and PowerShell
- Secret identifier and sensitive-file scan of the current tree and Git history; values were not printed
- `npm audit --json` and `npm audit --omit=dev --json` on 2026-08-11
- `npx tsc --noEmit --pretty false`: pass, zero compiler errors
- `npx eslint .`: fail, 673 findings (357 errors, 316 warnings)

No exploit requests were sent and no database/storage mutations were performed. The configured database appeared production-facing, so dynamic tests were intentionally withheld. A finding is marked **Needs Verification** when deployed reachability or provider behavior could not be safely established.

## Architecture and attack surface

The application is a single Next.js deployment with customer and admin route groups, Route Handlers, and Server Actions backed by Prisma/PostgreSQL. Better Auth provides email/password and Google OAuth database sessions. Media is stored in Azure Blob Storage, mail is sent over SMTP, and an ERP endpoint supplies product/inventory information. Current checkout exposes COD and bank transfer; Safepay/PayFast code is incomplete/legacy but routable in source.

High-risk public entry points are `/api/auth/[...all]`, `/api/test-upload`, `/api/payfast/init`, `/api/checkout/confirm`, `/api/products`, customer Server Actions, HTML-rendering CMS routes, and upload actions. Admin pages use layout/page guards, but Server Actions require independent checks. See [ARCHITECTURE_AND_DATA_FLOW.md](ARCHITECTURE_AND_DATA_FLOW.md) for the full inventory.

## Findings

## [SEC-001] Client-writable `roleName` enables vertical privilege escalation

**Severity:** Critical  
**Confidence:** Confirmed  
**Category:** Broken access control; mass assignment  
**CWE/OWASP Mapping:** CWE-269, CWE-915; OWASP Top 10 A01 Broken Access Control; API3 Broken Object Property Level Authorization  
**Affected Component:** Better Auth registration/user update and admin RBAC  
**Files:** `lib/auth.ts`, `components/v2/Auth/RegisterForm.tsx`, `prisma/schema.prisma`, `app/(admin)/admin/(admin)/layout.tsx`; installed Better Auth `dist/db/schema.mjs` and `dist/api/routes/{sign-up,update-user}.mjs`  
**Lines:** `lib/auth.ts:37-43`; `RegisterForm.tsx:69-75`; `schema.prisma:117-136`; admin layout `30-45`  
**Affected Endpoint/Feature:** Better Auth sign-up and update-user routes; admin role resolution

### Description

`roleName` is declared as a Better Auth `additionalField` without `input: false` or a server default. Better Auth 1.4.7 parses supplied additional fields during both sign-up and user update unless input is explicitly disabled. The UI sending `roleName: "user"` is not a control. An attacker can call the auth route directly with the name of an existing privileged role.

The `User.roleName` foreign key resolves to `Role.name`; the admin layout accepts any session role other than the literal `user`, and `hasPermission` then loads that role's permissions. This can become full admin takeover.

### Evidence

```ts
user: {
  additionalFields: {
    roleName: { type: 'string' },
  },
}
```

Installed Better Auth code only rejects a field when `fields[key].input === false`, and spreads parsed fields into `createUser`/`updateUser`.

### Attack / Failure Scenario

A public registrant changes the sign-up body from `roleName: "user"` to a guessed/known privileged `Role.name`, or an authenticated user submits `roleName` to update-user. The created/updated session user then enters `/admin` and receives the permissions attached to that role.

### Business Impact

Admin takeover permits user/role changes, catalog/pricing/inventory manipulation, order/customer PII access, settings/media changes, and further persistence.

### Recommended Fix

Make role input-disabled and server-defaulted, remove it from the public auth client schema, and assign privileged roles only through a separately authorized admin action. Audit every existing non-`user` account and revoke all sessions after deployment.

### Secure Implementation Example

```ts
roleName: {
  type: "string",
  input: false,
  defaultValue: "user",
}
```

Also use an adapter/database hook that overwrites public sign-up roles regardless of body content.

### Verification

Attempt sign-up and update-user with every privileged role name; both must reject or ignore the field and persist `user`. Verify only a user with `user_update` can change roles and that the action prevents self-escalation/last-admin removal. Review existing accounts and session revocation. Residual risk remains if any other writable field controls authorization.

## [SEC-002] Order administration actions expose PII and alter state without authorization

**Severity:** Critical  
**Confidence:** Confirmed  
**Category:** Broken function-level authorization; excessive data exposure  
**CWE/OWASP Mapping:** CWE-862, CWE-200; OWASP A01; API5 Broken Function Level Authorization  
**Affected Component:** Admin order Server Actions  
**File:** `app/(admin)/admin/(admin)/orders/actions/order.action.ts`  
**Lines:** 56-120, 123-138  
**Affected Endpoint/Feature:** `getOrders`, `updateOrderStatus`, `updatePaymentStatus`

### Description

These exported Server Actions do not call `withPermission`, `hasPermission`, or even `generateSession`. `getOrders` returns full users, billing/shipping addresses, order items, and products. The two mutations accept an order ID and enum value and update the record directly. Guarding `/admin/orders` with `RoleGuard` does not authorize the action endpoint.

### Evidence

`saveInvoice` at line 140 correctly uses `withPermission("order_status_manage", ...)`, demonstrating the intended pattern; the three preceding functions bypass it.

### Attack / Failure Scenario

An unauthenticated or low-privilege caller obtains/invokes the action identifier, enumerates orders and PII, then marks an order paid, cancelled, delivered, or otherwise changes its workflow state.

### Business Impact

Major personal-data breach, false fulfillment/revenue records, fraud, customer support damage, and loss of audit reliability.

### Recommended Fix

Wrap reads in `order_view`; use distinct `order_status_manage` and payment-recording permissions for mutations. Validate transitions in a central state machine, return minimal fields, add actor/reason/audit metadata, and avoid a generic payment-status setter.

### Secure Implementation Example

```ts
export async function updateOrderStatus(id: string, next: OrderStatus) {
  return withPermission("order_status_manage", async () => {
    // load current state, validate allowed transition, then update
  });
}
```

### Verification

Integration-test each action as unauthenticated, customer, view-only admin, and authorized operator. Assert denial and no data/mutation for the first three identities. Verify transition and audit events. Residual risk includes privileged insider abuse, which requires least privilege and monitoring.

## [SEC-003] Payment initiation/confirmation is not bound to a trusted order and is replayable

**Severity:** Critical  
**Confidence:** Needs Verification (confirmed code defect; deployed/provider reachability not tested)  
**Category:** Payment integrity; replay; improper authorization  
**CWE/OWASP Mapping:** CWE-345, CWE-294, CWE-862; OWASP A04 Cryptographic Failures/A06 Insecure Design  
**Affected Component:** Safepay callback and PayFast/APS prototype  
**Files:** `app/api/checkout/confirm/route.ts`, `app/api/payfast/init/route.ts`, `lib/payfast.ts`, `lib/payments/aps.ts`  
**Lines:** confirm `5-51`; init `4-35`; payfast `5-30`  
**Affected Endpoint/Feature:** `GET /api/checkout/confirm`, `POST /api/payfast/init`; absent `/api/payfast/ipn`

### Description

The public initiation route signs caller-supplied `amount` and `order_id` using MD5. The confirmation route verifies an HMAC only over `tracker`; `order_id`, `reference`, amount, currency, customer, and expected payment state are not authenticated together. A valid tracker/signature pair can therefore be replayed with a different order ID. The route does not query the provider, uses ordinary string equality, has no event idempotency, and updates asynchronously. Even a bad signature changes the caller-selected order to `FAILED`.

Current checkout does not call these paths and offers COD/bank transfer, but the Route Handlers exist. Provider semantics and production exposure require staging verification.

### Attack / Failure Scenario

A caller obtains one valid redirect tuple, substitutes another order number while reusing the tracker HMAC, and marks that order paid. The initiation endpoint can also act as a merchant signing oracle for arbitrary order/amount pairs.

### Business Impact

Unpaid fulfillment, payment/order mismatch, fraudulent revenue records, denial of service by false failures, reconciliation failure, and PCI/payment-provider incident response.

### Recommended Fix

Block these routes until rebuilt. Create payment attempts server-side from an authenticated order and server-calculated amount/currency. Persist provider transaction ID, expected order/amount/currency, status, and an idempotency key. Verify the provider's signed server-to-server webhook exactly as documented, use timing-safe comparison where applicable, query/reconcile provider state, and enforce one-way state transitions in a transaction. Do not use browser redirects as proof of payment.

### Secure Implementation Example

```ts
// Pseudocode: provider-specific verification is mandatory
const attempt = await db.paymentAttempt.findUnique({ where: { providerEventId } });
verifyProviderSignature(rawBody, headers, configuredSecret);
assert(event.orderId === attempt.orderId);
assert(event.amount === attempt.expectedAmount && event.currency === "PKR");
await applyEventIdempotently(attempt, event);
```

### Verification

In a disposable provider sandbox, test replay, changed order/amount/currency/reference, duplicate/concurrent webhook, invalid signature, late failure/refund, and out-of-order events. Confirm no route can mark paid without provider verification. Obtain provider/security review before enabling. Residual risk includes provider compromise and operational reconciliation errors.

## [SEC-004] Checkout accepts invalid quantity and discount states

**Severity:** Critical  
**Confidence:** Confirmed  
**Category:** Business-logic validation; improper input validation  
**CWE/OWASP Mapping:** CWE-20, CWE-840; OWASP A06 Insecure Design; API6 Unrestricted Access to Sensitive Business Flows  
**Affected Component:** Anonymous cart and active checkout  
**Files:** `lib/action/cart.action.ts`, `lib/action/v2-order.action.ts`, `prisma/schema.prisma`  
**Lines:** cart `7-42`; order `65-122`, `142-177`; schema `216-229`, `291-369`  
**Affected Endpoint/Feature:** `addToCart`, `placeOrder`, fixed coupons, stock decrement

### Description

`addToCart` does not require quantity to be a positive integer. A negative quantity passes the maximum-stock check and can be stored. `placeOrder` only checks `product.quantity < item.quantity`, so a negative item passes, produces a negative subtotal/order item, and `decrement: item.quantity` increases stock. A fixed coupon is not capped to subtotal and the final total is not constrained non-negative. The database has no quantity/monetary check constraints.

### Attack / Failure Scenario

A caller invokes the cart action with a negative quantity and places an order. Alternatively, a fixed coupon larger than the subtotal creates a zero/negative payable order. Inventory and financial records become incorrect even without browser UI support.

### Business Impact

Invalid/negative orders, inventory inflation, coupon abuse, reporting/accounting corruption, customer support failures, and potential fraudulent credits or fulfillment.

### Recommended Fix

Use shared runtime schemas for positive integer quantity, supported shipping/payment enum, bounded notes/address fields, and coupon codes. Cap discount to eligible subtotal, reject `total < 0`, and round/represent money in minor units or Decimal. Add PostgreSQL checks for positive quantities and non-negative monetary/count fields. Clean existing invalid rows before constraints.

### Secure Implementation Example

```ts
const quantity = z.number().int().min(1).max(MAX_PER_ITEM).parse(input.quantity);
const discount = Math.min(calculatedDiscount, subtotal);
const totalMinor = subtotalMinor + shippingMinor - discountMinor;
if (totalMinor < 0) throw new Error("Invalid order total");
```

### Verification

Test negative, zero, fractional, huge, overflow/NaN, coupon-over-subtotal, and modified Server Action bodies. Assert no invalid cart/order rows and no inventory increase. Add database-constraint tests and scan/repair existing data. Residual risk includes catalog mispricing and authorized coupon misconfiguration.

## [SEC-005] A database credential was disclosed in the supplied audit context

**Severity:** High  
**Confidence:** Confirmed  
**Category:** Secret exposure  
**CWE/OWASP Mapping:** CWE-200, CWE-522; OWASP A02 Security Misconfiguration/A04 Cryptographic Failures  
**Affected Component:** Production-looking PostgreSQL credential and environment handling  
**Files:** `.env` (value intentionally omitted), `.gitignore`  
**Lines:** `.gitignore:33-34`; secret value not reproduced  
**Affected Endpoint/Feature:** Database authentication

### Description

The IDE context supplied for this audit displayed a complete database connection credential. `.env*` is ignored and no `.env`/private-key path was found in the tracked tree or 54-commit history, which is positive, but disclosure in a chat, screenshot, ticket, or audit transcript is still disclosure. Other local secrets must also be assessed for exposure history.

### Attack / Failure Scenario

A party with transcript access uses the credential to connect if firewall/network policy permits, or reuses it against another environment.

### Business Impact

Database confidentiality/integrity loss, customer PII breach, order/catalog manipulation, destructive access, and regulatory/contractual incident obligations.

### Recommended Fix

Rotate the database password immediately, revoke the old credential, inspect authentication/query/audit logs from the exposure time, validate backups, and create a separate least-privilege runtime identity. Rotate any other credential that appeared in the same disclosure channel. Move production secrets to a managed secret store/managed identity and prohibit copying values into support channels.

### Secure Implementation Example

Inject `DATABASE_URL` at deployment from a vault and expose only a placeholder in documentation; do not generate or print the value in CI logs.

### Verification

Confirm the old credential fails, the application works with the new least-privilege identity, and no unexpected connections/changes occurred. Complete incident triage with the database/cloud owner. Residual risk depends on log coverage and how long the exposed credential was valid.

## [SEC-006] Public test importer mass-assigns active products

**Severity:** High  
**Confidence:** Confirmed  
**Category:** Broken function-level authorization; mass assignment  
**CWE/OWASP Mapping:** CWE-862, CWE-915; OWASP A01; API3/API5  
**Affected Component:** Product import Route Handler and scraper  
**Files:** `app/api/test-upload/route.ts`, `testing-product-python/main.py`  
**Lines:** route `4-29`; scraper `109-113`, `184-198`  
**Affected Endpoint/Feature:** `POST /api/test-upload`

### Description

The endpoint accepts arbitrary JSON without authentication or validation and creates an `active` product using caller-selected title, description, price, discounted price, quantity, images, specifications, brand, and category. Database errors are returned to the caller.

### Attack / Failure Scenario

Anyone posts fraudulent products with manipulated price/stock or attacker-controlled content/URLs. The included scraper demonstrates the expected unauthenticated calling pattern.

### Business Impact

Catalog defacement, pricing fraud, stored-XSS chaining, third-party content ingestion, database/storage growth, and trust/reputation damage.

### Recommended Fix

Remove the route from production. If imports are required, create a dedicated authenticated job/admin capability with least privilege, strict schema, bounded batch size, draft state, provenance, allowlisted source/media domains, duplicate detection, review/approval, audit records, and rate/queue controls.

### Secure Implementation Example

Return `404` for the route in production until a secured importer replaces it; do not rely on an undocumented shared query string.

### Verification

Anonymous/customer requests must fail without creating rows. Test all fields, oversized batches, duplicates, malicious HTML/URLs, and audit/approval behavior. Residual risk remains in trusted-source compromise and licensing/provenance.

## [SEC-007] Customer commerce actions have object-level authorization failures

**Severity:** High  
**Confidence:** Confirmed for row-ID actions; Needs Verification for legacy action reachability  
**Category:** BOLA/IDOR; caller-controlled identity  
**CWE/OWASP Mapping:** CWE-639, CWE-862; OWASP A01; API1 Broken Object Level Authorization  
**Affected Component:** Cart, wishlist, recently viewed, and legacy checkout/actions  
**Files:** `lib/action/cart.action.ts`, `lib/action/wishlist.action.ts`, `lib/action/home.action.ts`, `lib/action/checkout.action.ts`  
**Lines:** cart `54-90`; wishlist `36-40`; home `453-626`, `774-877`; checkout `25-35`, `98-225`  
**Affected Endpoint/Feature:** Row update/delete; actions accepting `userId`; `processCheckout`

### Description

Cart update/delete and wishlist delete use only caller-supplied row IDs, not the current anonymous/session owner. Wishlist IDs are sequential. Older home actions accept `userId` for history/cart/wishlist reads and writes. Legacy `processCheckout` trusts caller `userId` and cart items without binding them to the current session. The newer active order action is better scoped, but the insecure exports remain source attack surface.

### Attack / Failure Scenario

A caller changes/deletes another cart/wishlist record, reads/clears another user's commerce history by user ID, or—if legacy action IDs are deployed—places/manipulates an order on another account.

### Business Impact

Customer privacy loss, cart tampering, denial of purchase, incorrect orders/addresses, and degraded trust.

### Recommended Fix

Never accept an authorization subject from the caller. Derive the user from the session or anonymous owner cookie and combine owner+row in the database operation. Delete obsolete action exports and inspect build manifests to ensure they are not registered. Add unique owner/product constraints.

### Secure Implementation Example

```ts
const owner = await requireCommerceOwner();
const result = await prisma.cart.deleteMany({ where: { id: cartId, ...owner } });
if (result.count !== 1) throw new Error("Not found");
```

### Verification

Use two users/two anonymous sessions and cross-submit every ID/user ID. All cross-owner operations must return indistinguishable not-found responses and preserve data. Inspect production Server Action manifests after removing legacy exports. Residual risk is identifier leakage plus any missed caller-controlled subject.

## [SEC-008] Multiple admin capabilities bypass action-level authorization

**Severity:** High  
**Confidence:** Confirmed  
**Category:** Broken function-level authorization; RBAC inconsistency  
**CWE/OWASP Mapping:** CWE-862, CWE-863; OWASP A01; API5  
**Affected Component:** Settings, grading, About CMS, dashboard analytics  
**Files:** `app/(admin)/admin/(admin)/setting/actions/setting.action.ts`; `(grading)/actions/grade.action.ts`; `about/team/actions/team.action.ts`; `about/what-we-do/actions/whatwedo.action.ts`; `app/(admin)/admin/actions/dashboard.ts`  
**Lines:** settings `7-103`; grading `10-127`; team CRUD approximately `28-204`; what-we-do `27-209`; dashboard `5-137`  
**Affected Endpoint/Feature:** Generic settings, About content, grading CRUD, dashboard/recent activity

### Description

The exported actions have no internal session/permission check. `updateSettings` accepts an arbitrary key, revalidation path, fields, and uploads. About and grading CRUD write public/admin data. Dashboard reads expose internal aggregates and recent user/anonymous identifiers. Page `RoleGuard` checks do not secure these action invocations; settings/About pages also often guard viewing rather than mutation.

Additional permission-name mismatches exist (for example brand/coupon edit pages guarded by `banner_update`, blog deletion using `blog_update`, and permission constants/actions using different names), increasing RBAC drift.

### Attack / Failure Scenario

An unauthenticated/customer/view-only role invokes actions directly to change public site configuration/content, upload media, change grading, or collect internal activity identifiers.

### Business Impact

Defacement, malicious links/content, availability/configuration damage, privacy exposure, and erosion of least privilege/audit evidence.

### Recommended Fix

Apply `withPermission` inside every action with mutation-specific permissions (`settings_update`, `about_update`, dedicated grading CRUD). Validate allowed setting keys and revalidation paths server-side. Generate a single typed permission registry and deny unknown permissions. Add authorization tests independent of page rendering.

### Verification

Create a permission/endpoint matrix and test unauthenticated, customer, view-only, module-editor, and super-admin identities. Unknown permissions and keys must fail closed. Verify each mutation records the correct actor. Residual risk includes over-broad role definitions.

## [SEC-009] Media upload and deletion actions lack authorization and robust file controls

**Severity:** High  
**Confidence:** Confirmed  
**Category:** Unrestricted upload; missing authorization; resource exhaustion  
**CWE/OWASP Mapping:** CWE-434, CWE-862, CWE-400; OWASP A01/A06  
**Affected Component:** Azure Blob media  
**Files:** `lib/action/FileUpload.tsx`, `lib/azure-upload.ts`, `next.config.ts`, customer profile upload  
**Lines:** FileUpload `28-97`, `99-176`; raw upload `13-42`; config `10-16`; profile `31-52`  
**Affected Endpoint/Feature:** Single/multiple upload, raw rich-text upload, blob deletion

### Description

Server Actions do not authenticate or authorize. Image uploads have no explicit allowlist, byte-signature check, pixel/dimension limit, per-user quota, or ownership record; they buffer the full body and call a currently vulnerable Sharp version. The global Server Action cap is 10 MB. `uploadToAzure` preserves arbitrary bytes, filename, and caller MIME type in publicly reachable storage. Delete functions accept URLs and derive blob names without checking owner/purpose.

### Attack / Failure Scenario

A caller consumes CPU/memory/storage with crafted images, hosts active content through raw upload, or deletes known blobs. A malicious image targets the vulnerable processing library.

### Business Impact

Storage/compute cost, denial of service, malware/content hosting, public-content loss, privacy exposure of avatars, and possible native image-library compromise.

### Recommended Fix

Authenticate each action and authorize purpose/owner. Enforce smaller per-purpose byte and pixel limits before full processing; inspect magic bytes; allow raster formats; decode/re-encode; use generated names; patch Sharp; rate-limit/quota; store media ownership; require ownership for deletion. Separate customer/private and public CMS containers and use scoped managed identity/SAS where possible.

### Verification

Test unauthenticated, cross-owner delete, wrong MIME/extension, SVG/HTML/polyglot, malformed/decompression-bomb, oversized dimensions, batch flood, and known image corpus. Verify storage access level and lifecycle in Azure. Residual risk includes parser zero-days and authorized malicious content.

## [SEC-010] Unsanitized HTML and JSON-LD create stored/reflected XSS paths

**Severity:** High  
**Confidence:** Confirmed sinks and sources; browser exploit chain should be verified in staging  
**Category:** Cross-site scripting  
**CWE/OWASP Mapping:** CWE-79; OWASP A05 Injection  
**Affected Component:** FAQ, blog, dynamic pages, shop/product structured data  
**Files:** `components/v2/FaqAccordion.tsx`; `app/(site)/blog/[slug]/page.tsx`; `app/(site)/[slug]/page.tsx`; `app/(site)/shop/page.tsx`; `app/(site)/product/[id]/page.tsx`; related CMS actions  
**Lines:** FAQ `63-70`; blog `100-111`; page `74-86`; shop `83-122`, `269-289`; product `126-150`  
**Affected Endpoint/Feature:** Public CMS rendering, search JSON-LD, product JSON-LD

### Description

CMS HTML is written without sanitization and inserted using `dangerouslySetInnerHTML`. Page/FAQ schemas only enforce minimum length; blog has no content schema. JSON-LD uses `JSON.stringify` inside raw script content without escaping `<`, while shop `search` comes directly from a query string and product fields can be populated through the public importer. A `</script>` payload can escape script context in typical HTML parsing.

### Attack / Failure Scenario

A content editor, compromised admin, or public product-import caller stores script-capable HTML; or a victim opens a crafted shop search URL containing a script-closing payload.

### Business Impact

Session/action abuse, customer/admin phishing, checkout manipulation, defacement, credential capture, and persistent compromise of visitors.

### Recommended Fix

Sanitize on write with a strict server-side allowlist and optionally again on render. Strip script/event/style/unsafe URL schemes; harden editor link/image rules. Escape `<` in JSON-LD (`replace(/</g, "\\u003c")`) or use a vetted serializer. Deploy a nonce/hash-based CSP only after sinks are removed; CSP is defense in depth.

### Verification

Use an XSS corpus across HTML, attributes, SVG, links, CSS, editor paste, `</script>` JSON-LD, and encoded variants. Assert inert output in multiple browsers and no CSP violations. Residual risk remains when allowing rich HTML or external media.

## [SEC-011] Checkout is vulnerable to overselling, coupon overuse, and duplicate-order races

**Severity:** High  
**Confidence:** Confirmed  
**Category:** Race condition; missing idempotency  
**CWE/OWASP Mapping:** CWE-362, CWE-367, CWE-841; OWASP A06; API6  
**Affected Component:** Active checkout transaction  
**File:** `lib/action/v2-order.action.ts`  
**Lines:** stock/coupon checks `55-119`; transaction/mutations `124-183`  
**Affected Endpoint/Feature:** `placeOrder`

### Description

Stock and coupon-limit checks occur before the transaction. The later transaction unconditionally decrements stock and increments coupon usage. Two concurrent calls can both pass the precheck. There is no idempotency key/unique checkout attempt; concurrent submissions can observe the same cart and create two orders before either deletes it.

### Attack / Failure Scenario

Automated parallel submissions buy the last unit multiple times, exceed coupon limits, or create duplicate orders/decrements.

### Business Impact

Overselling, lost margin, customer cancellations/refunds, incorrect inventory, support workload, and reconciliation disputes.

### Recommended Fix

Introduce a client-generated idempotency key bound to user/cart and unique in the database. Perform conditional stock/coupon updates inside one serializable/retryable transaction, requiring `quantity >= requested` and `usageCount < usageLimit`, and fail unless each affected-row count is one. Consider reservation/expiration for online payments.

### Verification

Run parallel integration tests against a disposable PostgreSQL instance for last-item, last-coupon, and duplicate-key cases. Exactly one order must succeed and stock/counts must remain valid. Residual risk includes distributed retries and abandoned reservations.

## [SEC-012] Installed production dependency tree contains known vulnerabilities

**Severity:** High  
**Confidence:** Confirmed scanner result; exploitability varies by feature  
**Category:** Vulnerable/outdated components; software supply chain  
**CWE/OWASP Mapping:** CWE-1104; OWASP A03 Software Supply Chain Failures  
**Affected Component:** npm dependency/lockfile  
**Files:** `package.json`, `package-lock.json`  
**Lines:** dependencies `package.json:14-65`  
**Affected Endpoint/Feature:** Next Server Actions/proxy/images, Better Auth/OAuth, uploads, UI, email, Inngest/transitives

### Description

On 2026-08-11, `npm audit --omit=dev --json` reported 58 production entries: 4 critical, 25 high, 28 moderate, 1 low. Direct affected packages were Better Auth 1.4.7, Swiper 12.0.3, Inngest 3.49.1, Next 16.0.10, Nodemailer 8.0.7, PostCSS 8.5.6, Prisma 7.2.0, Sharp 0.34.5, and UUID 13.0.0.

Relevant advisories include Better Auth OAuth/account/rate-limit issues, Next Server Action/proxy bypass/DoS/SSRF/disclosure issues, Sharp/libvips flaws, Swiper prototype pollution, Inngest environment disclosure, and transitive protobuf/grpc/telemetry issues. Examples: [Better Auth GHSA-g38m-r43w-p2q7](https://github.com/advisories/GHSA-g38m-r43w-p2q7), [Next GHSA-m99w-x7hq-7vfj](https://github.com/advisories/GHSA-m99w-x7hq-7vfj), [Sharp GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [Swiper GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643).

### Attack / Failure Scenario

Attackers target exposed framework actions/proxy paths, authentication/OAuth behavior, crafted image processing, or vulnerable browser/transitive parsers. Some flagged plugin-specific Better Auth paths are not configured; others match deployed features.

### Business Impact

Authentication/account compromise, authorization/proxy bypass, denial of service, information disclosure, image-processing compromise, and client-side integrity loss.

### Recommended Fix

Upgrade in a review branch, prioritizing a non-vulnerable Next release (audit proposed 16.3.0), Better Auth, Sharp (audit proposed 0.35.3), Swiper >=12.1.2, Inngest >=3.54.0, UUID >=13.0.1, and fixed mail/toolchain versions. Remove unused Inngest/legacy dependencies. Re-run audit, inspect breaking changes, and regression-test auth/actions/uploads/UI.

### Verification

Require `npm audit --omit=dev` to meet an approved zero/high-risk policy with documented exceptions; run SBOM/SCA in CI and retest affected flows. Do not run blind `npm audit fix --force` in production. Residual risk includes undisclosed vulnerabilities and unexercised upgrade paths.

## [SEC-013] Audit logging duplicates sensitive records without redaction, reliable actor context, or retention

**Severity:** Medium  
**Confidence:** Confirmed  
**Category:** Sensitive data exposure; audit integrity/privacy  
**CWE/OWASP Mapping:** CWE-532, CWE-359; OWASP A09 Security Logging and Alerting Failures  
**Affected Component:** Prisma query extension and `AuditLog`  
**Files:** `lib/prisma.ts`, `prisma/schema.prisma`, `lib/action-utils.ts`  
**Lines:** Prisma `124-203`; schema `497-506`; wrapper `7-35`  
**Affected Endpoint/Feature:** Most Prisma create/update/delete operations and audit UI

### Description

Most records are serialized wholesale into `oldData`/`newData`, including users, addresses, reviews, contacts, orders, settings, and payment references. There is no field allowlist/redaction, retention, integrity protection, or relation to a controlled actor. Only actions run through `withPermission` set `userContext`; customer and unguarded actions appear as `SYSTEM`. Bulk operations are not equivalently covered.

### Attack / Failure Scenario

A user with audit access—or an attacker after a database/admin breach—obtains additional copies of PII and operational data. Investigators cannot reliably distinguish system/customer/unauthorized changes.

### Business Impact

Greater breach impact and retention burden, misleading incident evidence, storage growth, and privacy/compliance gaps.

### Recommended Fix

Define an event schema with actor ID/type, action, object type/ID, request/correlation ID, outcome, reason, and a minimal allowlisted diff. Never log secrets/tokens/full PII. Add append-only protections/export, retention/deletion rules, access monitoring, and coverage for privileged reads and bulk changes.

### Verification

Create/update/delete each sensitive model and inspect output for secrets/PII and correct actor. Test bulk/failed/unauthorized events and retention jobs. Residual risk includes privileged access to necessary metadata.

## [SEC-014] Authentication abuse and privileged-account controls are incomplete

**Severity:** Medium  
**Confidence:** Confirmed for code controls; deployed gateway/library defaults need verification  
**Category:** Authentication failures; insufficient rate limiting  
**CWE/OWASP Mapping:** CWE-307, CWE-204, CWE-308; OWASP A07; API4 Unrestricted Resource Consumption  
**Affected Component:** Proxy limiter, password reset, customer/admin authentication  
**Files:** `proxy.ts`, `app/(site)/forgot-password/actions.ts`, forgot-password page, `lib/auth.ts`, customer security page  
**Lines:** proxy `10-86`; existence action `5-7`; UI `21-31`; auth `7-43`; password change `48-53`  
**Affected Endpoint/Feature:** Login/register/auth API/reset/admin sessions

### Description

The process-local limiter only matches path substrings `login`, `register`, `subscribe`, and `contact`; Better Auth endpoints and forgot/reset paths need not match. It resets per instance, trusts forwarded headers without a documented proxy trust boundary, and returns a 60-second retry for a one-hour window. Forgot-password explicitly returns whether an account exists. Email verification, admin MFA, lockout/risk controls, and privileged re-authentication are not configured. Customer password change sets `revokeOtherSessions: false`.

### Attack / Failure Scenario

Distributed credential stuffing bypasses per-instance counters; attackers enumerate emails and target accounts. A stolen admin session remains useful without MFA/re-authentication, including after password change on another device.

### Business Impact

Account takeover, admin compromise, spam/email cost, privacy exposure, and weak incident containment.

### Recommended Fix

Use shared-store/gateway limits keyed by normalized IP plus account/device signals on exact auth/reset routes; return generic reset responses; add verified-email policy where compatible; require phishing-resistant MFA for privileged users; revoke other sessions on password/reset; add re-authentication for roles, payments, exports, settings, and credential changes. Review Better Auth upgrade/configuration guidance.

### Verification

Test distributed/IPv6/forwarded-header attempts, enumeration timing/text, lock/recovery, session revocation, MFA enrollment/recovery, and privileged re-auth. Residual risk is distributed low-and-slow abuse and social engineering.

## [SEC-015] Login redirect is accepted without an internal-path allowlist

**Severity:** Medium  
**Confidence:** High; browser behavior should be confirmed after framework upgrade  
**Category:** Unvalidated redirect; DOM script navigation  
**CWE/OWASP Mapping:** CWE-601, CWE-79; OWASP A05  
**Affected Component:** Customer email and Google login  
**File:** `components/v2/Auth/LoginForm.tsx`  
**Lines:** 18-22, 53-66, 75-81  
**Affected Endpoint/Feature:** `/login?redirect=...`

### Description

The `redirect` query value is used directly in `router.push` after password login and as the OAuth `callbackURL`. It is not restricted to a known same-origin relative path. Depending on Next/Better Auth runtime handling, external or `javascript:` destinations can produce an open redirect or script execution.

### Attack / Failure Scenario

An attacker sends a branded login link with a malicious redirect. After successful authentication, the victim is sent to phishing/malicious content or triggers unsafe client navigation.

### Business Impact

Credential/session phishing, malware delivery, trust abuse, and possible client-side code execution.

### Recommended Fix

Parse once and allow only known relative paths beginning with one `/`, rejecting `//`, schemes, backslashes, control characters, and unexpected destinations. Use the same validated value for OAuth.

### Verification

Test absolute URLs, protocol-relative URLs, `javascript:`, encoded/control-character/backslash variants, and valid internal routes. Residual risk includes malicious content on an allowed internal page.

## [SEC-016] Repository does not define a complete HTTP security-header policy

**Severity:** Medium  
**Confidence:** High for repository; deployed edge needs verification  
**Category:** Security misconfiguration; defense in depth  
**CWE/OWASP Mapping:** CWE-693, CWE-1021; OWASP A02  
**Affected Component:** Next/proxy/deployment responses  
**Files:** `next.config.ts`, `proxy.ts`  
**Lines:** config `3-61`; proxy `16-88`  
**Affected Endpoint/Feature:** All browser responses

### Description

No global CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or frame restriction is configured. The CSP in `images.contentSecurityPolicy` applies to optimized image responses, not the site. HTTPS redirects and CORS/gateway policy are not represented. This increases the impact of SEC-010 and clickjacking/content-sniffing/referrer leakage.

### Recommended Fix

Define/test headers at one authoritative layer. Start CSP in report-only, remove inline/eval dependencies, then enforce nonce/hash-based `script-src`, strict `object-src 'none'`, `base-uri`, `form-action`, and `frame-ancestors`. Enable HSTS only after HTTPS/subdomain readiness. Add `nosniff`, strict referrer and minimal permissions policies.

### Verification

Inspect every route/API/error/static response at the deployed edge; run CSP/headers tests and clickjacking checks. Residual risk: headers do not fix vulnerable application logic.

## [SEC-017] Runtime validation, pagination, and error boundaries are inconsistent

**Severity:** Medium  
**Confidence:** Confirmed  
**Category:** Improper input validation; resource exhaustion; error disclosure  
**CWE/OWASP Mapping:** CWE-20, CWE-400, CWE-209; OWASP A10 Mishandling Exceptional Conditions; API4/API8  
**Affected Component:** Public/admin actions and product API  
**Files:** `app/api/products/route.ts`, `lib/action/address.action.ts`, `lib/action/v2-order.action.ts`, multiple admin actions, `next.config.ts`  
**Lines:** products `5-29`; address interface/actions `7-18`, `40-84`; order input `10-30`; body cap config `8-12`  
**Affected Endpoint/Feature:** Search, address/checkout, pagination, public forms/actions

### Description

TypeScript interfaces are treated as validation in address/checkout paths; string lengths, extra runtime fields, notes, page/limit, IDs, and numerical special cases are not consistently bounded. Product search has no result limit. Numerous actions return raw `error.message`, which can reveal database/storage/provider details. Some Zod schemas are well-bounded, but the policy is not centralized.

### Recommended Fix

Validate every boundary with shared strict schemas, normalize inputs, reject unknown keys, bound strings/arrays/pages/limits/files, and use cursor pagination. Return stable public error codes/messages; log a redacted correlation ID internally. Add gateway/request timeouts and response-size budgets.

### Verification

Fuzz all handlers/actions with wrong types, unknown keys, huge/negative/special numbers, long Unicode, missing fields, and high-cardinality searches. Assert bounded work and no internals in responses. Residual risk includes ORM/provider exceptional cases.

## [SEC-018] Sensitive console logging coexists with missing security-event coverage

**Severity:** Medium  
**Confidence:** Confirmed  
**Category:** Sensitive data in logs; insufficient monitoring  
**CWE/OWASP Mapping:** CWE-532, CWE-778; OWASP A09  
**Affected Component:** Order/payment/review/user logs and login logging  
**Files:** `app/api/checkout/confirm/route.ts`, `lib/action/v2-order.action.ts`, `lib/action/home.action.ts`, admin user action, `lib/action/logs.ts`  
**Lines:** callback `13`; order `286`; review `888`; user action `212`; login helper `6-23`  
**Affected Endpoint/Feature:** Payment redirect, order retrieval, reviews, user edits, authentication monitoring

### Description

The payment route logs signature/reference/tracker/order values; order retrieval logs the full order including addresses; review logs FormData including email; user update logs validated user data. Conversely, `createLoginLog` has no caller, so the login-log table/UI is not reliably populated. There is no centralized redaction, event schema, alerting, or visible retention.

### Recommended Fix

Remove payload logging. Emit structured, allowlisted security events with correlation ID and pseudonymized actor/object IDs. Cover successful/failed login, reset/password/MFA/session events, role/permission changes, price/inventory/coupon/order/payment/settings/media actions, and denied attempts. Alert on anomalies and set access/retention controls.

### Verification

Exercise sensitive flows and inspect application/platform/APM logs for PII, tokens, secrets, payment identifiers, and stack traces. Confirm required events/alerts with correct actor/outcome. Residual risk includes third-party platform logs.

## [SEC-019] Database schema and migration history do not enforce commerce integrity or reproducibility

**Severity:** Medium  
**Confidence:** Confirmed for code; live DB controls need verification  
**Category:** Data integrity; unsafe migration practice  
**CWE/OWASP Mapping:** CWE-20, CWE-682; OWASP A06  
**Affected Component:** Prisma/PostgreSQL schema and migration lifecycle  
**Files:** `prisma/schema.prisma`, `prisma/migrations/20260804_add_order_payment_tracking/migration.sql`  
**Lines:** carts `202-229`; orders/coupons `291-369`; migration `1-7`  
**Affected Endpoint/Feature:** Money, inventory, carts, coupons, deployment

### Description

Money uses binary `Float`; there are no check constraints for positive quantities, rating range, non-negative totals/stock/discount/counts, valid owner identity, or one default address. Cart/wishlist lack owner/product uniqueness. Only one migration exists and adds two columns, so the full schema is not reproducible from migration history. The seed also requires validation against the current schema.

### Recommended Fix

Use integer minor units or PostgreSQL Decimal with explicit rounding. Add reviewed constraints/unique indexes after cleaning data. Establish a full baseline migration and forward-only reviewed migration process; separate runtime and migration DB roles; rehearse backups/rollbacks.

### Verification

Build an empty database solely from migrations, run integrity/concurrency tests, compare schema drift, and restore a backup in a drill. Residual risk includes legacy bad data and cross-service writes.

## [SEC-020] Privacy transparency, retention, and user-rights mechanisms are missing

**Severity:** Medium  
**Confidence:** Confirmed in repository; legal applicability needs verification  
**Category:** Privacy engineering/compliance readiness  
**CWE/OWASP Mapping:** CWE-359; GDPR/CCPA principles; OWASP ASVS data protection  
**Affected Component:** Accounts, checkout, contact, newsletter, reviews, logs, third parties  
**Files:** `components/v2/Footer.tsx`, register/checkout pages, `prisma/schema.prisma`, `lib/prisma.ts`  
**Lines:** footer `302-318`; register `204-215`; checkout `788-793`; PII models `117-187`, `251-338`, `435-505`  
**Affected Endpoint/Feature:** Personal-data collection and lifecycle

### Description

The footer policy links are commented out; registration links point to `#`; checkout's Terms link points to `/shop`. No customer account deletion/export/correction workflow, public unsubscribe, consent/marketing preference record, retention schedule, deletion/anonymization job, or breach-response configuration was found. Data is shared with Google, SMTP, Azure, an avatar service, and ERP-dependent flows without in-repository notices/processor governance. Audit logs duplicate PII.

Source alone cannot determine jurisdiction, lawful basis, tax/order retention, provider agreements, international transfers, children's handling, or whether an external policy exists.

### Recommended Fix

Create an approved data inventory/ROPA, public privacy/terms/cookie notices, just-in-time notices, marketing consent/unsubscribe evidence, authenticated export/correct/delete workflows with legal-retention exceptions, provider agreements, retention/deletion schedules, and incident response. Minimize data and third-party disclosure.

### Verification

Legal/privacy owners must test notices and data-subject request workflows end-to-end across DB, logs, backups, Blob, SMTP/marketing, Google, and vendors. Residual risk depends on applicable law and operational execution. This report does not certify legal compliance.

## [SEC-021] Secure-development gates and security tests are absent

**Severity:** Medium  
**Confidence:** Confirmed  
**Category:** Secure SDLC; testing/configuration  
**CWE/OWASP Mapping:** OWASP A03/A06; ASVS verification program  
**Affected Component:** Build, lint, tests, CI, dependency management  
**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, repository root  
**Lines:** scripts `package.json:5-10`; config `next.config.ts:3-12`; TS `9-13`, `32-44`  
**Affected Endpoint/Feature:** All releases

### Description

No unit/integration/e2e test suite or CI workflow was found. Package scripts contain no test/lint/typecheck/audit command. Next builds ignore TypeScript errors, although the current independent typecheck passes. ESLint fails with 673 findings. `reactStrictMode` is disabled. Vulnerability/SBOM/secret/SAST/DAST scanning and protected release gates are absent.

### Recommended Fix

Add blocking CI for clean install, typecheck, lint baseline, unit/integration/e2e security tests, migration verification, build, SCA/SBOM, secret scan, and artifact provenance. Remove `ignoreBuildErrors`, reduce lint debt without hiding security rules, add dependency update ownership, and test all remediated attack paths.

### Verification

Prove CI blocks an introduced auth bypass, vulnerable dependency, secret, failing migration, XSS, BOLA, negative quantity, replay, and concurrency regression. Residual risk requires human review, staging DAST, and periodic penetration tests.

## [SEC-022] Anonymous-cookie and recovery/session correctness need hardening

**Severity:** Low  
**Confidence:** Confirmed code observations; framework/deployed cookie behavior needs verification  
**Category:** Cookie/session hardening; recovery correctness  
**CWE/OWASP Mapping:** CWE-614, CWE-1275; OWASP A07  
**Affected Component:** Anonymous commerce cookie, reset URL, reset email  
**Files:** `lib/session.ts`, forgot-password page, `lib/auth.ts`  
**Lines:** cookie `4-20`; reset `28-31`; email `21-33`  
**Affected Endpoint/Feature:** Anonymous cart/wishlist and password recovery

### Description

The custom `anonymous_id` cookie is HttpOnly and production-Secure but does not explicitly set `sameSite`. The forgot-password UI requests a redirect to `/v2/reset-password`, while the actual route is `/reset-password`. The reset email interpolates the user name into HTML without encoding. Customer password change not revoking other sessions is tracked under SEC-014.

### Recommended Fix

Set an explicit `sameSite: "lax"` (or stricter if compatible), verify domain/path/prefix behavior, fix the reset route, and HTML-encode all email variables. Add recovery tests and generic responses.

### Verification

Inspect `Set-Cookie` in production and test cross-site navigation, cart continuity, reset expiry/single-use/correct route, and HTML-like user names. Residual risk is primarily browser/library behavior and session theft addressed elsewhere.

## [SEC-023] Legacy, backup, and scraper code obscure the deployable attack surface

**Severity:** Informational  
**Confidence:** Confirmed  
**Category:** Architecture/maintainability/supply-chain governance  
**CWE/OWASP Mapping:** OWASP A03/A06  
**Affected Component:** Duplicate actions, build-excluded backup, prototype tools/integrations  
**Files:** `lib/action/home.action.ts`, `lib/action/checkout.action.ts`, `backup/` (111 tracked files), `testing-product-python/main.py`, `package.json`, track-order page  
**Lines:** representative checkout `1-506`; scraper `105-206`; package scripts/dependencies `5-65`  
**Affected Endpoint/Feature:** Commerce action registration, source review, catalog import, unused dependencies

### Description

New and legacy cart/wishlist/checkout implementations coexist. The build excludes a large tracked backup tree. A runnable external scraper targets the public test importer; no Python dependency lock/license/provenance control exists. Inngest is installed without a route, payment code is partly commented/disconnected, and order tracking is a non-functional form. Dead exports may still be registered when imported by Client Components, so deployable reachability cannot be inferred from filenames alone.

### Recommended Fix

Delete/archive obsolete code outside the deployable repository after review, keep one action/service per capability, generate and inspect Server Action manifests, remove unused dependencies, gate experimental integrations, add ownership/status documentation, and resolve third-party content/software licensing.

### Verification

Compare production build routes/action manifests before and after cleanup, run regression/security tests, and use dependency/cruft tooling. Residual risk is accidental reintroduction from branches/backups.

## Positive controls observed

- Normal database access uses Prisma; no raw-query, command-execution, XML, or unsafe deserialization sink was found.
- Better Auth owns password hashing and database session records; plaintext password storage was not found in application code.
- Customer dashboard layout checks a server-side session.
- Newer customer order reads constrain `userId` to the session; saved address selection also checks owner.
- Active checkout reloads cart/products and calculates prices/shipping on the server.
- Order, items, stock, coupon, and cart deletion are grouped in a database transaction, although precheck races remain.
- Many newer admin CRUD actions correctly use `withPermission`.
- `.env*` and PEM files are ignored; no tracked environment/private-key file was found; `package-lock.json` is committed.
- Image conversion to WebP limits width and removes original active content for the `uploadImage` path, though authentication and resource controls are missing.

These controls reduce specific risks but do not compensate for the findings above.

## Final assessment

The application should not process real customers or payments until Phase 1 remediation is complete and independently verified. The most urgent risks allow admin privilege, order/payment manipulation, invalid commerce state, and credential misuse. A focused patch can close several critical paths quickly, but payment architecture, concurrency/data constraints, upload isolation, privacy operations, dependency upgrades, and security testing require coordinated engineering and operational work.

After fixes, perform code review plus authenticated staging penetration testing for Better Auth endpoints, every Server Action, admin RBAC, two-user BOLA, XSS, upload parser/storage behavior, checkout concurrency/idempotency, and payment-provider sandbox callbacks. Follow with cloud/database/storage configuration review and an applicable PCI/privacy assessment by qualified owners.
