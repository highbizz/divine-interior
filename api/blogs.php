<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

// ─── Auto Create & Seed Blogs Table ────────────────────────
try {
    $db->exec("CREATE TABLE IF NOT EXISTS `blogs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `slug` VARCHAR(255) NOT NULL UNIQUE,
        `excerpt` TEXT NULL,
        `content` LONGTEXT NULL,
        `cover_image` TEXT NULL,
        `author` VARCHAR(100) DEFAULT 'Admin',
        `tags` TEXT NULL,
        `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        `meta_title` VARCHAR(255) NULL,
        `meta_description` TEXT NULL,
        `views` INT DEFAULT 0,
        `published_at` DATETIME NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Check count and seed if empty
    $chkCount = $db->query("SELECT COUNT(*) FROM `blogs`")->fetchColumn();
    if ((int)$chkCount === 0) {
        $seedStmt = $db->prepare("INSERT INTO `blogs` 
            (title, slug, excerpt, content, cover_image, author, tags, status, meta_title, meta_description, views, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, NOW())");
        
        $seedStmt->execute([
            "The Ultimate Guide to Ergonomic Seating: How to Choose the Right Office Chair for Posture & Productivity",
            "ultimate-guide-to-ergonomic-seating",
            "Discover how proper lumbar support, adjustable 4D armrests, dynamic tilt mechanisms, and breathable mesh transform long working hours into a comfortable, pain-free experience.",
            "<p class=\"lead text-lg text-stone-700 leading-relaxed mb-6\">In today’s modern workspace environment, professionals spend an average of 7 to 10 hours seated at their desks. Sitting for extended periods on unsupportive chairs often leads to chronic spinal misalignment, lower back strain, shoulder tension, and reduced daily focus.</p><h3 class=\"text-xl font-medium text-stone-900 mt-8 mb-4\">1. The Role of Lumbar Support in Spinal Alignment</h3><p class=\"mb-4\">Your lower spine possesses a natural inward curve. When sitting without adequate lower back support, your pelvis tilts backward, causing your spine to flatten and posture to slump. Premium ergonomic task chairs feature height and depth adjustable lumbar supports that align precisely with the S-curve of your spine.</p><ul class=\"list-disc pl-6 space-y-2 mb-6 text-stone-700\"><li><strong>Adjustable Lumbar Height:</strong> Positions pressure-relieving cushion exactly at lower back curvature.</li><li><strong>Adaptive Tension:</strong> Responds smoothly to body weight while maintaining core stabilization.</li></ul><h3 class=\"text-xl font-medium text-stone-900 mt-8 mb-4\">2. Breathable High-Performance Mesh vs. Traditional Foam</h3><p class=\"mb-4\">Thermal regulation plays a major role in workday comfort. High-tension elastomeric mesh allows continuous airflow, preventing heat buildup during intensive work hours.</p>",
            "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
            "Office Furnisho Ergonomics Team",
            json_encode(["Ergonomics", "Office Comfort", "Buying Guide"]),
            "Ultimate Guide to Ergonomic Seating | Office Furnisho",
            "Learn how to choose the right ergonomic office chair for posture support and workplace productivity.",
            1420
        ]);

        $seedStmt->execute([
            "Designing a Modern Executive Workspace: Balancing Luxury Aesthetics with Everyday Functionality",
            "designing-modern-executive-workspace",
            "Explore key interior layout principles, premium materials, and ergonomic seating strategies for building executive offices that project prestige and inspire high productivity.",
            "<p class=\"lead text-lg text-stone-700 leading-relaxed mb-6\">An executive office serves as a command center, consultation room, and brand signature all in one. Achieving the ideal synergy between sophisticated minimalism, architectural elegance, and ergonomic functionality requires thoughtful spatial planning.</p><h3 class=\"text-xl font-medium text-stone-900 mt-8 mb-4\">1. Defining Functional Zones in Executive Offices</h3><p class=\"mb-4\">Modern executive spaces are no longer static desk rooms. Top corporate interiors divide executive offices into three distinct functional zones.</p>",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            "Design & Interiors Desk",
            json_encode(["Interior Design", "Executive Suite", "Workspace Trends"]),
            "Designing a Modern Executive Workspace | Office Furnisho",
            "Discover spatial planning and seating ideas for contemporary executive offices.",
            980
        ]);

        $seedStmt->execute([
            "Mesh vs. Leather Office Chairs: Which Seating Option is Right for Your Business?",
            "mesh-vs-leather-office-chairs",
            "A comprehensive side-by-side comparison of breathability, long-term durability, maintenance requirements, and ergonomic features of mesh vs. leather task seating.",
            "<p class=\"lead text-lg text-stone-700 leading-relaxed mb-6\">Selecting office seating for your team or personal study often comes down to one fundamental material choice: breathable engineered mesh or classic leather. Both options offer distinct visual appeal and physical benefits.</p>",
            "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1200&q=80",
            "Furniture Specialist",
            json_encode(["Chair Comparison", "Office Comfort", "Buyer Guide"]),
            "Mesh vs Leather Office Chairs Comparison | Office Furnisho",
            "Compare mesh and leather office chairs for breathability, comfort, and durability.",
            1150
        ]);
    }
} catch (\Throwable $e) {
    // Continue gracefully
}

function decode_blog(array $row): array {
    if (isset($row['tags']) && is_string($row['tags'])) {
        $row['tags'] = json_decode($row['tags'], true) ?? [];
    }
    return $row;
}

// ─── GET (public for published, all for auth) ─────────────
if ($method === 'GET') {
    $authed = false;
    try {
        require_auth();
        $authed = true;
    } catch (\Throwable $e) {}

    if ($id) {
        // Increment views for public GET
        if (!$authed) {
            $db->prepare('UPDATE blogs SET views = views + 1 WHERE id = ?')->execute([$id]);
        }
        $stmt = $db->prepare('SELECT * FROM blogs WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Blog not found', 404);
        json_success(decode_blog($row));
    }

    $page   = (int) ($_GET['page']     ?? 1);
    $per    = (int) ($_GET['per_page'] ?? 50);
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';

    $conds = [];
    $vals  = [];

    if (!$authed) {
        $conds[] = "status = 'published'";
    } elseif ($status !== '' && $status !== 'all') {
        $conds[] = 'status = ?';
        $vals[]  = $status;
    }
    if ($search !== '') {
        $conds[] = '(title LIKE ? OR author LIKE ? OR tags LIKE ?)';
        $vals    = array_merge($vals, ["%$search%", "%$search%", "%$search%"]);
    }

    $where  = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $offset = ($page - 1) * $per;

    $count = $db->prepare("SELECT COUNT(*) FROM blogs $where");
    $count->execute($vals);
    $total = (int) $count->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM blogs $where ORDER BY created_at DESC LIMIT $per OFFSET $offset");
    $stmt->execute($vals);
    $rows = array_map('decode_blog', $stmt->fetchAll());

    json_success(['items' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $per, 'total_pages' => (int)ceil($total/$per)]);
}

// Write ops require auth
require_auth();
$body = get_body();

// ─── POST (create) ────────────────────────────────────────
if ($method === 'POST') {
    if (empty($body['title']) || empty($body['slug'])) {
        json_error('Title and slug are required');
    }

    $chk = $db->prepare('SELECT id FROM blogs WHERE slug = ?');
    $chk->execute([$body['slug']]);
    if ($chk->fetch()) json_error('Slug already exists');

    $publishedAt = ($body['status'] === 'published' && empty($body['published_at']))
        ? date('Y-m-d H:i:s')
        : ($body['published_at'] ?? null);

    $stmt = $db->prepare('
        INSERT INTO blogs
          (title,slug,excerpt,content,cover_image,author,tags,status,meta_title,meta_description,published_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $body['title'],
        $body['slug'],
        $body['excerpt']          ?? '',
        $body['content']          ?? '',
        $body['cover_image']      ?? null,
        $body['author']           ?? 'Admin',
        json_encode($body['tags'] ?? []),
        $body['status']           ?? 'draft',
        $body['meta_title']       ?? null,
        $body['meta_description'] ?? null,
        $publishedAt,
    ]);

    $newId = (int) $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$newId]);
    json_success(decode_blog($stmt->fetch()), 201);
}

// ─── PUT (update) ─────────────────────────────────────────
if ($method === 'PUT' && $id) {
    if (!empty($body['slug'])) {
        $chk = $db->prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?');
        $chk->execute([$body['slug'], $id]);
        if ($chk->fetch()) json_error('Slug already exists');
    }

    $fields = [];
    $vals   = [];
    $allowed = ['title','slug','excerpt','content','cover_image','author','status','meta_title','meta_description','published_at'];

    foreach ($allowed as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $body[$f];
        }
    }
    if (array_key_exists('tags', $body)) {
        $fields[] = '`tags` = ?';
        $vals[]   = json_encode($body['tags']);
    }
    // Auto-set published_at when status changes to published
    if (($body['status'] ?? '') === 'published') {
        $chk = $db->prepare('SELECT published_at FROM blogs WHERE id = ?');
        $chk->execute([$id]);
        $existing = $chk->fetch();
        if (!$existing['published_at']) {
            $fields[] = '`published_at` = ?';
            $vals[]   = date('Y-m-d H:i:s');
        }
    }

    if (!$fields) json_error('Nothing to update');
    $vals[] = $id;
    $db->prepare('UPDATE blogs SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

    $stmt = $db->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
    json_success(decode_blog($stmt->fetch()));
}

// ─── DELETE ───────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    $db->prepare('DELETE FROM blogs WHERE id = ?')->execute([$id]);
    json_success(['deleted' => true]);
}

json_error('Method not allowed', 405);
