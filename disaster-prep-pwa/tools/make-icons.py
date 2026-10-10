"""Generate simple PNG icons (white warning triangle on blue) with only the Python stdlib.
Run: python tools/make-icons.py   (writes icons/icon-192.png and icons/icon-512.png)"""
import os
import struct
import zlib

BLUE = (11, 61, 145)
WHITE = (255, 255, 255)


def inside_triangle(x, y, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
    p = (x, y)
    d1, d2, d3 = sign(p, a, b), sign(p, b, c), sign(p, c, a)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def pixel(u, v):
    # u, v in 0..1. Everything stays inside the central 60% so the icon is safe as "maskable".
    if inside_triangle(u, v, (0.5, 0.22), (0.78, 0.74), (0.22, 0.74)):
        if 0.47 <= u <= 0.53 and 0.37 <= v <= 0.58:  # exclamation bar
            return BLUE
        if (u - 0.5) ** 2 + (v - 0.656) ** 2 <= 0.033 ** 2:  # exclamation dot
            return BLUE
        return WHITE
    return BLUE


def write_png(path, size):
    ss = 3  # supersampling for smooth edges
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            r = g = b = 0
            for sy in range(ss):
                for sx in range(ss):
                    c = pixel((px + (sx + .5) / ss) / size, (py + (sy + .5) / ss) / size)
                    r += c[0]; g += c[1]; b += c[2]
            n = ss * ss
            row += bytes((r // n, g // n, b // n))
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xffffffff)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)) \
        + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
    os.makedirs(out, exist_ok=True)
    for s in (192, 512):
        write_png(os.path.join(out, "icon-%d.png" % s), s)
        print("wrote icon-%d.png" % s)
