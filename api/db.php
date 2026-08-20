<?php
require_once __DIR__ . '/config.php';

function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        json_error('Database connection failed: ' . $e->getMessage(), 500);
    }

    return $pdo;
}

// ─── Response helpers ──────────────────────────────────────
function json_success($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

function json_error(string $message, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// ─── Request body ──────────────────────────────────────────
function get_body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ─── Pagination helper ─────────────────────────────────────
function paginate(PDO $db, string $table, array $where = [], int $page = 1, int $per = 20): array {
    $page  = max(1, $page);
    $per   = min(100, max(1, $per));
    $offset = ($page - 1) * $per;

    $cond  = '';
    $vals  = [];
    if ($where) {
        $parts = array_map(fn($k) => "`$k` = ?", array_keys($where));
        $cond  = 'WHERE ' . implode(' AND ', $parts);
        $vals  = array_values($where);
    }

    $count = $db->prepare("SELECT COUNT(*) FROM `$table` $cond");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM `$table` $cond ORDER BY `created_at` DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = $stmt->fetchAll();

    return [
        'items'       => $rows,
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $per,
        'total_pages' => (int) ceil($total / $per),
    ];
}
