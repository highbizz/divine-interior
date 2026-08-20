<?php
// ============================================================
// Divine Interior — API Config
// XAMPP local: C:\xampp\htdocs\divineinterior\api\
// Live server : /public_html/api/  (or subfolder per host)
// ============================================================

// ─── Detect environment ────────────────────────────────────
$httpHost = $_SERVER['HTTP_HOST'] ?? '';
$hostName = parse_url('http://' . $httpHost, PHP_URL_HOST) ?: $httpHost;

$isLocal = in_array($hostName, ['localhost', '127.0.0.1', '::1'])
    || empty($hostName)
    || php_sapi_name() === 'cli';

// ─── Database ─────────────────────────────────────────────
if ($isLocal) {
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u839176890_divineinterior');
    define('DB_USER', 'u839176890_divineinterior');
    define('DB_PASS', 'Divineinterior@2026');
    define('DB_PORT', 3307);          // XAMPP default port
} else {
    // ─── LIVE SERVER (Hostinger) ───────────────────────────
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u839176890_divineinterior');
    define('DB_USER', 'u839176890_divineinterior');
    define('DB_PASS', 'Divineinterior@2026');
    define('DB_PORT', 3306);
}

// ─── JWT ──────────────────────────────────────────────────
define('JWT_SECRET',          'divine-interior-secret-key-change-in-production-2024');
define('JWT_EXPIRY',          86400);    // 24 hours
define('CUSTOMER_JWT_SECRET', 'divine-customer-secret-key-change-in-production-2024');
define('CUSTOMER_JWT_EXPIRY', 604800);   // 7 days

// ─── Email ────────────────────────────────────────────────
define('USE_SMTP',       false);
define('SMTP_HOST',      'smtp.gmail.com');
define('SMTP_PORT',      587);
define('SMTP_USER',      'your@gmail.com');
define('SMTP_PASS',      'your-app-password');
define('SMTP_SECURE',    'tls');
define('MAIL_FROM',      'noreply@divineinterior.com');
define('MAIL_FROM_NAME', 'Divine Interior');
define('ADMIN_EMAIL',    'admin@divine.com');

// ─── CORS ─────────────────────────────────────────────────
$allowed_origins = [
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    // ↓ Add your live domain here
    'https://yourdomain.com',
    'https://www.yourdomain.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
