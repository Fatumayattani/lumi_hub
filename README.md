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

## Architecture

The application follows a client-server architecture with a strong emphasis on leveraging Backend-as-a-Service (BaaS) capabilities:

*   **Frontend (Client-Side):** The entire user interface is a Single-Page Application (SPA) built with React. All UI logic, routing, and direct interactions with Supabase and Algorand SDKs happen here.
*   **Backend (Supabase BaaS):** Supabase acts as the primary backend, handling:
    *   **Data Persistence:** All structured data (products, stores, transactions, user purchases) is stored in a PostgreSQL database managed by Supabase.
    *   **Authentication:** User registration, login, and session management are handled by Supabase Auth.
    *   **File Storage:** Supabase Storage buckets are used for efficient and secure storage of various file types, with Row Level Security (RLS) ensuring data privacy.
    *   **Serverless Logic:** Specific backend operations, such as processing demo payments, are encapsulated in Supabase Edge Functions, written in TypeScript/Deno.
*   **Blockchain Interaction:** For cryptocurrency payments, the frontend directly interacts with the Algorand blockchain via the `@txnlab/use-wallet` and `algosdk` libraries. This allows users to connect their Algorand wallets and sign transactions securely.
*   **Deployment:** The React application is deployed as a static site on Netlify, which connects to the Supabase backend.

This architecture provides a scalable, secure, and performant solution by offloading much of the traditional backend development to Supabase, allowing developers to focus on the core application logic and user experience.

## Project Structure

The project is organized into logical directories to maintain clarity and separation of concerns:

