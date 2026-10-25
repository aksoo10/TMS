-- ====================================================================
-- ANDRITZ ISC (Indonesia Service Center) - Tool Management System (TMS)
-- Database & Role-Based Access Control (RBAC) Schema for Localhost
-- Target: MySQL 8.0+ / MariaDB (Laragon Localhost)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `tms_isc` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tms_isc`;

-- 1. DROP EXISTING TABLES IN REVERSE ORDER OF DEPENDENCY
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `historical_logs`;
DROP TABLE IF EXISTS `inspections`;
DROP TABLE IF EXISTS `tool_movements`;
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `sites`;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 2. SITES TABLE (Master Lokasi 6 Site Resmi)
-- ====================================================================
CREATE TABLE `sites` (
  `id` VARCHAR(32) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `region` VARCHAR(150) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `pic` VARCHAR(100) NOT NULL,
  `contact` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `active_tools_count` INT UNSIGNED DEFAULT 0,
  `total_assigned` INT UNSIGNED DEFAULT 0,
  `status` ENUM('Operational', 'Maintenance', 'Inactive') DEFAULT 'Operational',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_site_code` (`code`),
  UNIQUE KEY `uk_site_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. ROLES & PERMISSIONS TABLE (RBAC Management)
-- ====================================================================
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `slug` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `badge_color` VARCHAR(30) DEFAULT '#00A3E0',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `code` VARCHAR(60) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permission_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. USERS TABLE (Akun Pengguna & Penugasan Role)
-- ====================================================================
CREATE TABLE `users` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `site_id` VARCHAR(32) NOT NULL,
  `job_title` VARCHAR(150) DEFAULT NULL,
  `avatar` VARCHAR(10) DEFAULT 'US',
  `phone` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_email` (`email`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_user_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. TOOLS MASTER TABLE (Database Inventaris Perkakas Industri)
-- ====================================================================
CREATE TABLE `tools` (
  `id` VARCHAR(32) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `barcode` VARCHAR(60) NOT NULL,
  `material_no` VARCHAR(60) NOT NULL,
  `serial_no` VARCHAR(80) NOT NULL,
  `site_id` VARCHAR(32) NOT NULL,
  `bin_location` VARCHAR(80) NOT NULL,
  `status` ENUM('Available', 'Checked Out', 'In Inspection', 'Maintenance', 'Damaged') DEFAULT 'Available',
  `tool_condition` ENUM('Good', 'Minor Defect', 'Damaged') DEFAULT 'Good',
  `calibration_status` ENUM('Valid', 'Due Soon', 'Overdue', 'N/A') DEFAULT 'Valid',
  `last_calibration_date` DATE DEFAULT NULL,
  `next_calibration_date` DATE DEFAULT NULL,
  `calibration_cert_no` VARCHAR(100) DEFAULT NULL,
  `last_inspection_date` DATE DEFAULT NULL,
  `purchase_date` DATE DEFAULT NULL,
  `assigned_to` VARCHAR(255) DEFAULT NULL,
  `specs` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tool_code` (`code`),
  UNIQUE KEY `uk_tool_barcode` (`barcode`),
  KEY `idx_tool_site` (`site_id`),
  KEY `idx_tool_status` (`status`),
  KEY `idx_tool_category` (`category`),
  CONSTRAINT `fk_tool_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. TOOL MOVEMENTS TABLE (Peminjaman, Pengembalian, dan Transfer)
-- ====================================================================
CREATE TABLE `tool_movements` (
  `id` VARCHAR(32) NOT NULL,
  `tool_id` VARCHAR(32) NOT NULL,
  `tool_code` VARCHAR(50) NOT NULL,
  `tool_name` VARCHAR(255) NOT NULL,
  `movement_type` ENUM('Check-Out', 'Check-In', 'Transfer') NOT NULL,
  `borrower_name` VARCHAR(100) NOT NULL,
  `borrower_id` VARCHAR(50) DEFAULT NULL,
  `from_site` VARCHAR(100) NOT NULL,
  `to_site` VARCHAR(100) NOT NULL,
  `work_order` VARCHAR(80) NOT NULL,
  `checkout_date` DATETIME NOT NULL,
  `expected_return_date` VARCHAR(50) DEFAULT NULL,
  `actual_return_date` DATETIME DEFAULT NULL,
  `status` ENUM('Active', 'Returned') DEFAULT 'Active',
  `approved_by` VARCHAR(100) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movement_tool` (`tool_id`),
  KEY `idx_movement_status` (`status`),
  CONSTRAINT `fk_mov_tool` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. INSPECTIONS TABLE (QA/QC Checklists & Sertifikasi Kelayakan)
-- ====================================================================
CREATE TABLE `inspections` (
  `id` VARCHAR(32) NOT NULL,
  `tool_id` VARCHAR(32) NOT NULL,
  `tool_code` VARCHAR(50) NOT NULL,
  `tool_name` VARCHAR(255) NOT NULL,
  `inspection_date` DATE NOT NULL,
  `inspector_name` VARCHAR(100) NOT NULL,
  `inspector_id` VARCHAR(50) DEFAULT NULL,
  `site_name` VARCHAR(100) NOT NULL,
  `verdict` ENUM('Pass', 'Pass with Observation', 'Fail', 'Quarantine') NOT NULL,
  `calibration_valid` TINYINT(1) DEFAULT 1,
  `certificate_no` VARCHAR(100) NOT NULL,
  `checklist_json` JSON NOT NULL,
  `findings` TEXT DEFAULT NULL,
  `next_inspection_due` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inspection_cert` (`certificate_no`),
  KEY `idx_insp_tool` (`tool_id`),
  CONSTRAINT `fk_insp_tool` FOREIGN KEY (`tool_id`) REFERENCES `tools` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 8. HISTORICAL LOGS TABLE (Audit Trail Seluruh Aktivitas Fleet)
-- ====================================================================
CREATE TABLE `historical_logs` (
  `id` VARCHAR(32) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `tool_code` VARCHAR(50) NOT NULL,
  `tool_name` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `site_name` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hist_timestamp` (`timestamp`),
  KEY `idx_hist_event` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 9. SEED DATA: 6 SITE RESMI
-- ====================================================================
INSERT INTO `sites` (`id`, `code`, `name`, `region`, `type`, `pic`, `contact`, `address`, `active_tools_count`, `total_assigned`, `status`) VALUES
('SITE-IKPP', 'IKPP', 'Site IKPP', 'Perawang, Siak, Riau', 'Pulp & Paper Mill Site', 'Dedi Kurniawan', '+62 812 7701 445', 'Jl. Raya Minas - Perawang KM 26, Siak, Riau', 38, 45, 'Operational'),
('SITE-IKPD', 'IKPD', 'Site IKPD', 'Riau', 'Pulp & Paper Mill Site', 'Agus Supriyadi', '+62 813 6590 128', 'Kawasan Industri IKPD, Riau', 22, 28, 'Operational'),
('SITE-OKI-1', 'OKI I', 'Site OKI I', 'Ogan Komering Ilir, South Sumatra', 'Pulp & Paper Mill Line 1', 'Reza Pratama', '+62 811 7300 910', 'Desa Bukit Batu, Air Sugihan, Ogan Komering Ilir', 44, 50, 'Operational'),
('SITE-OKI-2', 'OKI II', 'Site OKI II', 'Ogan Komering Ilir, South Sumatra', 'Pulp & Paper Mill Line 2', 'Fajar Nugraha', '+62 812 7109 443', 'Desa Bukit Batu, Air Sugihan, Ogan Komering Ilir', 36, 42, 'Operational'),
('SITE-TELL', 'TELL', 'Site TELL', 'Muara Enim, South Sumatra', 'Pulp & Paper Mill Site', 'Siti Rahmawati', '+62 734 451020', 'Desa Banuayu, Kec. Empat Petulai Dangku, Muara Enim', 29, 34, 'Operational'),
('SITE-ISC', 'ISC', 'Site ISC', 'Pekanbaru, Riau', 'Indonesia Service Center Central Hub', 'Bambang Santoso', '+62 761 882901', 'Kawasan Industri ANDRITZ ISC, Jl. Soekarno-Hatta, Pekanbaru', 65, 75, 'Operational');

-- ====================================================================
-- 10. SEED DATA: ROLES & PERMISSIONS
-- ====================================================================
INSERT INTO `roles` (`id`, `slug`, `name`, `description`, `badge_color`) VALUES
(1, 'super-admin', 'Super Admin', 'Akses penuh ke seluruh konfigurasi sistem, audit, manajemen user, dan inventaris fleet.', '#00A3E0'),
(2, 'tool-engineer', 'Tool Engineer', 'Mengelola database tools, pendaftaran alat baru, spesifikasi teknis, dan verifikasi sertifikasi.', '#10B981'),
(3, 'site-supervisor', 'Site Supervisor', 'Membuat permohonan check-out peminjaman alat, transfer armada antar-site, dan tracking WO.', '#F59E0B'),
(4, 'quality-inspector', 'Quality Inspector', 'Melakukan inspeksi berkala, checklist QA/QC, audit masa kalibrasi, dan menerbitkan sertifikat.', '#8B5CF6'),
(5, 'warehouse-operator', 'Warehouse Operator', 'Melakukan check-in fisik saat alat kembali, inspeksi kebersihan dan fisik dasar, scan barcode.', '#0284C7'),
(6, 'viewer', 'Auditor / Viewer', 'Akses lihat laporan eksekutif, analytics utilisasi, dan riwayat historical log tanpa izin edit.', '#64748B');

INSERT INTO `permissions` (`code`, `module`, `name`, `description`) VALUES
('all', 'System', 'Super Administrator Access', 'Akses tanpa batas ke seluruh modul sistem'),
('tools_manage', 'Tools Database', 'Kelola Master Tools', 'Tambah, edit, dan arsipkan katalog alat'),
('tools_view', 'Tools Database', 'Lihat Master Tools', 'Melihat informasi inventaris dan barcode alat'),
('movements_create', 'Tools Movement', 'Buat Check-Out & Transfer', 'Mencatat peminjaman alat ke proyek atau transfer antar site'),
('movements_approve', 'Tools Movement', 'Persetujuan Peminjaman', 'Memberikan persetujuan pergerakan armada alat'),
('movements_return', 'Tools Movement', 'Proses Check-In', 'Menerima alat kembali dari lapangan'),
('movements_view', 'Tools Movement', 'Lihat Pergerakan', 'Melihat daftar status peminjaman dan surat jalan'),
('inspection_manage', 'Inspection', 'Kelola Inspeksi QA', 'Menentukan kriteria kelayakan dan checklist'),
('inspection_create', 'Inspection', 'Input Hasil Inspeksi', 'Mengisi form inspeksi dan status kelaikan alat'),
('inspection_view', 'Inspection', 'Lihat Sertifikat', 'Melihat sertifikat QA/QC kelaikan alat'),
('site_manage', 'Site Database', 'Kelola Master Site', 'Menambah dan memperbarui data lokasi site'),
('site_view', 'Site Database', 'Lihat Master Site', 'Melihat daftar site operasional'),
('user_manage', 'User & Roles', 'Kelola User & Role', 'Mengatur akun pengguna dan hak akses peran'),
('audit_view', 'Historical', 'Lihat Log Audit', 'Melihat riwayat aktivitas transaksi historical'),
('analytics_view', 'Analytics', 'Lihat Analytics', 'Melihat dashboard utilisasi dan fleet intelligence');

-- Assign Permissions to Roles
-- 1. Super Admin: all
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions`;

-- 2. Tool Engineer: tools_manage, tools_view, inspection_manage, inspection_create, inspection_view, movements_view, site_view, analytics_view
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions` WHERE `code` IN ('tools_manage', 'tools_view', 'inspection_manage', 'inspection_create', 'inspection_view', 'movements_view', 'site_view', 'analytics_view');

-- 3. Site Supervisor: movements_create, movements_return, movements_view, tools_view, site_view
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions` WHERE `code` IN ('movements_create', 'movements_return', 'movements_view', 'tools_view', 'site_view');

-- 4. Quality Inspector: inspection_manage, inspection_create, inspection_view, tools_view
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 4, `id` FROM `permissions` WHERE `code` IN ('inspection_manage', 'inspection_create', 'inspection_view', 'tools_view');

-- 5. Warehouse Operator: movements_return, movements_view, tools_view, inspection_view
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 5, `id` FROM `permissions` WHERE `code` IN ('movements_return', 'movements_view', 'tools_view', 'inspection_view');

-- 6. Auditor / Viewer: tools_view, movements_view, inspection_view, site_view, audit_view, analytics_view
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 6, `id` FROM `permissions` WHERE `code` IN ('tools_view', 'movements_view', 'inspection_view', 'site_view', 'audit_view', 'analytics_view');

-- ====================================================================
-- 11. SEED DATA: USERS DENGAN ROLE MASING-MASING
-- ====================================================================
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `site_id`, `job_title`, `avatar`, `phone`) VALUES
('USR-001', 'Hendro Wibowo', 'hendro.wibowo@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 1, 'SITE-ISC', 'Head of Fleet & Asset Operations', 'HW', '+62 811 7600 123'),
('USR-002', 'Bambang Santoso', 'bambang.santoso@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 2, 'SITE-ISC', 'Senior Reliability & Tooling Specialist', 'BS', '+62 812 7654 321'),
('USR-003', 'Reza Pratama', 'reza.pratama@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 3, 'SITE-OKI-1', 'Site Lead - OKI Mill Operations', 'RP', '+62 813 9876 543'),
('USR-004', 'Siti Rahmawati', 'siti.rahmawati@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 4, 'SITE-TELL', 'QA/QC & Calibration Inspector', 'SR', '+62 812 3456 789'),
('USR-005', 'Dedi Kurniawan', 'dedi.kurniawan@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 5, 'SITE-IKPP', 'Tool Crib & Inventory Officer', 'DK', '+62 812 7701 445'),
('USR-006', 'Fajar Nugraha', 'fajar.nugraha@andritz.com', '$2y$10$wE9Nf8Q7Yl1Jm4y7vY9lue9XhZq5.F6s1D7cO3g4v4b8u0i4m9cZe', 6, 'SITE-OKI-2', 'Plant Compliance & Safety Auditor', 'FN', '+62 812 7109 443');

-- ====================================================================
-- 12. SEED DATA: TOOLS INVENTARIS
-- ====================================================================
INSERT INTO `tools` (`id`, `code`, `name`, `category`, `brand`, `model`, `barcode`, `material_no`, `serial_no`, `site_id`, `bin_location`, `status`, `tool_condition`, `calibration_status`, `last_calibration_date`, `next_calibration_date`, `calibration_cert_no`, `last_inspection_date`, `purchase_date`, `assigned_to`, `specs`) VALUES
('TOOL-001', 'ATZ-TRQ-401', 'Hydraulic Torque Wrench Low Profile 4,500 Nm', 'Hydraulic Bolting', 'Enerpac / ANDRITZ Spec', 'W4000X-ISC', '899014280191', 'MAT-8840210', 'ENP-2024-8841', 'SITE-ISC', 'RACK-A1-04', 'Available', 'Good', 'Valid', '2026-06-15', '2026-12-15', 'CERT-CAL-2026-0891', '2026-09-20', '2024-03-10', NULL, 'Max Torque 4,500 Nm, Hex cassette 50mm - 80mm, Working pressure 700 bar'),
('TOOL-002', 'ATZ-TRQ-402', 'Square Drive Hydraulic Torque Wrench 7,800 Nm', 'Hydraulic Bolting', 'Hytorc', 'AVANTI-7', '899014280192', 'MAT-8840212', 'HYT-2025-0199', 'SITE-OKI-1', 'FIELD-BOX-02', 'Checked Out', 'Good', 'Valid', '2026-05-10', '2026-11-10', 'CERT-CAL-2026-0512', '2026-08-15', '2025-01-20', 'Reza Pratama (WO-2026-OKI-041)', '1-1/2" Square Drive, Max torque 7,800 Nm, 360x180 swivel coupler'),
('TOOL-003', 'ATZ-ALN-101', 'Precision Laser Shaft Alignment System', 'Alignment & Measurement', 'Pruftechnik / Fluke', 'ROTALIGN Touch', '899014280193', 'MAT-8831090', 'PRF-2023-7721', 'SITE-IKPP', 'LAB-CAB-01', 'Checked Out', 'Good', 'Valid', '2026-04-18', '2026-10-18', 'CERT-CAL-2026-0441', '2026-09-02', '2023-11-05', 'Dedi Kurniawan (WO-2026-IKPP-109)', 'SensALIGN 7 sensor, Live Move 3D, Cardan shaft alignment capability'),
('TOOL-004', 'ATZ-VIB-201', 'Triaxial Vibration Analyzer & Data Collector', 'Condition Monitoring', 'ANDRITZ Metris / SKF', 'Microlog GX CMXA 75', '899014280194', 'MAT-8832044', 'SKF-2024-9182', 'SITE-ISC', 'RACK-E2-01', 'In Inspection', 'Good', 'Due Soon', '2025-11-01', '2026-11-01', 'CERT-CAL-2025-1102', '2026-10-15', '2024-02-14', NULL, '4-Channel simultaneous, FFT spectral analysis, ATEX Zone 2 rated'),
('TOOL-005', 'ATZ-PMP-501', 'Ultra-High Pressure Hydraulic Electric Pump 1,500 Bar', 'Hydraulic Power Units', 'Enerpac', 'Z-Class 1500', '899014280195', 'MAT-8840501', 'ENP-2024-4410', 'SITE-TELL', 'HEAVY-BAY-03', 'Available', 'Good', 'Valid', '2026-07-22', '2027-01-22', 'CERT-CAL-2026-0789', '2026-09-11', '2024-06-01', NULL, 'Dual stage 1,500 bar / 21,750 psi, calibrated digital gauge with auto-stop'),
('TOOL-006', 'ATZ-TNS-301', 'Multi-Stud Bolt Tensioner Set M48 - M64', 'Hydraulic Bolting', 'Tentec / Atlas Copco', 'AERO-W4864', '899014280196', 'MAT-8840332', 'TTC-2025-3391', 'SITE-OKI-2', 'CONTAINER-B1', 'Checked Out', 'Good', 'Valid', '2026-03-30', '2026-09-30', 'CERT-CAL-2026-0322', '2026-08-28', '2025-02-18', 'Fajar Nugraha (WO-2026-OKI-044)', 'High pressure hydraulic seal, 1500 bar capacity, stroke indicator'),
('TOOL-007', 'ATZ-FLG-601', 'Hydraulic Flange Spreader Wedge 14 Ton', 'Lifting & Spreading', 'Equalizer International', 'SWi12/14TI', '899014280197', 'MAT-8840615', 'EQL-2023-5590', 'SITE-ISC', 'RACK-B2-08', 'Maintenance', 'Minor Defect', 'Overdue', '2025-08-10', '2026-08-10', 'CERT-CAL-2025-0811', '2026-09-14', '2023-05-12', NULL, 'Interlocking first step 6mm access, 14 metric ton spreading force'),
('TOOL-008', 'ATZ-ELC-701', 'Digital 5kV Insulation Resistance Tester (Megger)', 'Electrical Testing', 'Megger', 'MIT515-ISC', '899014280198', 'MAT-8850119', 'MGR-2025-1104', 'SITE-TELL', 'ELEC-SAFE-01', 'Available', 'Good', 'Valid', '2026-08-01', '2027-02-01', 'CERT-CAL-2026-0805', '2026-10-02', '2025-04-10', NULL, 'CAT IV 600V safety rating, measurement up to 10 T-Ohm, PI & DAR auto test'),
('TOOL-009', 'ATZ-GAS-801', 'Confined Space 4-Gas Detector with Sampling Pump', 'Safety & Environmental', 'Dräger', 'X-am 5000 Multi-Gas', '899014280199', 'MAT-8860220', 'DRG-2024-7832', 'SITE-IKPD', 'SAFETY-LOCKER-A', 'Checked Out', 'Good', 'Due Soon', '2026-05-02', '2026-11-02', 'CERT-CAL-2026-0504', '2026-09-25', '2024-04-20', 'Agus Supriyadi (WO-2026-IKPD-081)', 'Sensors: O2, CO, H2S, LEL hydrocarbons with integrated motorized sample pump'),
('TOOL-010', 'ATZ-DIL-901', 'Digital Dial Indicator 0.001mm with Magnetic Base', 'Alignment & Measurement', 'Mitutoyo', 'ID-C112XB Series 543', '899014280200', 'MAT-8831005', 'MTY-2025-9012', 'SITE-OKI-1', 'PRECISION-03', 'Available', 'Good', 'Valid', '2026-07-10', '2027-01-10', 'CERT-CAL-2026-0711', '2026-09-08', '2025-03-15', NULL, 'Accuracy 0.003mm, IP42 dust/water proof, Digimatic output for SPC logging');

-- ====================================================================
-- 13. SEED DATA: TOOL MOVEMENTS
-- ====================================================================
INSERT INTO `tool_movements` (`id`, `tool_id`, `tool_code`, `tool_name`, `movement_type`, `borrower_name`, `borrower_id`, `from_site`, `to_site`, `work_order`, `checkout_date`, `expected_return_date`, `actual_return_date`, `status`, `approved_by`, `notes`) VALUES
('MOV-2026-0101', 'TOOL-002', 'ATZ-TRQ-402', 'Square Drive Hydraulic Torque Wrench 7,800 Nm', 'Check-Out', 'Reza Pratama', 'EMP-4491', 'Site ISC', 'Site OKI I', 'WO-2026-OKI-041', '2026-10-18 09:30:00', '2026-11-05', NULL, 'Active', 'Hendro Wibowo', 'Overhaul Line 1 Digester Flange Assembly'),
('MOV-2026-0102', 'TOOL-003', 'ATZ-ALN-101', 'Precision Laser Shaft Alignment System', 'Check-Out', 'Dedi Kurniawan', 'EMP-3820', 'Site ISC', 'Site IKPP', 'WO-2026-IKPP-109', '2026-10-20 14:15:00', '2026-10-30', NULL, 'Active', 'Bambang Santoso', 'Main feed pump motor-gearbox alignment check'),
('MOV-2026-0103', 'TOOL-006', 'ATZ-TNS-301', 'Multi-Stud Bolt Tensioner Set M48 - M64', 'Check-Out', 'Fajar Nugraha', 'EMP-5102', 'Site OKI II', 'Site OKI II', 'WO-2026-OKI-044', '2026-10-22 08:00:00', '2026-10-28', NULL, 'Active', 'Reza Pratama', 'Recovery boiler feed pump flange tightening'),
('MOV-2026-0104', 'TOOL-009', 'ATZ-GAS-801', 'Confined Space 4-Gas Detector with Sampling Pump', 'Check-Out', 'Agus Supriyadi', 'EMP-2918', 'Site IKPD', 'Site IKPD', 'WO-2026-IKPD-081', '2026-10-21 11:45:00', '2026-10-27', NULL, 'Active', 'Agus Supriyadi', 'Tank entry inspection at liquor storage tank'),
('MOV-2026-0098', 'TOOL-001', 'ATZ-TRQ-401', 'Hydraulic Torque Wrench Low Profile 4,500 Nm', 'Check-In', 'Dedi Kurniawan', 'EMP-3820', 'Site IKPP', 'Site ISC', 'WO-2026-IKPP-098', '2026-09-12 10:00:00', '2026-09-25', '2026-09-24 16:30:00', 'Returned', 'Bambang Santoso', 'Returned clean and verified with post-job function test'),
('MOV-2026-0095', 'TOOL-005', 'ATZ-PMP-501', 'Ultra-High Pressure Hydraulic Electric Pump 1,500 Bar', 'Transfer', 'Siti Rahmawati', 'EMP-6204', 'Site ISC', 'Site TELL', 'TRF-2026-044', '2026-09-15 09:00:00', 'N/A', '2026-09-16 11:20:00', 'Returned', 'Hendro Wibowo', 'Inter-site fleet re-allocation via official Surat Jalan');

-- ====================================================================
-- 14. SEED DATA: INSPECTIONS
-- ====================================================================
INSERT INTO `inspections` (`id`, `tool_id`, `tool_code`, `tool_name`, `inspection_date`, `inspector_name`, `inspector_id`, `site_name`, `verdict`, `calibration_valid`, `certificate_no`, `checklist_json`, `findings`, `next_inspection_due`) VALUES
('INSP-2026-0312', 'TOOL-001', 'ATZ-TRQ-401', 'Hydraulic Torque Wrench Low Profile 4,500 Nm', '2026-09-20', 'Siti Rahmawati', 'EMP-6204', 'Site ISC', 'Pass', 1, 'INSP-CERT-2026-0312', '{"cleanliness": "Pass", "gaugeAndSeals": "Pass", "quickCouplers": "Pass", "cablesAndHoses": "Pass", "physicalHousing": "Pass", "electricalSafety": "N/A"}', 'Tool is in prime operational condition. O-ring seals lubricated with silicone grease.', '2026-12-20'),
('INSP-2026-0310', 'TOOL-007', 'ATZ-FLG-601', 'Hydraulic Flange Spreader Wedge 14 Ton', '2026-09-14', 'Bambang Santoso', 'EMP-1029', 'Site ISC', 'Fail', 0, 'INSP-DEFECT-2026-004', '{"cleanliness": "Pass", "gaugeAndSeals": "Pass", "quickCouplers": "Fail", "cablesAndHoses": "Fail", "physicalHousing": "Pass", "electricalSafety": "N/A"}', 'Micro-leakage detected at female hydraulic quick coupler fitting under 500 bar pressure. Quarantined for coupler replacement.', '2026-10-14'),
('INSP-2026-0305', 'TOOL-008', 'ATZ-ELC-701', 'Digital 5kV Insulation Resistance Tester (Megger)', '2026-10-02', 'Siti Rahmawati', 'EMP-6204', 'Site TELL', 'Pass', 1, 'INSP-CERT-2026-0305', '{"cleanliness": "Pass", "gaugeAndSeals": "Pass", "quickCouplers": "N/A", "cablesAndHoses": "Pass", "physicalHousing": "Pass", "electricalSafety": "Pass"}', 'Leads continuity verified against 10M test resistor. Display and backlighting fully functional.', '2027-01-02');

-- ====================================================================
-- 15. SEED DATA: HISTORICAL LOGS
-- ====================================================================
INSERT INTO `historical_logs` (`id`, `timestamp`, `event_type`, `tool_code`, `tool_name`, `user_name`, `site_name`, `details`) VALUES
('HIST-001', '2026-10-22 08:00:15', 'Check-Out', 'ATZ-TNS-301', 'Multi-Stud Bolt Tensioner Set M48 - M64', 'Fajar Nugraha', 'Site OKI II', 'Tool checked out for WO-2026-OKI-044 (Recovery boiler feed pump tightening)'),
('HIST-002', '2026-10-21 11:45:00', 'Check-Out', 'ATZ-GAS-801', 'Confined Space 4-Gas Detector with Sampling Pump', 'Agus Supriyadi', 'Site IKPD', 'Tool checked out for WO-2026-IKPD-081 (Liquor tank entry inspection)'),
('HIST-003', '2026-10-20 14:15:22', 'Check-Out', 'ATZ-ALN-101', 'Precision Laser Shaft Alignment System', 'Dedi Kurniawan', 'Site IKPP', 'Tool checked out for WO-2026-IKPP-109 (Feed pump motor-gearbox alignment)'),
('HIST-004', '2026-10-18 09:30:10', 'Check-Out', 'ATZ-TRQ-402', 'Square Drive Hydraulic Torque Wrench 7,800 Nm', 'Reza Pratama', 'Site OKI I', 'Tool checked out for WO-2026-OKI-041 (Digester flange assembly)'),
('HIST-005', '2026-10-15 16:20:00', 'Inspection', 'ATZ-VIB-201', 'Triaxial Vibration Analyzer & Data Collector', 'Bambang Santoso', 'Site ISC', 'Periodic routine inspection completed. Status updated to In Inspection for calibration check.'),
('HIST-006', '2026-10-10 11:00:00', 'Register', 'ATZ-DIL-901', 'Digital Dial Indicator 0.001mm with Magnetic Base', 'Hendro Wibowo', 'Site OKI I', 'New tool inducted into fleet inventory under MAT-8831005'),
('HIST-007', '2026-10-02 10:15:00', 'Inspection', 'ATZ-ELC-701', 'Digital 5kV Insulation Resistance Tester (Megger)', 'Siti Rahmawati', 'Site TELL', 'Routine safety inspection PASSED. Certificate INSP-CERT-2026-0305 issued.'),
('HIST-008', '2026-09-24 16:30:00', 'Check-In', 'ATZ-TRQ-401', 'Hydraulic Torque Wrench Low Profile 4,500 Nm', 'Dedi Kurniawan', 'Site ISC', 'Returned from Site IKPP in clean condition. Verified functional.');
