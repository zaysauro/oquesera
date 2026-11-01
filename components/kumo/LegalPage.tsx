import type { ReactNode } from 'react';
import { OPERATOR_CNPJ, OPERATOR_LEGAL_NAME } from '@/config/brand';

export function operatorLabel(): string {
  if (!OPERATOR_LEGAL_NAME) return 'a empresa responsável pela operação do Kumo One';
  return OPERATOR_CNPJ ? `${OPERATOR_LEGAL_NAME}, inscrita no CNPJ sob o nº ${OPERATOR_CNPJ}` : OPERATOR_LEGAL_NAME;
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {updated}</p>
      <div className="mt-8 space-y-6 leading-relaxed text-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:space-y-1 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </article>
  );
}
