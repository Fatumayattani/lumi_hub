<p align="center">
  <img src="public/lumil.png" alt="Logo" width="200"/>
</p>

# Lumi Hub - The Easiest Way to Sell Digital Products

Lumi Hub is a modern, full-stack e-commerce platform designed for creators to easily sell their digital products. It features secure user authentication, intuitive product management, a dynamic marketplace, and seamless cryptocurrency payment processing via the Algorand blockchain.

## Features

*   **Creator Dashboard:** A dedicated dashboard for creators to manage their store, products, and view sales analytics.
*   **Product Management:** Easily add, edit, publish, and manage digital products with details like name, description, price, category, tags, and associated files/images.
*   **Secure File Storage:** Digital product files are securely stored and delivered only after successful purchase verification.
*   **Customizable Storefronts:** Creators can set up and customize their own storefronts with a unique name, description, and logo.
*   **Dynamic Marketplace:** A public marketplace where users can browse, search, and filter digital products from various creators.
*   **Algorand Payments:** Integrated support for secure and fast payments using the Algorand blockchain, allowing purchases with ALGO cryptocurrency.
*   **User Authentication:** Robust user authentication (sign-up, sign-in, password reset) powered by Supabase, including Google OAuth.
*   **Responsive Design:** A clean, modern, and responsive user interface built with Tailwind CSS, ensuring a great experience across all devices.

## Tech Stack

Lumi Hub is built using a modern and efficient technology stack:

*   **Frontend:**
    *   **React:** A JavaScript library for building user interfaces.
    *   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    *   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
    *   **Vite:** A fast build tool and development server for modern web projects.
    *   **Lucide React:** A collection of beautiful and customizable open-source icons.
*   **Backend as a Service (BaaS):**
    *   **Supabase:** An open-source Firebase alternative providing:
        *   **PostgreSQL Database:** For storing all application data (products, stores, users, transactions).
        *   **Supabase Auth:** For user authentication and authorization.
        *   **Supabase Storage:** For storing product images, store logos, and private digital product files.
        *   **Supabase Edge Functions:** Serverless functions for specific backend logic (e.g., `create-demo-payment`).
*   **Blockchain Integration:**
    *   **Algorand:** A decentralized, secure, and scalable blockchain used for processing cryptocurrency payments.
    *   **`@txnlab/use-wallet`:** A React hook library for connecting and interacting with Algorand wallets.
    *   **`algosdk`:** The official JavaScript SDK for Algorand.
*   **Deployment:**
    *   **Netlify:** For continuous deployment and hosting of the frontend application.

## Project Architecture

Lumi Hub follows a modern full-stack architecture with clear separation of concerns:

```
Lumi Hub Architecture
├── Frontend (Client)
│   ├── React + TypeScript
│   ├── Vite build system
│   ├── Tailwind CSS for styling
│   ├── Wallet integration (Algorand)
│   └── Supabase client for authentication and data
│
├── Backend (Supabase)
│   ├── PostgreSQL Database
│   │   ├── Users table
│   │   ├── Products table
│   │   ├── Stores table
│   │   └── Transactions table
│   ├── Authentication
│   ├── Storage (Files, Images)
│   └── Edge Functions (Payment processing)
│
└── Blockchain (Algorand)
    ├── Testnet/Mainnet connection
    ├── Smart contracts
    └── Transaction processing
```

The frontend communicates with Supabase for all data operations and authentication, while Algorand blockchain integration handles payment processing. Digital assets are securely stored in Supabase Storage and delivered only after successful payment verification.

## Installation

To run Lumi Hub locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lumihub.git
   cd lumihub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following Supabase and Algorand credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_ALGOD_SERVER=your-algod-server-url
   VITE_ALGOD_PORT=your-algod-port
   VITE_ALGOD_TOKEN=your-algod-token
   VITE_INDEXER_SERVER=your-indexer-server-url
   VITE_INDEXER_PORT=your-indexer-port
   VITE_INDEXER_TOKEN=your-indexer-token
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   The application should now be running at `http://localhost:5173`

## Live Site

The production version of Lumi Hub is available at:  
🌐 [https://lumihub.live](https://lumihub.live)

## Roadmap

### Current Features (v1.0)
- Basic creator dashboard
- Product management system
- Algorand payment integration
- Marketplace browsing
- User authentication

### Near-term (Q3-Q4 2025)
- [ ] Enhanced analytics dashboard
- [ ] Multi-file product support
- [ ] Subscription-based products
- [ ] Improved search and filtering
- [ ] Creator referral program

### Mid-term (2026)
- [ ] NFT-based digital products
- [ ] Expanded blockchain support (Ethereum, Solana)
- [ ] Mobile app development
- [ ] Affiliate marketing system
- [ ] Advanced store customization

### Long-term (2026+)
- [ ] AI-powered product recommendations
- [ ] Decentralized storage integration (IPFS)
- [ ] Creator collaboration features
- [ ] Marketplace advertising platform
- [ ] Internationalization and multi-currency support

## Viability

Lumi Hub addresses several key market needs that ensure its viability:

1. **Growing Creator Economy:**  
   The global creator economy is valued at over $100 billion, with digital products being a significant segment. Lumi Hub provides specialized tools for this growing market.

2. **Blockchain Advantages:**  
   By leveraging Algorand's blockchain, Lumi Hub offers:
   - Lower transaction fees (typically <1 cent)
   - Instant settlement (4-second finality)
   - Carbon-negative operations
   - No chargeback risks

3. **Competitive Differentiation:**  
   Unlike platforms that take 20-50% commissions, Lumi Hub operates on a sustainable low-fee model while providing better tools for digital product delivery.

4. **Scalable Infrastructure:**  
   The use of Supabase and serverless architecture ensures the platform can scale cost-effectively as user numbers grow.

5. **Revenue Model:**  
   Lumi Hub's business model includes:
   - Small transaction fee (3-5%)
   - Premium features subscription
   - Future marketplace advertising

6. **Technical Sustainability:**  
   The modern tech stack ensures maintainability and access to developer talent, while the open architecture allows for easy integration of new features and blockchain networks.
    