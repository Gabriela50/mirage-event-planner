#!/usr/bin/env python3
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
tracked = subprocess.check_output(
    ["git", "ls-files", "-z"], cwd=root
).split(b"\0")

blocked = {
    ".env", ".env.local", ".env.production",
    "credentials.json", "service-account.json",
    "id_rsa", "id_ed25519"
}

found = []
for raw in tracked:
    if not raw:
        continue
    relative = Path(raw.decode())
    if relative.name.lower() in blocked:
        found.append(str(relative))

if found:
    print("ALERTA: posibles archivos sensibles versionados:")
    for item in found:
        print(" -", item)
    raise SystemExit(1)

print("OK: no se encontraron nombres de archivos sensibles versionados.")
