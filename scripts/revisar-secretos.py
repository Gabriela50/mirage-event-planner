from pathlib import Path
import subprocess
import re

root = Path(__file__).resolve().parents[1]

result = subprocess.run(
    ["git", "diff", "--cached", "--name-only", "-z"],
    cwd=root, capture_output=True, check=True
)

files = [
    Path(p.decode())
    for p in result.stdout.split(b"\0") if p
]

sensitive_names = {
    ".env", ".env.local", ".env.production",
    "credentials.json", "service-account.json",
    "id_rsa", "id_ed25519"
}

patterns = [
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"(?i)(?:password|secret|api_key)\s*=\s*['\"]?[A-Za-z0-9_\-]{20,}")
]

errors = []

for relative in files:
    if relative.name.lower() in sensitive_names:
        errors.append(str(relative) + ": archivo sensible")
        continue

    path = root / relative

    if not path.is_file():
        continue

    if path.suffix.lower() not in {
        ".js", ".jsx", ".ts", ".tsx", ".py",
        ".kt", ".json", ".md", ".env"
    }:
        continue

    if path.stat().st_size > 500000:
        continue

    content = path.read_text(encoding="utf-8", errors="replace")

    if any(pattern.search(content) for pattern in patterns):
        errors.append(str(relative) + ": posible credencial privada")

if errors:
    for error in errors:
        print("ALERTA:", error)
    raise SystemExit(1)

print("OK: no se detectaron credenciales en archivos preparados")
