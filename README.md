# KHARNA — Chhath Puja sarees

A production-shaped MERN store for Chhath Puja sarees: a warm, mobile-first storefront and a
complete admin studio. React 18 + Vite on the front, Express + MongoDB behind it.

Prices are in INR. Payments support Cash on Delivery out of the box and Razorpay when keys are
configured. Every business detail that needs a real-world answer is marked `TODO` in the UI and
listed at the end of this file.

---

## Stack

**Frontend** — React 18, Vite 5, React Router 6, Redux Toolkit, Tailwind CSS 3, Framer Motion,
Axios, React Hook Form + Zod, React Helmet Async, Recharts (admin dashboard only).

**Backend** — Node ESM, Express 4, Mongoose 8, JWT in an httpOnly cookie with bcrypt (12 rounds),
Zod validation on every input, Multer uploads (Cloudinary or local disk), Razorpay, helmet, CORS
allowlist, rate limiting, mongo-sanitize, morgan.

---

## Quick start

Requirements: Node 20+ and npm. MongoDB is optional for development.

```bash
# 1. Backend
cd backend
cp .env.example .env          # set JWT_SECRET; everything else has a working default
npm install
npm run seed                  # one admin, 6 collections, 28 sarees, 3 coupons, sample orders
npm run dev                   # http://localhost:5001/api/v1

# 2. Frontend (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5001`.

Seeded accounts:

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Admin    | `admin@kharna.in`   | `Admin@12345` |
| Customer | `demo@kharna.in`    | `Demo@12345` |
| Customer | `ritika@example.com`| `Demo@12345` |

Coupons: `CHHATH10` (10% up to ₹1,000), `SURYODAY500` (flat ₹500), `NEW200` (₹200).

> Port 5001 is the default because macOS reserves 5000 for AirPlay Receiver. Change `PORT` and the
> Vite proxy target together if you prefer another port.

### Database in development

Leave `MONGO_URI` empty and the API boots its own persisted `mongodb-memory-server`, storing data in
`backend/.mongo-data`. Seeded data survives restarts. Set a real `MONGO_URI` for staging/production.

---

## Environment variables

**backend/.env**

| Variable | Purpose |
| --- | --- |
| `NODE_ENV`, `PORT`, `CLIENT_URL` | Runtime, port (default 5001), allowed frontend origin(s) |
| `MONGO_URI` | MongoDB connection string; empty in dev uses local memory server |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing secret and lifetime (7d) |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Account created by `npm run seed` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional; uploads fall back to `backend/uploads` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Optional; online payment stays hidden until set |
| `SHIPPING_FEE`, `FREE_SHIPPING_THRESHOLD` | Defaults; Admin → Settings overrides at runtime |

**frontend/.env**

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base; leave empty to use the dev proxy |
| `VITE_SITE_URL` | Canonical/OG/JSON-LD origin, e.g. `https://kharna.in` |

No secrets live in source control. Both apps ship `.env.example` and `.gitignore` excludes `.env`,
`uploads/` and `.mongo-data/`.

---

## Scripts

**backend**

| Command | Does |
| --- | --- |
| `npm run dev` | nodemon on `src/server.js` |
| `npm start` | production start |
| `npm run seed` | wipes and reseeds catalogue, users, coupons and sample orders |
| `npm run lint` | ESLint 9 flat config |

**frontend**

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | production build with route-level chunks |
| `npm run preview` | serve the built bundle |
| `npm run lint` / `format` / `format:check` | ESLint 9, Prettier 3 |

---

## Folder layout

```
backend/
  src/
    config/        env parsing, database, razorpay, cloudinary
    models/        User, Product, Category, Order, Coupon, Review, Settings
    controllers/   auth, product, category, cart, order, payment, review,
                   coupon, user, settings, admin, upload
    routes/        /api/v1 routers
    validators/    Zod schemas per resource
    middleware/    auth, validate, error handler, upload, rate limits
    seed/          deterministic catalogue + demo orders
  .mongo-data/     dev database (gitignored)

frontend/
  src/
    pages/         storefront pages + pages/admin/*
    components/    brand, layout, product, cart, ui, auth, admin, seo
    routes/        AppRoutes, lazy page cache, ProtectedRoute
    store/         slices: auth, cart, wishlist, settings, ui
    services/      axios client + one module per resource
    styles/        Tailwind entry and component utilities
```

---

## API reference

Base path: `/api/v1`. Auth is a JWT in the `kharna_token` httpOnly cookie (Bearer header also
accepted). Error bodies are `{ success: false, message, details? }`; stack traces are never sent in
production.

