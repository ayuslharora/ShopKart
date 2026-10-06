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

---

# Lab 1–3 Compliance Pass

After the profile section was done, the project was audited against three
external lab problem statements (Lab-01 Customer Auth, Lab-02 Login → Home
Flow, Lab-03 Product Catalog & Discovery). This section documents the gaps
found and what was built to close them. Note: routes stayed under `/users`
and `/orders` rather than being renamed to `/customers`, since that's a
naming difference only, not a functional gap.

## Audit findings (before this pass)

- No `POST /products` endpoint existed at all — only `GET /products` and
  `GET /products/:id`.
- `GET /products` ignored query parameters — no search, no category filter.
- No dedicated `/products` listing page; the catalog lived on `/home`.
- The product detail route was `/product/:id` (singular), not `/products/:id`
  as the lab spec's routing table expects.
- `/home` showed the product catalog instead of the logged-in customer's own
  info (name/email), which is what Lab-02 actually asks for.
- No error state ("Something went wrong…") or empty state ("No products
  found.") on any product listing — a failed fetch just silently showed
  nothing.
- The search bar in `Navbar` and the category rail on `Home` were both
  decorative, wired to nothing.

## POST /products + search/filter (server)

**`server/controllers/product.controller.js`**
- Added `createProduct`: validates `name`, `description`, `category`, and an
  image (`image` or `imageUrl`, either key accepted) are present, `price > 0`,
  `stock >= 0`, then creates the product and returns `201`. Left as an open
  (unauthenticated) endpoint, matching the lab's explicit note that
  admin/auth for product creation comes in a later lab.
- `getProducts` now reads `search` and `category` from `req.query` and builds
  the Mongo filter dynamically: `search` does a case-insensitive substring
  match on `name`, `category` does a case-insensitive exact match, and both
  can be combined. User-supplied text is regex-escaped first so someone can't
  break or hijack the match with regex metacharacters.

**`server/models/Product.model.js`**
- `seller` changed from required to optional, since the lab's create-product
  request body has no seller field. Products made via this endpoint simply
  won't have one.

**`server/routes/product.route.js`**
- Added `POST /` (before `GET /`) wired to `createProduct`, no auth
  middleware.

This was manually tested by the user directly in Postman against the lab's
exact request shape before the frontend work started.

## Dedicated /products page + working search/filter (frontend)

**`client/src/pages/Products.jsx`** (new)
- Category buttons down the side (`All`, `Groceries`, `Fashion`, …) that set
  `?category=` on the API call.
- The search field lives in `Navbar` (see below) rather than a second input
  on the page itself, to avoid two search boxes stacked on top of each other.
- Debounces both search and category changes by 300ms before calling the
  API, so typing doesn't fire a request per keystroke.
- Three explicit UI states: `loading` (shared `Loading` component), `error`
  ("Something went wrong while loading products."), and `ready` with either
  the product grid or "No products found." if the array comes back empty.

**`client/src/components/Navbar.jsx`**
- The search `<input>` was previously uncontrolled and did nothing. It now
  accepts optional `searchValue`/`onSearchChange` props and becomes a
  controlled field when a page supplies them (currently only `Products.jsx`
  does); other pages that render `search` keep the old decorative behavior
  since they don't pass those props.
- "Shop"/"Categories"/"Deals" links now point at `/products` instead of `#`.

**`client/src/App.jsx`**
- Added `/products` (private route, renders `Products.jsx`).
- Renamed the product detail route from `/product/:id` to `/products/:id`.

**Link updates** — `ProductCard.jsx` and `Profile.jsx`'s recent-orders/
recently-viewed/wishlist links updated from `/product/${id}` to
`/products/${id}` to match the renamed route.

## Home rebuilt as the Lab-02 welcome page

**`client/src/pages/Home.jsx`** — replaced the product-catalog content
(which now lives at `/products`) with a welcome page: greets the user by
name and shows their name/email in a card, with a button linking to
`/products`. The lab spec also asks for a `phone` field, which doesn't exist
on this project's `User` model (`fullName`/`phone` were never added — the
model uses `name`/`username`/`email`), so it was left out rather than
fabricated.

## Landing page: real data instead of mock data

**`client/src/pages/Landing.jsx`** — the "Today's picks" section previously
rendered a hardcoded 3-item `picks` array. It now fetches `/products` on
mount and shows the first 3 real products, with the shared `Loading`
component while the request is in flight. (The "12,400+ sellers" stat was
deliberately left as marketing copy — there's no seller-count endpoint, and
the app already carries a "practice project" disclaimer in the footer.)

## Remaining known gaps (not yet closed)

