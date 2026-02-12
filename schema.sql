-- 1. USERS: The Source of Truth for authentication and permissions
-- We assume email is the unique identifier.
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password_hash TEXT, -- Stored securely (bcrypt/argon2)
    role TEXT DEFAULT 'Editor', -- 'Administrator' or 'Editor',
    
    -- Explicit Permissions (Columns for easy SQL querying)
    can_publish BOOLEAN DEFAULT 0,
    can_delete BOOLEAN DEFAULT 0,
    
    -- Complex/Granular Permissions (JSON for flexibility)
    allowed_paths JSON, -- e.g. ["/blog", "/news"]
    
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER_PREFS: Separate table for UI preferences (Theme, etc.)
CREATE TABLE IF NOT EXISTS user_prefs (
    user_email TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'default',
    last_login DATETIME,
    FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- 3. CONTENT_METADATA: Tracks state of Drafts & Reviews
-- Replaces 'work_in_progress'. Content body lives in KV (Key = id).
CREATE TABLE IF NOT EXISTS content_metadata (
    id TEXT PRIMARY KEY, -- Matches KV Key (e.g., "draft:user@email.com:post.md")
    filename TEXT NOT NULL,
    author_email TEXT NOT NULL,
    repo TEXT, -- Context for the draft
    
    -- Status dictates UI location
    status TEXT NOT NULL, -- 'private_draft', 'pending_review'
    
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY(author_email) REFERENCES users(email) ON DELETE CASCADE
);

-- 4. POSTS: Cache for Production Content (Already Published on GitHub)
-- Kept for performance to avoid scanning GitHub API for lists.
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, -- "repo/path/filename"
    repo TEXT NOT NULL,
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'main',
    status TEXT NOT NULL DEFAULT 'published',
    hash TEXT, -- GitHub blob SHA
    last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repo, path, filename)
);

-- 5. MEDIA: Cache for Media Assets
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    repo TEXT NOT NULL,
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'main',
    type TEXT,
    size INTEGER,
    hash TEXT,
    last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repo, path, filename)
);