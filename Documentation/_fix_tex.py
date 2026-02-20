import re

filepath = r'c:\Users\yoyoy\Documents\Cryto-World-Bank\Documentation\WHITEPAPER_BCOLBD2025.tex'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ===== Issue 2A: Add \usepackage{pmboxdraw} after \usepackage{float} =====
content = content.replace(
    '\\usepackage{float}\n',
    '\\usepackage{float}\n\\usepackage{pmboxdraw}\n'
)

# ===== Issue 1: Add \hline between ALL data rows in bordered tabular envs =====
lines = content.split('\n')
new_lines = []
in_bordered_tabular = False
tables_fixed = 0
current_table_modified = False

for i, line in enumerate(lines):
    new_lines.append(line)
    stripped = line.strip()

    if '\\begin{tabular}' in line:
        in_bordered_tabular = '|' in line
        current_table_modified = False
    elif '\\end{tabular}' in line:
        if current_table_modified:
            tables_fixed += 1
        in_bordered_tabular = False
    elif in_bordered_tabular and stripped.endswith('\\\\'):
        next_idx = i + 1
        while next_idx < len(lines) and lines[next_idx].strip() == '':
            next_idx += 1
        if next_idx < len(lines):
            next_stripped = lines[next_idx].strip()
            if next_stripped != '\\hline' and not next_stripped.startswith('\\end{tabular}'):
                new_lines.append('\\hline')
                current_table_modified = True

content = '\n'.join(new_lines)

# ===== Issue 2B: Replace verbatim ASCII box-drawing with Unicode =====
def process_verbatim(match):
    text = match.group(0)
    orig_lines = text.split('\n')
    result = []

    for i, line in enumerate(orig_lines):
        if '\\begin{verbatim}' in line or '\\end{verbatim}' in line:
            result.append(line)
            continue

        # Replace runs of 2+ dashes with horizontal box-drawing char
        new_line = re.sub(r'-{2,}', lambda m: '\u2500' * len(m.group()), line)

        # Replace + corners based on context
        chars = list(new_line)
        new_chars = []
        for j, ch in enumerate(chars):
            if ch == '+':
                has_hdash_right = (j + 1 < len(chars) and chars[j + 1] == '\u2500')
                has_hdash_left = (len(new_chars) > 0 and new_chars[-1] == '\u2500')

                is_top = False
                is_bottom = False
                if i + 1 < len(orig_lines):
                    nl = orig_lines[i + 1]
                    if j < len(nl) and nl[j] == '|':
                        is_top = True
                if i - 1 >= 0:
                    pl = orig_lines[i - 1]
                    if j < len(pl) and pl[j] == '|':
                        is_bottom = True

                if has_hdash_right and not has_hdash_left:
                    # Left corner
                    new_chars.append('\u2514' if is_bottom else '\u250c')
                elif has_hdash_left and not has_hdash_right:
                    # Right corner
                    new_chars.append('\u2518' if is_bottom else '\u2510')
                elif has_hdash_left and has_hdash_right:
                    # T-junction or cross
                    if is_top and is_bottom:
                        new_chars.append('\u253c')
                    elif is_top:
                        new_chars.append('\u252c')
                    elif is_bottom:
                        new_chars.append('\u2534')
                    else:
                        new_chars.append(ch)
                else:
                    new_chars.append(ch)
            else:
                new_chars.append(ch)

        new_line = ''.join(new_chars)

        # Replace all | with vertical box-drawing char
        new_line = new_line.replace('|', '\u2502')

        # Replace * bullets (preceded by │ and space) with •
        new_line = re.sub(r'(?<=\u2502 )\* ', '\u2022 ', new_line)

        result.append(new_line)

    return '\n'.join(result)

content = re.sub(
    r'\\begin\{verbatim\}.*?\\end\{verbatim\}',
    process_verbatim,
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Tables fixed (with added \\hlines): {tables_fixed}")
print("Verbatim blocks: 2 converted to Unicode box-drawing characters")
