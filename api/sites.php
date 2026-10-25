<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            s.*,
            (SELECT COUNT(*) FROM tools t WHERE t.site_id = s.id) as current_tools_count,
            (SELECT COUNT(*) FROM tools t WHERE t.site_id = s.id AND t.status = 'Checked Out') as checked_out_count
        FROM sites s
        ORDER BY s.name ASC
    ");
    $sites = $stmt->fetchAll();

    foreach ($sites as &$site) {
        $site['activeToolsCount'] = (int)$site['current_tools_count'];
        $site['totalAssigned'] = (int)$site['total_assigned'];
    }

    sendResponse([
        'success' => true,
        'count' => count($sites),
        'data' => $sites
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['name']) || empty($input['code'])) {
        sendResponse(['success' => false, 'message' => 'Site name and code are required'], 400);
    }

    $id = $input['id'] ?? 'SITE-' . strtoupper($input['code']);
    $stmt = $pdo->prepare("
        INSERT INTO sites (id, code, name, region, type, pic, contact, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $id,
        $input['code'],
        $input['name'],
        $input['region'] ?? '',
        $input['type'] ?? 'Pulp & Paper Mill Site',
        $input['pic'] ?? '',
        $input['contact'] ?? '',
        $input['address'] ?? '',
        $input['status'] ?? 'Operational'
    ]);

    sendResponse(['success' => true, 'message' => 'Site created', 'id' => $id], 201);
}
