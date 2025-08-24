-- Trigger para actualizar last_message_id en conversaciones
DELIMITER //
CREATE TRIGGER after_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    UPDATE conversations 
    SET last_message_id = NEW.id, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
END;
//
DELIMITER ;

-- Trigger para actualizar el estado de usuario
DELIMITER //
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.status = 'online' THEN
        SET NEW.last_seen = CURRENT_TIMESTAMP;
    END IF;
END;
//
DELIMITER ;