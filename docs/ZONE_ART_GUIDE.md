# Zone Art Guide: making a Pokélove map look right

Read this before you touch how any overworld zone looks. It is the concept, the code map and the
step-by-step workflow that turned Labu Lanjut (the reference zone) from flat primitives into the
finished look. Other zones still have to go through the same steps.

Context: `GAME_VISION.md` (story, zones, decisions; section 6 = visual style, section 13 = log).
Asset pipeline details and benchmarks: `pipeline/README.md`.

---

## 1. The look we want

- **Reference:** `ref/style_ref_yono.webp` (Yono and the Celestial Elephants / Pokémon Let's Go).
  The anchor frame for this game is `art/style/anchor_painted_00003.png`. The finished example is
  Labu Lanjut: `art/style/labu_final_audit.png`.
- **World:** soft, rounded, chunky 3D. Every surface wears a **hand-painted texture** (painted grass
  with light-to-dark gradients, painted wood grain, tiles, sand). Nothing is a flat single colour
  and nothing has a sharp unrounded edge.
- **Light:** warm and soft. Shadows are a gentle colour shift (warm light, lilac shadow), never dark
  holes. Light tilt-shift at the top and bottom of the screen.
- **Characters:** stay **2D paper cutouts** drawn from Qish's own doodles (thick black outline). Do not
  turn them into 3D.
- **Blending is the whole game.** Faris's complaints were always about things that do not blend:
  hard-edged roads and slabs, sharp grass cones, models lit differently to the ground, props poking
  through each other, things floating. Check for all of these every time.

What Faris rejected, so do not do it again:
- Flat-colour primitives (boxes, cones, icosahedrons) as visible props. "Sampah."
- A clean "style B" toon look with no painted textures. "Masih x smooth."
- Rectangular road, path or parking slabs on top of grass. "Bentuk obvious x blend."
- Signposted gates to the next zone. He wants Qish to discover exits herself.

His layout preferences (zones are revisited one by one): no left-to-right corridor zones; put the
centrepiece in the middle, vary entry and exit sides, and offer him layout options as ASCII
previews before you build.

## 2. How it works in code (`game/src/overworld/`)

| File | What it does |
|---|---|
| `style.ts` | Palette `PAL` and `toonify()`: after a zone builds, every Lambert/Phong/Standard material becomes `MeshToonMaterial` with a soft two-band ramp. You build props with plain `flat(color)` or Lambert materials and they still match. |
| `textures.ts` | Preloads the painted textures (`public/assets/textures/*.webp`). `painted(name, w, h, metres)` / `paintedMat(...)` give a texture repeating every N metres. |
| `splat.ts` | `splatGround(area, paint)`: ONE ground mesh that mixes grass / dirt / tar / pavers through a soft canvas mask with wobbly edges and paint-dab break-up in the shader. **Every road, path, parking pad, worn patch and river bank goes in here, never as a slab.** |
| `models.ts` | Decodes generated GLBs for the current zone only (`ZONE_MODELS`); retains models shared with the next zone and releases the others, including decoded bitmaps. `model(id, size, "length" or "height")` and `modelBox(id, w, h, d, turn?)` give a placed copy, or `null` as a hand-built fallback. It strips TRELLIS's normal/PBR maps and keeps only colour. `frontZ(obj, x, y)` raycasts a model's front face. Buildings and trees get `userData.fade`. |
| `overworld.ts` | `updateFade()` turns faded props 30% see-through when they hide Qish from the camera. `runExit()` spirals out to a free spot if an exit's "back" point is blocked. |
| `merge.ts` | `mergeStatic()` bakes static props into few draw calls. Fading props are kept whole. `window.__noMerge` (dev) turns baking off for measuring. |
| `props.ts` | Shared prop builders (palm, bush, bench, lamp, sign, myvi, flower bed, ...). Each tries `model()` first and keeps a hand-built fallback. |
| `zones/labuProps.ts` | Labu's props plus shared ones (trees, fence, stream, bridge, `meadow()` grass sprites, chickens, birds). |
| `zones/cats.ts` | Rigged cats; coats are painted textures (`paintedCoat`). |

Animated creatures (cats, chickens, ducks, birds, butterflies, laundry) stay **hand-built** because
they are rigged. Keep them smooth: spheres 16+ segments, rounded boxes, patterns painted as textures,
never extra meshes laid on top.

## 3. Tools (all local, ComfyUI on port 8188)

Start or restart ComfyUI: `pipeline/tools/comfy.sh`. Python = `/mnt/storage/Projects/Comfy/.venv/bin/python`.

| Step | Command | Time |
|---|---|---|
| Prop concepts (2D, white bg) | `python pipeline/tools/prop_concepts.py --zone <zone> [names]` | ~4 s each |
| Concept → 3D GLB | `python pipeline/tools/gen3d.py art/props/<zone>/<file>.png --name <id> --faces N --out art/3d/<zone> --optimize` | 20–170 s |
| Painted textures | `python pipeline/tools/texture_kit.py <names>` then `seamless.py` | ~4 s each |
| Any other image | `python pipeline/tools/qwen_gen.py --t2i ...` or `--image ...` | 3–35 s |
| Look at a GLB | `python3 pipeline/tools/render_glb.py a.glb b.glb --out x.png` (4 angles) | ~10 s |
| Measure a GLB | `node pipeline/audit/front_view.mjs model.glb out.png` (front, with 10% grid) | ~5 s |
| Screenshot a zone | `node pipeline/audit/shots.mjs --zone <id> --grid x0,x1,z0,z1 --out /tmp/g` | ~1 min |
| Check a zone | `node pipeline/audit/check.mjs --zone <id> --from x,z --roads "x0,z0,x1,z1;..."` | ~20 s |

The audit scripts need the **dev server** (`cd game && npm run dev`, port 5181) because they use the
dev panel and `window.__overworld`. Both take `--save '<json>'` to start from a given save, e.g. Labu's
birthday party: `--save '{"cards":[1,2,3,4,5,6,7,8],"flags":{"introSeen":true,"endingSeen":true}}'`. Zone ids: labulanjut, sunway, galeri, dusun, angkasa, cosyplace,
photobooth, bukit, sepang.

`--faces` guide: big building 40k–80k (`--preset hero`), small building 16k–20k, tree 9k–12k,
small prop 3k–8k. If a model comes out with holes, run again with another `--seed` and more faces
(Qish's house only came out whole on seed 7 at 80k).

## 4. Workflow for one zone

1. **Audit what is there.** Grid screenshots of the whole zone (`shots.mjs --grid`), then list every
   visible prop, surface and creature and decide for each: generated model, painted texture in the
   splat ground, or hand-built but smoothed (animated only). Read the zone's `build()` in
   `src/zones/zones.ts` and its props file.
2. **Layout first if needed.** If the zone is still a straight corridor, propose 2–3 layouts to Faris
   (ASCII) before making art.
3. **Concepts.** Add a dict for the zone to `ZONES` in `prop_concepts.py`: one sentence per prop,
   object only. Generate, then put them on one contact sheet and look at every one. Regenerate
   anything with readable text, wrong facing, extra objects or a style break.
4. **3D.** Run `gen3d.py` for each (background batch). Render the results with `render_glb.py` and
   look for holes, missing parts and orientation. Copy the `.web.glb` files to
   `game/public/assets/models/<id>.glb` and add each id to `MODELS` and the relevant
   `ZONE_MODELS` entries in `models.ts`. Run `pipeline/audit/zone-models.mjs` to catch missing
   dependencies before/after the ending. Add buildings
   and trees to the `FADE` set.
5. **Wire the builders.** In each prop builder: `const gen = model(...)` (or `modelBox` to fill an
   exact box), and `if (gen) return ...` before the old hand-built code, which stays as the fallback.
   Scale trees by height, buildings by length.
6. **Measure, then collide.** Generated models are never laid out like the code assumed. With
   `front_view.mjs` (and a side view) find where the door, steps, porch and board actually are,
   then write colliders that follow the model (walls solid, porch reachable only up its steps,
   columns solid) and shift the model so its door sits on the path. Recheck the old hand-placed
   decorations around it: remove any that now overlap (Labu's flower boxes did).
7. **Ground.** Replace every slab/tile/road mesh with one `splatGround()` whose mask paints the paths,
   roads with dusty shoulders, pads, worn patches (strength 0.5–0.8 so grass shows through) and banks.
   Water: wobbly alpha edge plus a foam band (see `stream()`). Grass: `meadow()` (painted sprite clumps)
   with an `avoid` box for every building, path, bench, hammock, etc.
8. **Text.** Never trust text inside a model. Generate signs with a blank board and add the words in
   the game with a canvas texture on a plane placed with `frontZ()`. Make the wrapper group the fade
   target so the words fade with the model.
9. **Check.** Run `check.mjs` (errors, unreachable pickups, overlapping models, models on roads,
   reachable exits) and walk the grid screenshots again. A **closed exit that is reachable on foot is
   a bug**: when the exit refuses her, Qish is put back at its `back` point, and if that point is
   inside a collider she is stuck. Block the way round instead (Labu's roadblock now fills the gap
   between the plantation fences).
10. **Log it.** Add a dated entry to `GAME_VISION.md` section 13 and keep `pipeline/README.md` current.

## 5. Gotchas we already paid for

- `comfy run` drops the raw-prompt link in subgraph templates (enhancer-off renders an empty
  prompt). Always use `qwen_gen.py` / `gen3d.py`, which post API graphs directly.
- T2I texture prompts must not name games ("Yono", "Pokémon"): the model draws icons and UI.
  For plain surfaces (plaster, tar) T2I makes sprite sheets; paint them with numpy noise instead.
- The edit model copies characters out of a style-reference image into prop concepts. For props use
  `--t2i` with words only.
- TRELLIS output: front faces +z as generated; some long things come out lying along x (the bridge,
  fixed with `modelBox(..., turn = true)`); stilt houses came out gable-on with the door on +x
  (handled with `door: "west"` turning them to face the road).
- The optimised GLBs are quantised; `models.ts` converts to float so `mergeStatic` does not mangle them.
- Doors are not centred on generated houses (Qish's is 1.85 m right of centre: `HOUSE_DOOR_X`).
- A sagging rope: hang things where a downward raycast hits it (`clothesline()`), not at a fixed y.
- Rounded tabby stripes on a sphere pinch at the pole; start them away from the top.
- Trees placed for the old small house ended up inside the new roof. After swapping any model,
  run `check.mjs` for overlaps.
- Headless screenshots: use the Vulkan flags in `lib.mjs` (real GPU); SwiftShader is too slow and
  Qish barely moves. The top and bottom of the screen are tilt-shift blurred, so teleport to put the
  thing you are checking in the middle.

## 6. Definition of done for a zone

- [ ] No flat-colour primitive is visible except small animated creatures.
- [ ] Every walkable surface is in the splat ground; no slab edges anywhere, water edges are soft.
- [ ] Every generated model: no holes, faces the right way, colliders follow its shape, no prop or
      tree inside it, nothing floating.
- [ ] Every sign readable (words added in game) and fading with its model.
- [ ] `check.mjs`: no errors, no unreachable pickups (except by-boat ones), no overlaps, no closed
      exit reachable on foot.
- [ ] Grid screenshots reviewed end to end; a before/after image saved in `art/style/`.
- [ ] Entry in `GAME_VISION.md` section 13.
