# Profile Section — Implementation Notes

This documents everything built after the request to add an Amazon-style
profile section (order count, recent orders, recently viewed, wishlist).

## Scope decision

Before starting, two things were confirmed:

- **Depth**: build the real backend (Product/Order APIs, User model changes,
  live DB queries) rather than a mock-data UI, since neither a Product nor
  an Order API existed yet.
- **Sections**: order count + recent orders, recently viewed products, and
  saved/wishlist items. Account settings/addresses were left out.

## Data model changes

**`server/models/Users.model.js`**
- Removed the `orders` field. It was an unused `[ObjectId]` ref that nothing
  ever wrote to — `Order.buyer` is the actual source of truth for a user's
  orders, so keeping a second, always-empty list would have been misleading.
- Added `wishlist: [ObjectId ref Product]`.
- Added `recentlyViewed: [{ product: ObjectId ref Product, viewedAt: Date }]`,
  capped at 10 entries, most-recent-first.

**`server/models/Product.model.js`**
- Changed `images: [String]` to a single `imageUrl: String`. Per instruction,
  product images are not stored as an array.

## New backend endpoints

**Products** (`server/controllers/product.controller.js`, `routes/product.route.js`)
- `GET /products` — list active products.
- `GET /products/:id` — single product. If the request is authenticated
  (via the new `attachUserIfAuthenticated` middleware, which sets `req.user`
  when a valid cookie exists but doesn't block the request otherwise), this
  also records the view: it pulls any existing entry for that product out of
  `recentlyViewed`, then pushes a fresh entry to the front and slices the
  list back down to 10.

**Orders** (`server/controllers/order.controller.js`, `routes/order.route.js`)
- `POST /orders` — places an order for a product (looks up price/seller from
  the product at order time).
- `GET /orders/me` — the logged-in user's orders, newest first.

**User profile** (`server/controllers/user.controller.js`)
- `GET /users/profile-overview` — one call that returns `orderCount`,
  `recentOrders` (last 5), `recentlyViewed` (populated), and `wishlist`
  (populated). Built as a single aggregated endpoint so the profile page
  doesn't need four separate round trips.
- `POST /users/wishlist/:productId` — toggles a product in/out of the
  wishlist.

## Frontend

- **`Home.jsx`** — now fetches `/products` instead of using a hardcoded
  array, so real seeded data (and later, real sellers' products) shows up.
- **`ProductCard.jsx`** — links to `/product/:id`; renders the real
  `imageUrl` when present, falling back to the original color-tile look.
- **`ProductDetail.jsx`** (new) — product page. Fetching it is what triggers
  the "recently viewed" write server-side. Has "Buy now" (creates an order)
  and "Save for later" (toggles wishlist).
- **`Profile.jsx`** — rebuilt to show: profile header, email/member-since/
  order-count cards, a recent-orders list (links back to the product, shows
  status/date/qty/price), a "Recently viewed" strip, and a "Saved for later"
  strip. All from the single `profile-overview` call.

## Seed data

`server/seed.js` inserts one seed seller and 8 sample products directly into
MongoDB, one `Product.create()` call at a time (not built up in a JS array
and bulk-inserted), each with a real Unsplash `imageUrl` and a price in
rupees. Run with `npm run seed` from `server/`.

## Bugs found and fixed along the way

These weren't part of the original ask but blocked it or were directly
introduced by the same code paths, so they were fixed in place:

- **`getMe` response shape** — was returning `{ AuthUser: {...} }` instead of
  the user directly, which didn't match how `AuthContext`/`Login` read the
  response (`response.data`). Fixed on the backend; frontend updated to
  match.
- **Password hash leaks** — `isAuthenticated` loaded the full user document
  (including the hashed password) into `req.user`, and `registerUser`
  returned the full created document including the hash. Both now strip
  `password` before it can reach the client.
- **`Seller` model not registered** — `getProductById`'s
  `.populate('seller', ...)` crashed with `Schema hasn't been registered for
  model "Seller"` because nothing in the running server process imported
  `Seller.model.js` (it was only ever imported by the separate `seed.js`
  process). Fixed by importing the model file in `product.controller.js`.
