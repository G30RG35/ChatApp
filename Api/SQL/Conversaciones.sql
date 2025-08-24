CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    is_group BIT DEFAULT 0,
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    last_message_id VARCHAR(36),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE NO ACTION
);

-- Crear índices
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_is_group ON conversations(is_group);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);