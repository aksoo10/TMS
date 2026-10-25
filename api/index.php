<?php
require_once __DIR__ . '/config/db.php';

$stats = [
    'roles_count' => (int)$pdo->query("SELECT COUNT(*) FROM roles")->fetchColumn(),
    'users_count' => (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'sites_count' => (int)$pdo->query("SELECT COUNT(*) FROM sites")->fetchColumn(),
    'tools_count' => (int)$pdo->query("SELECT COUNT(*) FROM tools")->fetchColumn(),
    'movements_count' => (int)$pdo->query("SELECT COUNT(*) FROM tool_movements")->fetchColumn(),
    'inspections_count' => (int)$pdo->query("SELECT COUNT(*) FROM inspections")->fetchColumn(),
    'historical_logs_count' => (int)$pdo->query("SELECT COUNT(*) FROM historical_logs")->fetchColumn(),
];

sendResponse([
    'service' => 'ANDRITZ ISC - Tool Management System (TMS) Backend API',
    'status' => 'ONLINE',
    'database' => [
        'connection' => 'Connected (PDO MySQL)',
        'host' => '127.0.0.1:3306',
        'database' => 'tms_isc',
    ],
    'statistics' => $stats,
    'endpoints' => [
        'GET  /api/roles.php' => 'Daftar Role RBAC & Permissions',
        'GET  /api/users.php' => 'Daftar Pengguna, Role, & Site',
        'GET  /api/sites.php' => 'Daftar 6 Lokasi Site ANDRITZ',
        'GET  /api/tools.php' => 'Katalog Tools, Barcode, & Status',
        'POST /api/tools.php' => 'Registrasi Alat Baru',
        'GET  /api/movements.php' => 'Daftar Peminjaman & Transfer Armada',
        'POST /api/movements.php' => 'Transaksi Check-Out / Check-In / Transfer',
        'GET  /api/inspections.php' => 'Hasil Inspeksi QA/QC & Sertifikat',
        'GET  /api/historical.php' => 'Audit Trail & Log Riwayat Aktivitas'
    ],
    'official_sites' => [
        'SITE-IKPP' => 'Site IKPP',
        'SITE-IKPD' => 'Site IKPD',
        'SITE-OKI-1' => 'Site OKI I',
        'SITE-OKI-2' => 'Site OKI II',
        'SITE-TELL' => 'Site TELL',
        'SITE-ISC' => 'Site ISC'
    ]
]);
