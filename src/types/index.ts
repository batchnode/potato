export interface User {
    id?: string;
    email: string;
    role: 'Administrator' | 'Editor';
    
    // Derived/Flattened Permissions
    canDelete: boolean;
    canEditPublished: boolean;
    requireReview: boolean;
    
    // UI State
    isSetupMode?: boolean;
    isAdmin?: boolean; // Derived helper
}

export interface Config {
    repo: string;
    pat: string;
    branch: string;
    postsDir?: string;
    assetsDir?: string;
    websiteUrl?: string;
    cmsBlogUrl?: string;
    email?: string;
    draftsEnabled?: boolean;
    trashEnabled?: boolean;
    saveDraftsToGithub?: boolean;
    saveReviewsToGithub?: boolean;
}

export interface GitHubContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    // KV Extras
    isKV?: boolean;
    last_modified?: string;
    author_id?: string;
}

export interface Editor {
    id: string;
    email: string;
    password?: string;
    role: 'Administrator' | 'Editor';
    requireReview: boolean;
    canDelete: boolean;
    canEditPublished: boolean;
    joined: string;
}