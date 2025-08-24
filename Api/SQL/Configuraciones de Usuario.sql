CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    user_id VARCHAR(36) NOT NULL,
    notification_enabled BIT DEFAULT 1,
    sound_enabled BIT DEFAULT 1,
    vibration_enabled BIT DEFAULT 1,
    language_code VARCHAR(10) DEFAULT 'es',
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    privacy_profile VARCHAR(20) DEFAULT 'contacts' CHECK (privacy_profile IN ('everyone', 'contacts', 'nobody')),
    last_updated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Crear índices
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_user_settings_language ON user_settings(language_code);