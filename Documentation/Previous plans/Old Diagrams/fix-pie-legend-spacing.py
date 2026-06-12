#!/usr/bin/env python3
"""Expand vertical spacing between pie legend rows after large-font render."""
import re
import sys
from pathlib import Path

ROW_GAP = 220


def main(path: str) -> None:
    text = Path(path).read_text()
    pattern = re.compile(
        r'<g class="legend" transform="translate\(([-0-9.]+),([-0-9.]+)\)">'
    )
    matches = list(pattern.finditer(text))
    if len(matches) < 2:
        Path(path).write_text(text)
        return

    ys = [float(m.group(2)) for m in matches]
    mid = sum(ys) / len(ys)
    new_ys = [mid + (i - (len(ys) - 1) / 2) * ROW_GAP for i in range(len(ys))]

    parts: list[str] = []
    last = 0
    for m, ny in zip(matches, new_ys):
        parts.append(text[last : m.start()])
        parts.append(
            f'<g class="legend" transform="translate({m.group(1)},{ny:.0f})">'
        )
        last = m.end()
    parts.append(text[last:])
    text = "".join(parts)

    vb = re.search(r'viewBox="([^"]+)"', text)
    if vb:
        nums = [float(x) for x in vb.group(1).split()]
        pie_offset = 225
        margin = 100
        ymin = min(nums[1], pie_offset + min(new_ys) - margin)
        ymax_need = max(nums[3], pie_offset + max(new_ys) + margin + 200)
        if ymin < nums[1]:
            nums[3] = ymax_need + (nums[1] - ymin)
            nums[1] = ymin
        else:
            nums[3] = ymax_need
        vb_new = "viewBox=\"" + " ".join(str(int(n) if n == int(n) else n) for n in nums) + "\""
        text = text.replace(vb.group(0), vb_new, 1)

    Path(path).write_text(text)


if __name__ == "__main__":
    main(sys.argv[1])
