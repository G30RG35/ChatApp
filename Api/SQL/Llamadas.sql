CREATE TABLE calls (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    conversation_id VARCHAR(36) NOT NULL,
    caller_id VARCHAR(36) NOT NULL,
    call_type VARCHAR(20) DEFAULT 'voice' CHECK (call_type IN ('voice', 'video')),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'ongoing', 'completed', 'missed', 'rejected')),
    started_at DATETIME DEFAULT GETDATE(),
    ended_at DATETIME NULL,
    duration INT DEFAULT 0,
    participants_count INT DEFAULT 2,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE NO ACTION,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE NO ACTION
);

-- Crear índices
CREATE INDEX idx_calls_conversation ON calls(conversation_id);
CREATE INDEX idx_calls_caller ON calls(caller_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_started_at ON calls(started_at DESC);