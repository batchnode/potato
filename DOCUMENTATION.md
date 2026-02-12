# Potato CMS Documentation

## 1. Overview

### What is Potato CMS?
Potato is a lightweight, high-performance Headless CMS for GitHub-backed static sites, built with React, Vite, and Cloudflare Workers. It's designed to simplify content management for developers and content creators who leverage GitHub for their website's content.

### Why use Potato CMS?
- **Lightweight & High-Performance:** Built with modern technologies to ensure a fast and responsive user experience.
- **GitHub-Backed:** All content is stored directly in your GitHub repository, providing version control, collaboration features, and easy integration with existing CI/CD pipelines.
- **Headless Architecture:** Provides content via an API, allowing you to use your preferred frontend framework or static site generator.
- **Cloudflare Integration:** Leverages Cloudflare Workers for its API and Cloudflare KV/D1 for configuration and session management, offering global scalability and low latency.
- **Role-Based Access Control:** Securely manage content with distinct Administrator and Editor roles.
- **Workbench Workflow:** A safe environment for drafting and collaborating on content before publication.

### Core Concepts
1.  **GitHub Connection**: All your content (Markdown, Images) is stored in your GitHub repository. Potato interacts with GitHub using a Fine-grained Personal Access Token (PAT).
2.  **Workers API**: The "brains" of Potato CMS, deployed as Cloudflare Workers. These serverless functions handle all backend operations such as content moves, uploads, authentication, and user management.
3.  **KV Storage**: Cloudflare Key-Value (KV) storage is used to store session information and site configuration data, providing fast access globally.
4.  **D1 Database**: Cloudflare D1 (serverless SQL database) is used for robust draft and preview systems, and potentially other structured data needs, acting as a fallback or primary storage for specific content types.

## 2. Getting Started (Installation & Deployment)

This section guides you through setting up and deploying your own instance of Potato CMS.

### Prerequisites
Before you begin, ensure you have the following:
-   **Node.js & npm**: Required for running the local development environment and building the project.
-   **Git**: For version control and interacting with GitHub.
-   **GitHub Account**: To host your content repository and fork the Potato CMS.
-   **Cloudflare Account**: To deploy the CMS to Cloudflare Pages, manage Workers, and configure KV/D1 storage.

### Step-by-Step Setup Guide

Follow these steps to deploy your own instance of Potato CMS.

#### 1. Fork the Repository
Start by forking the Potato CMS repository on GitHub. This creates your own copy of the CMS that you can customize and deploy.

1.  Navigate to the [Potato CMS GitHub repository](https://github.com/batchnode/potato).
2.  Click the **Fork** button at the top right of the page.

#### 2. Prepare your GitHub Account
You need a **Fine-grained Personal Access Token (PAT)** so the CMS can write to your content repository.

1.  Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta).
2.  Click **Generate new token**.
3.  **Name** your token (e.g., `Potato CMS Token`).
4.  Set **Repository access** to "Only select repositories" and choose your forked Potato CMS repository (or the repository where your content will reside).
5.  Grant the following **Permissions**:
    *   **Contents**: Read and Write (This allows the CMS to create, edit, and delete content in your chosen repository).
    *   **Metadata**: Read-only (Automatically added and necessary for repository information).
6.  **Save the token** somewhere safe immediately after creation—you will not be able to view it again! This token is crucial for Potato CMS to interact with your GitHub repository.

#### 3. Deploy to Cloudflare Pages
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Navigate to **Workers & Pages > Create application > Pages > Connect to Git**.
3.  Select your forked `potato-cms` repository.
4.  Configure the **Build settings**:
    *   **Framework preset**: `Vite`
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
5.  Click **Save and Deploy**. Cloudflare will now build and deploy your CMS frontend.

#### 4. Configure KV and D1 Storage
Potato uses Cloudflare KV to store your configuration and sessions, and Cloudflare D1 for robust content management features.

1.  In the Cloudflare Dashboard, go to **Workers & Pages > KV**.
2.  Click **Create namespace** and name it `potato_kv`.
3.  Next, go to **Workers & Pages > D1**.
4.  Click **Create database** and name it `potato_d1`.
5.  Go back to your **Pages Project > Settings > Functions**.
6.  Scroll down to **KV namespace bindings** and add a new binding:
    *   **Variable name**: `potato_kv`
    *   **KV namespace**: Select the `potato_kv` namespace you just created.
7.  Under **D1 database bindings**, add a new binding:
    *   **Variable name**: `potato_d1`
    *   **D1 database**: Select the `potato_d1` database you just created.
