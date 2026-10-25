<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            m.id,
            m.tool_id as toolId,
            m.tool_code as toolCode,
            m.tool_name as toolName,
            m.movement_type as `type`,
            m.borrower_name as borrowerName,
            m.borrower_id as borrowerId,
            m.from_site as fromSite,
            m.to_site as toSite,
            m.work_order as workOrder,
            DATE_FORMAT(m.checkout_date, '%Y-%m-%d %H:%i') as checkoutDate,
            m.expected_return_date as expectedReturnDate,
            DATE_FORMAT(m.actual_return_date, '%Y-%m-%d %H:%i') as actualReturnDate,
            m.status,
            m.approved_by as approvedBy,
            m.notes
        FROM tool_movements m
        ORDER BY m.checkout_date DESC
    ");
    $movements = $stmt->fetchAll();

    sendResponse([
        'success' => true,
        'count' => count($movements),
        'data' => $movements
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'checkout';

    if ($action === 'checkout') {
        $movId = 'MOV-2026-' . str_pad((string)mt_rand(100, 999), 4, '0', STR_PAD_LEFT);
        $toolId = $input['toolId'];
        
        // Get tool info
        $tStmt = $pdo->prepare("SELECT code, name, site_id FROM tools WHERE id = ?");
        $tStmt->execute([$toolId]);
        $tool = $tStmt->fetch();
        if (!$tool) sendResponse(['success' => false, 'message' => 'Tool not found'], 404);

        // Get site names
        $s1 = $pdo->query("SELECT name FROM sites WHERE id = '{$tool['site_id']}'")->fetchColumn() ?: 'Site ISC';
        $destSiteId = $input['destinationSiteId'] ?? 'SITE-OKI-1';
        $s2 = $pdo->query("SELECT name FROM sites WHERE id = '{$destSiteId}'")->fetchColumn() ?: 'Site OKI I';

        $pdo->beginTransaction();
        $ins = $pdo->prepare("
            INSERT INTO tool_movements (
                id, tool_id, tool_code, tool_name, movement_type, borrower_name, borrower_id,
                from_site, to_site, work_order, checkout_date, expected_return_date, status, approved_by, notes
            ) VALUES (?, ?, ?, ?, 'Check-Out', ?, ?, ?, ?, ?, NOW(), ?, 'Active', ?, ?)
        ");
        $ins->execute([
            $movId, $toolId, $tool['code'], $tool['name'],
            $input['borrowerName'] ?? 'Operator',
            $input['borrowerId'] ?? 'EMP-0000',
            $s1, $s2,
            $input['workOrder'] ?? 'WO-2026-GEN',
            $input['expectedReturnDate'] ?? date('Y-m-d', strtotime('+14 days')),
            $input['approvedBy'] ?? 'Hendro Wibowo',
            $input['notes'] ?? ''
        ]);

        // Update tool status
        $pdo->prepare("UPDATE tools SET status = 'Checked Out', assigned_to = ? WHERE id = ?")
            ->execute([$input['borrowerName'] . ' (' . ($input['workOrder'] ?? '') . ')', $toolId]);

        // Audit log
        $pdo->prepare("INSERT INTO historical_logs (id, timestamp, event_type, tool_code, tool_name, user_name, site_name, details) VALUES (?, NOW(), 'Check-Out', ?, ?, ?, ?, ?)")
            ->execute(['HIST-' . mt_rand(100000, 999999), $tool['code'], $tool['name'], $input['borrowerName'] ?? 'Operator', $s2, "Check-out untuk WO: " . ($input['workOrder'] ?? '')]);

        $pdo->commit();
        sendResponse(['success' => true, 'message' => 'Check-out berhasil dicatat', 'id' => $movId], 201);
    }
}
