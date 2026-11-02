"""Mirror pt-BR UI translations into the unit tests that cover the changed
files. For each test, a string is rewritten only when the English text is
gone from the source modules that test imports and its translation is there,
so assertions follow the real UI copy instead of a guess."""
import glob, json, os, re, sys
ROOT = sys.argv[1]
tests = sys.argv[2:]
pairs = {}
for f in glob.glob(os.path.join(ROOT, 'scripts/kumo-i18n/[!_]*.json')) + [os.path.join(ROOT, 'scripts/kumo-i18n/_diff-map.json')]:
    for k, v in json.load(open(f)).items():
        k = k.split(':', 1)[1] if k.startswith(('jsx:', 'q:')) else k
        fix = lambda t: t.replace('&apos;', "'").replace('&amp;', '&').replace('&nbsp;', ' ')
        k, v = fix(k), fix(v)
        pairs.setdefault(k, v)
        ks, vs = k.rstrip('.!?…:'), v.rstrip('.!?…:')
        if ks != k and len(ks) >= 3: pairs.setdefault(ks, vs)

def resolve(spec):
    if not spec.startswith('@/'): return None
    base = os.path.join(ROOT, spec[2:])
    for c in [base, base + '.tsx', base + '.ts', base + '/index.tsx', base + '/index.ts', base + '/page.tsx']:
        if os.path.isfile(c): return c
    return None

def sources_for(test_src):
    out = []
    for spec in re.findall(r"""(?:from|import\(|vi\.mock\()\s*['"](@/[^'"]+)['"]""", test_src):
        p = resolve(spec)
        if p: out.append(p)
    # one more level: siblings imported relatively by those modules
    extra = []
    for p in out:
        d = os.path.dirname(p)
        for spec in re.findall(r"""from\s+['"](\.{1,2}/[^'"]+)['"]""", open(p).read()):
            b = os.path.normpath(os.path.join(d, spec))
            for c in [b + '.tsx', b + '.ts', b + '/index.tsx']:
                if os.path.isfile(c): extra.append(c); break
    return out + extra

changed = 0
for t in tests:
    s = open(t).read()
    srcs = sources_for(s)
    if not srcs: continue
    blob = '\n'.join(open(p).read() for p in srcs)
    norm = re.sub(r'\s+', ' ', blob)
    ui = {t.strip() for t in re.findall(r'>([^<>{}]+)<', norm)}
    ui |= set(re.findall(r"'([^'\n]*)'", norm)) | set(re.findall(r'"([^"\n]*)"', norm)) | set(re.findall(r'`([^`\n]*)`', norm))
    local = {k: v for k, v in pairs.items() if k not in ui and v in norm}
    if not local: continue
    def prefix_target(body):
        # A partial assertion (toContain / regex prefix) of one translated
        # sentence: use that sentence's translation, minus end punctuation.
        if len(body) < 8 or body in local: return local.get(body)
        hits = {v.rstrip('.!?…:') for k, v in local.items() if k.startswith(body) or (len(body) >= 14 and body in k)}
        return next(iter(hits)) if len(hits) == 1 else None
    def lit(m):
        q, body = m.group(1), m.group(2)
        return q + local[body] + q if body in local else m.group(0)
    o = s
    s = re.sub(r"(['\"`])([^'\"`\n]{2,300})\1", lit, s)
    def rx(m):
        body, flags = m.group(1), m.group(2)
        plain = re.sub(r'\\(.)', r'\1', body)
        if plain in local:
            return '/' + re.escape(local[plain]).replace('\\ ', ' ').replace('/', '\\/') + '/' + flags
        return m.group(0)
    s = re.sub(r"(?<![\w)\]])/((?:[^/\\\n]|\\.){2,200})/([gimsuy]*)(?=[\s,)\]])", rx, s)
    if s != o:
        open(t, 'w').write(s); changed += 1
print(changed, 'tests updated')
