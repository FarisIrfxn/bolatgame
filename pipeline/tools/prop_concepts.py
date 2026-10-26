"""Make 2D concept images of props for the 3D pipeline (step 1 of 2; gen3d.py is step 2).

Each prop is one isolated object on white in the shared hand-painted style, ready for TRELLIS.2.
Describe ONLY the object in a PROPS entry; BASE adds the style, framing and lighting.

  python prop_concepts.py --zone labu house mango          # just these
  python prop_concepts.py --zone labu                      # every prop of that zone
  python prop_concepts.py --zone sunway --seed 7 kiosk     # another seed if a concept is off

Output: art/props/<zone>/<zone>_<name>_0000N.png. Add a zone by adding a dict to ZONES.
Rules learned the hard way (see docs/ZONE_ART_GUIDE.md): never ask for readable text (ask for a
"blank board with no writing" and put the words on in the game); say which way the front faces;
wide buildings "wide and shallow"; long things (bridges) get turned in code if they come out sideways.
"""
import argparse
import json
import subprocess
from pathlib import Path

P = "/mnt/storage/Projects/Comfy/.venv/bin/python"
TOOLS = Path(__file__).resolve().parent
ART = TOOLS.parent.parent / "art" / "props"
BASE = ("The image is a square 3D-rendered stylized game asset illustration, isolated on a pure flat white background with no ground, no cast shadow and no text. "
        "The single object is shown whole and centred, filling about eighty percent of the frame, seen in a three-quarter view from the front-left and slightly above. "
        "It is styled like a cosy hand-painted 3D adventure game asset: chunky friendly proportions with softly rounded edges, hand-painted textures with soft brush strokes, "
        "painted light highlights along top edges and gentle darker shading in crevices, saturated cheerful colours, soft warm daylight from the upper left. ")

