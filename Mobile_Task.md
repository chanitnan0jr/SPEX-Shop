# Mobile_Task.md — SPEX-Shop (React Native)

## Overview
SPEX-Shop mobile app built with Expo + React Native.
Reuses existing SpecBot backend on Azure App Service — no backend changes needed except new Cart/Order/Payment routes.

## Status legend
- [ ] Not started
- [~] In progress  
- [x] Done

---

## Phase 0 — Setup (Day 1)

### Init Expo project
- [x] `cd SpecBot- && npx create-expo-app mobile_frontend --template blank-typescript`
- [x] `cd mobile_frontend && bunx expo install expo-router nativewind @tanstack/react-query axios expo-secure-store`
- [x] Setup `app.json` — name: "SPEX-Shop", scheme: "spexshop"
- [x] Setup `_layout.tsx` — root layout + TanStack Query provider
- [ ] Setup NativeWind — `tailwind.config.js` + `babel.config.js`
- [x] Setup `lib/api.ts` — axios instance pointing to Azure App Service URL
- [x] Copy `types/` จาก `frontend/` มาใส่ `mobile_frontend/types/`
- [ ] ทดสอบ `GET /api/health` จาก mobile ว่า connect Azure ได้
- [ ] ทดสอบ run บน Expo Go app (iOS/Android)

---

## Phase 1 — Product Catalog (Day 2–3)

### Backend (เพิ่มใน existing backend)
- [x] สร้าง `routes/products.ts` — `GET /api/products` (list with pagination)
- [x] สร้าง `GET /api/products/:id` — product detail
- [x] reuse `models/Spec.ts` — ไม่ต้องสร้าง schema ใหม่
- [ ] ทดสอบด้วย Bruno

### Mobile screens
- [x] สร้าง `app/(tabs)/index.tsx` — Home · product grid
- [x] สร้าง `components/ProductCard.tsx` — รูป · ชื่อ · ราคา · brand badge
- [x] สร้าง `app/product/[id].tsx` — Product detail · full spec sections
- [x] สร้าง `components/SpecSection.tsx` — แสดง spec_sections แบบ accordion
- [x] เพิ่ม pagination / infinite scroll บน product list
- [x] เพิ่ม filter by brand (Samsung / Apple / Xiaomi etc.)

---

## Phase 2 — Search (Day 4)

### Mobile screens
- [x] สร้าง `app/(tabs)/search.tsx` — RAG search screen
- [x] สร้าง `components/SearchBar.tsx` — Thai language input
- [x] call `POST /api/search` — reuse existing RAG endpoint ✅
- [x] แสดง answer + source cards
- [x] เพิ่ม search history (AsyncStorage)
- [x] เพิ่ม suggested queries ("มือถือแบตอึด", "กล้องดีราคาไม่เกิน 15000")

---

## Phase 3 — Auth (Day 5)

### Backend (เพิ่มใน existing backend)
- [x] สร้าง `models/AuthUser.ts` — Mongoose schema (name, email, passwordHash)
- [x] สร้าง `routes/auth.ts`
  - `POST /api/auth/register`
  - `POST /api/auth/login` → return JWT
  - `POST /api/auth/refresh`
- [x] ทดสอบด้วย Bruno ✅

### Mobile screens
- [x] สร้าง `app/auth/login.tsx` ✅
- [x] สร้าง `app/auth/register.tsx` ✅
- [x] สร้าง `context/auth.tsx` — login / logout / refresh token ✅
- [x] เก็บ JWT ใน `expo-secure-store` (ไม่ใช่ AsyncStorage) ✅
- [x] สร้าง `lib/api.ts` refresh interceptor — axios interceptor attach JWT header ✅
- [x] Protected routes — redirect ไป login ถ้าไม่มี token ✅

---

## Phase 4 — Cart (Day 6–7)

### Backend (เพิ่มใน existing backend)
- [x] สร้าง `models/Cart.ts` ✅
- [x] สร้าง `routes/cart.ts`
  - `GET /api/cart` — get current user cart
  - `POST /api/cart/add` — add item
  - `PATCH /api/cart/update` — update quantity
  - `DELETE /api/cart/remove/:specId` — remove item
  - `DELETE /api/cart/clear` — clear cart
- [x] ทดสอบด้วย Bruno ✅

### Mobile screens
- [x] สร้าง `app/(tabs)/cart.tsx` — cart screen ✅
- [x] สร้าง `components/CartItem.tsx` — รูป · ชื่อ · ราคา · quantity stepper ✅
- [x] สร้าง `hooks/useCart.ts` — Guest mode & Sync logic ✅
- [x] เพิ่มปุ่ม "Add to Cart" ใน ProductCard + Product detail ✅
- [x] แสดง cart badge count บน tab icon ✅
- [x] Order summary — subtotal · items count ✅

---

## Phase 5 — Checkout + Order (Week 2 Day 1–3)

### Backend (เพิ่มใน existing backend)
- [ ] สร้าง `models/Order.ts`
```typescript
{
  userId: ObjectId
  items: [{ specId, brand, model, price_thb, quantity }]
  totalAmount: number
  status: "pending" | "paid" | "cancelled"
  paymentRef: string | null
  createdAt: Date
}
```
- [ ] สร้าง `routes/orders.ts`
  - `POST /api/orders/create` — create order from cart
  - `GET /api/orders` — list user orders
  - `GET /api/orders/:id` — order detail