- `GET /products/:id` still returns `500` for a malformed MongoDB ObjectId
  instead of the `400` the lab spec asks for (a `CastError` falls through to
  the generic catch block).
- No `PATCH /customers/change-password` (Lab-01 bonus).
- No `?sort=price_asc` / `?sort=price_desc` on `GET /products` (Lab-03
  bonus).
- Routes are under `/users`/`/orders`, not renamed to `/customers` — a
  cosmetic mismatch with Lab-01/02's exact route names, not a functional one.

---

# Lab 4 — Wishlist System

Built against the Lab-04 (Wishlist System) problem statement. Per the lab,
no Context/Redux was used — the wishlist lives in MongoDB and each page
fetches what it needs.

## Backend

**`server/models/Users.model.js`**
- `wishlist` reshaped to the lab's form: `[{ type: ObjectId, ref: 'Product' }]`,
  default `[]`. Same data in MongoDB, so existing users keep working.

**`server/controllers/wishlist.controller.js`** + **`routes/wishlist.route.js`**
(new, mounted at `/wishlist`, every route behind `isAuthenticated` — the
user always comes from the JWT cookie, never from the request):

| Method | Endpoint | Success | Errors |
|---|---|---|---|
| POST | `/wishlist/:productId` | 201 | 400 bad id, 404 no product, 409 already saved |
| GET | `/wishlist` | 200 `{ success, count, wishlist }` (populated) | 401 |
| DELETE | `/wishlist/:productId` | 200 | 400 bad id, 404 not in wishlist |
| PATCH | `/wishlist/:productId/toggle` (bonus) | 200 `{ saved }` | 400, 404 |

- **Duplicate prevention** is done in the query itself:
  `updateOne({ _id, wishlist: { $ne: productId } }, { $push: ... })`. If the
  filter matches nothing, the product was already there → 409. Because the
  check and the write are one operation, two fast clicks can't both add it
  (verified: two concurrent POSTs → one 201, one 409, one entry).
- **Gotcha found while testing:** the first version checked
  `result.modifiedCount === 0` to detect "already saved". That never fires
  here, because the User schema has `timestamps: true` and Mongoose adds an
  `updatedAt` change to every update — so the document always counts as
  modified. Checking `matchedCount` against a filter that encodes the
  condition fixes it.
- `GET /wishlist` filters out `null` entries, which is what `populate()`
  returns for a product that was deleted after being saved.
- The old `POST /users/wishlist/:productId` toggle was removed;
  `ProductDetail` now uses `PATCH /wishlist/:productId/toggle`.

## Frontend

- **`pages/Wishlist.jsx`** (new, private route `/wishlist`) — "My Wishlist",
  "N products saved", and three explicit states: loading ("Loading your
  wishlist..."), error ("Unable to load your wishlist." + Try Again, which
  re-runs the request), and empty ("Your wishlist is empty" + Browse
  Products → `/products`).
- **`components/WishlistCard.jsx`** (new) — image, name, category, price,
  stock ("N units left" / "Out of stock"), View Details, Remove from
  Wishlist (shows "Removing...", per-card error on failure).
- **`components/ProductCard.jsx`** — now has a wishlist button when the page
  passes `onToggleWishlist` (Landing doesn't, so guests see the plain card).
  States: `♡ Add to Wishlist` → `⏳ Saving...` (button disabled, so no
  duplicate requests) → `♥ Added to Wishlist`; clicking again removes it.
  Failures show "Unable to save product. Please try again." Also shows
  stock. The card is no longer one big `<Link>` (a button can't sit inside
  a link), so the image and text are the link and the button sits below.
- **`pages/Products.jsx`** — fetches `GET /wishlist` once to know which cards
  start as saved, and calls POST/DELETE per card. A 409 on add or 404 on
  remove means the server already has that state, so the UI syncs to it
  instead of showing an error.
- **`pages/ProductDetail.jsx`** — now loads whether the product is already
  saved (it previously always showed "Save for later"), and uses the toggle
  endpoint.
- **`components/Navbar.jsx`** — logged-in users now get the lab's
  `Home | Products | Wishlist | Logout` (plus cart and avatar, which now
  shows the user's real initial instead of a hardcoded "A"). Guests on a
  product page see Log in / Sign up instead. Wishlist link with live count
  ("Wishlist (3)", bonus). Products/Wishlist pass the count they already
  have so it updates instantly; other pages fetch it once. Navbar and Logo
  links switched from `<a href>` to React Router `<Link>`, so navigating no
  longer reloads the page.
- **`App.jsx`** — added the `/wishlist` route.
