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
            if re.search(r'[;{}=]|\(\)|=>|//|&&|\|\|', t) or len(t) > 220: continue
            seen.append(t)
    print(json.dumps(seen, ensure_ascii=False, indent=0))

def apply(mapfile, paths):
    m = json.load(open(mapfile))
    for p in paths:
        s = open(p).read(); o = s
        for en, pt in sorted(m.items(), key=lambda kv: -len(kv[0])):
            # "jsx:Word" only replaces JSX text (>Word<); "q:Word" only a quoted
            # literal ('Word' / "Word"). Use these for short, generic words.
            if en.startswith('jsx:'):
                w = re.escape(en[4:])
                s = re.sub(r'(>\s*)' + w + r'(\s*<)', lambda m_: m_.group(1) + pt + m_.group(2), s)
                continue
            if en.startswith('q:'):
                w = re.escape(en[2:])
                s = re.sub(r"(['\"])" + w + r"\1", lambda m_: m_.group(1) + pt + m_.group(1), s)
                continue
            words = en.split()
            if not words: continue
            # match across JSX line wrapping: any whitespace run between words
            pat = r'(?<![\w-])' + r'\s+'.join(re.escape(w) for w in words) + r'(?![\w-])'
            s = re.sub(pat, lambda _m: pt, s)
        if s != o:
            open(p, 'w').write(s); print('translated', p)

if __name__ == '__main__':
    if sys.argv[1] == 'extract': extract(sys.argv[2:])
    elif sys.argv[1] == 'apply': apply(sys.argv[2], sys.argv[3:])


def apply_tests(mapfiles, paths):
    """Mirror UI translations into test assertions: replace whole string
    literals ('x', "x", `x`) and whole regex literals (/x/, /x/i) whose
    content equals an English key from the maps."""
    m = {}
    for f in mapfiles:
        for k, v in json.load(open(f)).items():
            k = k.split(':', 1)[1] if k.startswith(('jsx:', 'q:')) else k
            if len(k) >= 2 and re.search(r'[A-Za-z]', k):
                m.setdefault(k.replace('&apos;', "'").replace('&amp;', '&').replace('&nbsp;', ' '),
                             v.replace('&apos;', "'").replace('&amp;', '&').replace('&nbsp;', ' '))
    for p in paths:
        s = open(p).read(); o = s
        def lit(mt):
            q, body = mt.group(1), mt.group(2)
            return q + m[body] + q if body in m else mt.group(0)
        s = re.sub(r"(['\"`])([^'\"`\n]{2,220})\1", lit, s)
        def rx(mt):
            body, flags = mt.group(1), mt.group(2)
            plain = body.replace('\\', '')
            if plain in m and re.escape(plain).replace('\\ ', ' ') .replace('\\-', '-') in (body, re.escape(plain)):
                return '/' + re.escape(m[plain]).replace('\\ ', ' ') + '/' + flags
            return mt.group(0)
        s = re.sub(r"(?<![\w)\]])/((?:[^/\\\n]|\\.){2,200})/([gimsuy]*)(?=[\s,)\]])", rx, s)
        if s != o:
            open(p, 'w').write(s); print('tests', p)

if __name__ == '__main__' and sys.argv[1] == 'tests':
    apply_tests(sys.argv[2].split(','), sys.argv[3:])
