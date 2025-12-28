# Tukai Web

Connect with friends, discover fascinating places, and create unforgettable experiences.

This is a [Next.js](https://nextjs.org/) project built with TypeScript, Tailwind CSS, and Redux for state management.

## 🚀 Get Started

Follow the steps below to set up and run the application:

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Running the Application

1. **Clone the repository**:

```bash
git clone https://github.com/Oltukai/tukai-web.git
cd tukai-web
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your API credentials and configuration values.

4. **Start the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load custom Google Fonts.

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

## 🧹 Formatting and Linting

Ensure your code follows consistent style and best practices by running:

```bash
npm run format && npm run lint
```

- `npm run format`: Automatically formats your code using the project's configuration (e.g., Prettier).
- `npm run lint`: Checks your code for potential errors and enforces coding standards (e.g., ESLint).

Run these commands before committing changes to maintain code quality.

## 📦 Building for Production

Build the application for production:

```bash
npm run build
```

## 🚀 Deploying to Production

The application is automatically deployed to [www.tukai.co](https://www.tukai.co) using AWS Amplify.

### Deployment Process

1. Ensure your changes are committed and pushed to your branch
2. Create a pull request to the `main` branch
3. Once the pull request is reviewed and merged to `main`, AWS Amplify will automatically:
   - Detect the changes
   - Build the application
   - Deploy to production

The deployment process typically takes a few minutes. You can monitor the deployment status in the AWS Amplify console.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
