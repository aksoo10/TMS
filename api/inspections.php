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
}
