// Minimal numeric tween (requestAnimationFrame) covering the two calls the 3D
// scenes need — `to(target, {…props, duration, ease, onUpdate})` and
// `killTweensOf(target)`. Replaces GSAP, whose standard licence restricts use
// in products that compete with Webflow (Kumo One ships a site builder).

type Props = Record<string, unknown> & {
  duration?: number;
  ease?: string;
  onUpdate?: () => void;
  onComplete?: () => void;
};

const active = new Map<object, Set<number>>();

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function to(target: object, props: Props): void {
  const { duration = 1, onUpdate, onComplete, ease: _ease, ...values } = props;
  const obj = target as Record<string, number>;
  const keys = Object.keys(values).filter((k) => typeof values[k] === 'number' && typeof obj[k] === 'number');
  const from = Object.fromEntries(keys.map((k) => [k, obj[k]]));
  const start = performance.now();
  const ids = active.get(target) ?? new Set<number>();
  active.set(target, ids);
  let id = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / (duration * 1000));
    const e = easeInOutQuad(t);
    for (const k of keys) obj[k] = from[k] + ((values[k] as number) - from[k]) * e;
    onUpdate?.();
    if (t < 1) {
      ids.delete(id);
      id = requestAnimationFrame(step);
      ids.add(id);
    } else {
      ids.delete(id);
      onComplete?.();
    }
  };
  id = requestAnimationFrame(step);
  ids.add(id);
}

function killTweensOf(target: object): void {
  const ids = active.get(target);
  if (!ids) return;
  ids.forEach((i) => cancelAnimationFrame(i));
  active.delete(target);
}

export const tween = { to, killTweensOf };
