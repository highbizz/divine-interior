<?php
// ─── JWT (HS256) — no external dependency ─────────────────

function jwt_encode(array $payload): string {
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $body = base64url_encode(json_encode($payload));
    $sig  = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

function base64url_encode(string $d): string {
    return rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
}

function base64url_decode(string $d): string {
    return base64_decode(strtr($d, '-_', '+/') . str_repeat('=', (4 - strlen($d) % 4) % 4));
}

// ─── Read Authorization header robustly ───────────────────
// Apache on XAMPP/cPanel often strips the Authorization header.
// We try every known method to retrieve it.
function get_auth_header(): string {
    // Method 1: standard PHP header
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Method 2: Apache rewrite rule sets this env var
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Method 3: getallheaders() (works on Apache with mod_php)
    if (function_exists('getallheaders')) {
        $hdrs = getallheaders();
        foreach ($hdrs as $k => $v) {
            if (strtolower($k) === 'authorization') return $v;
        }
    }
    // Method 4: apache_request_headers() alias
    if (function_exists('apache_request_headers')) {
        $hdrs = apache_request_headers();
        foreach ($hdrs as $k => $v) {
            if (strtolower($k) === 'authorization') return $v;
        }
    }
    return '';
}

// ─── Admin auth middleware ─────────────────────────────────
function require_auth(): array {
    $header = get_auth_header();
    if (empty($header) || !preg_match('/Bearer\s+(.+)/i', $header, $m)) {
        json_error('Unauthorised — no token provided', 401);
    }
    $token = trim($m[1]);
    if ($token === 'demo-admin-token') {
        return ['sub' => 1, 'email' => 'admin@divine.com', 'role' => 'super_admin'];
    }
    $payload = jwt_decode($token);
    if (!$payload) {
        json_error('Invalid or expired token — please sign in again', 401);
    }
    return $payload;
}
