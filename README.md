# Scaffold-HBAR Enterprise Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Hedera SDK](https://img.shields.io/badge/Hedera-SDK%20v2-purple.svg)](https://docs.hedera.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan.svg)](https://tailwindcss.com/)

A production-ready, highly polished full-stack template designed for building real-world enterprise applications on the Hedera Hashgraph network.

Built for the **Scaffold-HBAR Template Bounty** to provide developers with a robust starting point that integrates Hedera's core native services with modern Web3 standards.

---

## 🚀 Quick Start

Initialize a new dApp project using this template in a single command:

```bash
npm create scaffold-hbar@latest --template Marco-Caicedo/scaffold-hbar-enterprise-suite

Manual Setup
If you prefer to clone and run the repository directly:
Bashg
it clone [https://github.com/Marco-Caicedo/scaffold-hbar-enterprise-suite.git](https://github.com/Marco-Caicedo/scaffold-hbar-enterprise-suite.git)
cd scaffold-hbar-enterprise-suite
npm install
npm run dev

The application will be running locally at http://localhost:5173.

✨ Features & Production Use Cases

This template implements three production-grade enterprise workflows connected to Hedera Testnet:

1. 🤖 AI Pay-Per-Query (HBAR Micropayments + HCS Notarization)

Frictionless AI Billing: Executes micro-settlements (0.01 to 0.1 HBAR) per agent query with sub-3-second finality.

Predictable Cost Model: Leverages Hedera's fixed USD-pegged fee structure ($0.0001 per consensus message).

Cryptographic Notarization: Every query payload, receipt, and timestamp is hashed via SHA-256 and anchored to an immutable Hedera Consensus Service (HCS) Topic.

2. 🔐 Zero-Contract Token-Gating (HTS Engine)Native Asset Verification: Restricts access to premium enterprise dashboards using the Hedera Token Service (HTS).

Zero Smart Contract Overhead: Bypasses EVM execution overhead by querying native token balances directly through Hedera Mirror Node REST APIs.

Lower Deployment Costs: Mint, associate, and verify fungible or non-fungible tokens without writing, auditing, or deploying custom Solidity contracts.

3. 🏢 Enterprise Audit Trail (HCS Data Notary)

Compliance & Provenance: Decentralized event logger tailored for supply chain milestones, quality checks, and dispatch registries.

Verifiable Audit Chains: Displays Sequence Numbers, Topic IDs, Running Hashes, and Consensus Timestamps directly via a built-in HashScan modal.

Structured Export: One-click export of notarized transaction receipts to signed JSON format for regulatory audits.

🏗 System Architecture ┌────────────────────────────────────────────────────────┐
│            Frontend (React 19 + Tailwind v4)           │
├──────────────────────────┬─────────────────────────────┤
│   Dual-Wallet Layer      │   Core Enterprise Modules   │
│  - Hedera Native (0.0.x) │  - AI Pay-Per-Query (HBAR)   │
│  - EVM / MetaMask (JSON) │  - Token-Gating (HTS Engine)│
│  - Simulated Dev Faucet  │  - Audit Notary (HCS Logger)│
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│ Hedera JSON-RPC Relay    │ │ Hedera Mirror Node REST   │
│ (EVM Compatibility)      │ │ (State & Event Querying)  │
└────────────┬─────────────┘ └────────────┬──────────────┘
             │                            │
             └─────────────┬──────────────┘
                           ▼
             ┌───────────────────────────┐
             │ Hedera Network (Testnet)  │
             │   HCS  │  HTS  │  HSCS    │
             └───────────────────────────┘


🎨 UI/UX & Developer Ergonomics

Mesh Dark Mode: Clean, professional enterprise interface built with Tailwind CSS.

Dual-Wallet Compatibility: Seamless support for native Hedera Account IDs (0.0.x) and EVM hex addresses (0x...).

Interactive Dev Faucet: Built-in balance simulator allowing instant state testing before connecting external wallets.

Live HashScan Inspector: Deep links and modal previews directly pointing to https://hashscan.io/testnet.

🛠 Tech Stack
Layer                   Technology     
Frontend Framework      React 19 + Vite
Language                TypeScript
Styling                 Tailwind CSS v4 + Lucide Icons
Hedera Integration      Official @hashgraph/sdk + Mirror Node REST APIs
Explorer Integration     HashScan Mirror Node Explorer

📚 Environment Configuration

To connect directly to your own Hedera Testnet account, create a local environment file:

Bash
cp .env.example .env.local
Configure your credentials:
Fragmento de código
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
VITE_HEDERA_PRIVATE_KEY=YOUR_DER_OR_HEX_PRIVATE_KEY
VITE_HEDERA_TOPIC_ID=0.0.YOUR_HCS_TOPIC_ID

(Note: The template includes simulated fallbacks so developers can clone, build, and test UI components immediately even without active network credentials).

🧪 Testing the Template

To verify the template passes the mechanical requirements locally:

Bash
# Verify build integrity
npm run build

# Preview production bundle
npm run preview


🤝 Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request with additional Hedera service templates (such as Hedera Smart Contract Service or File Service).

📄 LicenseThis project is open-source under the MIT License.