**Auth** — `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
`GET /auth/me` (returns `user: null` for guests so the SPA can boot without a 401),
`POST /auth/forgot-password`, `POST /auth/reset-password/:token`.
Auth routes are rate limited.

**Catalogue** — `GET /products` (search, fabric, colour, day, price, sort, page),
`GET /products/:slug`, `GET /products/:slug/related`, `GET /categories`,
`GET /categories/:slug`, `GET /reviews/product/:productId`, `GET /settings`.

**Account** (auth) — `PATCH /users/profile`, `PATCH /users/password`,
`GET|POST /users/addresses`, `PATCH|DELETE /users/addresses/:id`,
`GET /users/wishlist`, `POST|DELETE /users/wishlist/:productId`,
`POST /reviews/product/:productId`, `DELETE /reviews/:id`.

**Cart** (auth) — `GET /cart`, `POST /cart`, `POST /cart/merge`,
`PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`.

**Orders** (auth) — `POST /orders`, `GET /orders`, `GET /orders/:id`,
`POST /orders/:id/cancel`, `POST /coupons/validate`.

**Payments** (auth) — `POST /payments/order`, `POST /payments/verify`, and a raw-body
Razorpay webhook handler.

**Admin** (auth + admin) — `GET /admin/stats`, `GET /admin/users`,
`GET /admin/products`, `POST /admin/products`, `PATCH|DELETE /admin/products/:id`,
`POST /admin/categories`, `PATCH|DELETE /admin/categories/:id`,
`GET /admin/orders`, `PATCH /admin/orders/:id/status`,
`GET|POST /admin/coupons`, `PATCH|DELETE /admin/coupons/:id`,
`PUT /admin/settings`, `POST /admin/uploads` (up to 6 images, 5 MB each).

---

## Decisions worth knowing

- **Server-authoritative money.** Cart, coupon and totals are recomputed on the server when an order
  is created. Order line items store a final per-unit price that already includes the size delta, so
  history stays correct if prices change later.
- **Stock is decremented atomically** at order creation and restored if a step fails or the order is
  cancelled.
- **Guest carts** live in `localStorage` (`kharna_guest_cart`) and merge into the account cart on
  login or registration.
- **Razorpay is hidden, not mocked.** Without keys, `settings.payments.razorpayEnabled` is false and
  checkout offers COD only, with a short explanation. Verification uses a timing-safe HMAC.
- **Uploads degrade gracefully.** Cloudinary when configured, otherwise local `uploads/` served by
  Express.
- **Order statuses move forward only** (placed → confirmed → packed → shipped → delivered) with the
  admin able to cancel until packing. Cancelling a paid order shows a refund reminder.
- **Route transitions** mount a keyed fade-up wrapper; `AnimatePresence mode="wait"` was avoided
  because it deadlocks with lazy route chunks. Reduced-motion is respected.
- **`GET /auth/me` is optional-auth** and answers `200 { user: null }` for guests so every anonymous
  visit does not log a 401.
- **Port 5001**, persisted memory Mongo in dev, placeholder `placehold.co` images — all chosen to
  keep `npm install && npm run dev` a two-command start.

---

## Design, accessibility and SEO

Warm Chhath palette (sun, marigold, flame, sindoor, bamboo on cream), Playfair Display and
Cormorant for headings, Poppins/Inter for text, Noto Serif Devanagari for Hindi lines. The
hand-authored sun-and-parvaitin SVG logo has light, dark and compact variants and doubles as the
route loader.

Contrast targets WCAG AA, focus rings use sindoor, dialogs trap focus, the cart drawer locks
background scroll, and the mobile sticky add-to-cart keeps a 44 px target. Skip link, landmark
regions, labelled controls and `aria-live` toasts are in place throughout.

Helmet supplies per-page titles, description, canonical, Open Graph and Twitter tags. Product pages
emit `Product` JSON-LD, FAQ emits `FAQPage` JSON-LD. `public/robots.txt` and `public/sitemap.xml`
are included. Images define width/height with an aspect-ratio wrapper and fade in on load to avoid
layout shift.

---

## TODO placeholders

These are deliberate gaps, not oversights:

1. **Razorpay live keys** — add `RAZORPAY_*` to `backend/.env`, then test create/verify and the
   webhook. Refund flow is a reminder only.
2. **Cloudinary credentials** — uploads currently write to `backend/uploads` without them.
3. **Real product photography** — seeded images use `placehold.co` and are labelled as placeholders.
4. **Transactional email** — password reset, order confirmation and contact replies are not sent.
   Hooks are marked `TODO` in the auth, order and contact code.
5. **Newsletter persistence** — the footer form validates and thanks the visitor but stores nothing.
6. **Business identity** — GSTIN, studio address and phone appear as `TODO` in the footer, contact
   page, About and Settings.
7. **Pincode serviceability and delivery ETA** — the product-page check is a friendly placeholder;
   connect a courier API for real estimates.
8. **Festival cut-off date** — shipping copy mentions the Chhath deadline as a `TODO`; set the real
   date each year.
9. **International shipping** — India-only for now; copy notes this as a future option.
10. **Testimonials** — the home page quotes are written examples, marked for replacement with real,
    consented customer words.
11. **Legal review** — Privacy and Terms are honest drafts and need a lawyer's pass plus final
    business details.

---

Built with care for the women who keep the light. Jai Chhathi Maiya.
