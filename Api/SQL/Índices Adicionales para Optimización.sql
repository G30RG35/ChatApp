-- Índices para búsquedas
CREATE INDEX idx_users_name ON users(first_name, last_name);
CREATE INDEX idx_messages_content ON messages(content(255));
CREATE INDEX idx_conversations_name ON conversations(name);

-- Índices para ordenación
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_users_last_seen ON users(last_seen DESC);

-- Índices para consultas de estado
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_message_status_user ON message_status(user_id, status);