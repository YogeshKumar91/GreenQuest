# GreenQuest

> A community platform that connects waste reporting, verified collection, and environmental rewards.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169e1?logo=postgresql)](https://www.postgresql.org/)

## Overview

GreenQuest is a web application for community waste management. People can report waste with a photo and location, collectors can find and verify collection tasks, and participants can earn points for verified contributions. The home page presents community impact totals, including reported waste, collected waste, points, and an estimated CO₂ offset.

The project is built with Next.js and React. It uses a PostgreSQL database through Drizzle ORM and Neon, Web3Auth for sign-in, Google Places for report locations, and a Groq API endpoint for image-assisted waste verification.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Current limitations](#current-limitations)

## Features

| Area | What it does |
| --- | --- |
| Home | Shows community impact totals and links to the main user flows. |
| Sign-in | Uses Web3Auth; associates the signed-in email with a GreenQuest user record. |
| Report Waste | Lets a user select a location, upload a waste photo, verify the photo, and submit a report. |
| Collect Waste | Lists reported tasks, supports location search and status updates, and verifies a collection photo. |
| Rewards | Displays points, available rewards, and earning/redemption transactions. |
| History | Shows the signed-in user's recent reports and their statuses. |
| Settings | Saves sample profile preferences in the current browser. |
| Admin | Provides an admin landing page and placeholder links for management areas. |

## How it works

### 1. Report waste

1. Sign in and open **Report Waste**.
2. Select a location through Google Places and upload a photo.
3. The app sends the image to the `/api/verify-waste` server endpoint. The endpoint calls Groq's vision-capable API to estimate the waste type, quantity, and confidence.
4. Review the suggested details and submit the report.
5. The report and verification result are stored in PostgreSQL. A report that meets the verification threshold is marked verified and earns 10 points; the app also records a transaction and creates a notification.

### 2. Collect waste

1. Open **Collect Waste**, browse or search tasks by location, and select a task.
2. Update the task status as collection work progresses.
3. Upload a collection photo for comparison with the reported waste type and amount.
4. If the image check reports matching type and quantity with sufficient confidence, the task is marked verified, a collection record is saved, and a collection reward is recorded.

### 3. Track and redeem points

The rewards area calculates a balance from earned and redeemed transactions. Verified reporting and collection create earning transactions; redeeming a reward creates a redemption transaction. A browser-side helper keeps the displayed balance in sync while the user navigates the app.

## Technology

- **Application:** Next.js 15 App Router, React 19, TypeScript
- **Styling and UI:** Tailwind CSS, Radix UI, Lucide icons, React Hot Toast
- **Data:** PostgreSQL on Neon, Drizzle ORM, Drizzle Kit
- **Authentication:** Web3Auth
- **Location search:** Google Maps/Places JavaScript API
- **Image verification:** Groq API, called from a Next.js route handler

## Getting started

### Prerequisites

- Node.js and npm
- A PostgreSQL database with a Neon-compatible connection URL
- Web3Auth, Google Maps/Places, and Groq credentials for the integrations you want to use

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the project root and set the variables described below. Keep real credentials private; `.env*` files are ignored by Git.

### Set up the database

Apply the Drizzle schema to the database configured by `DATABASE_URL`:

```bash
npm run db:push
```

### Run locally

```bash
npm run dev
```

Open [http://greenquest.lvh.me:3000](http://greenquest.lvh.me:3000). This local hostname avoids hCaptcha's `localhost` warning. Add that exact origin to the allowed origins in your Web3Auth project and to the Google Maps key's HTTP referrer restrictions.

## Environment variables

| Variable | Used for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Database queries and Drizzle commands | PostgreSQL connection string. |
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | User sign-in | Public Web3Auth client ID. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Location search on the report page | Enable Maps JavaScript API and Places API, configure billing, and allow the local or deployed site origin in the key's HTTP referrer restrictions. |
| `GROQ_API_KEY` | Live image verification | Server-side secret. Do not expose it with a `NEXT_PUBLIC_` prefix. |

Example variable names (replace the placeholders with your own credentials):

```dotenv
DATABASE_URL=postgresql://user:password@host/database
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your-web3auth-client-id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GROQ_API_KEY=your-groq-api-key
```

Do not commit real credentials. For a hosted deployment, configure these values using the hosting provider's environment-variable or secret-management settings.

For Render, set `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` in the service's environment before deploying (Next.js embeds public variables during the build). Also add the deployed Render origin, such as `https://your-service.onrender.com`, to the allowed origins for your Web3Auth project.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run db:push` | Apply the Drizzle schema to the configured database. |
| `npm run db:studio` | Launch the configured Drizzle database dashboard command. |

## Project structure

```text
app/
├── admin/                 Admin landing page and management-section routes
├── api/verify-waste/      Server endpoint for Groq image verification
├── collect/               Collection task list and verification flow
├── leaderboard/           User report history (navigation label: History)
├── login/                 Web3Auth sign-in
├── report/                Waste report submission and image verification
├── rewards/               Point balance, rewards, and transactions
├── settings/              Browser-local profile preferences
└── verify/                Standalone verification demo using mock data
components/                 Shared layout, navigation, and UI components
utils/
├── balanceSync.ts          Browser-side reward-balance synchronization
└── db/
    ├── actions.ts          Database queries and mutations
    ├── dbConfig.jsx        Neon and Drizzle connection
    └── schema.ts           PostgreSQL table definitions
```

The database schema defines users, reports, rewards, collected waste, notifications, and reward transactions.

## Current limitations

- The standalone `/verify` page returns simulated results. The report and collection flows use the live `/api/verify-waste` endpoint.
- Live image verification requires a valid `GROQ_API_KEY` and an available Groq API.
- The admin login/access checks are prototype-only and rely on client-side state. Admin management pages are placeholders; the admin area is **not suitable for production administration** without server-side authentication, authorization, and complete management functionality.
- Some user and settings data is stored in browser local storage. This client-side state must not be treated as an authorization boundary.
