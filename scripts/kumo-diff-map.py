"""Build an EN->PT map from the real source diff (import commit .. HEAD):
for each changed line pair, the differing quoted literals / JSX text
segments become candidate pairs. Ambiguous keys (mapped to >1 value) are
dropped. Output JSON on stdout."""
import json, re, subprocess, sys, difflib, collections
BASE = sys.argv[1]
diff = subprocess.run(['git', 'diff', '-U0', BASE, 'HEAD', '--', 'app', 'components', 'lib'],
                      capture_output=True, text=True).stdout
pairs = collections.defaultdict(set)
TOK = re.compile(r"""'[^'\n]*'|"[^"\n]*"|`[^`\n]*`|>[^<>{}\n]+<""")
def segs(line):
    return [t for t in TOK.findall(line)]
for hunk in re.split(r'^@@.*@@.*$', diff, flags=re.M):
    minus = [l[1:] for l in hunk.split('\n') if l.startswith('-') and not l.startswith('---')]
    plus = [l[1:] for l in hunk.split('\n') if l.startswith('+') and not l.startswith('+++')]
    for a, b in zip(minus, plus):
        sa, sb = segs(a), segs(b)
        sm = difflib.SequenceMatcher(None, sa, sb)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == 'replace' and (i2 - i1) == (j2 - j1):
                for x, y in zip(sa[i1:i2], sb[j1:j2]):
                    x2, y2 = x.strip('\'"`<> ').strip(), y.strip('\'"`<> ').strip()
                    if x2 and y2 and x2 != y2 and re.search(r'[A-Za-z]{2}', x2) and '${' not in x2 + y2:
                        pairs[x2].add(y2)
out = {k: next(iter(v)) for k, v in pairs.items() if len(v) == 1}
json.dump(out, sys.stdout, ensure_ascii=False, indent=0)
