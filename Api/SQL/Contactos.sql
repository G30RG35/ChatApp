CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    user_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    nickname VARCHAR(100),
    is_favorite BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION, -- Cambiado de CASCADE a NO ACTION
    FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE NO ACTION, -- Cambiado de CASCADE a NO ACTION
    CONSTRAINT unique_contact UNIQUE (user_id, contact_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX idx_contacts_is_favorite ON contacts(is_favorite);