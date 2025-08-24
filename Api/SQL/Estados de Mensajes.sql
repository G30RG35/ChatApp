CREATE TABLE message_status (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    message_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('delivered', 'read')),
    updated_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE (message_id, user_id)
);

-- Índices sugeridos
CREATE INDEX idx_message_status_message ON message_status(message_id);
CREATE INDEX idx_message_status_user ON message_status(user_id);
CREATE INDEX idx_message_status_status ON message_status(status);
CREATE INDEX idx_message_status_updated_at ON message_status(updated_at DESC);
