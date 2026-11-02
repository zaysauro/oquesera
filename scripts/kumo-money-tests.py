"""Rewrite USD amounts asserted in unit tests to the pt-BR/BRL output of
formatMoney (Intl pt-BR uses a no-break space after R$)."""
import re, sys
NB = '\\u00a0'
def brl(intpart, cents):
    n = intpart.replace(',', '')
    grouped = f"{int(n):,}".replace(',', '.')
    return f"R${NB}{grouped},{cents}"
for p in sys.argv[1:]:
    s = open(p).read(); o = s
    # quoted literals: '$1,150.00' / '-$2.00' / '$5.00 each'
    s = re.sub(r"(['\"`])(-?)\$(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})", lambda m: f"{m.group(1)}{m.group(2)}{brl(m.group(3), m.group(4))}", s)
    # regexes like /\$5[,.]?000/ → /R\$\s?5[.,]?000/
    s = re.sub(r"/\\\$(\d)", r"/R\\$\\s?\1", s)
    if s != o: open(p, 'w').write(s); print('money', p)
