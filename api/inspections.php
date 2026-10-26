<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            i.id,
            i.tool_id as toolId,
            i.tool_code as toolCode,
            i.tool_name as toolName,
            i.inspection_date as inspectionDate,
            i.inspector_name as inspectorName,
            i.inspector_id as inspectorId,
            i.site_name as siteName,
            i.verdict,
            CAST(i.calibration_valid AS UNSIGNED) as calibrationValid,
            i.certificate_no as certificateNo,
            i.checklist_json as checklist,
            i.findings,
            i.next_inspection_due as nextInspectionDue
        FROM inspections i
        ORDER BY i.inspection_date DESC
    ");
    $inspections = $stmt->fetchAll();

    foreach ($inspections as &$insp) {
        $insp['checklist'] = json_decode($insp['checklist'] ?? '{}');
        $insp['calibrationValid'] = (bool)$insp['calibrationValid'];
    }

    sendResponse([
        'success' => true,
        'count' => count($inspections),
        'data' => $inspections
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['toolId'])) {
        sendResponse(['success' => false, 'message' => 'Tool ID is required'], 400);
    }

    $id = 'INSP-' . mt_rand(100000, 999999);
    $certNo = $input['certificateNo'] ?? ('INSP-CERT-' . mt_rand(100000, 999999));
    $today = date('Y-m-d');

    // Get tool
    $tStmt = $pdo->prepare("SELECT code, name, site_id FROM tools WHERE id = ?");
    $tStmt->execute([$input['toolId']]);
    $tool = $tStmt->fetch();

    $siteName = $input['siteName'] ?? 'Site ISC';

    $stmt = $pdo->prepare("
        INSERT INTO inspections (
            id, tool_id, tool_code, tool_name, inspection_date, inspector_name, inspector_id,
            site_name, verdict, calibration_valid, certificate_no, checklist_json, findings, next_inspection_due
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        )
    ");

    $stmt->execute([
        $id,
        $input['toolId'],
        $tool ? $tool['code'] : ($input['toolCode'] ?? '-'),
        $tool ? $tool['name'] : ($input['toolName'] ?? '-'),
        $today,
        $input['inspectorName'] ?? 'QA Inspector',
        $input['inspectorId'] ?? 'QA-01',
        $siteName,
        $input['verdict'] ?? 'Pass',
        isset($input['calibrationValid']) && !$input['calibrationValid'] ? 0 : 1,
        $certNo,
        json_encode($input['checklist'] ?? []),
        $input['findings'] ?? 'Pemeriksaan standar SOP ANDRITZ ISC',
        $input['nextInspectionDue'] ?? date('Y-m-d', strtotime('+3 months'))
    ]);

    // Update tool condition and status
    $verdict = $input['verdict'] ?? 'Pass';
    $newStatus = ($verdict === 'Fail' || $verdict === 'Quarantine') ? 'Maintenance' : 'Available';
    $newCondition = ($verdict === 'Fail') ? 'Needs Repair' : (($verdict === 'Pass with Observation') ? 'Acceptable' : 'Good');
    $pdo->prepare("UPDATE tools SET status = IF(status = 'Checked Out', 'Checked Out', ?), tool_condition = ?, last_inspection_date = ? WHERE id = ?")
        ->execute([$newStatus, $newCondition, $today, $input['toolId']]);

    // Historical log
    $pdo->prepare("INSERT INTO historical_logs (id, timestamp, event_type, tool_code, tool_name, user_name, site_name, details) VALUES (?, NOW(), 'Inspection', ?, ?, ?, ?, ?)")
        ->execute(['HIST-' . mt_rand(100000, 999999), $tool ? $tool['code'] : '-', $tool ? $tool['name'] : '-', $input['inspectorName'] ?? 'QA Inspector', $siteName, "Inspeksi QA/QC: {$verdict}. Sertifikat: {$certNo}"]);

    sendResponse(['success' => true, 'message' => 'Inspection saved', 'id' => $id, 'certificateNo' => $certNo], 201);
}

