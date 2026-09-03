# Omran Toys — Official Target Architecture

Status: **APPROVED TARGET ARCHITECTURE**

## Repository responsibilities

### `alaaomran2020/omrantoys-store` — Storefront / Customer Experience
This repository is the canonical source for the customer-facing website and presentation layer.

Owns:
- Homepage and public store pages
- UI/UX and brand presentation
- RTL Arabic experience and mobile responsiveness
- Navigation, search and category/filter UX
- Product cards and product-details presentation
- WhatsApp commerce UX
- SEO, metadata, accessibility and frontend performance
- Public trust/contact/footer sections
- Storefront release quality gates

It MUST NOT become a second manually maintained product database.

### `alaaomran2020/omran-store-live` — Product Engine / Data Pipeline
This repository is the canonical source for the existing production product ingestion/data engine until an explicitly approved migration replaces it.

Owns:
- Product ingestion pipeline
- Google Sheets product source currently used by the production flow
- Product API / Cloudflare Worker product delivery
- Product image/data automation
- n8n product automation
- Review/publish state handling
- Product-pipeline tests and operational automation

The customer-facing design in this repository is not the canonical storefront after migration.

## Integration contract

Target request path:

`Customer -> omrantoys.store -> omrantoys-store Storefront -> /api/products contract -> Product Engine -> approved product source`

The storefront consumes a stable product contract. It must not couple UI components directly to Google Sheets, n8n internals, or storage implementation details.

Where same-origin routing is practical, `/api/products` should be the public storefront contract so implementation details can change without rewriting the UI.

## Single Source of Truth rule

There MUST be exactly one authoritative writable product source at a time.

Do not manually maintain the same product catalog independently in D1 and Google Sheets.

During the current transition, the existing Live product pipeline remains authoritative for product catalog data unless a separately reviewed migration changes that decision.

D1 assets/migrations in `omrantoys-store` are retained for audit and possible non-catalog capabilities. They MUST NOT be made a competing catalog source without an explicit data-migration plan.

## Product safety rules

- Never invent price, SKU, barcode, brand, age, stock, discount, model or piece count.
- Unconfirmed price is rendered as: `للاستفسار والكميات`.
- REVIEW / NEEDS_REVIEW / inactive products must not be exposed to customers.
- Product and packaging fidelity is mandatory for product imagery.
- Raw product assets are never destructively deleted as part of storefront work.

## WhatsApp contract

WhatsApp remains the primary inquiry/conversion path for the current architecture.

Product inquiry events should preserve existing analytics compatibility and support `whatsapp_product_inquiry` with product identity, category, price mode, page location and CTA location. Legacy tracking must not be removed without verifying downstream dependencies.

## Deployment boundary

Storefront and Product Engine deployments must be independently testable and rollbackable.

A Storefront release must not require rewriting the product catalog. A Product Engine release must not require redesigning the Storefront.

No direct production changes are permitted merely to reconcile repository differences. Changes go through a branch, quality gates, review/PR, deployment and production QA.

## Migration principle

`omran-store-live` is a Golden Reference for proven production product behavior, not a template to copy blindly into `omrantoys-store`.

For each capability, use one of:
- `KEEP_FROM_PRIMARY`
- `PORT_FROM_LIVE`
- `MERGE`
- `REFACTOR`
- `DEPRECATE`
- `NEEDS_REVIEW`

No legacy component is removed until its replacement and production dependency status are proven.

## Definition of success

The target architecture is achieved when:
1. `omrantoys-store` is the canonical professional customer-facing storefront.
2. The storefront receives approved products through a stable product API contract.
3. `omran-store-live` product automation continues operating without duplicate catalog ownership.
4. Product, WhatsApp and analytics behavior passes regression tests.
5. Both deployment boundaries have explicit rollback paths.
6. Production content is verified after deployment, not inferred from build success alone.