8.  **Redeploy** your site from the Cloudflare Pages dashboard to apply these new bindings.

#### 5. Initial Setup Mode
After successful deployment and configuration of KV/D1 bindings:

1.  Visit your deployed Cloudflare Pages URL (e.g., `https://your-project.pages.dev`).
2.  The CMS will detect that it's unconfigured and automatically enter **Setup Mode**.
3.  Follow the on-screen prompts to:
    *   Create your **Administrator** account (this will be the first user with full control).
    *   Enter your **GitHub PAT** from Step 2.
    *   Link your **Content Repository** (this is the GitHub repository where your blog posts, images, and other content will be stored).

Once these steps are completed, your Potato CMS will be fully operational!

## 3. User Guide

Welcome to **Potato**, your lightweight, high-performance Headless CMS for GitHub-backed static sites. This guide will walk you through the various features and workflows.

### Dashboard Overview
*(Placeholder for detailed description of the dashboard components. Will require further investigation of the UI.)*

### Content Management

#### Creating and Editing Posts (The Workbench Workflow)
The **Workbench** is your safety net for content creation and a central hub for managing your content lifecycle.

1.  **Creating Drafts**: Use the Workbench to start new posts. These are initially stored in a designated `_drafts` folder within your GitHub repository, keeping them separate from your published content.
2.  **Collaboration**: Other team members with appropriate permissions can see and collaborate on your drafts within the Workbench, facilitating a streamlined review process.
3.  **Publishing**: When your content is ready, use the **Publish** action. This action moves the file from the `_drafts` folder to your production content folder in your GitHub repository and typically triggers a site rebuild or deployment via your connected CI/CD.

#### Media Library
*(Placeholder for detailed description of media library features: uploading, organizing, using assets in posts. Will require further investigation of the UI.)*

#### Content Preview
*(Placeholder for detailed description of content preview functionality. Will require further investigation of the UI.)*

#### Trash & Soft Delete
Mistakes happen, and Potato CMS provides mechanisms to recover from accidental deletions. Enable **Soft Delete** in your Settings to add a layer of safety.

-   **Moves, not Deletes**: When you "delete" a post, it isn't permanently removed immediately. Instead, it is moved to a special `_trash` folder in your GitHub repository.
-   **Restore**: Any user with appropriate edit permissions can restore a post from the Trash back to its original location in the production content.
-   **Permanent Removal**: Only Administrators have the authority to "Empty Trash" or "Permanently Delete" posts, ensuring that sensitive content is not irrevocably lost without proper authorization.

### User Roles and Permissions (RBAC)

Potato CMS implements strict Role-Based Access Control (RBAC) to maintain security and ensure users only have access to the functions they need.

#### 🛡️ Administrator
Administrators have comprehensive control over the CMS.
-   **Full Control**: Can edit any system setting, manage GitHub tokens, and view infrastructure logs.
-   **Content Destruction**: Have unique permissions to "Empty Trash" or "Permanently Delete" posts.
-   **User Management**: Can add or remove other users (Editors) and assign or revoke their specific permissions.

#### ✍️ Editor
Editors are primarily focused on content creation and management.
-   **Content Creation**: Focused on writing, editing, and managing drafts and published content (based on permissions).
-   **Restricted Settings**: Can only access Appearance (Themes) and manage their own Profile settings.
-   **Publication Guard**: By default, Editors cannot edit published posts. An Administrator must explicitly grant them permission to modify already published content.

#### Assigning Permissions
*(Placeholder for how an Administrator assigns permissions to Editors. Will require further investigation of the UI.)*

### Settings & Personalization

Customize your workspace and manage core CMS settings.

#### General Settings
*(Placeholder for general site settings. Will require further investigation of the UI.)*

#### Theme Customization
Personalize your Potato CMS interface:
-   **Themes**: Switch between different visual themes, such as Default, Light, and the high-contrast **Black** theme.
-   **Persistence**: Click **Save Appearance** to ensure your selected theme and other personalization settings are remembered across different browsers and devices.

#### GitHub Settings
*(Placeholder for managing GitHub PATs and repository connections. Will require further investigation of the UI.)*

#### Schema Management
*(Placeholder for how content schemas are defined and managed, if applicable. Will require further investigation of the UI.)*

#### Security Settings
*(Placeholder for security-related configurations. Will require further investigation of the UI.)*

### Troubleshooting & FAQs

#### Force Rebuild
If your live site isn't reflecting the latest updates from your CMS (e.g., after publishing new content), you can often resolve this by initiating a force rebuild.
-   Use the **Force Rebuild** button (typically found in Settings) to send a signal to your hosting provider (e.g., Cloudflare Pages) to re-trigger the build and deployment process for your static site.

