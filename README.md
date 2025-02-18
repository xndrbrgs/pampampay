# PamPamPay

## Overview

PamPamPay is a modern peer-to-peer (P2P) money transfer application designed to facilitate fast, secure, and seamless transactions between users. The application leverages cutting-edge technologies to provide a smooth user experience while ensuring robust authentication and data management.

## Features

- **User Authentication** powered by Clerk
- **Secure Database Management** using Supabase
- **Efficient ORM** with Prisma
- **Type-Safe Development** with TypeScript
- **Smooth Animations** using Motion
- **Real-Time Transaction Processing**
- **Intuitive UI/UX** for seamless money transfers

## Tech Stack

PamPamPay is built using the following core technologies:

### Frontend

- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Ensuring type safety and scalability
- **Motion** - For smooth animations and enhanced user experience

### Backend

- **Supabase** - Postgres database and real-time authentication
- **Prisma** - ORM for managing database interactions
- **Clerk** - Authentication and user management solution

## Installation & Setup

To set up PamPamPay locally, follow these steps:

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Supabase account & API keys**
- **Clerk account & API keys**

### Clone the Repository

```bash
git clone https://github.com/your-username/pampampay.git
cd pampampay
```

### Install Dependencies

```bash
yarn install
# or
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the necessary environment variables:

```
NEXT_PUBLIC_CLERK_FRONTEND_API=<your_clerk_frontend_api>
CLERK_API_KEY=<your_clerk_api_key>
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
DATABASE_URL=<your_database_url>
```

### Run the Development Server

```bash
yarn dev
# or
npm run dev
```

## Deployment

PamPamPay can be deployed on platforms like **Vercel** or **Netlify**. Ensure your environment variables are correctly set up in the hosting platform.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a new branch (`feature-branch`)
3. Commit your changes
4. Push to your branch and submit a Pull Request

## License

PamPamPay is open-source and licensed under the **MIT License**.

## Contact

For support or inquiries, reach out to us at [**support@www.pampampay.com**](mailto:support@www.pampampay.com).
