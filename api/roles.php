<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all roles with their assigned permissions
    $sql = "
        SELECT 
            r.id,
            r.slug,
            r.name,
            r.description,
            r.badge_color,
            r.created_at,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) as user_count,
            COALESCE(
                (
                    SELECT JSON_ARRAYAGG(p.code)
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_id = p.id
                    WHERE rp.role_id = r.id
                ),
                JSON_ARRAY()
            ) as permissions
        FROM roles r
        ORDER BY r.id ASC
    ";
    
    $stmt = $pdo->query($sql);
    $roles = $stmt->fetchAll();

    foreach ($roles as &$role) {
        $role['permissions'] = json_decode($role['permissions'] ?? '[]');
        $role['user_count'] = (int)$role['user_count'];
    }

    sendResponse([
        'success' => true,
        'count' => count($roles),
        'data' => $roles
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['name']) || empty($input['slug'])) {
        sendResponse(['success' => false, 'message' => 'Role name and slug are required'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO roles (slug, name, description, badge_color) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $input['slug'],
        $input['name'],
        $input['description'] ?? '',
        $input['badge_color'] ?? '#00A3E0'
    ]);
    $roleId = $pdo->lastInsertId();

    if (!empty($input['permissions']) && is_array($input['permissions'])) {
        $permStmt = $pdo->prepare("
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT ?, id FROM permissions WHERE code = ?
        ");
        foreach ($input['permissions'] as $code) {
            $permStmt->execute([$roleId, $code]);
        }
    }

    sendResponse([
        'success' => true,
        'message' => 'Role created successfully',
        'role_id' => $roleId
    ], 201);
} else {
    sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}