ZONES = {
  "bilik": {
    "bed": "A low double bed with a rounded WHITE painted wooden frame and headboard. ALL bedding is ONE uniform bubblegum PINK colour, including the entire mattress fitted sheet, one continuous thick puffy duvet covering the full bed from pillows to foot, and both pillows. Medium light rosy pink like hex F29AC1. The duvet is a single uninterrupted pink fabric surface with soft natural wrinkles, no colour blocks, no stripe, no bands, no folded contrasting edge, no runner, no throw, no white bedding, no red or orange fabric. The right pink pillow has a small shallow oval depression in the cloth, completely empty, with no toy or object. Both pillows are the same pink as the duvet. View from the foot of the bed, pillows at the far end, whole isolated bed.",
    "curtain": "One single hanging pink fabric curtain panel, tall and narrow, with rounded soft vertical pleats and natural wavy hem. Uniform medium light bubblegum pink fabric like hex F29AC1, subtle woven texture and soft folds, small pink fabric hanging loops along its gathered top edge. The panel hangs straight vertically, no tieback. Front-facing, full panel visible, isolated on white. Fabric only: no wall, no window, no rod, no furniture, no background scene.",
    "desk": "A compact bubblegum PINK bedroom writing desk, wide and shallow, facing the viewer. Every wooden surface is painted rosy pink like hex F29AC1: pink tabletop, pink drawers, pink legs, pink drawer knobs. Soft rounded corners and subtle painted wood grain. A matching pink chair with pink legs and pink upholstery is tucked close beneath the front of the desk. On top: a small pink desk lamp with a pale pink shade on the left, a closed pale pink sketchbook and three pencils at the centre, and a tiny dark smartphone lying screen-up on the right. All furniture is PINK, no brown wood, no cream table, no orange or red, no green lamp. One coherent compact furniture set, no wall, no writing.",
    "door": "One closed interior bedroom door together with its narrow surrounding doorframe, isolated upright. The entire door and the entire frame are painted solid bubblegum PINK like hex F29AC1, including two softly bevelled inset pink rectangular panels, pink trim, pink hinges and a small rounded pink doorknob on the right. Soft rounded corners, subtle hand-painted wood grain, gentle pink highlights and pink shaded recesses. Tall narrow straight rectangular silhouette, flat back, shallow thickness. Fully pink, no white frame, no cream, no natural brown wood, no arch, no wall, no floor, no steps, no text.",
    "wardrobe": "A tall freestanding two-door bedroom wardrobe, compact and broad rather than thin. Warm ivory painted wood with hand-painted wood grain, softly arched top corners, two framed cabinet doors with vertical panel detailing, small round antique brass handles, short curved feet. The front faces the viewer. Closed, no mirror, no clothes, no text.",
    "console": "A low bedroom media cabinet and gaming setup, wide and shallow. Rounded warm cream wooden cabinet with two drawers, one black flat-screen television standing on top facing the viewer, a little white game console and two controllers, one coral pink and one deep blue, resting on the cabinet. The television screen is plain dark navy with no words, icons or image. Cozy hand-painted furniture, isolated whole object.",
    "plant": "A leafy indoor pothos houseplant in a rounded terracotta ceramic pot, lush clusters of smooth heart-shaped green leaves spilling gently over the rim. Short compact table-sized plant, soft painted leaf highlights, no flowers, no other objects.",
  },
  "labu": {
    "house": "The object is a cosy one-storey Malaysian kampung family house, wide and shallow: cream plaster walls on a low sandstone plinth, a plum-mauve clay-tile pitched roof with deep eaves running left to right, a small gabled front porch on two round cream columns over a wooden front door in the middle of the long front wall, four windows with wooden frames, brown louvred shutters and little flower boxes, two stone steps up to the porch. The front of the house faces the viewer.",
    "mango": "The object is a round mango tree: a short sturdy brown trunk and one big fluffy cloud-shaped crown made of rounded leaf clumps in rich greens with painted lighter tops, a dozen yellow and green mangoes hanging under the crown.",
    "raintree": "The object is a wide umbrella-shaped rain tree (pokok hujan-hujan): a thick brown trunk splitting into three branches, a broad flat dome canopy of rounded leaf clumps in soft greens dotted with small pink fluffy blossoms.",
    "banana": "The object is a small banana plant: a pale green fibrous trunk and seven big broad drooping banana leaves in fresh greens with painted midribs, a hanging bunch of green-yellow bananas.",
    "oilpalm": "The object is an oil palm tree (kelapa sawit): a short fat rough brown trunk with old frond stubs and a big drooping round crown of long feathery dark green fronds, a cluster of dark red palm fruit under the crown.",
    "coconut": "The object is a tall slender coconut palm: a gently curved ringed light brown trunk and a crown of long arching bright green feathery fronds, a cluster of green coconuts under the crown.",
    "bush": "The object is a round leafy garden bush made of five soft rounded leaf clumps in fresh and deep greens with painted lighter tops, a few tiny pink flowers.",
    "bench": "The object is a wooden park bench: four rounded honey-brown wooden slats for the seat and two for the backrest, curved dark plum iron legs and armrests.",
    "wakaf": "The object is a Malaysian wakaf gazebo: a square raised wooden platform deck on short posts with a woven red and cream pandan mat on top, four round wooden pillars holding a pointed four-sided plum clay-tile roof with a small golden finial, three wooden steps at the front.",
    "kedai": "The object is a small Malaysian kampung sundry shop (kedai runcit): a cream single-storey shop with a pale blue flat roof, a large plain blank green signboard on top with no writing on it, a red and white striped awning over an open shop front filled with colourful shelves of goods, a white ice cream freezer and stacked red and yellow drink crates beside the door.",
    "stilt_blue": "The object is a traditional Malaysian kampung house on short wooden stilts: pale sky-blue painted wooden plank walls, a soft blue-grey clay-tile pitched roof running left to right, two windows with open teal shutters, a wooden front door in the middle with four wooden steps up to it.",
    "stilt_terra": "The object is a traditional Malaysian kampung house on short wooden stilts: pale lime-cream painted wooden plank walls, a terracotta orange clay-tile pitched roof running left to right, two windows with open rust-red shutters, a wooden front door in the middle with four wooden steps up to it.",
    "fence": "The object is one straight section of a low wooden picket fence, wide and shallow, seen from the front-left: nine honey-brown wooden pickets with rounded tops on two horizontal rails, a sturdier square post with a round cap at each end.",
    "lamppost": "The object is a cute kampung street lamp post: a slim dark plum metal pole with a small curved arm at the top holding a rounded lantern with a warm cream glass shade, a small round base.",
    "pole": "The object is a Malaysian concrete electricity pole: a tall slim pale grey tapered round pole with a short crossbar near the top holding three small white ceramic insulators.",
    "flowerbed": "The object is a long low wooden raised flower bed planter box, wide and shallow: honey-brown wooden planks with rounded edges, filled with soft round green leafy plants and many small pink, white, magenta and yellow flowers.",
    "signboard": "The object is a small wooden notice signboard on one post: a rounded rectangular blank cream painted board with a honey-brown wooden frame, slightly tilted back, on a single wooden post. The board is completely blank with no writing.",
    "mailbox": "The object is a cute red Malaysian kampung mailbox: a rounded red metal letterbox with a curved top and a small yellow flag on the side, on a short honey-brown wooden post.",
    "pot": "The object is a round terracotta flower pot holding a bushy round green plant covered in small pink bougainvillea flowers.",
    "arch": "The object is a Malaysian kampung welcome arch gate over a road, wide and shallow: two cream painted square pillars with green tops and round yellow knobs, holding a long blank dark green signboard across the top with a cream border. The signboard is completely blank with no writing.",
    "motorbike": "The object is a cute Malaysian kapcai underbone motorcycle parked on its side stand, seen from the side and slightly front: rounded sky-blue and cream body panels, a small front basket, a black seat, chunky black tyres, round headlight.",
    "hammock": "The object is a cosy rainbow striped fabric hammock hanging between two short sturdy honey-brown wooden posts, wide and shallow, the hammock sagging gently in the middle with soft pastel stripes of pink, yellow, mint green and sky blue.",
    "lanternpole": "The object is a slim honey-brown wooden pole with a small crossbar near the top from which hangs one round red paper lantern with gold trim and a little tassel.",
    "roadblock": "The object is a wooden road barrier: a white and red striped horizontal plank on two A-frame wooden legs, wide and shallow, with a small blank yellow sign hanging from the middle with no writing on it.",
    "bridge": "The object is a small wooden footbridge, long and narrow, gently arched: a deck of honey-brown planks with painted grain and rounded edges, low wooden railings with round posts along both sides. The bridge runs from front to back, seen from the front-left so its whole length is visible.",
    "caketable": "The object is a small rectangular party table, wide and shallow, covered with a soft pastel pink tablecloth that drapes to the ground in gentle rounded folds with a scalloped hem. In the middle of the table stands one round two-tier birthday cake: creamy mango-yellow frosting, fresh orange mango cubes on top, white cream piping around each tier and a few small lit candles. A small stack of plates beside it. The long side faces the viewer.",
    "clothtable": "The object is a small empty rectangular party table, wide and shallow, completely covered by a bright rosy pink tablecloth that drapes all the way to the ground in soft rounded folds with a wavy scalloped hem. The flat top is completely empty with nothing on it. The long side faces the viewer.",
    "foodtable": "The object is a long party buffet table, wide and shallow, covered with a soft mint green tablecloth that drapes to the ground in gentle rounded folds. On top, laid out in a row: a plate of sliced smoked brown beef, a big red bowl of spicy soup with vegetables and skewers, a plate of red glossy rice cakes, and four colourful drink cups in pink, yellow, green and blue at the front edge. The long side faces the viewer.",
    "clothesline": "The object is a kampung clothesline: two T-shaped honey-brown wooden posts with a thin rope strung between them, wide and shallow, with no clothes on it.",
  },
  "sunway": {
    "screen_tower": "A large L-shaped contemporary Kuala Lumpur shopping mall corner building, three storeys tall, with a broad softly rounded outside corner facing the viewer. Dark midnight-blue ribbed cladding frames three enormous completely blank matte-black display panels: one wrapping around the rounded corner and one on each front wing. The ground floor has warm glowing glass shop windows and rounded cream columns. A slim blank dark fascia runs along the roof. Wide and shallow overall, with the two wings forming a clear right angle. No words, logos, adverts, symbols or people.",
    "shops_left": "A wide continuous row of four compact Kuala Lumpur city shophouses, four storeys tall and shallow, with softly rounded cream and dusty-peach plaster facades. The ground floor has four distinct warm glowing glass storefronts, each with a broad completely blank signboard and two with gently scalloped striped awnings. Upper floors have recessed windows, small rounded balconies and painted trim. The long front faces the viewer. No words, logos, symbols, people or street furniture.",
    "shops_right": "A wide continuous row of three compact Kuala Lumpur music-district shophouses, four storeys tall and shallow, with softly rounded ivory, muted plum and warm ochre plaster facades. Ground floor bays include a warm guitar-shop window, a vinyl-record display window and one closed corrugated shutter, all beneath completely blank signboards; upper floors have recessed windows and rounded painted trim. The long front faces the viewer. No words, logos, symbols, people or street furniture.",
    "mrt_entrance": "A compact modern Malaysian underground MRT entrance, open towards the viewer: a wide staircase descending into a dark opening, pale stone side walls with rounded corners, transparent aqua glass balustrades in soft steel frames, and a gently curved translucent glass canopy. At the back is one completely blank round coloured station badge panel and beside the top stair is one slim blank white totem. No words, letters, logos, arrows, people or background.",
    "monorail_train": "A cute two-car Kuala Lumpur monorail train joined together as one object, long and narrow, with rounded aerodynamic noses at both ends, a pearl-white body, broad cobalt-blue lower stripe, dark navy continuous windows, small doors and softly rounded details. The train sits level and the full long side is visible, angled slightly so one rounded front is also visible. No track, station, text, logo, passengers or background.",
    "monorail_station": "An EMPTY compact elevated Kuala Lumpur monorail station structure, long and narrow, with a pale warm-grey platform deck on two chunky rounded concrete pillars, transparent aqua glass safety walls, slim charcoal frames and a softly arched pearl-white canopy roof covering the visibly empty platform. A broad completely blank navy station sign panel sits below the roof. The full long side faces the viewer. The station contains no vehicle at all: no train, no monorail car, no locomotive and no carriage. No track extending away, stairs, words, letters, logos, passengers or background.",
    "bus": "A cute modern Malaysian city bus, long and boxy but heavily rounded like a friendly toy, pearl-white body with a coral-red lower band and thin cobalt-blue roof trim, large dark navy windows, rounded front windscreen and chunky black wheels. Full vehicle visible from a front-left three-quarter view. The destination panel is completely blank. No words, logos, passengers or road.",
    "car_red": "A compact modern city hatchback car with chunky toy-like proportions, smooth cherry-red painted body, dark navy windows, rounded cream headlights and chunky black wheels. Full car visible from a front-left three-quarter view, facing towards the viewer. No text, logo, driver, road or background.",
    "car_green": "A compact modern city sedan with chunky toy-like proportions, smooth deep emerald-green painted body, dark navy windows, rounded cream headlights and chunky black wheels. Full car visible from a front-left three-quarter view, facing towards the viewer. No text, logo, driver, road or background.",
    "taxi": "A compact Kuala Lumpur city taxi with chunky toy-like proportions, smooth mango-yellow painted sedan body, dark navy windows, rounded cream headlights, chunky black wheels and a small completely blank cream roof light. Full car visible from a front-left three-quarter view, facing towards the viewer. No words, logo, driver, road or background.",
    "burger_kiosk": "A small Malaysian street burger cart, compact and freestanding, with a rounded coral-red metal counter body, pale steel worktop, black hot plate, condiment bottles and a softly curved striped yellow-and-red canopy on four slim posts. A wide completely blank yellow signboard hangs under the canopy. No words, logos, vendor, food truck, wheels or background.",
    "shawarma_counter": "A compact freestanding shawarma counter with softly rounded stainless-steel panels and a warm cream tiled front, a vertical browned meat spit beside a glowing orange grill, a little basket of wrapped flatbreads, sauce bottles and a gently curved small hood above. Wide and shallow with the serving side facing the viewer. No words, logos, vendor, wall or background.",
    "tree_planter": "A cheerful Kuala Lumpur street tree growing from one broad rounded granite planter. The planter is a low smooth cylinder with hand-painted speckled pale-grey stone; a slim warm-brown trunk rises into a dense fluffy cloud-shaped crown of rounded emerald and fresh-green leaf clumps. One coherent object, no flowers, bench, pavement, people or background.",
    "banner_lamp": "A tall elegant city street lamp with a softly rounded charcoal-black pole and base, one curved arm holding a warm cream oval lamp, and a short side rail holding one completely blank vertical magenta fabric banner with rounded lower corners. Full lamp visible upright. No words, letters, logos, symbols, street or background.",
  },
}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("names", nargs="*")
    ap.add_argument("--zone", required=True, choices=ZONES)
    ap.add_argument("--seed", type=int, default=21)
    args = ap.parse_args()
    props = ZONES[args.zone]
    out = ART / args.zone
    for name in args.names or list(props):
        r = subprocess.run([P, str(TOOLS / "qwen_gen.py"), "--t2i", "--prompt", BASE + props[name], "--seed", str(args.seed),
                            "--name", f"{args.zone}_{name}", "--out", str(out)], capture_output=True, text=True)
        last = r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-400:]
        print(name, json.loads(last)["outputs"][0] if last.startswith("{") else last)


if __name__ == "__main__":
    main()
