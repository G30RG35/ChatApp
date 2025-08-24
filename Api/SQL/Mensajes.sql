CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content VARCHAR(MAX) NOT NULL, -- actualizado desde TEXT
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'audio')),
    media_url VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    reply_to_id VARCHAR(36),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE NO ACTION
);

-- Índices para rendimiento
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_id);
