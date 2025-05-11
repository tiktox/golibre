# RideShare DriverAds

This is a Next.js starter application for a ride-sharing platform with ad monetization for drivers.

## Core Features:

- Ride Request Display: Allows a driver to view available ride requests from nearby customers.
- Driver Profile w/ Ads: Driver profiles include vehicle and license information, and can show ads.
- Ride Acceptance UI: Accept or decline incoming ride requests, including a mini-map of the pickup location.
- Intelligent Ad Display: When an advertisement should be displayed to the Driver Partner. This tool considers driver status, time of day, and trip history.
- Google Sign-In: Allows clients to authenticate through a Google Account.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd rideshare-driverads
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Authentication (Google Sign-In).
    *   Enable Firestore (Cloud Firestore).
    *   Obtain your Firebase project configuration.

4.  **Configure Environment Variables:**
    *   Copy the `.env.template` file to a new file named `.env`:
        ```bash
        cp .env.template .env
        ```
    *   Fill in your Firebase project configuration details in the `.env` file. These variables are prefixed with `NEXT_PUBLIC_FIREBASE_`.
    *   If you are using Genkit with Google AI, also add your `GOOGLE_API_KEY` to the `.env` file.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

    If you are using Genkit flows, you might also need to run the Genkit development server:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## Building for Production

To create a production build, run:
```bash
npm run build
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

1.  **Push your code to a Git repository** (e.g., GitHub, GitLab, Bitbucket).

2.  **Import your project in Vercel:**
    *   Go to your Vercel dashboard.
    *   Click "Add New..." -> "Project".
    *   Select your Git repository.

3.  **Configure Environment Variables in Vercel:**
    *   This is a **critical step** for the application to work correctly.
    *   In your Vercel project settings, go to "Settings" -> "Environment Variables".
    *   Add all the variables from your `.env` file (or `.env.template`).
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
        *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
        *   `NEXT_PUBLIC_FIREBASE_APP_ID`
        *   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (if applicable)
        *   `GOOGLE_API_KEY` (if applicable for Genkit/Google AI Studio features)
    *   Ensure the variables are set for the correct environments (Production, Preview, Development).
    *   **Do not prefix `GOOGLE_API_KEY` with `NEXT_PUBLIC_`** as it is a server-side key and should not be exposed to the client. `NEXT_PUBLIC_` variables are exposed to the client-side bundle.

4.  **Deploy:**
    *   Vercel will automatically build and deploy your project when you push changes to the connected Git branch (usually `main` or `master`).

**Important Note on Build Errors:**
If your Vercel build fails with an error like `Firebase API Key is not defined`, it means the `NEXT_PUBLIC_FIREBASE_API_KEY` (or other required Firebase variables) were not correctly set in your Vercel project's environment variables settings at build time. Double-check these settings in Vercel.

## Genkit (AI Features)

This application uses Genkit for AI-related functionalities, such as the intelligent ad display.
-   Flows are defined in `src/ai/flows/`.
-   The Genkit configuration is in `src/ai/genkit.ts`.
-   To run Genkit flows locally for development or testing, use `npm run genkit:dev` or `npm run genkit:watch`. You will need a `GOOGLE_API_KEY` set in your `.env` file for this.

## Exporting to GitHub

1.  Initialize a Git repository in your project directory if you haven't already:
    ```bash
    git init
    ```
2.  Create a `.gitignore` file (a basic one should already be present if you cloned a starter). Ensure it includes `node_modules/`, `.env`, `.next/`, `out/`, etc.
3.  Add your project files to the repository:
    ```bash
    git add .
    ```
4.  Commit your changes:
    ```bash
    git commit -m "Initial commit"
    ```
5.  Create a new repository on GitHub.
6.  Link your local repository to the GitHub repository:
    ```bash
    git remote add origin <your-github-repository-url>
    ```
    (Replace `<your-github-repository-url>` with the URL from GitHub, e.g., `https://github.com/yourusername/your-repo-name.git`)
7.  Push your changes to GitHub:
    ```bash
    git push -u origin main
    ```
    (Or `master` if that's your default branch name).
```# golibre
