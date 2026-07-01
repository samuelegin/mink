# mink

Send money like a message. Claim `@yourname`, pay anyone, on any chain — mink handles the chains, gas, and addresses so you never have to think about them.

Built for the **UXmaxx Hackathon** (Universal Accounts Track), powered by **Particle Network's Universal Accounts SDK (EIP-7702)**, **Arbitrum**, and **Magic**.

## What's in this repo (checkpoint 2)

This is the landing page — the pitch surface for the product. It's built to be fast, real-content-first, and screenshot-ready for the deck.

- Hero, "how it works," social feed preview, universal balance visual, and community section
- All copy and layout are final; app screens (sign up, send, wallet) are the next milestone

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- lucide-react for icons

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Build

```bash
npm run build
```

## Structure

```
src/
  assets/ illustrations, logo, community photo
  components/      Navbar, Hero, PoweredBy, HowItWorks, FeedPreview, UniversalBalance, Community, CTA, Footer
  hooks/ useReveal.ts - scroll-reveal animation hook
  App.tsx page assembly
  index.css design tokens + global styles
```

## Roadmap

- Sign up flow with Magic embedded wallet (email login, EIP-7702 upgrade)
- Handle registry contract on Arbitrum (registerUsername, resolve)
- Send-by-handle flow via Particle Universal Accounts SDK
- Live feed + wallet screens