# GreenAura - Farm Fresh Produce E-commerce App

GreenAura is a modern e-commerce application that connects customers directly with local farmers for fresh, farm-to-table produce delivery.

## Features

- **Modern UI/UX**: Clean, responsive design with smooth animations and transitions
- **Authentication**: Secure email-based authentication with OTP verification
- **Product Browsing**: Browse products by category, farm, or featured items
- **Shopping Cart**: Add products to cart, adjust quantities, and proceed to checkout
- **User Profiles**: Manage personal information, addresses, and view order history
- **Responsive Design**: Optimized for both mobile and desktop experiences

## Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom theming
- **Authentication**: Supabase Auth (Email OTP)
- **Database**: Supabase
- **State Management**: React Context + Local Storage
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/green-aura.git
   cd green-aura
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEBUG_LOGS=1
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/components`: Reusable UI components
- `src/context`: Global state management with React Context
- `src/lib`: Utility functions and hooks
- `src/services`: API service layer for Supabase interactions
- `src/types`: TypeScript type definitions

## Key Components

- **Authentication Flow**: Email-based OTP verification for secure sign-in
- **Product Browsing**: Category-based product exploration with filtering and sorting
- **Shopping Cart**: Persistent cart with local storage integration
- **Checkout Flow**: Multi-step checkout process with address selection
- **User Profile**: Personal information management and order history

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js applications.

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.