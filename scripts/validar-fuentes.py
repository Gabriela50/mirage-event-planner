from pathlib import Path
root = Path(__file__).resolve().parents[1]
required = ['src/App.jsx', 'server/db/pool.js', 'package.json']
for name in required:
    path = root / name
    assert path.is_file(), 'Falta: ' + name
    assert path.stat().st_size > 0, 'Archivo vacio: ' + name
    print('OK:', name)
print('Fuentes esenciales verificadas.')
