# Intyoza Mobile

React Native app built with Expo Router and TypeScript. It connects to the existing Intyoza API and includes regular-user functionality only.

## Requirements

- Node.js LTS and npm
- Expo Go on an Android device, or Android Studio with an emulator configured

## Install and run

```bash
npm install
npm run start
```

Scan the QR code with Expo Go. To open an Android emulator from the Expo CLI, start an emulator first and run:

```bash
npm run android
```

To produce and validate the Android JavaScript bundle:

```bash
npm run android:export
npm run typecheck
```

## API configuration

The app defaults to `https://intyoza-backend.onrender.com`. To use another API base URL, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL`. This value is public app configuration; do not put secrets in it.

Authentication tokens are stored with Expo SecureStore and attached as bearer tokens. A `401` clears the local session. Logout clears the local session because the documented API has no logout endpoint.

## Included regular-user features

- Email registration and login
- Profile retrieval and updates
- Learning categories and article listings
- English and Kinyarwanda learning and Myth Buster content
- Health facility search and local filtering
- Guest AI chat
- Authenticated community spaces, posts, and user reports
- Professional callback requests and the user's referral list

No administrator routes or screens are included. The community space creation route is excluded because its Swagger summary says it is usually admin-only. The health facility list is implemented as a public request, consistent with its summary and observed live behavior; Swagger’s global security declaration conflicts with that summary.

## API contract limits

The published Swagger document does not define most response schemas. The app uses response fields verified from live read-only responses for learning categories, article listings, myths, and facilities. For community, chat, profile, and referral results, it avoids assuming undocumented fields and renders returned values defensively.

The learning endpoint currently returns article metadata without article body content, and no article detail route is documented. The app therefore lists articles without fabricating full article text. Swagger documents Google OAuth redirects but does not specify a mobile deep-link return URI, so OAuth is not wired into the app until that redirect contract is available. Password recovery/reset endpoints are not documented.

## Scope and security

This app does not modify the backend, call `/api/v1/admin/*`, or recreate admin workflows. All content and user records are loaded from the deployed API; there is no mock-data fallback.
