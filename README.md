# Scaffold-HBAR Enterprise Suite

Welcome to the **Scaffold-HBAR Enterprise Suite** — a production-ready, highly polished Next.js/React template designed specifically for building real-world enterprise applications on the Hedera Hashgraph network. 

This template was built for the **Scaffold HBAR Template Bounty** to provide developers with a robust starting point that integrates Hedera's core services with modern web development standards.

## 🚀 Quick Start

Start a new project using this template in a single command:

```bash
npm create scaffold-hbar@latest --template your-org/scaffold-hbar-enterprise-suite
```

*(Replace `your-org` with your GitHub username or organization where this repository is hosted)*

### Manual Setup

If you prefer to clone the repository directly:

```bash
git clone https://github.com/your-org/scaffold-hbar-enterprise-suite.git
cd scaffold-hbar-enterprise-suite
npm install
npm run dev
```

## ✨ Features & Use Cases

This template is not just a UI; it implements three fully functional enterprise use cases using Hedera Testnet:

1. **🤖 AI Pay-Per-Query (HBAR + HCS)**
   - Implements frictionless micropayments for API queries (e.g., prompting an AI model).
   - Showcases high-throughput, low-cost HBAR transfers.
   - Automatically notarizes the transaction receipt and metadata to the Hedera Consensus Service (HCS) for an immutable record.

2. **🔐 Zero-Contract Token-Gating (HTS)**
   - Demonstrates how to restrict access to premium content using the Hedera Token Service (HTS).
   - Verifies ownership of a specific VIP token (NFT or Fungible) natively without the need to deploy or interact with complex Smart Contracts.
   - Drastically reduces gas costs and deployment complexity compared to EVM alternatives.

3. **🏢 Enterprise Audit Trail (HCS Notary)**
   - Provides a decentralized, immutable logging system for enterprise compliance.
   - Submits application events (e.g., user actions, data changes) as messages to an HCS topic.
   - Verifies 100% deterministic, aBFT finality timestamps for regulatory auditing.

## 🎨 Modern UI/UX

The user interface has been completely overhauled from the standard boilerplate:
- **Clean, Modern Web3 Aesthetic:** Replaced heavy "cyberpunk" themes with a sleek, professional "mesh dark mode" design.
- **Tailwind CSS v4:** Utilizes the latest utility classes for rapid, responsive styling.
- **Lucide Icons & Framer Motion:** Smooth interactions, micro-animations, and crisp iconography.
- **Interactive Walkthroughs:** Built-in "Demo Mode" with simulated wallet connection (HashPack simulation) to test the flows immediately without needing a real wallet extension during initial development.

## 🛠 Tech Stack

- **Framework:** React 19 / Vite (or Next.js depending on your deployment choice)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Hedera SDK:** Official `@hashgraph/sdk` (integrated via backend/API endpoints or simulated in frontend for demo)
- **Components:** Custom Radix-style UI components with Framer Motion animations

## 📚 Environment Variables

To fully utilize the real Hedera network (Testnet), copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Hedera Testnet credentials:

```env
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_ACCOUNT_ID=0.0.12345
VITE_HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
```

## 🤝 Contributing

We welcome contributions! If you're using this template and have ideas for more Hedera use cases (like Smart Contracts, File Service, etc.), feel free to open a PR.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
