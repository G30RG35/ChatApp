CREATE TABLE groups (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url VARCHAR(500),
    created_by VARCHAR(36) NOT NULL,
    is_public BIT DEFAULT 0,
    max_members INT DEFAULT 100,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE NO ACTION
);

-- Crear índices
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_is_public ON groups(is_public);
CREATE INDEX idx_groups_created_at ON groups(created_at DESC);