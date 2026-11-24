"""
US Trailers: photoreal build film, rendered offline with Blender Cycles.

A Texan-style V-nose enclosed toy hauler, modelled part by part at real size (metres, Z up,
+X towards the coupler), assembled on screen chapter by chapter in a black studio with a glossy
floor, then the lights go down and the RGB comes up.

Run:  python render/trailer.py --frames 1-200 --res 1600x900 --samples 96 --out /path/frames
      python render/trailer.py --stills 40,120,190 --res 960x540 --samples 32 --out /path/preview
"""
import argparse
import math
import sys

import bpy
import numpy as np
from mathutils import Vector

# ----------------------------------------------------------------------------- args
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument("--frames", default="")
ap.add_argument("--stills", default="")
ap.add_argument("--res", default="960x540")
ap.add_argument("--samples", type=int, default=48)
ap.add_argument("--out", required=True)
ap.add_argument("--blend", default="")
ap.add_argument("--cam", default="")
ap.add_argument("--manifest", default="")
args = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ----------------------------------------------------------------------------- dimensions (m)
L = 5.4  # box length
NV = 0.8  # V-nose depth
W = 2.08  # outside width
HW = W / 2
FLOOR = 0.62  # floor top above ground
ROOF = 2.72  # roof top
H = ROOF - FLOOR
WHEEL_R = 0.345  # 15" wheel + 225/75 tyre
TYRE_W = 0.225
TRACK = 0.93  # wheel centre from middle
AXLES = [-0.45 - 0.35, 0.45 - 0.35]  # tandem, just behind centre
RAIL_Z = FLOOR - 0.12
X0, X1 = -L / 2, L / 2  # rear, front of the box
TIP = X1 + NV
COUP = TIP + 1.25  # coupler x
FPS = 30

# ----------------------------------------------------------------------------- materials
MATS = {}


def principled(name, color, metal=0.0, rough=0.5, coat=0.0, coat_rough=0.03, emission=None, strength=0.0, aniso=0.0, spec_tint=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_rough
    if aniso:
        b.inputs["Anisotropic"].default_value = aniso
    if emission:
        b.inputs["Emission Color"].default_value = (*emission, 1)
        b.inputs["Emission Strength"].default_value = strength
    MATS[name] = m
    return m


def tex_image(name, size, fn):
    """procedural greyscale image from numpy, tileable"""
    y, x = np.mgrid[0:size, 0:size] / size
    v = np.clip(fn(x, y), 0, 1).astype(np.float32)
    img = bpy.data.images.new(name, size, size, alpha=False, float_buffer=True)
    rgba = np.dstack([v, v, v, np.ones_like(v)])
    img.pixels.foreach_set(rgba[::-1].ravel())
    img.pack()
    return img


def add_bump(mat, img, scale, strength, rough_mod=None):
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    it = nt.nodes.new("ShaderNodeTexImage")
    it.image = img
    it.projection = "BOX"
    it.projection_blend = 0.2
    it.interpolation = "Cubic"
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], it.inputs["Vector"])
    nt.links.new(it.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    if rough_mod:
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = rough_mod
        nt.links.new(it.outputs["Color"], mr.inputs["Value"])
        nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])


def noise_rough(mat, lo, hi, scale=40.0):
    """break up perfect roughness with fine noise: what makes metal read as metal"""
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 8
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = lo, hi
    nt.links.new(n.outputs["Fac"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])


