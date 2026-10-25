<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            h.id,
            DATE_FORMAT(h.timestamp, '%Y-%m-%d %H:%i:%s') as `timestamp`,
            h.event_type as eventType,
            h.tool_code as toolCode,
            h.tool_name as toolName,
            h.user_name as `user`,
            h.site_name as site,
            h.details
        FROM historical_logs h
        ORDER BY h.timestamp DESC
        LIMIT 100
    ");
    $logs = $stmt->fetchAll();

    sendResponse([
        'success' => true,
        'count' => count($logs),
        'data' => $logs
    ]);
}
