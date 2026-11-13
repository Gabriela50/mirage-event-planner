from pathlib import Path
from html.parser import HTMLParser

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
html = dist / "index.html"
assert html.is_file(), "Falta compilar MIRAGE"

class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.files = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        url = values.get("src") or values.get("href", "")
        if url.endswith((".js", ".css")):
            self.files.append(url)

parser = Assets()
parser.feed(html.read_text())
assert parser.files, "No hay recursos JS/CSS"
for asset in parser.files:
    assert (dist / asset.lstrip("/.")).is_file(), "Falta " + asset
print("OK: distribución web de MIRAGE")