def build_materials():
    # deep gloss black paint: dark metallic flake base under a mirror clear coat
    p = principled("paint", (0.006, 0.006, 0.007), metal=0.35, rough=0.38, coat=1.0, coat_rough=0.015)
    noise_rough(p, 0.3, 0.45, 220)
    # hot-dip galvanised: spangled, dull silver
    g = principled("galv", (0.66, 0.68, 0.69), metal=1.0, rough=0.36)
    nt = g.node_tree
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 35
    vor.feature = "F1"
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value, mr.inputs["To Max"].default_value = 0.26, 0.48
    nt.links.new(vor.outputs["Color"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], nt.nodes["Principled BSDF"].inputs["Roughness"])
    # mirror-polished aluminium (wheels, trims)
    pa = principled("polished", (0.91, 0.92, 0.93), metal=1.0, rough=0.06)
    noise_rough(pa, 0.04, 0.09, 300)
    # brushed aluminium
    principled("brushed", (0.86, 0.87, 0.88), metal=1.0, rough=0.24, aniso=0.7)
    # chrome
    principled("chrome", (0.95, 0.95, 0.96), metal=1.0, rough=0.02)
    # polished diamond checker plate
    ch = principled("checker", (0.9, 0.91, 0.92), metal=1.0, rough=0.09)

    def diamonds(x, y):
        n = 8
        gx, gy = (x * n) % 1 - 0.5, (y * n) % 1 - 0.5
        alt = ((np.floor(x * n) + np.floor(y * n)) % 2) * 2 - 1
        a = alt * math.pi / 4
        u = gx * np.cos(a) - gy * np.sin(a)
        v = gx * np.sin(a) + gy * np.cos(a)
        d = (u / 0.36) ** 2 + (v / 0.08) ** 2
        return np.clip(1.2 - d, 0, 1) ** 0.6

    add_bump(ch, tex_image("diamond", 512, diamonds), 6.0, 0.35)
    # tyre rubber, interior rubber floor
    principled("rubber", (0.018, 0.018, 0.02), rough=0.72)
    principled("sidewall", (0.022, 0.022, 0.024), rough=0.55)
    principled("coin", (0.03, 0.03, 0.032), rough=0.6)
    # marine ply
    ply = principled("ply", (0.55, 0.38, 0.2), rough=0.6)
    nt = ply.node_tree
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 3
    wave.inputs["Distortion"].default_value = 8
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.42, 0.27, 0.13, 1)
    ramp.color_ramp.elements[1].color = (0.62, 0.45, 0.25, 1)
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    # interior walls: white composite
    principled("white", (0.82, 0.83, 0.84), rough=0.35, coat=0.3)
    # brake caliper red, black plastics, glass, lights
    principled("caliper", (0.6, 0.04, 0.03), rough=0.3, coat=0.8)
    principled("blackplastic", (0.02, 0.02, 0.022), rough=0.45)
    principled("disc", (0.45, 0.46, 0.47), metal=1.0, rough=0.25, aniso=0.8)
    principled("amber", (0.9, 0.4, 0.02), rough=0.15, emission=(1.0, 0.45, 0.05), strength=0.0)
    principled("red", (0.6, 0.02, 0.02), rough=0.15, emission=(1.0, 0.05, 0.03), strength=0.0)
    principled("ledwhite", (0.9, 0.9, 0.9), rough=0.2, emission=(1.0, 0.95, 0.88), strength=0.0)
    # RGB strip: emission driven per frame
    principled("rgb", (0.05, 0.05, 0.05), rough=0.3, emission=(1, 0.1, 0.8), strength=0.0)
    principled("weld", (0.5, 0.48, 0.45), metal=1.0, rough=0.45)
    # studio floor: black, wet-look gloss with faint breakup
    fl = principled("floor", (0.005, 0.005, 0.006), rough=0.2)
    # a polished studio floor, not a mirror: it should pick up the trailer and its lights, not the room
    fl.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.14
    noise_rough(fl, 0.1, 0.24, 6)


# ----------------------------------------------------------------------------- geometry helpers
PARTS = []  # (name, [objects], chapter, offset Vector)


def obj_from_mesh(name, mesh, mat, loc=(0, 0, 0)):
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    o.location = loc
    if mat:
        o.data.materials.append(MATS[mat])
    return o


def bevel(o, w, seg=3, limit=True):
    m = o.modifiers.new("bevel", "BEVEL")
    m.width = w
    m.segments = seg
    m.limit_method = "ANGLE" if limit else "NONE"
    m.harden_normals = True
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def box(name, size, loc, mat, bev=0.004, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    # bake the size only: the origin must stay at the part's centre so it rotates about itself
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(MATS[mat])
    if bev:
        bevel(o, bev)
    return o


def cyl(name, r, depth, loc, mat, axis="Y", verts=48, bev=0.0):
    rot = {"X": (0, math.pi / 2, 0), "Y": (math.pi / 2, 0, 0), "Z": (0, 0, 0)}[axis]
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(MATS[mat])
    smooth(o)
    if bev:
        bevel(o, bev, 2)
    return o


def tube_between(name, a, b, size, mat, bev=0.004):
    """rectangular hollow section from a to b; size = (width, height)"""
    a, b = Vector(a), Vector(b)
    d = b - a
    o = box(name, (d.length, size[0], size[1]), (a + b) / 2, mat, bev)
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((1, 0, 0)).rotation_difference(d.normalized())
    return o


def curve_tube(name, pts, r, mat, res=12):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 4
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (*p, 1)
    sp.use_endpoint_u = True
    sp.order_u = 3
    sp.resolution_u = res
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MATS[mat])
    return o


def lathe(name, profile, mat, loc, axis="Y", steps=64):
    """profile: [(radius, height)] revolved round the local Z axis, then turned to `axis`"""
    verts, faces = [], []
    n = len(profile)
    for s in range(steps):
        a = s / steps * 2 * math.pi
        for r, h in profile:
            verts.append((r * math.cos(a), r * math.sin(a), h))
    for s in range(steps):
        s2 = (s + 1) % steps
        for i in range(n - 1):
            faces.append((s * n + i, s * n + i + 1, s2 * n + i + 1, s2 * n + i))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = obj_from_mesh(name, me, mat, loc)
    smooth(o)
    o.rotation_euler = {"X": (0, math.pi / 2, 0), "Y": (math.pi / 2, 0, 0), "Z": (0, 0, 0)}[axis]
    return o


