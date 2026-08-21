# Compliance and Privacy Readiness Review

**Review date:** 2026-08-11  
**Assessment type:** Repository-level technical readiness review  
**Conclusion:** The repository does **not** demonstrate compliance with PCI DSS, GDPR, CCPA/CPRA, or any national privacy law. Formal applicability and compliance require legal, organizational, operational, infrastructure, and—where applicable—qualified assessor evidence.

## Status definitions

| Status | Meaning |
| --- | --- |
| PASS | The reviewed source contains a control that substantially meets the narrow technical objective. Runtime effectiveness may still require testing. |
| PARTIAL | Some implementation exists, but important coverage or assurance is missing. |
| FAIL | The reviewed source contains a confirmed gap or contradictory implementation. |
| NOT APPLICABLE | The control does not apply to the architecture visible in source. Reassess if the architecture changes. |
| NEEDS VERIFICATION | Source cannot establish applicability or operating effectiveness. |

## Framework baseline

This review uses the current official references available on the assessment date:

- [OWASP Top 10:2025](https://owasp.org/Top10/)
- [OWASP Application Security Verification Standard 5.0.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP API Security Top 10:2023](https://owasp.org/API-Security/editions/2023/en/0x03-introduction/)
- [PCI DSS v4.0.1 document library](https://www.pcisecuritystandards.org/document_library/?class=pcidss&doc=pci_dss)
- [EU General Data Protection Regulation, Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [California Consumer Privacy Act, as amended](https://oag.ca.gov/privacy/ccpa?bot_detected=1)
- [Pakistan Ministry of IT & Telecommunication 2023 Personal Data Protection Bill draft](https://moitt.gov.pk/SiteImage/Misc/files/Final%20Draft%20Personal%20Data%20Protection%20Bill%20May%202023.pdf). A draft is not evidence of enacted/current legal obligations; local counsel must determine the law in force and its applicability.

## Technical controls verified from code

- Password operations and database sessions are delegated to Better Auth; application code does not store plaintext passwords.
- Normal database access uses Prisma ORM and no raw SQL execution was found.
- The customer dashboard verifies a server-side session.
- Newer order/address reads bind data to the authenticated user.
- Active checkout reloads product prices and calculates shipping on the server.
- Order creation and related writes use a database transaction.
- Many admin mutations use a central `withPermission` wrapper.
- `.env*` and PEM files are ignored and a package lock is committed.

These are not a compliance certification and are materially limited by the findings in [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md).

## OWASP Top 10:2025 matrix

| Control Area | Status | Evidence | Gap | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| A01 Broken Access Control | FAIL | `hasPermission`/`withPermission` exist; customer order reads are scoped | Client-writable role, unguarded order/admin actions, cart/wishlist BOLA (SEC-001/002/007/008) | Admin takeover, PII and state manipulation | Fix P0 authorization paths; maintain an endpoint-permission matrix and negative tests |
| A02 Security Misconfiguration | FAIL | Environment files are ignored | Missing global headers, public test/payment routes, broad upload actions, build errors ignored (SEC-006/009/016/021) | Expanded exploitability and unsafe release | Secure defaults, headers, environment gates, release checklist, cloud review |
| A03 Software Supply Chain Failures | FAIL | Lockfile committed | 58 production audit entries; no SCA/SBOM/CI; unused packages/tooling (SEC-012/021/023) | Known-vulnerability exploitation | Patch, remove unused dependencies, generate SBOM, gate CI and exceptions |
| A04 Cryptographic Failures | FAIL | HMAC exists in one callback; PostgreSQL URL requests TLS | MD5 payment signing, incomplete message binding, disclosed DB credential, encryption-at-rest/token handling unknown (SEC-003/005) | Payment/credential/data compromise | Rotate credentials; provider-standard crypto/protocol; verify KMS/TLS/encryption |
| A05 Injection | FAIL | Prisma parameterization reduces SQL injection | Stored/reflected HTML/JSON-LD XSS; email HTML interpolation (SEC-010/022) | Browser compromise/phishing | Server sanitization, safe serialization/output encoding, CSP defense in depth |
| A06 Insecure Design | FAIL | Some session/transaction/permission abstractions exist | Invalid order invariants, replay, races, no idempotency/state machine (SEC-003/004/011/019) | Financial/inventory fraud | Threat-model commerce; central invariants, state machines, idempotent workflows |
| A07 Authentication Failures | FAIL | Better Auth database sessions | Writable role, weak distributed throttling, enumeration, no admin MFA/re-auth (SEC-001/014/015/022) | Account/admin takeover | Patch auth package/config; MFA, verified recovery, shared throttling, session policy |
| A08 Software or Data Integrity Failures | FAIL | Lockfile and Prisma transaction | Public importer, unsafe payment state, unverified third-party import/provenance (SEC-003/006/023) | Catalog/payment/data corruption | Authenticate provenance, approval, signed/idempotent provider events |
| A09 Security Logging and Alerting Failures | FAIL | Prisma audit table and log UI exist | Full PII snapshots, wrong `SYSTEM` actors, sensitive console logs, login logger unused, no alerts (SEC-013/018) | Poor detection plus added exposure | Minimal structured immutable events, redaction, alerts, retention, tests |
| A10 Mishandling of Exceptional Conditions | PARTIAL | Many actions catch failures | Raw error messages, async unawaited payment update, no central error contract (SEC-003/017) | Information leakage/inconsistent state | Stable error codes, fail-closed behavior, correlation IDs and failure-path tests |

## OWASP ASVS 5.0 readiness matrix

The target assurance level should be selected by the business. Given e-commerce, admin, PII, and payment influence, use at least a rigorous Level 2-style verification baseline and elevate payment/privileged flows where the standard calls for greater assurance.

| Control Area | Status | Evidence | Gap | Recommendation |
| --- | --- | --- | --- | --- |
| Encoding and sanitization | FAIL | React escapes normal JSX | Rich HTML and JSON-LD raw sinks are not sanitized/escaped | Central allowlist sanitizer, contextual encoding, XSS regression corpus |
| Validation and business logic | FAIL | Zod is used in selected forms/actions | Checkout/address/API/admin validation is inconsistent; numeric/race defects | Strict shared boundary schemas and commerce invariant/state tests |
| Web frontend security | FAIL | No analytics script found | Global CSP/frame/referrer/permissions policies absent; open redirect | Enforced header baseline and validated internal navigation |
| API and web service security | FAIL | Route Handlers use framework primitives | Public importer/payment paths, BOLA/BFLA, no bounded search | Endpoint inventory, auth/authz, schemas, quotas, safe errors |
| File handling | FAIL | One path re-encodes images to WebP | No action auth, type/pixel/quota/ownership/malware controls; raw upload exists | Purpose-specific authenticated media service and storage policy |
| Authentication | FAIL | Better Auth hashing/session management | Role mass assignment, throttling/enumeration/MFA/verification/session gaps | Fix role field; patch/configure auth; admin MFA/re-auth/recovery policy |
| Session management | PARTIAL | Database session model; HttpOnly custom anonymous cookie | Deployed cookie/session expiration/rotation unknown; other sessions retained on customer password change | Runtime cookie/session tests and documented invalidation rules |
| Authorization | FAIL | Central role/permission lookup exists | Multiple actions bypass it; ownership checks inconsistent | Deny-by-default action policy, subject derivation, permission matrix tests |
| Data protection | FAIL | Secrets kept in untracked env locally | Credential disclosure, PII logs/audits, no retention/rights, public avatars | Rotation, data minimization, encryption verification, retention/deletion |
| Secure communication | NEEDS VERIFICATION | Database connection string requests TLS | Hosting TLS, redirect, HSTS, provider TLS validation, internal network not supplied | Cloud/network evidence and automated TLS/header monitoring |
| Cryptography | FAIL | Framework crypto and HMAC used | MD5 payment signing and incomplete signed-message binding | Provider-approved algorithms/protocols; KMS/key lifecycle review |
| Configuration | FAIL | Separate env names and `.gitignore` | No deployment manifest, secret store policy, safe environment gates, security headers | IaC/config baselines, managed secrets, environment separation |
| Logging and error handling | FAIL | Audit/log tables exist | Sensitive payloads, incomplete actors/events, raw errors, no alerting/retention | Redacted structured events, alert use cases, incident-ready retention |
| Self-contained security architecture | PARTIAL | Monolith simplifies call paths | Duplicate legacy actions and page/action guard mismatch obscure enforcement | Consolidate services/actions and document trust boundaries/owners |
| Security verification | FAIL | Manual audit and typecheck completed | No automated tests/CI/SAST/DAST/SCA policy or penetration test evidence | Implement the remediation test program and independent staging test |

## OWASP API Security Top 10:2023 matrix

| Control Area | Status | Evidence | Gap | Recommendation |
| --- | --- | --- | --- | --- |
| API1 Broken Object Level Authorization | FAIL | New customer orders/addresses use owner filters | Cart/wishlist row-ID and legacy user-ID actions (SEC-007) | Owner-qualified atomic queries and two-user tests |
| API2 Broken Authentication | FAIL | Better Auth centralizes auth | Role field, reset enumeration, throttling/MFA/package issues | Fix SEC-001/012/014 and test all auth routes |
| API3 Broken Object Property Level Authorization | FAIL | Some DTO/select usage | Public product mass assignment and writable auth role | Strict schemas/allowlists; non-input authorization properties |
| API4 Unrestricted Resource Consumption | FAIL | Server Action body cap 10 MB | Unbounded product results, image CPU/memory/storage, process-local limits | Pagination, small purpose limits, quotas, timeouts, shared limiter |
| API5 Broken Function Level Authorization | FAIL | `withPermission` used by many admin actions | Orders/settings/About/grading/dashboard bypass it | Central action guard and matrix tests |
| API6 Unrestricted Access to Sensitive Business Flows | FAIL | Server recalculates product prices | Product import, checkout replay/races/invalid quantity | Anti-automation, invariants, idempotency, approval |
| API7 Server-Side Request Forgery | PASS | No user-controlled server fetch target found; ERP base is environment-controlled | Deployment environment compromise could redirect ERP; payment provider parsing unverified | Allowlist configured hosts, egress policy, provider response limits |
| API8 Security Misconfiguration | FAIL | Same-origin framework defaults; no permissive CORS found | Headers/deployment policy absent; debug/test endpoints; error leakage | Production route/config allowlist and edge validation |
| API9 Improper Inventory Management | PARTIAL | Routes/actions are documented in audit architecture | Duplicate legacy actions and incomplete payment/IPN routes | Automated route/action manifest inventory with owner/status/deprecation |
| API10 Unsafe Consumption of APIs | PARTIAL | ERP uses HTTPS, encoding, 12-second timeout and response check | ERP response authenticity/schema depth/provider governance unknown; payment flow incomplete | Strict response schemas, allowlist/egress, auth/signatures, contracts/monitoring |

## PCI DSS v4.0.1 considerations

PCI DSS applies to entities that store, process, transmit cardholder data or can affect the security of the cardholder data environment. Source shows no card number/CVV fields and current checkout offers COD/bank transfer, but `CREDIT_CARD`, Safepay, and PayFast artifacts exist. Exact scope and SAQ eligibility depend on the deployed payment page, redirect/iframe/script architecture, merchant agreements, and systems that can influence it.

| Control Area | Status | Evidence | Gap | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| PCI scope and data-flow determination | NEEDS VERIFICATION | Current UI does not collect PAN/CVV | Production provider/page architecture and merchant role unavailable | Wrong SAQ/scope and unprotected CDE influence | Document payment data flow with acquirer/QSA; confirm SAQ/ROC obligation |
| Requirement 2 secure configurations | FAIL | App config is source-controlled | Missing header/deployment baselines; test routes present | Insecure production defaults | Harden app/cloud/DB/storage using reviewed standards |
| Requirements 3/4 account data and transmission | NEEDS VERIFICATION | No card data model found; HTTPS provider URLs | Hosting TLS, logs, provider payloads, network, storage not verified | Card data/token leakage if architecture differs | Prohibit PAN/SAD storage/logging; verify TLS and tokenization/hosted fields |
| Requirement 6 secure systems/software | FAIL | Framework/ORM and manual review | Critical code flaws, vulnerable packages, no SDLC gates | Exploitable payment-influencing application | Patch, threat-model, review, test and manage changes/vulnerabilities |
| Requirement 6.4.3 payment-page scripts | NEEDS VERIFICATION | No active card page found | Deployed payment scripts/authorization/integrity inventory unavailable | E-skimming if card page exists | If applicable, inventory/authorize/justify and integrity-protect scripts |
| Requirement 8 identity/access/MFA | FAIL | Named users, DB sessions, RBAC model | Role escalation, unguarded actions, no privileged MFA | Unauthorized CDE-influencing change | Unique identities, least privilege, MFA, access reviews, re-authentication |
| Requirement 10 logs/monitoring | FAIL | Audit/LoginLog models exist | Incomplete/misleading actors, sensitive data, login logging unused, no alerts | Undetected payment/admin abuse | PCI-aligned event coverage, integrity, time sync, review/retention evidence |
| Requirement 11 security testing | FAIL | `npm audit`/manual audit run | No ASV scan, penetration test, IDS/change-detection evidence, automated tests | Unknown exploitable external surface | QSA-guided scans/tests after remediation; payment-page change detection if applicable |
| Requirement 12 policies/third parties/incidents | NEEDS VERIFICATION | Provider names present in source | Policies, responsibility matrix, TPSP evidence, incident plan unavailable | Governance/response failure | Establish PCI governance and obtain provider attestations/responsibilities |

**PCI conclusion:** Do not enable the current online payment code. Engage the acquirer/payment provider and a qualified PCI professional to define scope and validation after the flow is redesigned. This review is not a PCI assessment or attestation.

## Privacy engineering and legal-readiness matrix

Personal data visible in source includes names, emails, phones, postal addresses, account identifiers, IP addresses, user agents, avatars, reviews, browsing/recent-product history, cart/wishlist data, order history, notes, contact messages, payment references, and authentication/OAuth/session data. The detailed collected → processed → stored → shared → retained/deleted map is in [ARCHITECTURE_AND_DATA_FLOW.md](ARCHITECTURE_AND_DATA_FLOW.md).

| Control Area | Status | Evidence | Gap | Risk | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Applicability/jurisdictions/controller roles | NEEDS VERIFICATION | Pakistan-facing brand and global web stack | Customer locations, legal entities, establishment/targeting, revenue/thresholds unknown | Applying wrong obligations | Legal counsel to document applicable laws, controller/processor roles and representatives |
| Data inventory/records of processing | PARTIAL | Prisma models and architecture data-flow inventory identify major data | Purposes, lawful bases, owners, vendors, locations, fields outside code unknown | Incomplete governance/DSAR | Establish maintained ROPA/data map tied to systems/vendors/retention |
| Transparency and notice | FAIL | Registration/checkout mention terms/privacy | Links are absent, `#`, commented out, or point to `/shop` | Collection without usable notice; customer trust/legal risk | Publish approved layered notices and just-in-time disclosures |
| Lawful basis/purpose limitation | NEEDS VERIFICATION | Commerce needs account/order/address data | Basis for reviews, history, logs, newsletter, avatars/vendors not recorded | Unlawful/incompatible processing | Legal assessment; encode purpose/consent and prevent incompatible reuse |
| Data minimization | FAIL | Some ORM `select` clauses limit fields | Admin orders/audits/logs expose/store whole records; public review action returns email | Larger breach and compliance scope | Minimize collection/response/log/audit fields; pseudonymize where possible |
| Accuracy/correction | PARTIAL | Profile and addresses can be updated | No broad correction workflow; audit/third-party propagation undefined | Inaccurate retained/shared data | Authenticated correction plus downstream propagation and exceptions |
| Access/portability/know | FAIL | Customers can view profile/orders/addresses | No comprehensive export/know workflow | Rights requests handled manually/incompletely | Verified export covering all stores/vendors with safe format and audit |
| Deletion/erasure | FAIL | Admin can delete selected records | No customer request/account deletion; order/log/blob/backups/vendor handling undefined | Excessive indefinite retention | Authenticated request workflow, legal holds/exceptions, anonymization and propagation |
| Retention/storage limitation | FAIL | Timestamps exist | No schedules/jobs; audit snapshots duplicate PII; backup retention unknown | Indefinite data and breach exposure | Field/system retention schedule, automated deletion, backup expiry/restore controls |
| Newsletter consent/unsubscribe | FAIL | Email validation and admin delete exist | No consent timestamp/source/text; no public unsubscribe/suppression record | Unwanted marketing and inability to prove consent | Double opt-in where required, one-click unsubscribe, suppression and consent evidence |
| Cookies/tracking | PARTIAL | Functional Better Auth and anonymous cookies; no analytics SDK found | Cookie notice/classification and deployed cookies unknown; SameSite not explicit for anonymous cookie | Transparency/security gap | Inventory runtime cookies; classify; consent only where applicable; publish notice |
| Third-party processors/sharing | NEEDS VERIFICATION | Google, Azure, SMTP, avatar service, ERP/payment providers identified | Agreements, sub-processors, purposes, security, locations and deletion unavailable | Vendor/transfer/data-use risk | Vendor due diligence, DPAs, least data, transfer mechanism, deletion/incident terms |
| International transfers/localization | NEEDS VERIFICATION | Cloud/provider endpoints cross organizational boundaries | Regions and transfer mechanisms unknown | Unlawful transfer/localization breach | Map regions/routes; legal review and approved safeguards/localization controls |
| Security of processing/reasonable security | FAIL | ORM, sessions, some RBAC/transactions | Critical/high findings and disclosed credential | Breach and enforcement exposure | Complete remediation and verify cloud/operational controls |
| Children's data | NEEDS VERIFICATION | General retail registration | Age targeting/knowledge/policy/consent unavailable | Special/minor obligations | Determine audience and implement age/parental controls if applicable |
| Automated decisions/profiling | NEEDS VERIFICATION | Recently viewed and product activity are stored | Marketing/recommendation profiling use outside source unknown | Notice/rights requirements | Document use; minimize; provide required controls/objections |
| Breach response/notification | NEEDS VERIFICATION | No repository incident plan | Detection, escalation, forensics, notification timelines/owners unknown | Delayed/non-compliant response | Tested incident/breach plan, contacts, evidence preservation and exercises |
| Privacy by design/DPIA | FAIL | No privacy review artifacts or gates found | High-risk changes lack documented review | Repeated design gaps | Add privacy/security review, DPIA/assessment triggers and release evidence |

### GDPR readiness observations

If GDPR applies, the repository does not evidence required transparency, lawful-basis records, data-subject rights, storage limitation, processor/transfer governance, or risk-appropriate security. Article-specific legal mapping and exemptions require counsel. Do not describe Qaam.pk as GDPR compliant based on this review.

### CCPA/CPRA readiness observations

If the business and consumers meet CCPA applicability, the source lacks a compliant notice at collection/privacy policy and operational know/delete/correct/opt-out/limit/non-discrimination request mechanisms. Whether Qaam.pk sells or shares personal information, meets statutory thresholds, or needs a Global Privacy Control/opt-out link cannot be determined. Do not describe Qaam.pk as CCPA/CPRA compliant based on this review.

### Pakistan and other jurisdictions

The business appears Pakistan-focused, but corporate structure, customer locations, sector, and current applicable Pakistani law were not provided. The official 2023 bill document reviewed is a draft and is not sufficient to state current legal obligations. Obtain current Pakistan-qualified legal advice plus advice for every market targeted or monitored.

## Organizational and infrastructure evidence required

The following cannot be proven from source and should be collected before any compliance conclusion:

- Corporate/legal entities, countries served, customer demographics, revenue/volume thresholds, and merchant/acquirer role
- Approved privacy/terms/returns/refund/marketing/cookie policies and their actual published versions
- Data processing inventory, lawful bases, records of consent, retention schedule, legal holds, and rights-request procedures/metrics
- Vendor inventory, DPAs, sub-processors, data regions, transfer mechanisms, deletion, incident notice, and security attestations
- Hosting, DNS/CDN/WAF, TLS, headers, vulnerability scans, network diagrams, database/storage IAM/encryption/logs/backups/restore tests
- Secret inventory, managed-vault configuration, rotations, access reviews, environment separation, and incident records
- Secure SDLC/change-management/training policies, code review evidence, CI controls, SBOM, vulnerability SLAs/exceptions
- Security monitoring, time synchronization, alert rules, on-call/incident playbooks, tabletop exercises, breach notification process
- Payment-provider integration specification, production data flow, SAQ/ROC eligibility, AOC/attestations, ASV and penetration-test evidence

## Compliance remediation priorities

1. **Stop immediate exposure:** rotate the disclosed credential; block unsafe payment/test routes; close role/order/admin/upload authorization and checkout invariants.
2. **Restore trustworthy technical controls:** patch dependencies, XSS, BOLA, concurrency, logs, validation, headers, database constraints, and automated security tests.
3. **Build privacy operations:** approved notices, consent/unsubscribe, inventory/ROPA, retention, rights workflows, vendor/transfer governance, incident response.
4. **Determine payment scope:** redesign the provider flow, obtain acquirer/QSA guidance, and collect PCI operational evidence.
5. **Validate independently:** staging penetration test, cloud posture review, privacy/legal assessment, and applicable PCI validation.

The implementation sequence, effort, and acceptance criteria are in [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md).
