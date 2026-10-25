<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "
        SELECT 
            u.id,
            u.name,
            u.email,
            u.job_title as title,
            u.avatar,
            u.phone,
            u.is_active,
            r.id as role_id,
            r.slug as role_slug,
            r.name as role,
            r.badge_color as role_badge_color,
            s.id as site_id,
            s.name as site,
            s.code as site_code,
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(p.code)
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE rp.role_id = r.id
                ),
                JSON_ARRAY()
            ) as permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN sites s ON u.site_id = s.id
        ORDER BY u.id ASC
    ";
    
    $stmt = $pdo->query($sql);
    $users = $stmt->fetchAll();

    foreach ($users as &$user) {
        $user['permissions'] = json_decode($user['permissions'] ?? '[]');
        $user['is_active'] = (bool)$user['is_active'];
    }

    sendResponse([
        'success' => true,
        'count' => count($users),
        'data' => $users
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Login check action
    if (isset($input['action']) && $input['action'] === 'login') {
        $email = $input['email'] ?? '';
        $stmt = $pdo->prepare("
            SELECT u.*, r.name as role, r.slug as role_slug, s.name as site_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN sites s ON u.site_id = s.id
            WHERE u.email = ? AND u.is_active = 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            unset($user['password_hash']);
            sendResponse(['success' => true, 'message' => 'Login successful', 'user' => $user]);
        } else {
            sendResponse(['success' => false, 'message' => 'User not found or inactive'], 401);
        }
    }

    sendResponse(['success' => false, 'message' => 'Invalid action'], 400);
}