#### PAT Updates
If the CMS suddenly loses its ability to interact with your GitHub repository (e.g., can't fetch content, save drafts), your GitHub Personal Access Token (PAT) might have expired or its permissions might have changed.
-   Check your GitHub PAT in your GitHub settings and ensure it is still valid and has the necessary "Contents: Read and Write" permissions. Update the PAT within the Potato CMS settings if necessary.

#### Common Issues
*(Placeholder for other common issues and their solutions.)*

## 4. Developer Guide

This section is intended for developers who want to contribute to Potato CMS, customize it, or understand its internal workings.

### Local Development Setup

To set up Potato CMS for local development:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/batchnode/potato.git
    cd potato-cms
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically accessible at `http://localhost:5173`. The Cloudflare Workers functions will also be accessible locally if properly configured in your development environment (e.g., using `wrangler`).

4.  **Environment Variables/Configuration:**
    For local development, you might need to configure environment variables or local settings that mimic the Cloudflare KV/D1 bindings and GitHub PAT used in production. Refer to the project's configuration files (e.g., `vite.config.ts`, `package.json` scripts, or specific Worker setup guides) for details on local environment variable management.

### Project Structure Overview

The Potato CMS project is structured to separate the frontend React application from the backend Cloudflare Workers API.

-   **`functions/api/`**: This directory contains the Cloudflare Workers that serve as the backend API for the CMS. Each `.ts` file typically represents an API endpoint or a related group of functions.
    -   `_middleware.ts`: Global middleware for the API.
    -   `_utils.ts`: Utility functions shared across API endpoints.
    -   `auth.ts`: Handles user authentication and session management.
    -   `drafts.ts`: API for managing content drafts.
    -   `editors.ts`: API for managing editor users and their permissions.
    -   `get_config.ts`: Retrieves CMS configuration.
    -   `github_contents.ts`: Interacts with GitHub to fetch repository content.
    -   `github_delete.ts`: Handles deleting content on GitHub.
    -   `github_dispatch.ts`: Triggers GitHub workflow dispatches.
    -   `github_info.ts`: Retrieves information about the GitHub repository.
    -   `github_move.ts`: Handles moving content within GitHub (e.g., to trash, from drafts).
    -   `github_rename.ts`: Renames content on GitHub.
    -   `github_upload.ts`: Uploads content to GitHub.
    -   `github_workflow_status.ts`: Checks the status of GitHub workflows.
    -   `health.ts`: Health check endpoint.
    -   `infrastructure_stats.ts`: Provides statistics about the Cloudflare infrastructure.
    -   `initialize_engine.ts`: Initializes the CMS engine.
    -   `media_proxy.ts`: Proxies media content.
    -   `profile.ts`: Manages user profiles.
    -   `setup.ts`: Handles the initial setup process of the CMS.
    -   `status.ts`: Provides general status information.
    -   `sync.ts`: Synchronizes data.
    -   `admin/`: Contains API endpoints specific to administrator functionalities, e.g., `sync_wip.ts`.

-   **`src/`**: This directory holds the entire React frontend application.
    -   `src/App.tsx`, `src/main.tsx`, `src/index.css`: Main application entry points and global styling.
    -   `src/assets/`: Static assets like images (e.g., `react.svg`).
    -   `src/components/`: Reusable React components (e.g., `BottomNav.tsx`, `Dashboard.tsx`, `Header.tsx`, `Modal.tsx`).
        -   Subdirectories like `src/components/Dashboard/`, `src/components/PreviewModal/`, etc., contain components and hooks specific to those features.
    -   `src/hooks/`: Custom React hooks for logic reuse.
        -   `src/hooks/app/`, `src/hooks/storage/`: Specialized hooks for application logic and data storage interaction.
    -   `src/layouts/`: Defines different page layouts (e.g., `AdminLayout.tsx`, `EditorLayout.tsx`, `MainLayout.tsx`).
    -   `src/pages/`: Top-level React components for different application routes/pages (e.g., `Content.tsx`, `CreatePost.tsx`, `Login.tsx`, `Settings.tsx`).
        -   Subdirectories like `src/pages/Content/`, `src/pages/CreatePost/`, etc., contain components and hooks specific to those pages.
    -   `src/types/`: TypeScript type definitions (e.g., `index.ts`).
    -   `src/utils/`: Utility functions (e.g., `cn.ts` for class name utilities).

-   **`public/`**: Static files served directly (e.g., `potato.png`, `vite.svg`).
    -   `public/actions/`: Contains GitHub Actions workflow files (e.g., `webp-converter.yml`).
    -   `public/templates/`: Markdown templates for different content types.

-   **`package.json`**: Defines project metadata, scripts (`dev`, `build`, `lint`, `preview`), and dependencies.
-   **`vite.config.ts`**: Configuration for Vite, the build tool for the frontend.
-   **`tsconfig*.json`**: TypeScript configuration files.
-   **`eslint.config.js`**: ESLint configuration for code linting.
-   **`schema.sql`**: SQL schema definition, likely for Cloudflare D1.

### API Reference (Cloudflare Workers)

The backend of Potato CMS is powered by Cloudflare Workers, providing a robust and scalable API. The endpoints are defined under the `functions/api/` directory.

High-level overview of key API functionalities:

-   **Authentication (`auth.ts`, `profile.ts`)**: Handling user login, logout, session management, and user profile operations.
-   **Content Management (`drafts.ts`, `github_contents.ts`, `github_upload.ts`, `github_delete.ts`, `github_move.ts`, `github_rename.ts`)**: Direct interaction with GitHub to create, read, update, and delete content files. This includes managing drafts, publishing, trashing, and media uploads.
-   **User and Permissions Management (`editors.ts`, `admin/sync_wip.ts`)**: Managing editor accounts, their roles, and synchronizing user-related data.
-   **Configuration and Status (`get_config.ts`, `status.ts`, `health.ts`, `initialize_engine.ts`, `infrastructure_stats.ts`)**: Retrieving CMS configuration, checking system health, initializing the engine, and monitoring infrastructure.
-   **GitHub Workflow Integration (`github_dispatch.ts`, `github_workflow_status.ts`)**: Triggering and monitoring GitHub Actions workflows, useful for CI/CD or content processing.
-   **Utilities (`_middleware.ts`, `_utils.ts`, `media_proxy.ts`)**: Common middleware, shared utility functions, and media asset proxying.

### Extending Potato CMS

Potato CMS is designed with extensibility in mind, particularly for its frontend and content management capabilities.

-   **Customizing Themes/UI**: The frontend is built with React and Tailwind CSS. You can modify existing components in `src/components/` and `src/pages/` or create new ones to alter the look and feel of the CMS. The theme options in `src/pages/Settings/components/ThemeOption.tsx` and related components provide a good starting point for understanding UI customization.
-   **Adding New Content Types/Schemas**: The presence of `schema.sql` and `src/pages/Settings/tabs/SchemaTab.tsx` suggests that content schemas might be definable or extendable. Further investigation into these files would reveal how to define custom content types and their associated fields, allowing Potato CMS to manage a wider variety of content structures beyond basic Markdown files. This might involve updating the D1 database schema and corresponding frontend forms/display logic.
-   **Customizing Cloudflare Workers**: The `functions/api/` directory houses the Cloudflare Workers. Developers can extend existing API endpoints or add new ones to introduce custom backend logic, integrate with other services, or modify how content is processed and stored.

## 5. Contributing

We welcome contributions to Potato CMS! Whether it's reporting bugs, suggesting new features, or submitting code changes, your help is valuable.

### How to Contribute

1.  **Report Bugs**: If you find a bug, please open an issue on the GitHub repository. Provide a clear description of the bug, steps to reproduce it, and expected behavior.
2.  **Suggest Features**: Have an idea for a new feature or an improvement? Open an issue to discuss your proposal.
3.  **Submit Pull Requests**:
    *   Fork the repository and create your branch from `main`.
    *   Ensure your code adheres to the project's coding style (ESLint is configured to help with this).
    *   Write clear, concise commit messages.
    *   Test your changes thoroughly.
    *   Open a pull request and describe the changes you've made.

### Code Style and Conventions

-   **Linting**: The project uses ESLint. Ensure your code passes linting checks by running `npm run lint`.
-   **TypeScript**: All new code should be written in TypeScript, adhering to the configurations in `tsconfig*.json`.
-   **React/Tailwind CSS**: Follow existing patterns for React component structure and Tailwind CSS utility class usage.

### Running Tests

To ensure code quality and prevent regressions:

-   **Linting**: Run `npm run lint` to check for code style and potential errors.
-   **Type Checking**: The `npm run build` command includes TypeScript compilation, which performs type checking.
-   *(Further tests, e.g., unit or integration tests, would be run here if available. For now, rely on linting and type checks.)*

This concludes the initial comprehensive documentation for Potato CMS. Further enhancements would involve detailed UI descriptions, screenshots, and more in-depth examples for advanced topics.
