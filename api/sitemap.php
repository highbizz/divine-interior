<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/xml; charset=utf-8');

$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . ($_SERVER['HTTP_HOST'] ?? 'officefurnisho.com');

$db = get_db();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Static Pages
$staticPages = [
    '' => ['freq' => 'daily', 'priority' => '1.0'],
    '/shop' => ['freq' => 'daily', 'priority' => '0.9'],
    '/about' => ['freq' => 'monthly', 'priority' => '0.7'],
    '/contact' => ['freq' => 'monthly', 'priority' => '0.7'],
    '/sale' => ['freq' => 'weekly', 'priority' => '0.8'],
    '/blogs' => ['freq' => 'daily', 'priority' => '0.8'],
];

foreach ($staticPages as $path => $meta) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($baseUrl . $path) . "</loc>\n";
    echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    echo "    <changefreq>" . $meta['freq'] . "</changefreq>\n";
    echo "    <priority>" . $meta['priority'] . "</priority>\n";
    echo "  </url>\n";
}

// Dynamic Published Blogs
try {
    $stmt = $db->query("SELECT slug, updated_at, created_at FROM blogs WHERE status = 'published' ORDER BY created_at DESC");
    while ($row = $stmt->fetch()) {
        $date = !empty($row['updated_at']) ? date('Y-m-d', strtotime($row['updated_at'])) : date('Y-m-d');
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . "/blog/" . $row['slug']) . "</loc>\n";
        echo "    <lastmod>" . $date . "</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }
} catch (\Throwable $e) {}

// Dynamic Products
try {
    $stmt = $db->query("SELECT handle, updated_at FROM products WHERE is_active = 1 ORDER BY id DESC");
    while ($row = $stmt->fetch()) {
        $date = !empty($row['updated_at']) ? date('Y-m-d', strtotime($row['updated_at'])) : date('Y-m-d');
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . "/product/" . $row['handle']) . "</loc>\n";
        echo "    <lastmod>" . $date . "</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.9</priority>\n";
        echo "  </url>\n";
    }
} catch (\Throwable $e) {}

echo '</urlset>';
