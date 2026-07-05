# mink

mink is a social payments application built for the UXMaxx Hackathon. The core idea is simple. Sending crypto should feel like sending a message. Instead of copying long wallet addresses, choosing a network, holding gas tokens, or thinking about which chain an asset lives on, a user in mink simply sends money to a friend's handle, such as @samuel. Everything else happens invisibly behind that single interaction.

mink is built around three sponsor technologies that make this experience possible.

Particle Network's Universal Accounts, running in EIP7702 mode, upgrade a user's existing wallet into a chain abstracted account in place. There is no new address to manage and no separate smart account to deploy. The wallet a user already has becomes capable of holding a unified balance and transacting across chains through a single signature.

Magic provides the embedded wallet and authentication layer. A user signs in with an email link or a Google account and receives a fully functional wallet with no seed phrase, no browser extension, and no separate signup flow to manage.

Arbitrum hosts the on chain identity layer. A dedicated smart contract called the Handle Registry maps human readable handles to wallet addresses and records payment events, giving mink's social feed something real to read from on chain rather than a database mink alone controls.

## The problem mink solves

Ordinary crypto payments require a sender to understand blockchain mechanics that have nothing to do with the actual goal of paying a friend. A typical flow forces someone to copy a forty two character address, confirm they are on the correct network, hold a separate gas token for that network, and hope they did not make a mistake anywhere in the process. mink removes every one of those steps from the user's mental model. The blockchain still does the work underneath, but the user only ever sees a handle, an amount, and a message.

## Core user flow

A new user opens mink and is guided through a short five screen onboarding carousel that explains the product in plain language, no addresses, no bridges, no chain selection, no gas. After onboarding, the user authenticates through Magic using either an email link or Google sign in. Immediately after authenticating for the first time, the user is required to claim a unique handle before they can enter the rest of the application. This claim step is treated as core account setup rather than an optional profile detail, since the handle is the user's entire payment identity inside mink.

Once inside the application, mink is organized into four main sections, accessible through a bottom tab bar on mobile and a persistent left sidebar on desktop.

The Home screen is centered on the user's unified balance. It shows a large balance card, quick actions for sending and requesting money, a short list of recent people the user has interacted with, a preview of recent activity, and a small profile completion checklist. It intentionally avoids exposing wallet addresses or chain details anywhere on the page.

The Pay screen is where a user actually sends money. It opens with a prominent search bar for finding a handle, contact, or recent recipient, followed by quick action cards, a horizontally scrolling row of recent people, and a full alphabetical contact list. Selecting a person opens a payment sheet where the user enters an amount, optionally attaches a short message such as coffee or rent, confirms the payment, and sees a success screen once it completes.

The Activity screen is designed to feel like a social feed rather than a transaction ledger. At the top, a horizontally scrolling row of story style avatars shows the people a user has recently paid or been paid by, similar in spirit to a messaging app's recent contacts. Below that sits a combined search and filter panel, a compact monthly summary of money received and sent, and a chronological, grouped feed of individual payments, each shown as a small social event such as Alex paid you for coffee rather than a row in a table.

The You screen is the user's identity and account settings surface. It shows the user's avatar, display name, and handle, along with buttons to share that handle or display a scannable QR code that encodes a payment link. Below the profile header, the page is organized into plain settings sections for account details, preferences, security, and support, deliberately avoiding the temptation to turn a profile page into a second analytics dashboard.

## Technical architecture

mink is split into two independent projects that together form the full application.

The frontend is a React and TypeScript application built with Vite and styled with Tailwind CSS. It uses the Magic SDK for authentication and embedded wallet creation, including both email link login and Google OAuth through the Magic OAuth extension. Ethers is used for all direct contract reads and writes. The application maintains its own design system built around a warm, neo brutalist inspired palette with a paper background, dark ink text, and a muted brown mink accent color, deliberately avoiding both dark mode crypto aesthetics and generic blue gradient fintech styling.

The contracts project is a Hardhat workspace containing the Handle Registry smart contract, its full test suite, and deployment scripts targeting Arbitrum Sepolia for testing and Arbitrum One for production use. The contract has already been audited internally during development, including a fix for a state consistency bug in the address update function, and is covered by an extensive test suite that treats the contract as though it were undergoing a third party audit.

## The Handle Registry contract

The Handle Registry is intentionally scoped as an identity and bookkeeping layer rather than a payment router. Value transfer between users is expected to happen through Particle's Universal Accounts directly, wallet to wallet, since that is both the simplest and the most compliant approach for the Universal Accounts hackathon track. The contract's job is narrower and more focused. It lets a user register a unique handle tied to their wallet address, lets that mapping be updated later if the user's controlling wallet changes, resolves a handle back to an address for any caller, and lets the true owner of a handle log a completed payment so that mink's social feed has a real on chain event to display. Every state changing function is protected so that only the actual owner of a handle can update it or log a payment on its behalf, which closes off the obvious way someone could otherwise fabricate a fake payment in the feed.

## Current implementation status

At this stage in development, the frontend is fully built and navigable end to end, including onboarding, authentication, handle claiming, and all four main application screens. The handle claim flow currently runs against a local mock registry rather than the live contract, controlled by a single flag in the codebase, so that UI work can continue without spending testnet funds on every iteration. The Handle Registry contract itself is written, tested, deployed, and verified on Arbitrum Sepolia, and is ready to be connected once the mock flag is switched off. Wiring an actual value transfer through Particle's Universal Accounts SDK in EIP7702 mode is the primary remaining piece of work required to satisfy the hackathon's core requirement of a real cross chain operation moving value.

Areas of the application that are deliberately left as honest empty states rather than filled with fabricated demo data include the activity feed, recent people lists, and monthly statistics on the You page, since none of them have a real data source connected yet. Each of these components is already written to accept real data through simple props, so connecting them later does not require rebuilding any UI.

## Project structure

The repository is organized as two sibling folders. The frontend folder contains the Vite React application, with page level screens under src components app, shared design system components grouped by feature under folders such as home, pay, activity, you, onboarding, and handle, and supporting logic under src lib, src hooks, and src context. The contracts folder contains the Hardhat project, with the Handle Registry contract itself under contracts, the audit style test suite under test, and deployment scripts under scripts.

## Getting started

To run the frontend locally, install dependencies with npm install inside the frontend folder, copy the example environment file to a real dot env file, fill in a Magic publishable key obtained from the Magic dashboard, and start the development server with npm run dev.

To work with the smart contracts, install dependencies with npm install inside the contracts folder, copy the example environment file and fill in a private key funded with Arbitrum Sepolia testnet ETH along with an Etherscan API key for verification, then use npm run compile to build the contract, npm test to run the full test suite, and npm run deploy:arbSepolia to deploy to Arbitrum Sepolia.

## Hackathon context

mink was built for the UXMaxx hackathon and targets three separate prize tracks that share a common technical foundation. The Universal Accounts track, sponsored by Particle Network, requires use of the Universal Accounts SDK in EIP7702 mode along with at least one cross chain operation that moves real value. The Arbitrum track rewards consumer applications where Arbitrum quietly powers the experience behind a chain abstracted user interface. The Magic Labs bonus challenge rewards the most creative and seamless use of Magic's embedded wallet infrastructure for onboarding. mink's architecture, an EOA upgraded in place through Particle, embedded and authenticated through Magic, with identity and payment logging recorded on Arbitrum, is designed to satisfy all three simultaneously rather than treating them as three separate integrations bolted together.
