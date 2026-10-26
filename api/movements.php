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
    } elseif ($action === 'checkin') {
        $movId = $input['movementId'] ?? null;
        $returnCondition = $input['condition'] ?? 'Good';
        $returnNotes = $input['notes'] ?? '';

        if (!$movId) {
            sendResponse(['success' => false, 'message' => 'Movement ID is required'], 400);
        }

        $mStmt = $pdo->prepare("SELECT tool_id, tool_code, tool_name, to_site, notes FROM tool_movements WHERE id = ?");
        $mStmt->execute([$movId]);
        $mov = $mStmt->fetch();

        if (!$mov) {
            sendResponse(['success' => false, 'message' => 'Movement not found'], 404);
        }

        $pdo->beginTransaction();
        $updatedNotes = ($mov['notes'] ? $mov['notes'] . ' | ' : '') . "Pengembalian: " . ($returnNotes ?: 'Kondisi terverifikasi');
        $pdo->prepare("UPDATE tool_movements SET status = 'Returned', actual_return_date = NOW(), notes = ? WHERE id = ?")
            ->execute([$updatedNotes, $movId]);

        $newStatus = ($returnCondition === 'Damaged') ? 'Maintenance' : 'Available';
        $pdo->prepare("UPDATE tools SET status = ?, tool_condition = ?, assigned_to = NULL WHERE id = ?")
            ->execute([$newStatus, $returnCondition, $mov['tool_id']]);

        $pdo->prepare("INSERT INTO historical_logs (id, timestamp, event_type, tool_code, tool_name, user_name, site_name, details) VALUES (?, NOW(), 'Check-In', ?, ?, 'Operator', ?, ?)")
            ->execute(['HIST-' . mt_rand(100000, 999999), $mov['tool_code'], $mov['tool_name'], $mov['to_site'], "Pengembalian tool diverifikasi. Kondisi: {$returnCondition}"]);

        $pdo->commit();
        sendResponse(['success' => true, 'message' => 'Check-in berhasil diverifikasi']);
    } elseif ($action === 'transfer') {
        $movId = 'MOV-TRF-' . mt_rand(1000, 9999);
        $toolId = $input['toolId'] ?? null;
        $toSiteId = $input['toSiteId'] ?? null;

        if (!$toolId || !$toSiteId) {
            sendResponse(['success' => false, 'message' => 'Tool ID and Destination Site ID are required'], 400);
        }

        $tStmt = $pdo->prepare("SELECT code, name, site_id FROM tools WHERE id = ?");
        $tStmt->execute([$toolId]);
        $tool = $tStmt->fetch();
        if (!$tool) sendResponse(['success' => false, 'message' => 'Tool not found'], 404);

        $s1 = $pdo->query("SELECT name FROM sites WHERE id = '{$tool['site_id']}'")->fetchColumn() ?: 'Site ISC';
        $s2 = $pdo->query("SELECT name FROM sites WHERE id = '{$toSiteId}'")->fetchColumn() ?: 'Site OKI I';

        $pdo->beginTransaction();
        $ins = $pdo->prepare("
            INSERT INTO tool_movements (
                id, tool_id, tool_code, tool_name, movement_type, borrower_name, borrower_id,
                from_site, to_site, work_order, checkout_date, expected_return_date, actual_return_date, status, approved_by, notes
            ) VALUES (?, ?, ?, ?, 'Transfer', ?, 'LOG-01', ?, ?, ?, NOW(), 'N/A', NOW(), 'Returned', 'Logistics Officer', ?)
        ");
        $waybill = $input['waybillNumber'] ?? ('SJ-' . date('ymd') . '-' . mt_rand(100, 999));
        $ins->execute([
            $movId, $toolId, $tool['code'], $tool['name'],
            $input['borrowerName'] ?? 'Logistics Officer',
            $s1, $s2,
            $waybill,
            $input['notes'] ?? 'Relokasi armada antar site ISC'
        ]);

        $pdo->prepare("UPDATE tools SET site_id = ? WHERE id = ?")
            ->execute([$toSiteId, $toolId]);

        $pdo->prepare("INSERT INTO historical_logs (id, timestamp, event_type, tool_code, tool_name, user_name, site_name, details) VALUES (?, NOW(), 'Transfer', ?, ?, 'Logistics Officer', ?, ?)")
            ->execute(['HIST-' . mt_rand(100000, 999999), $tool['code'], $tool['name'], $s2, "Relokasi ke {$s2} via {$waybill}"]);

        $pdo->commit();
        sendResponse(['success' => true, 'message' => 'Transfer berhasil dicatat', 'id' => $movId], 201);
    }
}

