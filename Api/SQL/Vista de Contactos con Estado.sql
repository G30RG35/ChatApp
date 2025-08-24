CREATE VIEW contact_status AS
SELECT 
    cnt.id AS contact_record_id,
    cnt.user_id AS owner_id,
    cnt.contact_id AS contact_user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.status,
    u.last_seen,
    cnt.nickname,
    cnt.is_favorite,
    cnt.created_at
FROM contacts cnt
JOIN users u ON cnt.contact_id = u.id;
