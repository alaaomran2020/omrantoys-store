# Storefront → Product Engine Audit

Status: **AUDIT COMPLETE / INTEGRATION STARTED**

## Scope audited
- `src/data`
- `src/context`
- `src/App.jsx`
- `src/admin`
- Live `shared/products.ts` and `/api/products` public contract

## Findings

### 1. `src/data/products.js` — DEPRECATE AS CATALOG SOURCE
The Storefront currently ships three hard-coded products with locally asserted SKU, stock, age, brand, price, piece counts, dimensions and other facts.

This conflicts with the approved architecture: the Storefront must not maintain an independent catalog. Keep this file only as a temporary rollback fixture until the Product Engine cutover is verified, then remove catalog ownership from it.

### 2. `StoreContext.jsx` — REFACTOR
Current product state is initialized from the hard-coded catalog and persisted as `omran_toys_products` in browser localStorage. It also manufactures catalog/business facts when enhancing products:
- wholesale prices derived from retail price
- default weight `500`
- visibility inferred from stock
- generated SKU for locally added products
- stock mutations after local order placement

These behaviors are incompatible with Product Engine authority. They must not be applied to Product Engine products.

The cart/wishlist/filter/modal state can remain in StoreContext. Catalog ownership must move behind a read-only Product Engine adapter.

### 3. `App.jsx` — KEEP / MINIMAL CHANGE
The customer UI composition is already separate from the hash-based admin app. This is a useful deployment boundary. Storefront components can continue consuming `StoreContext`; the data source should change behind that interface to reduce UI regression risk.

### 4. `src/admin` — NEEDS REVIEW / DO NOT CONNECT TO PUBLIC CATALOG YET
The admin product list explicitly reads D1 and exposes SKU, retail price and stock-oriented fields. That is a separate catalog model from the approved Live Product Engine contract.

Do not let this admin become a second writable catalog. Until a reviewed admin-to-Product-Engine write contract exists, product-management UI must not be treated as authoritative for the public catalog.

### 5. Live Product Engine contract — PORT CONTRACT, NOT IMPLEMENTATION
The Live public Product contract is intentionally small:
- `id: string`
- `name: string`
- `price: number | null`
- `category: string`
- `description: string`
- `image: string | null`
- `imageSource: string | null`
- `active: boolean`
- `sortOrder: number | null`
- `productPrompt: string`
- `rowIndex: number`

Payload:
- `products`
- `status`
- `fetchedAt`

The parser filters inactive products by default, tolerates malformed rows, converts Drive links for display and treats invalid/unconfirmed price as `null`.

## Contract gap
The Storefront UI expects a richer model than the Product Engine currently proves. Fields such as SKU, stock, age, brand, discounts, weight, wholesale pricing, dimensions and flags are NOT present in the public Product Engine contract.

Therefore the adapter must use safe empty/null defaults and UI capabilities that depend on unproven inventory/catalog fields must be progressively disabled or converted to inquiry behavior. We must never synthesize those facts.

## First implementation
Added `src/lib/productEngine.js` as an anti-corruption layer between Storefront and Product Engine.

It:
- fetches same-origin `/api/products`
- validates the payload shape
- adapts the proven Live fields to the current Storefront component shape
- filters inactive products defensively
- preserves `price: null`
- never generates SKU, stock, age, brand, discount or wholesale data
- uses an 8-second abort timeout

## Safe cutover plan
1. Keep current Storefront component tree unchanged.
2. Introduce Product Engine loading into StoreContext behind an explicit source state.
3. On successful valid Engine response, replace catalog state with adapted Engine products.
4. On network/API failure during the migration phase, keep the current local fixture as a rollback fallback and expose source/error state for QA.
5. Stop persisting Product Engine catalog rows as a writable local catalog.
6. Make cart/checkout behavior capability-aware: unknown stock must not be interpreted as zero stock, and unknown price must route to inquiry instead of numeric checkout.
7. Only after regression QA remove the legacy hard-coded catalog source.

## Admin decision
D1 admin product reads/writes are not connected to the public catalog in this phase. The admin remains isolated until a separate Product Engine admin/write API is designed. This prevents dual-source product ownership.

## Quality gates before merge
- lint
- build
- adapter contract tests or equivalent executable checks
- UI regression for product cards/details/search/filter
- null-price inquiry behavior
- unknown-stock behavior
- `/api/products` same-origin routing verified in the target deployment
- production content verification after deploy
