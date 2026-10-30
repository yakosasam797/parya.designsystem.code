"""Validate original brand files and rebuild deterministic download packs (stdlib only)."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib
import json
import struct
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
public = root / "apps/docs/public"
source = root / "apps/docs/src/brand/manifest.json"
manifest = json.loads(source.read_text(encoding="utf8"))
groups = {group["id"] for group in manifest["groups"]}
hashes = set()
files = []
for variant in manifest["variants"]:
    assert variant["group"] in groups and variant["files"], variant["id"]
    for extension, entry in variant["files"].items():
        path = (public / entry["path"]).resolve()
        assert path.is_relative_to(public.resolve()), entry["path"]
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        assert digest == entry["sha256"] and len(data) == entry["bytes"], path
        assert digest not in hashes, f"Duplicate original file: {path}"
        hashes.add(digest)
        if extension == "png":
            assert data[:8] == b"\x89PNG\r\n\x1a\n", path
            dimensions = struct.unpack(">II", data[16:24])
        else:
            svg = ET.fromstring(data)
            dimensions = (int(svg.get("width")), int(svg.get("height")))
        assert dimensions == (entry.get("width", variant["width"]), entry.get("height", variant["height"])), path
        files.append((extension, entry["path"].removeprefix("brand/"), data))

(public / "brand/manifest.json").write_bytes(source.read_bytes())
common = [("README.md", (public / "brand/README.md").read_bytes()),
          ("manifest.json", source.read_bytes())]
for pack in ["all", "svg", "png"]:
    members = common + [(name, data) for ext, name, data in files if pack == "all" or ext == pack]
    destination = public / f"brand/paryatech-logos-{pack}.zip"
    with ZipFile(destination, "w") as archive:
        for name, data in sorted(members):
            info = ZipInfo(name, (2026, 10, 29, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    with ZipFile(destination) as archive:
        assert set(archive.namelist()) == {name for name, _ in members}
        for name, data in members:
            assert archive.read(name) == data, name
    print(f"Verified {pack} pack: {len(members) - len(common)} original files")
print(f"Validated {len(manifest['variants'])} variants / {len(files)} unique files; original bytes and dimensions match.")
