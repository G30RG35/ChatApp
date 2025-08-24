CREATE TABLE call_participants (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    call_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at DATETIME DEFAULT GETDATE(),
    left_at DATETIME NULL,
    duration INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'missed', 'rejected')),

    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices sugeridos
CREATE INDEX idx_call_participants_call ON call_participants(call_id);
CREATE INDEX idx_call_participants_user ON call_participants(user_id);
CREATE INDEX idx_call_participants_status ON call_participants(status);
CREATE INDEX idx_call_participants_joined_at ON call_participants(joined_at DESC);
