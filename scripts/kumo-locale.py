"""One-shot pass: en-US/USD display + Stripe currency -> config/brand.ts constants.

Skips files that parse Intl output (formatToParts / timeZone math) because
those depend on en-US field order, and test files.
"""
import os, re, sys
ROOT = sys.argv[1]
DIRS = ['app', 'components', 'lib', 'hooks', 'scripts/billing']
EXTRA = ['scripts/create-tier-stripe-products.ts']
SKIP_FILES = {'lib/booking/timezone.ts'}

def is_comment(line):
    t = line.lstrip(); return t.startswith(('//', '*', '/*', '{/*'))

def add_import(s, names, rel):
    spec = "'@/config/brand'" if not rel.startswith('scripts/') else "'../" + ('../' * (rel.count('/') - 1)) + "config/brand'"
    m = re.search(r"import \{([^}]*)\} from '(@/config/brand|(?:\.\./)+config/brand)';", s)
    if m:
        cur = {x.strip() for x in m.group(1).split(',') if x.strip()} | names
        return s.replace(m.group(0), "import { " + ", ".join(sorted(cur)) + " } from '" + m.group(2) + "';")
    line = "import { " + ", ".join(sorted(names)) + " } from " + spec + ";\n"
    m = re.search(r"^import [\s\S]*?from ['\"][^'\"]+['\"];?\n", s, flags=re.M)
    if m: return s[:m.start()] + line + s[m.start():]
    d = re.match(r"^(['\"]use (client|server)['\"];?\n)", s)
    if d: return s[:d.end()] + line + s[d.end():]
    return line + s

files = []
for d in DIRS:
    for b, _, fs in os.walk(os.path.join(ROOT, d)):
        files += [os.path.join(b, f) for f in fs if f.endswith(('.ts', '.tsx'))]
files += [os.path.join(ROOT, e) for e in EXTRA]
n = 0
for p in files:
    rel = os.path.relpath(p, ROOT)
    if rel in SKIP_FILES: continue
    s = open(p).read()
    if 'formatToParts' in s: continue
    if not re.search(r"'(en-US|USD|usd)'", s): continue
    need = set(); out = []
    for line in s.split('\n'):
        if is_comment(line): out.append(line); continue
        if rel.startswith('lib/db/schema/'):
            line = line.replace(".default('USD')", ".default('BRL')"); out.append(line); continue
        if "'en-US'" in line: line = line.replace("'en-US'", 'APP_LOCALE'); need.add('APP_LOCALE')
        if "'usd'" in line: line = line.replace("'usd'", 'STRIPE_CURRENCY'); need.add('STRIPE_CURRENCY')
        if "'USD'" in line and "label: 'USD" not in line and "value: 'USD'" not in line:
            line = line.replace("'USD'", 'APP_CURRENCY'); need.add('APP_CURRENCY')
        out.append(line)
    new = '\n'.join(out)
    if need: new = add_import(new, need, rel)
    if new != s: open(p, 'w').write(new); n += 1
print(n, 'files changed')
