'use client';

import { useState } from 'react';
import type { StepProps } from './types';
import { obLabel, obHint, obTextarea, obPrimaryBtn } from '../ob-styles';

const EXAMPLES = [
  'Barbearia no centro da cidade com atendimento por hora marcada.',
  'Escritório de contabilidade para pequenas empresas e MEIs.',
  'Restaurante de comida caseira com almoço executivo e delivery.',
];

export function StepMission({ state, setAnswers, next }: StepProps) {
  const [mission, setMission] = useState<string>(state.answers.mission ?? '');

  return (
    <div className="space-y-5">
      <div>
        <label className={obLabel}>
          Em uma frase — o que a sua empresa faz?
        </label>
        <textarea
          value={mission}
          onChange={(e) => { setMission(e.target.value); setAnswers({ mission: e.target.value }); }}
          rows={3}
          placeholder="Procure usar menos de 25 palavras…"
          maxLength={500}
          data-testid="onboarding-mission"
          className={obTextarea}
        />
        <p className="mt-1.5 text-right text-[12px] text-muted-foreground">{mission.length}/500</p>
      </div>

      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Precisa de uma ideia? Experimente:
        </p>
        <ul className="flex flex-col gap-2">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => { setMission(ex); setAnswers({ mission: ex }); }}
                className="text-left text-[13.5px] italic text-primary transition-opacity hover:opacity-75"
              >
                &ldquo;{ex}&rdquo;
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className={obHint}>
          <span className="material-icons" style={{ fontSize: 15 }}>lightbulb</span>
          Você pode ajustar isso a qualquer momento no painel.
        </p>
        <button
          type="button"
          onClick={() => next({ mission })}
          data-testid="onboarding-mission-next"
          className={obPrimaryBtn}
        >
          {mission.trim() ? 'Continuar' : 'Pular'}
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
