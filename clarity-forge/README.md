# ClarityForge

ClarityForge is a web application designed to help entrepreneurs get clarity on what to build. It provides a platform to see top-in-demand product and service-based solutions, allowing users to interact, post problems, and propose solutions in a community-driven environment.

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/) and [Bun](https://bun.sh/) installed on your machine.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd clarity-forge
bun install
```

The `bun install` command will automatically trigger the `postinstall` script, which runs `prisma generate` to create the necessary Prisma Client code.

### 3. Environment Setup

The application requires environment variables to run. These tell the app where to find the database and how to secure user sessions.

1.  In the root of the project, find the file named `.env.example`.
2.  Create a copy of this file and rename the copy to `.env`.

```bash
# On Linux or macOS
cp .env.example .env

# On Windows
copy .env.example .env
```

The default values in the `.env` file are configured for local development and should work out of the box.

### 4. Database Migration

Run the database migrations to set up your local database schema:

```bash
bunx prisma migrate dev
```

This will create the SQLite database file and all the necessary tables.

### 5. Running the Development Server

Now you can start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database**: [SQLite](https://www.sqlite.org/index.html)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Authentication**: [JWT](https://jwt.io/) with `jose`
-   **Runtime**: [Bun](https://bun.sh/)
