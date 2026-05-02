# Repair Shop

A modern React Native app for **mobile repair shops in India** — digitises the workflow that today runs on paper job slips, WhatsApp updates, and GST invoices in a notebook.

Built for the shop owner / technician (not the customer).

---

## What it does

- **Dashboard** — Today's jobs, today's revenue (₹ in Indian grouping), in-progress count, ready-for-pickup count, low-stock alerts.
- **Jobs** — Walk-in intake (customer + device + IMEI + accessories + lock note + issue), filterable list (Today / In Progress / Ready / Overdue), full status timeline (Received → Diagnosed → Quoted → Approved → Under Repair → Ready → Delivered).
- **Customers** — Auto-created from jobs. Search by name or phone. One-tap call or WhatsApp. Job history + lifetime spend.
- **Inventory** — Spare parts with cost / sell price / stock / low-stock threshold. Stock decrements automatically when a part is fitted to a job.
- **Invoices** — GST-compliant tax invoice with CGST + SGST split, HSN code 998719 (mobile-repair service), totals in words. **One-tap WhatsApp share** sends the invoice text straight to the customer.
- **Settings** — Shop profile, GSTIN, default GST rate, technician roster, reset.

The app ships with seeded sample data so it never feels empty on first launch.

---

## Stack

- React Native CLI **0.76.5** (New Architecture) + TypeScript strict
- React Navigation 7 (native-stack + bottom-tabs)
- Local persistence via `@react-native-async-storage/async-storage` (no cloud backend in V1)
- Animations via `react-native-reanimated` 3 — splash overlay pulse, button springs, list staggered enter, status-pill spring on change, success overlay zoom, animated number counters on Dashboard, custom toast slide-up.
- `react-native-svg` for the app icon, splash logo, empty-state illustrations, and custom icon set (no third-party icon library).
- Custom design system in `src/theme/tokens.ts` — deep-indigo / saffron palette, 4-pt spacing scale, hairline-bordered cards, tabular-num currency, distinctive enough to not look "AI-generated".

### Why these choices

- **No native config drama**: every native dep autolinks cleanly so the GitHub Actions runner can build an APK with no manual intervention.
- **No Lottie / vector assets to ship**: animations are all worklet-based, illustrations are inline SVG. Smaller APK, simpler tree.
- **AsyncStorage over SQLite**: V1 is a single-shop demo; AsyncStorage with a hand-written reactive store is simpler and ships in days, not weeks. Easy to swap for SQLite (`@op-engineering/op-sqlite`) when scaling.

---

## Run locally (Android)

```bash
yarn install
yarn start          # in one terminal
yarn android        # in another (needs Android emulator or USB device)
```

iOS works too but needs a Mac + `pod install`. Not covered here.

---

## Get the APK from GitHub Actions

Every push to any branch (and every manual run from the **Actions** tab) builds a debug-signed release APK. To install on your phone:

1. Open the [Actions tab](../../actions) and pick the latest "Build Android APK" run.
2. Scroll to **Artifacts** and download `repair-shop-<n>-<sha>.apk`.
3. Transfer to your Android phone (Drive / WhatsApp to yourself / USB).
4. Tap the file. The first time, Android will ask you to allow "Install unknown apps" for your file manager / browser — allow it, then re-tap.
5. Done. The launcher icon is the saffron wrench-on-indigo mark and the app is named **Repair Shop**.

> Signing: the APK is signed with the Android **debug keystore**, which is fine for sideloading and testing but not for the Play Store. To publish, generate a real release keystore and update `android/app/build.gradle` accordingly.

---

## Project layout

```
src/
├── app/
│   ├── App.tsx                  # providers + boot order (hydrate → splash hide)
│   └── navigation/              # RootNavigator + AppTabs (typed)
├── components/                  # AnimatedPressable, Button, Card, Input, MoneyText, StatusPill, Skeleton, EmptyState, Fab, Toast, ScreenHeader, SplashOverlay, StatCard, icons.tsx
├── data/
│   ├── store.ts                 # tiny pub-sub + AsyncStorage persistence
│   ├── seed.ts                  # sample shop, customers, parts, jobs
│   └── types.ts
├── lib/
│   ├── currency.ts              # formatINR with Indian grouping
│   ├── date.ts                  # DD/MM/YYYY + relative time
│   ├── gst.ts                   # CGST/SGST/IGST split + numberToIndianWords
│   ├── haptics.ts               # respects Reduce Motion
│   ├── id.ts                    # ticket / invoice number generation
│   └── whatsapp.ts              # whatsapp:// deep link, fallback to api.whatsapp.com
├── screens/
│   ├── onboarding/              # 3-step PagerView-like flow
│   ├── dashboard/               # animated stat cards + active-jobs list
│   ├── jobs/                    # list, create (modal), detail (timeline + parts)
│   ├── customers/               # list + detail (history, lifetime spend)
│   ├── inventory/               # list + add/edit
│   ├── invoices/                # list + detail (printable layout, share)
│   ├── settings/                # shop info, GST, technicians, reset
│   └── more/                    # tab-5 hub
└── theme/
    └── tokens.ts                # design system
```

Brand source on the Android side: a single `splash_logo.xml` and `ic_launcher_foreground.xml` vector drawable feed both the launcher icon (adaptive on Android 8+) and the native splash screen — no PNGs to maintain.

---

## What was deliberately deferred

To keep V1 shippable and the CI build reliable:

- Camera-based IMEI scanning
- Bluetooth thermal-printer support
- Hindi / regional i18n (single-language for now)
- Cloud sync / multi-device
- Push notifications
- Razorpay or other payment-gateway integration
- iOS CI build (works locally, but Macs in CI cost money)
- Customer-facing app (this is the shop side)
- Play Store release-signed AAB

These are deliberate cuts, not omissions. The architecture is set up to slot any of them in without rewrites.
