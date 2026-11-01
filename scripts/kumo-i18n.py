"""Exact-string UI translation helper for Kumo One (pt-BR).

  extract FILE...           print the user-visible English strings found
  apply MAP.json FILE...    replace exact strings (JSX text and string literals)

Extraction is heuristic (JSX text nodes plus quoted literals in UI-ish props
and calls); application only touches strings listed in the map, matched
exactly, so code identifiers are never rewritten.
"""
import json, re, sys

TEXT = re.compile(r">([^<>{}]*[A-Za-z][^<>{}]*)<", re.S)
LIT = re.compile(r"""(?:placeholder|title|label|aria-label|panelSubtitle|panelTitle|description|subtitle|emptyText|message|error|alt|confirmText|heading)=?\s*[:=]?\s*\{?\s*(['"`])([^'"`\n]*[A-Za-z][^'"`\n]*)\1""")
CALL = re.compile(r"""(?:setError|setMessage|setSuccess|toast(?:\.\w+)?|alert|confirm|setNotice|setStatus|showToast|throw new Error)\(\s*(['"`])([^'"`\n]*[A-Za-z][^'"`\n]*)\1""")
TERN = re.compile(r"""\?\s*(['"])([A-Z][^'"\n]*)\1\s*:\s*(['"])([A-Z][^'"\n]*)\3""")

def extract(paths):
    seen = []
    for p in paths:
        s = open(p).read()
        found = [m.group(1) for m in TEXT.finditer(s)]
        found += [m.group(2) for m in LIT.finditer(s)] + [m.group(2) for m in CALL.finditer(s)]
        for m in TERN.finditer(s): found += [m.group(2), m.group(4)]
        for f in found:
            t = ' '.join(f.split())
            if len(t) < 2 or not re.search(r'[a-z]{2}', t) or t in seen: continue
            if re.fullmatch(r'[\w./:-]+', t) and not re.search(r'[A-Z]', t[:1]): continue
            seen.append(t)
    print(json.dumps(seen, ensure_ascii=False, indent=0))

def apply(mapfile, paths):
    m = json.load(open(mapfile))
    for p in paths:
        s = open(p).read(); o = s
        for en, pt in sorted(m.items(), key=lambda kv: -len(kv[0])):
            words = en.split()
            if not words: continue
            # match across JSX line wrapping: any whitespace run between words
            pat = r'(?<![\w-])' + r'\s+'.join(re.escape(w) for w in words) + r'(?![\w-])'
            s = re.sub(pat, lambda _m: pt, s)
        if s != o:
            open(p, 'w').write(s); print('translated', p)

if __name__ == '__main__':
    if sys.argv[1] == 'extract': extract(sys.argv[2:])
    else: apply(sys.argv[2], sys.argv[3:])
