# WorkForge 🚀

WorkForge is a powerful ticketing and wiki system that leverages AI and Analytics to help teams work faster and more efficiently. Built with a Next.js frontend, WorkForge provides a seamless and intuitive user experience.

[Backend Repository](https://github.com/zsliwoski/work-forge-cloud)

## Features ✨

- **Integrated Wiki**: Maintain comprehensive documentation and knowledge base.
- **Analytics Dashboard**: Gain insights into team performance and ticket resolution times.
- **Real-time Collaboration**: Collaborate with team members in real-time.
- **Customizable Workflows**: Tailor workflows to fit your team's needs.

## Technology Stack 🛠️

- **Frontend**: Next.js
- **Database**: Postgres SQL
- **ORM**: Prisma

## Getting Started 🏁

### Prerequisites

- Node.js
- Postgres SQL

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/zsliwoski/work-forge.git
    cd work-forge
    ```

2. Install frontend dependencies:
    ```bash
    cd work-forge
    npm install
    ```

## Setting Up the Database 🗄️

### Initialize Prisma

1. Install Prisma CLI:
    ```bash
    npm install prisma --save-dev
    ```

2. Initialize Prisma in your project:
    ```bash
    npx prisma init
    ```

3. Configure the `DATABASE_URL` in the `.env` file to point to your Postgres database:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
    ```

### Migrate the Database

1. Define your Prisma schema in `prisma/schema.prisma`.

2. Run the migration to create the database structure:
    ```bash
    npx prisma migrate dev --name init
    ```

3. Generate Prisma Client:
    ```bash
    npx prisma generate
    ```

The Prisma database is now generated!

### Create a .env File

To run workforge, you'll need to create a `.env` file from the `example.env` file, follow these steps:

1. Ensure the `example.env` file exists in the project directory.
2. Copy the contents of the `example.env` file.
3. Create a new file named `.env` in the same directory.
4. Paste the copied contents into the `.env` file.
5. Save the `.env` file.

**Important Notes**:
- The `.env` file is used to store environment variables and may contain sensitive information. Handle it with care.
- Update the `.env` file with your specific configuration values as needed.
- Workforge uses GitHub and Google OAuth credentials for login support
- You'll need to generate Resend API credentials for email support (used for team invites)
- Variables should be formatted like the following example:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
    ```

### Running the Application

1. Start the frontend:
    ```bash
    npm run dev
    ```

3. Open your browser and navigate to `http://localhost:3000`.

## Contributing 🤝

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact 📧

For any inquiries, please contact me at [zsliwoski@gmail.com].