- [ ] ทดสอบด้วย Bruno

### Mobile screens
- [ ] สร้าง `app/checkout.tsx` — checkout screen
  - Order summary
  - Shipping address form
  - Payment method selector
- [ ] สร้าง `app/(tabs)/orders.tsx` — order history
- [ ] สร้าง `app/orders/[id].tsx` — order detail + status

---

## Phase 6 — Payment / Omise (Week 2 Day 4–5)

### Backend
- [ ] สมัคร Omise account (free sandbox) — https://omise.co
- [ ] install `omise-node` package
- [ ] สร้าง `routes/payment.ts`
  - `POST /api/payment/charge` — create Omise charge
  - `POST /api/payment/webhook` — handle Omise webhook → update order status
- [ ] เพิ่ม `OMISE_PUBLIC_KEY` + `OMISE_SECRET_KEY` ใน backend `.env`
- [ ] ทดสอบ sandbox payment ด้วย Bruno

### Mobile
- [ ] install `omise-react-native` หรือใช้ WebView + Omise.js
- [ ] สร้าง `components/PaymentForm.tsx` — card number input (Omise tokenization)
- [ ] สร้าง `hooks/usePayment.ts` — tokenize → charge flow
- [ ] แสดง payment success / failure screen
- [ ] เพิ่ม order status polling หลัง payment

---

## Phase 7 — Polish + Build (Week 2 Day 6–7)

### UX Polish
- [ ] Loading skeletons บน ProductCard, CartItem
- [ ] Error states ครบทุก screen
- [ ] Pull-to-refresh บน product list + orders
- [ ] Toast notifications (add to cart, payment success/fail)
- [ ] Empty states (empty cart, no orders, no search results)

### App icon + Splash screen
- [ ] ออกแบบ SPEX-Shop icon (ใช้ Figma)
- [ ] ใส่ใน `app.json` → `expo.icon` + `expo.splash`

### Build + Deploy
- [ ] `bunx eas build --platform android --profile preview` → APK
- [ ] ทดสอบบน Android จริง
- [ ] (Optional) `bunx eas build --platform ios` ถ้ามี Mac/Apple Developer account
- [ ] อัปโหลด APK ไว้ใน GitHub Releases
- [ ] เพิ่ม demo GIF/video ใน README.md

---

## Phase 8 — CV + Portfolio Update

- [ ] เพิ่ม SPEX-Shop ใน `frontend/localhost-v1` portfolio
- [ ] อัปเดต `projectsData.ts` — เพิ่ม mobile app entry
- [ ] อัปเดต CV — แทน Mini Redis ด้วย SPEX-Shop
- [ ] เพิ่ม React Native + Expo ใน Technical Skills
- [ ] เพิ่ม Omise ใน Skills ถ้าใช้จริง
- [ ] อัปเดต GitHub README ของ repo

---

## Backend endpoints summary (ทั้งหมดที่ต้องเพิ่ม)

| Method | Path | Description | Phase |
|--------|------|-------------|-------|
| GET | `/api/products` | list products + pagination | 1 |
| GET | `/api/products/:id` | product detail | 1 |
| POST | `/api/auth/register` | register | 3 |
| POST | `/api/auth/login` | login → JWT | 3 |
| POST | `/api/auth/refresh` | refresh token | 3 |
| GET | `/api/cart` | get cart | 4 | ✅ |
| POST | `/api/cart/add` | add to cart | 4 | ✅ |
| PATCH | `/api/cart/update` | update qty | 4 | ✅ |
| DELETE | `/api/cart/remove/:specId` | remove item | 4 | ✅ |
| DELETE | `/api/cart/clear` | clear cart | 4 | ✅ |
| POST | `/api/orders/create` | create order | 5 |
| GET | `/api/orders` | list orders | 5 |
| GET | `/api/orders/:id` | order detail | 5 |
| POST | `/api/payment/charge` | Omise charge | 6 |
| POST | `/api/payment/webhook` | Omise webhook | 6 |

Existing endpoints reused ✅: `/api/search` · `/api/specs/:brand` · `/api/compare` · `/api/health`

---

## Tech stack (mobile_frontend)

| Layer | Technology |
|---|---|
| Framework | Expo SDK 51 + Expo Router |
| Language | TypeScript |
| Styling | NativeWind (Tailwind on RN) |
| Data fetching | TanStack Query v5 |
| HTTP | Axios |
| Auth storage | expo-secure-store |
| Payment | Omise React Native |
| Build | EAS Build |
| Deploy | GitHub Releases (APK) |

---

## Known risks

| Risk | Mitigation |
|------|-----------|
| Omise React Native ไม่ update | ใช้ WebView + Omise.js แทน |
| iOS build ต้องการ Apple Developer ($99/yr) | ทำแค่ Android ก่อน |
| Expo Go ไม่รองรับ native modules บางตัว | ใช้ Development Build แทน |
| NativeWind v4 ยัง beta | pin version ไว้ที่ stable |
