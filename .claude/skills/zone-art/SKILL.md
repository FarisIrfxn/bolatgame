---
name: zone-art
description: Art pass for a Pokélove overworld zone (map) - restyling, adding or fixing props, ground, roads, water, grass, lighting, colliders around props, generating textures or 3D models with ComfyUI. Use whenever the task is about how a zone/map looks or is laid out, even a single prop.
---

Read `docs/ZONE_ART_GUIDE.md` first and follow its workflow (section 4) and definition of done
(section 6). Labu Lanjut is the finished reference zone. Faris's visual decisions and the progress log
live in `GAME_VISION.md` (sections 6 and 13); asset tooling details in `pipeline/README.md`.

Before building anything that changes a zone's layout, show Faris 2-3 ASCII layout options.
After any change, run `node pipeline/audit/check.mjs --zone <id>` and review grid screenshots from
`node pipeline/audit/shots.mjs` (dev server on port 5181 must be running).
