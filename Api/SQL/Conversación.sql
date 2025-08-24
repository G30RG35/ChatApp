CREATE TABLE conversation_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    conversation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at DATETIME DEFAULT GETDATE(),
    left_at DATETIME NULL,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE (conversation_id, user_id)
);

-- Índices sugeridos
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_role ON conversation_participants(role);
CREATE INDEX idx_conversation_participants_joined_at ON conversation_participants(joined_at DESC);
