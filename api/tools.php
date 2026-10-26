<?php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $site_filter = $_GET['site'] ?? 'ALL';
    $status_filter = $_GET['status'] ?? 'ALL';
    $category_filter = $_GET['category'] ?? 'ALL';
    $search = $_GET['q'] ?? '';

    $where = [];
    $params = [];

    if ($site_filter !== 'ALL') {
        $where[] = "t.site_id = ?";
        $params[] = $site_filter;
    }
    if ($status_filter !== 'ALL') {
        $where[] = "t.status = ?";
        $params[] = $status_filter;
    }
    if ($category_filter !== 'ALL') {
        $where[] = "t.category = ?";
        $params[] = $category_filter;
    }
    if (!empty($search)) {
        $where[] = "(t.code LIKE ? OR t.name LIKE ? OR t.barcode LIKE ? OR t.material_no LIKE ? OR t.serial_no LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $sql = "
        SELECT 
            t.id,
            t.code,
            t.name,
            t.category,
            t.brand,
            t.model,
            t.barcode,
            t.material_no as materialNo,
            t.serial_no as serialNo,
            t.site_id as siteId,
            s.name as siteName,
            t.bin_location as binLocation,
            t.status,
            t.tool_condition as `condition`,
            t.calibration_status as calibrationStatus,
            t.last_calibration_date as lastCalibrationDate,
            t.next_calibration_date as nextCalibrationDate,
            t.calibration_cert_no as calibrationCertNo,
            t.last_inspection_date as lastInspectionDate,
            t.purchase_date as purchaseDate,
            t.assigned_to as assignedTo,
            t.specs
        FROM tools t
        LEFT JOIN sites s ON t.site_id = s.id
    ";

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY t.id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tools = $stmt->fetchAll();

    sendResponse([
        'success' => true,
        'count' => count($tools),
        'data' => $tools
    ]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['name'])) {
        sendResponse(['success' => false, 'message' => 'Tool name is required'], 400);
    }

    $id = $input['id'] ?? 'TOOL-' . str_pad((string)(mt_rand(100, 999)), 3, '0', STR_PAD_LEFT);
    $code = $input['code'] ?? 'ATZ-' . strtoupper(substr($input['category'] ?? 'GEN', 0, 3)) . '-' . mt_rand(100, 999);
    $barcode = $input['barcode'] ?? '8990142' . mt_rand(10000, 99999);

    $stmt = $pdo->prepare("
        INSERT INTO tools (
            id, code, name, category, brand, model, barcode, material_no, serial_no,
            site_id, bin_location, status, tool_condition, calibration_status,
            last_calibration_date, next_calibration_date, calibration_cert_no,
            last_inspection_date, purchase_date, specs
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?
        )
    ");

    $stmt->execute([
        $id,
        $code,
        $input['name'],
        $input['category'] ?? 'Hydraulic Bolting',
        $input['brand'] ?? 'ANDRITZ Spec',
        $input['model'] ?? '',
        $barcode,
        $input['materialNo'] ?? 'MAT-88' . mt_rand(10000, 99999),
        $input['serialNo'] ?? 'SN-2026-' . mt_rand(1000, 9999),
        $input['siteId'] ?? 'SITE-ISC',
        $input['binLocation'] ?? 'RACK-A1',
        $input['status'] ?? 'Available',
        $input['condition'] ?? 'Good',
        $input['calibrationStatus'] ?? 'Valid',
        $input['lastCalibrationDate'] ?? date('Y-m-d'),
        $input['nextCalibrationDate'] ?? date('Y-m-d', strtotime('+6 months')),
        $input['calibrationCertNo'] ?? 'CERT-CAL-2026-' . mt_rand(1000, 9999),
        $input['lastInspectionDate'] ?? date('Y-m-d'),
        $input['purchaseDate'] ?? date('Y-m-d'),
        $input['specs'] ?? ''
    ]);

    // Insert historical log
    $histStmt = $pdo->prepare("
        INSERT INTO historical_logs (id, timestamp, event_type, tool_code, tool_name, user_name, site_name, details)
        SELECT ?, NOW(), 'Register', ?, ?, 'System Operator', s.name, 'Alat baru didaftarkan ke inventaris sistem'
        FROM sites s WHERE s.id = ?
    ");
    $histStmt->execute(['HIST-' . mt_rand(100000, 999999), $code, $input['name'], $input['siteId'] ?? 'SITE-ISC']);

    sendResponse(['success' => true, 'message' => 'Tool registered successfully', 'id' => $id, 'code' => $code], 201);
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? ($input['id'] ?? null);

    if (!$id) {
        sendResponse(['success' => false, 'message' => 'Tool ID is required'], 400);
    }

    $fields = [];
    $params = [];

    $allowed = [
        'name' => 'name',
        'category' => 'category',
        'brand' => 'brand',
        'model' => 'model',
        'barcode' => 'barcode',
        'materialNo' => 'material_no',
        'serialNo' => 'serial_no',
        'siteId' => 'site_id',
        'binLocation' => 'bin_location',
        'status' => 'status',
        'condition' => 'tool_condition',
        'calibrationStatus' => 'calibration_status',
        'lastCalibrationDate' => 'last_calibration_date',
        'nextCalibrationDate' => 'next_calibration_date',
        'calibrationCertNo' => 'calibration_cert_no',
        'lastInspectionDate' => 'last_inspection_date',
        'purchaseDate' => 'purchase_date',
        'assignedTo' => 'assigned_to',
        'specs' => 'specs'
    ];

    foreach ($allowed as $apiKey => $dbCol) {
        if (isset($input[$apiKey])) {
            $fields[] = "`$dbCol` = ?";
            $params[] = $input[$apiKey];
        }
    }

    if (empty($fields)) {
        sendResponse(['success' => false, 'message' => 'No fields to update'], 400);
    }

    $params[] = $id;
    $sql = "UPDATE tools SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    sendResponse(['success' => true, 'message' => 'Tool updated successfully', 'id' => $id]);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        sendResponse(['success' => false, 'message' => 'Tool ID is required'], 400);
    }

    // Delete associated movements if needed or check constraint
    $pdo->prepare("DELETE FROM tool_movements WHERE tool_id = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM inspections WHERE tool_id = ?")->execute([$id]);
    $stmt = $pdo->prepare("DELETE FROM tools WHERE id = ?");
    $stmt->execute([$id]);

    sendResponse(['success' => true, 'message' => 'Tool deleted successfully', 'id' => $id]);
}