def prism(name, pts_xy, z0, z1, mat, bev=0.0):
    """plan outline [(x, y)] extruded from z0 to z1"""
    n = len(pts_xy)
    verts = [(x, y, z0) for x, y in pts_xy] + [(x, y, z1) for x, y in pts_xy]
    faces = [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = obj_from_mesh(name, me, mat)
    if bev:
        bevel(o, bev, 3)
    return o


def join(name, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        for m in o.modifiers:
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    return o


def part(name, objs, chapter, offset):
    PARTS.append((name, objs, chapter, Vector(offset)))


# ----------------------------------------------------------------------------- the trailer
def build_trailer():
    # ---- 01 chassis: rails, cross members, A-frame tongue, coupler, jockey, welds, chains
    rails = [tube_between(f"rail{s}", (X0 - 0.05, s * 0.72, RAIL_Z), (X1 + 0.05, s * 0.72, RAIL_Z), (0.06, 0.15), "galv", 0.006) for s in (1, -1)]
    part("Main rails", rails, 1, (0, 0, 2.4))
    xs = np.linspace(X0, X1, int(L / 0.4) + 1)
    cross = [tube_between(f"x{i}", (x, -0.72, RAIL_Z + 0.02), (x, 0.72, RAIL_Z + 0.02), (0.05, 0.1), "galv", 0.005) for i, x in enumerate(xs)]
    part("Cross members", cross, 1, (0, 0, 2.0))
    welds = []
    for x in xs:
        for s in (1, -1):
            welds.append(curve_tube("weld", [(x - 0.03, s * 0.69, RAIL_Z + 0.075), (x, s * 0.69, RAIL_Z + 0.078), (x + 0.03, s * 0.69, RAIL_Z + 0.075)], 0.007, "weld", 4))
    part("Welds", welds, 1, (0, 0, 0.6))
    tongue = [tube_between(f"tongue{s}", (X1 - 0.1, s * 0.72, RAIL_Z), (COUP - 0.12, s * 0.06, RAIL_Z), (0.06, 0.12), "galv", 0.006) for s in (1, -1)]
    coupler = [
        box("coupler_body", (0.34, 0.12, 0.1), (COUP + 0.02, 0, RAIL_Z + 0.01), "galv", 0.02),
        lathe("coupler_hood", [(0.0, 0.11), (0.05, 0.11), (0.07, 0.08), (0.075, 0.02), (0.07, 0.0)], "galv", (COUP + 0.16, 0, RAIL_Z - 0.04), "Z", 32),
        box("coupler_lever", (0.24, 0.035, 0.03), (COUP + 0.02, 0, RAIL_Z + 0.09), "caliper", 0.01, (0, -0.15, 0)),
    ]
    chains = [curve_tube(f"chain{s}", [(COUP - 0.3, s * 0.09, RAIL_Z - 0.04), (COUP - 0.08, s * 0.12, RAIL_Z - 0.24), (COUP + 0.14, s * 0.07, RAIL_Z - 0.1)], 0.009, "chrome") for s in (1, -1)]
    jockey = [
        cyl("jockey_post", 0.04, 0.6, (COUP - 0.55, 0.0, RAIL_Z + 0.06), "galv", "Z", 32, 0.004),
        cyl("jockey_handle", 0.012, 0.18, (COUP - 0.55, 0.0, RAIL_Z + 0.4), "chrome", "Y", 16),
        cyl("jockey_wheel", 0.1, 0.06, (COUP - 0.55, 0.0, 0.1), "rubber", "Y", 32, 0.01),
    ]
    part("A-frame tongue", tongue, 1, (1.8, 0, 0.8))
    part("Coupler & chains", coupler + chains, 1, (1.2, 0, 0.6))
    part("Jockey wheel", jockey, 1, (0, 0, 1.0))

    # ---- 02 running gear: axles, leaf springs, hubs, discs, calipers
    for i, ax in enumerate(AXLES):
        objs = [cyl(f"axle{i}", 0.04, TRACK * 2 - 0.1, (ax, 0, WHEEL_R), "galv", "Y", 32)]
        for s in (1, -1):
            leaves = []
            for k in range(4):
                leaves.append(box(f"leaf{i}{s}{k}", (0.95 - k * 0.16, 0.06, 0.009), (ax, s * 0.72, WHEEL_R + 0.045 - k * 0.011), "galv", 0.002))
            objs += leaves
            objs.append(box(f"ubolt{i}{s}", (0.08, 0.09, 0.12), (ax, s * 0.72, WHEEL_R + 0.0), "chrome", 0.01))
            hubx = (ax, s * (TRACK - 0.12), WHEEL_R)
            objs.append(cyl(f"disc{i}{s}", 0.15, 0.022, hubx, "disc", "Y", 64))
            objs.append(box(f"caliper{i}{s}", (0.12, 0.06, 0.08), (ax - 0.12, s * (TRACK - 0.12), WHEEL_R + 0.09), "caliper", 0.015))
        part("Axle & springs" if i == 0 else "Second axle", objs, 2, (0, 0, -1.2))

    # ---- 03 wheels: polished six-spoke aluminium, all-terrain tyres with real tread blocks
    for i, ax in enumerate(AXLES):
        for s in (1, -1):
            c = (ax, s * TRACK, WHEEL_R)
            r, w = WHEEL_R, TYRE_W
            prof = [(0.19, -w / 2 + 0.01), (0.25, -w / 2), (r - 0.03, -w / 2 + 0.005), (r - 0.005, -w / 2 + 0.03), (r, -w / 2 + 0.06), (r, w / 2 - 0.06), (r - 0.005, w / 2 - 0.03), (r - 0.03, w / 2 - 0.005), (0.25, w / 2), (0.19, w / 2 - 0.01)]
            tyre = lathe(f"tyre{i}{s}", prof, "sidewall", c, "Y", 96)
            tread = []
            for k in range(44):
                a = k / 44 * 2 * math.pi
                for col, off in ((-1, 0.0), (1, 0.5 / 44 * 2 * math.pi)):
                    aa = a + off
                    tb = box("tread", (0.05, 0.07, 0.016), (c[0] + math.cos(aa) * (r + 0.006), c[1] + col * 0.045, c[2] + math.sin(aa) * (r + 0.006)), "rubber", 0.004, (0, -aa + math.pi / 2, 0))
                    tread.append(tb)
            tread_j = join(f"tread{i}{s}", tread)
            rimw = 0.17
            barrel = lathe(f"barrel{i}{s}", [(0.19, -rimw / 2), (0.2, -rimw / 2 + 0.01), (0.185, -rimw / 2 + 0.02), (0.18, rimw / 2 - 0.02), (0.195, rimw / 2 - 0.005), (0.2, rimw / 2)], "polished", c, "Y", 96)
            face_y = c[1] + s * (rimw / 2 - 0.03)
            face = lathe(f"face{i}{s}", [(0.0, 0.0), (0.06, 0.0), (0.07, 0.012), (0.17, 0.01), (0.19, 0.0)], "polished", (c[0], face_y, c[2]), "Y", 96)
            face.rotation_euler = (s * -math.pi / 2, 0, 0)
            spokes = []
            for k in range(6):
                a = k / 6 * 2 * math.pi
                sp = box("spoke", (0.11, 0.022, 0.045), (c[0] + math.cos(a) * 0.115, face_y + s * 0.012, c[2] + math.sin(a) * 0.115), "polished", 0.008, (0, -a, 0))
                spokes.append(sp)
            nuts = [cyl("nut", 0.012, 0.03, (c[0] + math.cos(k / 6 * 2 * math.pi + 0.5) * 0.055, face_y + s * 0.02, c[2] + math.sin(k / 6 * 2 * math.pi + 0.5) * 0.055), "chrome", "Y", 6) for k in range(6)]
            cap = cyl("cap", 0.035, 0.03, (c[0], face_y + s * 0.025, c[2]), "chrome", "Y", 32, 0.008)
            part("Polished wheel" if (i, s) == (0, 1) else f"Wheel {i}{s}", [tyre, tread_j, barrel, face, cap] + spokes + nuts, 3, (0, s * 1.6, 0.2))
    # radius fenders: polished stainless half-round bands, one per wheel, joined across the tandem
    fen = []
    for ax in AXLES:
        for s in (1, -1):
            o = lathe("fender", [(WHEEL_R + 0.065, -0.14), (WHEEL_R + 0.07, -0.13), (WHEEL_R + 0.07, 0.13), (WHEEL_R + 0.065, 0.14)], "chrome", (ax, s * TRACK, WHEEL_R), "Y", 64)
            # keep the top half only
            bpy.context.view_layer.update()
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.select_all(action="DESELECT")
            bpy.ops.object.mode_set(mode="OBJECT")
            for v in o.data.vertices:
                v.select = (o.matrix_world @ v.co).z < WHEEL_R + 0.02
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.delete(type="VERT")
            bpy.ops.object.mode_set(mode="OBJECT")
            sol = o.modifiers.new("t", "SOLIDIFY")
            sol.thickness = 0.004
            fen.append(o)
    for s in (1, -1):
        fen.append(box("fender_bridge", (abs(AXLES[1] - AXLES[0]) - 0.18, 0.28, 0.004), ((AXLES[0] + AXLES[1]) / 2, s * TRACK, WHEEL_R * 2 + 0.06), "chrome", 0))
    part("Radius fenders", fen, 3, (0, 0, 1.4))

    # ---- 04 frame & floor: ply floor, steel wall studs and roof bows, coin-grip, E-track, D-rings
    floor = [box("floor", (L, W - 0.04, 0.02), (0, 0, FLOOR - 0.01), "ply", 0.002), box("coin", (L - 0.02, W - 0.08, 0.004), (0, 0, FLOOR + 0.002), "coin", 0)]
    part("Marine-ply floor", floor, 4, (0, 0, 1.6))
    studs = []
    for x in np.linspace(X0 + 0.03, X1 - 0.03, int(L / 0.6) + 1):
        for s in (1, -1):
            studs.append(box("stud", (0.04, 0.04, H), (x, s * (HW - 0.035), FLOOR + H / 2), "galv", 0.004))
        studs.append(box("bow", (0.04, W - 0.08, 0.04), (x, 0, ROOF - 0.04), "galv", 0.004))
    part("Steel cage", studs, 4, (0, 0, 2.2))
    lining = [box("lining", (L - 0.04, 0.01, H - 0.06), (0, s * (HW - 0.06), FLOOR + H / 2), "white", 0.002) for s in (1, -1)]
    lining.append(box("ceiling", (L - 0.04, W - 0.14, 0.01), (0, 0, ROOF - 0.065), "white", 0.002))
    part("White interior lining", lining, 4, (0, 0, 1.8))
    etrack = []
    for s in (1, -1):
        for hgt in (0.45, 1.05):
            et = box("etrack", (L - 0.4, 0.008, 0.12), (0, s * (HW - 0.06), FLOOR + hgt), "galv", 0.002)
            etrack.append(et)
            for k in range(int((L - 0.5) / 0.05)):
                etrack.append(box("slot", (0.022, 0.004, 0.055), (-L / 2 + 0.25 + k * 0.05, s * (HW - 0.066), FLOOR + hgt), "blackplastic", 0))
    rings = [lathe("ring", [(0.03, 0.0), (0.045, 0.005), (0.06, 0.0)], "chrome", (x, s * (HW - 0.3), FLOOR + 0.004), "Z", 32) for x in np.linspace(X0 + 0.6, X1 - 0.6, 4) for s in (1, -1)]
    part("E-track & D-rings", [join("etrack_all", etrack)] + rings, 4, (0, 0, 1.2))

    # ---- 05 skin: gloss panels, crowned roof, V-nose, polished checker wrap, aluminium corners
    for s in (1, -1):
        part("Gloss side panel" if s < 0 else "Gloss side panel, kerb side", [box(f"side{s}", (L, 0.016, H), (0, s * (HW - 0.008), FLOOR + H / 2), "paint", 0.006)], 5, (0, s * 2.2, 0))
    # V-nose: two raked panels meeting at the prow
    vn = []
    for s in (1, -1):
        vn.append(prism(f"vside{s}", [(X1, s * HW), (TIP, s * 0.03), (TIP - 0.016, s * 0.022), (X1, s * (HW - 0.016))], FLOOR, ROOF, "paint", 0.004))
        vn.append(prism(f"vguard{s}", [(X1 - 0.02, s * (HW + 0.004)), (TIP + 0.01, s * 0.036), (TIP - 0.006, s * 0.03), (X1 - 0.02, s * (HW - 0.004))], FLOOR - 0.03, FLOOR + 0.62, "checker", 0.002))
    vn.append(prism("vroof", [(X1, HW), (TIP, 0.03), (TIP, -0.03), (X1, -HW)], ROOF - 0.016, ROOF, "paint", 0.004))
    vn.append(cyl("prow", 0.028, H + 0.02, (TIP - 0.004, 0, FLOOR + H / 2), "brushed", "Z", 24))
    part("V-nose", vn, 5, (2.2, 0, 0.3))
    roof = box("roof", (L + 0.02, W + 0.01, 0.03), (0, 0, ROOF - 0.015), "paint", 0.01)
    corners = [cyl("corner", 0.032, L, (0, s * HW, ROOF), "brushed", "X", 24) for s in (1, -1)]
    corners += [cyl("corner", 0.032, H, (X0, s * HW, FLOOR + H / 2), "brushed", "Z", 24) for s in (1, -1)]
    corners += [curve_tube("vtrim", [(X1, s * HW, ROOF), ((X1 + TIP) / 2, s * HW * 0.5, ROOF), (TIP, 0, ROOF)], 0.032, "brushed", 6) for s in (1, -1)]
    corners += [box("rub", (L, 0.02, 0.09), (0, s * (HW + 0.01), FLOOR + 0.05), "brushed", 0.004) for s in (1, -1)]
    part("Crowned roof", [roof], 5, (0, 0, 2.0))
    part("Aluminium trims", corners, 5, (0, 0, 1.0))

    # ---- 06 doors: rear ramp with polished face and spring assist, side door with flush lock
    ramp_h = H - 0.06
    ramp = [
        box("ramp", (0.05, W - 0.06, ramp_h), (X0 - 0.025, 0, FLOOR + ramp_h / 2), "paint", 0.006),
        box("ramp_face", (0.006, W - 0.2, ramp_h - 0.12), (X0 - 0.055, 0, FLOOR + ramp_h / 2), "checker", 0.002),
    ]
    for s in (1, -1):
        ramp.append(cyl("spring", 0.03, 0.4, (X0 - 0.04, s * (HW - 0.18), FLOOR + 0.18), "chrome", "Z", 24))
        ramp.append(box("cam", (0.03, 0.04, ramp_h - 0.3), (X0 - 0.07, s * (HW - 0.3), FLOOR + ramp_h / 2), "chrome", 0.006))
    hinge = bpy.data.objects.new("ramp_hinge", None)
    bpy.context.collection.objects.link(hinge)
    hinge.location = (X0, 0, FLOOR)
    for o in ramp:
        # children live in the hinge's space: shift them so they stay where they were drawn
        o.parent = hinge
        o.location = o.location - hinge.location
    part("Spring-assist ramp", ramp, 6, (-2.0, 0, 0))
    door = [
        box("door", (0.86, 0.03, 1.95), (X1 - 1.2, -(HW + 0.012), FLOOR + 1.0), "paint", 0.008),
        box("door_seal", (0.9, 0.006, 1.99), (X1 - 1.2, -(HW + 0.002), FLOOR + 1.0), "blackplastic", 0.002),
        box("door_handle", (0.16, 0.03, 0.06), (X1 - 1.52, -(HW + 0.035), FLOOR + 1.0), "chrome", 0.01),
        box("drip", (1.0, 0.05, 0.02), (X1 - 1.2, -(HW + 0.03), FLOOR + 2.02), "brushed", 0.006),
    ] + [cyl("door_hinge", 0.012, 0.12, (X1 - 0.76, -(HW + 0.03), FLOOR + z), "chrome", "Z", 16) for z in (0.3, 1.0, 1.7)]
    part("Side door", door, 6, (0, -1.6, 0))

    # ---- 07 systems: RGB strips, clearance lights, tail lights, roof vent
    rgb = []
    for s in (1, -1):
        rgb.append(box("rgb_under", (L + NV * 0.6, 0.04, 0.01), (0.2, s * (HW - 0.1), FLOOR - 0.03), "rgb", 0.003))
        rgb.append(box("rgb_belt", (L, 0.012, 0.022), (0, s * (HW + 0.022), FLOOR + 0.11), "rgb", 0.003))
        rgb.append(box("rgb_roof", (L, 0.012, 0.018), (0, s * (HW + 0.03), ROOF - 0.06), "rgb", 0.003))
        rgb.append(box("rgb_in", (L - 0.4, 0.04, 0.01), (0, s * (HW - 0.25), ROOF - 0.07), "rgb", 0.003))
    part("RGB lighting", rgb, 7, (0, 0, -0.8))
    lights = []
    for s in (1, -1):
        for x in (X0 + 0.1, 0, X1 - 0.1):
            lights.append(lathe("clear", [(0.0, 0.02), (0.02, 0.018), (0.028, 0.0)], "amber", (x, s * (HW + 0.002), ROOF - 0.12), "Y", 24))
            lights[-1].rotation_euler = (s * -math.pi / 2, 0, 0)
        lights.append(box("tail", (0.03, 0.18, 0.08), (X0 - 0.06, s * (HW - 0.18), FLOOR - 0.06), "red", 0.02))
        for x in (X0 + 0.05, X1 - 0.05):
            lights.append(box("roofclear", (0.05, 0.03, 0.03), (x, s * (HW - 0.06), ROOF + 0.015), "amber" if x > 0 else "red", 0.008))
    lights.append(box("vent", (0.42, 0.42, 0.06), (0.4, 0, ROOF + 0.03), "white", 0.03))
    part("LED lights & vent", lights, 7, (0, 0, 1.2))


# ----------------------------------------------------------------------------- studio
def build_studio():
    w = bpy.data.worlds.new("world")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    # view direction z: below horizon dark, a soft pale band just above it, dark overhead
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, (0.004, 0.004, 0.005, 1)
    els[1].position, els[1].color = 1.0, (0.002, 0.002, 0.003, 1)
    for pos, c in ((0.5, 0.006), (0.53, 0.085), (0.6, 0.03), (0.75, 0.006)):
        e = els.new(pos)
        e.color = (c, c, c * 1.08, 1)
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -1, 1
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    # what reflections see: a bright studio (horizon softbox band, overhead panel), while the camera
    # sees the dark cyc. Gloss paint and polished metal only look real when they mirror something.
    ramp2 = nt.nodes.new("ShaderNodeValToRGB")
    e2 = ramp2.color_ramp.elements
    e2[0].position, e2[0].color = 0.0, (0.01, 0.01, 0.01, 1)
    e2[1].position, e2[1].color = 1.0, (0.2, 0.2, 0.21, 1)
    for pos, c in ((0.49, 0.015), (0.515, 0.4), (0.545, 0.95), (0.575, 0.4), (0.62, 0.03), (0.85, 0.04), (0.95, 0.16)):
        e = e2.new(pos)
        e.color = (c, c, c * 1.04, 1)
    nt.links.new(mr.outputs["Result"], ramp2.inputs["Fac"])
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixRGB")
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(ramp2.outputs["Color"], mix.inputs["Color1"])
    nt.links.new(ramp.outputs["Color"], mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, 0))
    fl = bpy.context.object
    fl.name = "floor"
    fl.data.materials.append(MATS["floor"])

    def area(name, loc, rot, size, energy, color=(1, 1, 1), shape="RECTANGLE", spread=55):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        l = bpy.context.object
        l.name = name
        l.data.shape = shape
        l.data.size, l.data.size_y = size
        l.data.energy = energy
        l.data.color = color
        # focus each light into a pool on the trailer instead of flooding the studio
        l.data.spread = math.radians(spread)
        # light the trailer, but don't appear in shot
        l.visible_camera = False
        return l

    lights = {
        # big overhead softbox
        "key": area("key", (0.5, 0, 6.5), (0, 0, 0), (7, 3), 2600),
        # long thin strips each side: the highlight lines down the gloss panels
        "stripL": area("stripL", (0, 5.5, 2.0), (math.radians(90), 0, 0), (10, 0.35), 1400),
        "stripR": area("stripR", (0, -5.5, 2.6), (math.radians(-90), 0, 0), (10, 0.25), 900),
        # cool rim from behind, warm kicker from the front
        "rim": area("rim", (-7, 0, 3), (0, math.radians(-90), 0), (0.6, 4), 900, (0.75, 0.85, 1.0)),
        "kick": area("kick", (8, -3.5, 1.6), (0, math.radians(80), math.radians(-25)), (0.3, 3.2), 420, (1.0, 0.85, 0.7)),
        # a second strip high on the other side for a top-edge highlight
        "edge": area("edge", (-2, -6, 4.2), (math.radians(-60), 0, 0), (9, 0.2), 500),
    }
    return lights


# ----------------------------------------------------------------------------- animation
def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


CH_FRAMES = {1: (1, 34), 2: (34, 52), 3: (52, 78), 4: (78, 104), 5: (104, 136), 6: (136, 152), 7: (152, 168)}
FINALE = (168, 220)  # lights down, RGB up, ramp drops
END = FINALE[1]


SCHEDULE = []  # (part name, chapter, first frame, settled frame) for the site's captions


def animate(lights):
    scene.frame_start, scene.frame_end = 1, END
    scene.render.fps = FPS
    by_ch = {}
    for p in PARTS:
        by_ch.setdefault(p[2], []).append(p)
    for ch, plist in by_ch.items():
        f0, f1 = CH_FRAMES[ch]
        n = len(plist)
        span = (f1 - f0) / max(1, n)
        for k, (name, objs, _, off) in enumerate(plist):
            s = f0 + k * span
            e = s + max(span * 1.6, 10)
            SCHEDULE.append((name, ch, int(s), int(e)))
            for o in objs:
                base = o.location.copy()
                for f in range(int(s) - 1, int(e) + 2):
                    t = ease((f - s) / (e - s))
                    o.location = base + off * (1 - t)
                    o.keyframe_insert("location", frame=f)
                    o.hide_render = f < s
                    o.keyframe_insert("hide_render", frame=f)
                o.location = base
    # finale: studio dims, LEDs light up, ramp drops
    f0, f1 = FINALE
    for f in range(f0, f1 + 1):
        t = ease((f - f0) / 26)
        for name, l in lights.items():
            if "base" not in l:
                l["base"] = l.data.energy
            l.data.energy = l["base"] * (1 - 0.97 * t)
            l.data.keyframe_insert("energy", frame=f)
        bg = scene.world.node_tree.nodes["Background"]
        bg.inputs["Strength"].default_value = 1 - 0.85 * t
        bg.inputs["Strength"].keyframe_insert("default_value", frame=f)
        for mn, st in (("rgb", 22), ("amber", 6), ("red", 8)):
            node = MATS[mn].node_tree.nodes["Principled BSDF"]
            node.inputs["Emission Strength"].default_value = st * t
            node.inputs["Emission Strength"].keyframe_insert("default_value", frame=f)
        # RGB colour drifts magenta -> violet -> cyan
        hue = 0.86 - 0.36 * ease((f - f0) / (f1 - f0))
        import colorsys

        r, g, b = colorsys.hsv_to_rgb(hue, 0.95, 1)
        node = MATS["rgb"].node_tree.nodes["Principled BSDF"]
        node.inputs["Emission Color"].default_value = (r, g, b, 1)
        node.inputs["Emission Color"].keyframe_insert("default_value", frame=f)
        hinge = bpy.data.objects["ramp_hinge"]
        rt = ease((f - (f0 + 18)) / 26)
        hinge.rotation_euler = (0, -math.radians(78) * rt, 0)
        hinge.keyframe_insert("rotation_euler", frame=f)


def camera_rig():
    tgt = bpy.data.objects.new("target", None)
    bpy.context.collection.objects.link(tgt)
    bpy.ops.object.camera_add()
    cam = bpy.context.object
    cam.data.lens = 40
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = tgt
    cam.data.dof.aperture_fstop = 5.6
    c = cam.constraints.new("TRACK_TO")
    c.target = tgt
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    scene.camera = cam
    # (frame, azimuth deg from +x, height, distance, target): interpolated round an orbit, not in straight lines
    keys = [
        (1, -42, 3.4, 10.0, (0.6, 0, 0.4)),
        (34, -55, 1.6, 7.6, (-0.3, 0, 0.4)),
        (52, -75, 0.7, 4.8, (-0.5, -0.7, 0.4)),
        (78, -48, 2.2, 8.6, (0.0, 0, 0.9)),
        (104, -28, 2.0, 10.5, (0.6, 0, 1.3)),
        (136, -128, 1.9, 9.6, (-0.8, 0, 1.2)),
        (168, -40, 1.1, 10.4, (0.5, 0, 1.2)),
        (196, -140, 1.0, 9.4, (-0.6, 0, 1.0)),
        (220, -152, 1.2, 8.6, (-0.8, 0, 1.1)),
    ]
    def smooth01(t):
        return t * t * (3 - 2 * t)
    for f in range(1, END + 1):
        k = max(i for i, kk in enumerate(keys) if kk[0] <= f)
        a = keys[k]
        b = keys[min(k + 1, len(keys) - 1)]
        t = 0 if b[0] == a[0] else smooth01((f - a[0]) / (b[0] - a[0]))
        az = math.radians(a[1] + (b[1] - a[1]) * t)
        hgt = a[2] + (b[2] - a[2]) * t
        dist = a[3] + (b[3] - a[3]) * t
        tg = Vector(a[4]).lerp(Vector(b[4]), t)
        tgt.location = tg
        cam.location = (tg.x + math.cos(az) * dist, tg.y + math.sin(az) * dist, hgt)
        cam.keyframe_insert("location", frame=f)
        tgt.keyframe_insert("location", frame=f)
    return cam


# ----------------------------------------------------------------------------- render
def setup_render():
    rw, rh = (int(v) for v in args.res.split("x"))
    r = scene.render
    r.engine = "CYCLES"
    r.resolution_x, r.resolution_y = rw, rh
    r.resolution_percentage = 100
    r.image_settings.file_format = "PNG"
    r.film_transparent = False
    c = scene.cycles
    c.device = "CPU"
    c.samples = args.samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.02
    c.use_denoising = True
    c.denoiser = "OPENIMAGEDENOISE"
    c.max_bounces = 8
    c.glossy_bounces = 6
    c.transparent_max_bounces = 4
    c.caustics_reflective = False
    c.caustics_refractive = False
    c.blur_glossy = 0.5
    scene.view_settings.view_transform = "AgX"
    for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
        try:
            scene.view_settings.look = look
            break
        except TypeError:
            pass
    scene.view_settings.exposure = 0.0


build_materials()
build_trailer()
lights = build_studio()
animate(lights)
camera_rig()
setup_render()
if args.manifest:
    import json

    with open(args.manifest, "w") as fh:
        json.dump({"frames": END, "fps": FPS, "chapters": CH_FRAMES, "finale": FINALE, "parts": [{"name": n, "chapter": c, "start": a, "end": b} for n, c, a, b in SCHEDULE]}, fh, indent=1)
    sys.exit(0)
if args.cam:
    cam = scene.camera
    cam.animation_data_clear()
    tgt = bpy.data.objects["target"]
    tgt.animation_data_clear()
    views = {"top": ((0.4, 0, 14), (0.4, 0, 0)), "front34": ((9, -6, 2.2), (1, 0, 1.2)), "rear34": ((-8.5, -5.5, 2.0), (-1, 0, 1.2)), "side": ((0.5, -12, 1.4), (0.5, 0, 1.3))}
    cam.location, tgt.location = views[args.cam]
    cam.data.lens = 35
if args.blend:
    bpy.ops.wm.save_as_mainfile(filepath=args.blend)

frames = []
if args.stills:
    frames = [int(f) for f in args.stills.split(",")]
elif args.frames:
    a, b = args.frames.split("-")
    frames = list(range(int(a), int(b) + 1))
import os
import time

os.makedirs(args.out, exist_ok=True)
for f in frames:
    path = os.path.join(args.out, f"f{f:04d}.png")
    if os.path.exists(path) and not args.stills:
        continue
    scene.frame_set(f)
    scene.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"frame {f} {time.time() - t:.1f}s", flush=True)
