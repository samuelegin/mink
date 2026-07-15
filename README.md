# Mink
Send money by @handle. Any chain in, Arbitrum out — the chain never shows.

**UXmaxx Hackathon 2026 — Samuel Egin · Gabriel Michael Ojomakpene**

## Overview

Mink is a chain-abstractedmink is a social payments application. A user logs in with email no seed phrase, no wallet extension and Magic instantly gives them an embedded EOA wallet. That same EOA is upgraded in place into a Particle **Universal Account** via **EIP-7702**: no new address, no asset migration, no smart-account deployment. The user's balance across every supported chain becomes one spendable balance.

When they pay a friend by `@handle`, Mink auto-sources the value from wherever the sender actually holds funds and settles it as native USDC on **Arbitrum One** for the recipient — invisibly. Every settled payment also gets a public, permissionless on-chain receipt via `PaymentRegistry.sol`, verifiable by anyone independent of Mink's own backend.

Mink turns "which chain is my friend on, do I have gas, do I need to bridge first" into "send $5 to @samuel."

## Repo Structure

Mink is **not** a monorepo — two independently-installed projects living in one repo:

```
mink/
├── src/                     React + Vite + Tailwind frontend
│   ├── components/          Screens: Home, Pay, Activity, You, onboarding
│   ├── lib/                 magic.ts, universalAccount.ts, universalPaymentClient.ts, contracts.ts
│   └── context/              Auth + Toast providers
├── contracts/                Independent Hardhat project (@mink contracts)
│   ├── contracts/           PaymentRegistry.sol
│   ├── test/                 Hardhat/Chai test suite
│   └── scripts/deploy.ts
├── package.json               Frontend (npm)
└── contracts/package.json     Contracts (npm, separate install)
```

Install each independently: `npm install` at the root for the frontend, `cd contracts && npm install` for the contracts project. There's no shared workspace tooling — the two are deployed and versioned separately on purpose, since the frontend targets a live app and the contract targets a testnet.

## The Problem

Sending crypto to a friend usually means:

- **Pick the right chain** — sender and recipient have to agree on one, or the payment fails
- **Hold the right token, on the right chain** — "I have USDC but on the wrong chain" is a routine dead end
- **Pay gas in a specific native token** — another asset to hold just to move the one you actually want to send
- **Bridge manually first** — a separate app, a separate wait, before the actual payment even starts
- **New wallet, new seed phrase** — the onboarding cost kills casual, Venmo-style usage before it starts

None of this is what "send $5 to a friend" should feel like.

## The Solution

Mink removes every one of those steps:

- **Magic** handles login (email magic link / Google) and gives every user an embedded wallet with zero setup
- **Particle Universal Accounts in EIP-7702 mode** upgrades that same wallet into a chain-abstracted account — one balance, any chain, no migration
- **Arbitrum One** is the fixed settlement destination — recipients always get USDC there, regardless of what chain the sender's funds started on
- **PaymentRegistry.sol** logs a public receipt for every settled payment — proof-of-payment that doesn't depend on trusting Mink's backend

## User Flow

```
01  Log in with email or Google              Magic creates an embedded wallet, no seed phrase
02  Search a friend by @handle                Handle resolves to their wallet address
03  Enter an amount and hit Send              UA previews the transfer + fee across all chains
04  Sign once (twice on a chain's first tx)   EIP-7702 auth (if needed) + the transfer itself
05  UA auto-sources value from any chain      Settles as native USDC on Arbitrum for the recipient
06  Receipt logged on-chain                    PaymentRegistry.logPayment() — public, verifiable
```

## Architecture

| Contract | Role |
|---|---|
| `PaymentRegistry` | Permissionless on-chain payment receipt log — records sender, recipient, amount, and note per payment; maintains running sent/received totals per address; never custodies funds, called only after a payment has already settled via UA |

## Live Deployment

| Component | Location |
|---|---|
| Frontend | [mink-pearl.vercel.app](https://mink-pearl.vercel.app) |
| Settlement chain (UA) | Arbitrum One (mainnet) — native USDC |
| `PaymentRegistry` | Arbitrum Sepolia (testnet) — *address pending first deploy, see `contracts/scripts/deploy.ts`* |

`PaymentRegistry` runs on Sepolia deliberately, decoupled from the real mainnet settlement chain — the receipt is supplementary proof, not the payment itself, so it costs free testnet gas instead of real mainnet gas on every send.

## Running Locally

**Prerequisites**
- Node.js v18+
- A Magic publishable key ([dashboard.magic.link](https://dashboard.magic.link))
- Particle Project ID / Client Key / App ID ([dashboard.particle.network](https://dashboard.particle.network))

**Environment variables** — create `.env` at the repo root:

```
VITE_MAGIC_PUBLISHABLE_KEY=
VITE_PARTICLE_PROJECT_ID=
VITE_PARTICLE_CLIENT_KEY=
VITE_PARTICLE_APP_ID=
VITE_PAYMENT_REGISTRY_ADDRESS=
```

**Install and run the frontend**

```
npm install
npm run dev
```

**Contracts — install, test, and deploy separately**

```
cd contracts
npm install
npm run compile
npm run test
npm run deploy:arbSepolia
```

Copy the deployed address into `VITE_PAYMENT_REGISTRY_ADDRESS` above.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React · Vite · TypeScript · Tailwind CSS |
| Auth / Wallet | Magic SDK · `@magic-ext/oauth2` (Google OAuth) |
| Chain Abstraction | Particle Universal Account SDK — EIP-7702 mode |
| Blockchain Lib | ethers v6 |
| Smart Contracts | Solidity 0.8.24 · Hardhat · Chai/Mocha |
| Settlement | Arbitrum One (USDC) |

## Team

**Samuel Egin** — Blockchain Dev · [@0xEtherfren](https://twitter.com/0xEtherfren)
**Gabriel Michael Ojomakpene** — Frontend Dev

*UXmaxx Hackathon 2026*