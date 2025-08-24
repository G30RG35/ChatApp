CREATE VIEW recent_conversations AS
SELECT 
    c.id AS conversation_id,
    c.name,
    c.avatar_url,
    c.is_group,
    c.created_by,
    c.created_at,
    c.updated_at,

    m.id AS last_message_id,
    m.content AS last_message,
    m.created_at AS last_message_at,
    m.sender_id AS last_message_sender_id,
    u.username AS last_message_sender_name,

    COUNT(DISTINCT cp.user_id) AS participants_count,

    SUM(CASE WHEN ms.status = 'read' THEN 1 ELSE 0 END) AS read_count,
    SUM(CASE WHEN ms.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count
FROM conversations c
LEFT JOIN messages m ON c.last_message_id = m.id
LEFT JOIN users u ON m.sender_id = u.id
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN message_status ms ON m.id = ms.message_id
GROUP BY 
    c.id, c.name, c.avatar_url, c.is_group, c.created_by, c.created_at, c.updated_at,
    m.id, m.content, m.created_at, m.sender_id,
    u.username;
