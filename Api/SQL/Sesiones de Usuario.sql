CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    user_id VARCHAR(36) NOT NULL,
    device_token VARCHAR(500),
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    last_active DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_device_token ON user_sessions(device_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);