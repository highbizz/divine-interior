<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

// JSON columns to decode on read
$JSON_COLS = ['tags', 'images', 'options', 'variants'];

function decode_json_cols(array $row, array $cols): array {
    foreach ($cols as $col) {
        if (isset($row[$col]) && is_string($row[$col])) {
            $row[$col] = json_decode($row[$col], true) ?? [];
        }
    }
    return $row;
}

// ─── GET (list or single) ─────────────────────────────────
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Product not found', 404);
        json_success(decode_json_cols($row, $JSON_COLS));
    }

    $page     = (int) ($_GET['page']    ?? 1);
    $per      = (int) ($_GET['per_page'] ?? 50);
    $search   = $_GET['search']   ?? '';
    $category = $_GET['category'] ?? '';
    $active   = $_GET['active']   ?? '';
    $slug     = $_GET['slug']     ?? '';

    $conds = [];
    $vals  = [];

    // Single product by slug
    if ($slug !== '') {
        $stmt = $db->prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if (!$row) json_error('Product not found', 404);
        json_success(decode_json_cols($row, $JSON_COLS));
    }

    if ($search !== '') {
        $conds[] = '(title LIKE ? OR sku LIKE ?)';
        $vals[]  = "%$search%";
        $vals[]  = "%$search%";
    }
    if ($category !== '' && $category !== 'all') {
        $conds[] = 'category = ?';
        $vals[]  = $category;
    }
    if ($active !== '') {
        $conds[] = 'is_active = ?';
        $vals[]  = (int) $active;
    }

    $where  = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $offset = ($page - 1) * $per;

    $count = $db->prepare("SELECT COUNT(*) FROM products $where");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM products $where ORDER BY created_at DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = array_map(fn($r) => decode_json_cols($r, $JSON_COLS), $stmt->fetchAll());

    json_success([
        'items'       => $rows,
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $per,
        'total_pages' => (int) ceil($total / $per),
    ]);
}

// All write ops require auth
require_auth();
$body = get_body();

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    $required = ['title', 'slug', 'price', 'category'];
    foreach ($required as $f) {
        if (empty($body[$f])) json_error("Field '$f' is required");
    }

    // Check slug unique
    $chk = $db->prepare('SELECT id FROM products WHERE slug = ?');
    $chk->execute([$body['slug']]);
    if ($chk->fetch()) json_error('Slug already exists');

    try {
        $stmt = $db->prepare('
            INSERT INTO products
              (title,slug,description,price,compare_at_price,currency,category,tags,images,stock,sku,is_active,is_featured,options,variants)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ');
        $stmt->execute([
            $body['title'],
            $body['slug'],
            $body['description']      ?? '',
            (float) $body['price'],
            isset($body['compare_at_price']) && $body['compare_at_price'] !== '' && $body['compare_at_price'] !== null
                ? (float) $body['compare_at_price'] : null,
            $body['currency']         ?? 'INR',
            $body['category'],
            json_encode($body['tags']     ?? []),
            json_encode($body['images']   ?? []),
            (int) ($body['stock']     ?? 0),
            !empty($body['sku'])      ? $body['sku'] : null,
            (int) ($body['is_active']    ?? 1),
            (int) ($body['is_featured']  ?? 0),
            json_encode($body['options']  ?? []),
            json_encode($body['variants'] ?? []),
        ]);

        $newId = (int) $db->lastInsertId();
        $stmt  = $db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$newId]);
        json_success(decode_json_cols($stmt->fetch(), $JSON_COLS), 201);
    } catch (PDOException $e) {
        json_error('Failed to create product: ' . $e->getMessage(), 500);
    }
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    // Check slug unique (excluding self)
    if (!empty($body['slug'])) {
        $chk = $db->prepare('SELECT id FROM products WHERE slug = ? AND id != ?');
        $chk->execute([$body['slug'], $id]);
        if ($chk->fetch()) json_error('Slug already exists');
    }

    $fields = [];
    $vals   = [];

    $map = [
        'title' => 'title', 'slug' => 'slug', 'description' => 'description',
        'price' => 'price', 'compare_at_price' => 'compare_at_price',
        'currency' => 'currency', 'category' => 'category',
        'stock' => 'stock', 'sku' => 'sku',
        'is_active' => 'is_active', 'is_featured' => 'is_featured',
    ];
    $jsonMap = ['tags', 'images', 'options', 'variants'];

    foreach ($map as $k => $col) {
        if (array_key_exists($k, $body)) {
            $fields[] = "`$col` = ?";
            if ($k === 'compare_at_price') {
                $vals[] = (isset($body[$k]) && $body[$k] !== '' && $body[$k] !== null) ? (float) $body[$k] : null;
            } elseif ($k === 'price') {
                $vals[] = (float) $body[$k];
            } elseif (in_array($k, ['stock','is_active','is_featured'])) {
                $vals[] = (int) $body[$k];
            } elseif ($k === 'sku') {
                $vals[] = !empty($body[$k]) ? $body[$k] : null;
            } else {
                $vals[] = $body[$k];
            }
        }
    }
    foreach ($jsonMap as $k) {
        if (array_key_exists($k, $body)) {
            $fields[] = "`$k` = ?";
            $vals[]   = json_encode(is_array($body[$k]) ? $body[$k] : []);
        }
    }

    if (!$fields) json_error('No fields to update');

    try {
        $vals[] = $id;
        $db->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

        $stmt = $db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Product not found', 404);
        json_success(decode_json_cols($row, $JSON_COLS));
    } catch (PDOException $e) {
        json_error('Failed to update product: ' . $e->getMessage(), 500);
    }
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
