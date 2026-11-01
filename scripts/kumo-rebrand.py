"""One-shot rebrand pass: SimplerDevelopment product name/domain -> Kumo One config.

Touches only non-comment lines of app/components/lib/config/hooks/contexts
TypeScript sources. Package names (@simplerdevelopment/*), GitHub URLs and
upstream attribution are left alone on purpose.
"""
import os, re, sys
ROOT = sys.argv[1]
DIRS = ['app', 'components', 'lib', 'hooks', 'contexts']
SKIP = {'config/brand.ts'}
changed = []

def is_comment(line):
    t = line.lstrip()
    return t.startswith('//') or t.startswith('*') or t.startswith('/*') or t.startswith('{/*')

def add_import(s, names):
    m = re.search(r"^import [\s\S]*?from ['\"][^'\"]+['\"];?\n", s, flags=re.M)
    line = f"import {{ {', '.join(sorted(names))} }} from '@/config/brand';\n"
    if m:
        return s[:m.start()] + line + s[m.start():]
    d = re.match(r"^(['\"]use (client|server)['\"];?\n)", s)
    if d:
        return s[:d.end()] + line + s[d.end():]
    return line + s

for d in DIRS:
    for base, _, files in os.walk(os.path.join(ROOT, d)):
        for f in files:
            if not f.endswith(('.ts', '.tsx')): continue
            p = os.path.join(base, f); rel = os.path.relpath(p, ROOT)
            if rel in SKIP: continue
            src = open(p).read()
            if not re.search(r'SimplerDev|Simpler Development|simplerdevelopment\.com', src): continue
            need = set(); out = []
            for line in src.split('\n'):
                if is_comment(line):
                    out.append(line); continue
                o = line
                # JSX attribute with a quoted brand-domain email: href="mailto:x@sd.com"
                def jsx_attr(m):
                    need.add('EMAIL_DOMAIN'); return '={`' + m.group(1) + '@${EMAIL_DOMAIN}' + m.group(2) + '`}'
                line = re.sub(r'="([^"`$\n]*)@simplerdevelopment\.com([^"\n]*)"', jsx_attr, line)
                def q_email(m):
                    need.add('EMAIL_DOMAIN'); return '`' + m.group(2) + '@${EMAIL_DOMAIN}' + m.group(3) + '`'
                line = re.sub(r"(['\"])([^'\"`$\n]*)@simplerdevelopment\.com([^'\"`\n]*)\1", q_email, line)
                if '`' in line and '@simplerdevelopment.com' in line:
                    need.add('EMAIL_DOMAIN'); line = line.replace('@simplerdevelopment.com', '@${EMAIL_DOMAIN}')
                if re.search(r"'\.simplerdevelopment\.com'", line):
                    need.add('PLATFORM_ROOT_DOMAIN'); line = re.sub(r"'\.simplerdevelopment\.com'", '`.${PLATFORM_ROOT_DOMAIN}`', line)
                if re.search(r"'simplerdevelopment\.com'", line):
                    need.add('PLATFORM_ROOT_DOMAIN'); line = re.sub(r"'simplerdevelopment\.com'", 'PLATFORM_ROOT_DOMAIN', line)
                if '`' in line and '.simplerdevelopment.com' in line:
                    need.add('PLATFORM_ROOT_DOMAIN'); line = line.replace('.simplerdevelopment.com', '.${PLATFORM_ROOT_DOMAIN}')
                # Example URLs in placeholders / copy
                line = re.sub(r'https://(staging\.|www\.)?simplerdevelopment\.com', 'https://example.com', line)
                line = line.replace('SimplerDevelopment2026', 'Kumo One')
                line = re.sub(r'(?<![/@\w-])SimplerDevelopment(?![/\w-])', 'Kumo One', line)
                line = line.replace('Simpler Development', 'Kumo One')
                line = re.sub(r'\bSimplerDev(?= )', 'Kumo', line)
                out.append(line)
            new = '\n'.join(out)
            if new != src:
                if need: new = add_import(new, need)
                open(p, 'w').write(new); changed.append(rel)
print(len(changed), 'files changed')
