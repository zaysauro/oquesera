'use client';

/**
 * Portal contract detail page with DropboxSign e-signature controls.
 *
 * Shows the contract metadata + clauses, plus an e-sign panel that
 * lets the owner send for signature, the signer sign in an embedded
 * iframe, and either party view the audit-trail events.
 *
 * Material Icons only — no emoji.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { pBtnPrimary, pBtnGhost } from '@/components/portal/portal-ui';

interface ContractClause {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

interface Signer {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  signedAt: string | null;
}

interface Contract {
  id: number;
  clientId: number;
  title: string;
  summary: string | null;
  status: string;
  clauses: ContractClause[] | null;
  currency: string | null;
  esignProvider: string | null;
  esignProviderRequestId: string | null;
  esignSignerEmail: string | null;
  esignSignerName: string | null;
  esignStatus: string | null;
  esignSentAt: string | null;
  esignSignedAt: string | null;
  esignDeclinedAt: string | null;
  esignAuditFileUrl: string | null;
  signers?: Signer[];
}

interface SigningEvent {
  id: number;
  contractId: number;
  kind: string;
  actorEmail: string | null;
  occurredAt: string;
  payload: Record<string, unknown> | null;
}

const ESIGN_LABEL: Record<string, string> = {
  not_sent: 'Not sent',
  sent: 'Sent — awaiting signature',
  viewed: 'Opened by signer',
  signed: 'Assinado',
  declined: 'Recusada',
  canceled: 'Canceled',
};

const ESIGN_COLOR: Record<string, string> = {
  not_sent: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-800',
  signed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-200 text-gray-600',
};

const EVENT_ICON: Record<string, string> = {
  sent: 'send',
  opened: 'visibility',
  viewed: 'visibility',
  signed: 'check_circle',
  all_signed: 'verified',
  declined: 'cancel',
  canceled: 'block',
  webhook: 'webhook',
};

export default function PortalContractDetailPage() {
  const params = useParams<{ id: string }>();
  const contractId = params?.id;

  const [contract, setContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<SigningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Sign-in-app modal state
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        fetch(`/api/portal/crm/contracts/${contractId}`),
        fetch(`/api/portal/crm/contracts/${contractId}/signing-events`),
      ]);
      const cJson = await cRes.json();
      const eJson = await eRes.json();
      if (cJson.success) {
        setContract(cJson.data as Contract);
      } else {
        setErrorText(cJson.error || 'Não foi possível carregar o contrato');
      }
      if (eJson.success) {
        setEvents(eJson.data as SigningEvent[]);
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Não foi possível carregar o contrato');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const esignStatus = contract?.esignStatus ?? 'not_sent';
  const canSend = useMemo(() => {
    if (!contract) return false;
    return ['not_sent', 'declined', 'canceled'].includes(esignStatus);
  }, [contract, esignStatus]);
  const canSign = ['sent', 'viewed'].includes(esignStatus);
  const canCancel = ['sent', 'viewed'].includes(esignStatus);

  const handleSend = async () => {
    if (!contractId) return;
    setSending(true);
    setErrorText(null);
    try {
      const res = await fetch(`/api/portal/crm/contracts/${contractId}/send-for-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, signerEmail }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorText(json.error || 'Não foi possível enviar for signature');
      } else {
        setSendDialogOpen(false);
        await reload();
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Não foi possível enviar');
    } finally {
      setSending(false);
    }
  };

  const handleSignNow = async () => {
    if (!contractId) return;
    setSignLoading(true);
    setErrorText(null);
    try {
      const res = await fetch(`/api/portal/crm/contracts/${contractId}/sign-url`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorText(json.error || 'Não foi possível obter o link de assinatura');
      } else {
        setSignUrl(json.data.signUrl);
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Não foi possível obter o link de assinatura');
    } finally {
      setSignLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!contractId) return;
    if (!confirm('Cancelar este pedido de assinatura? Não é possível desfazer.')) return;
    try {
      const res = await fetch(`/api/portal/crm/contracts/${contractId}/cancel-signature`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorText(json.error || 'Não foi possível cancelar');
      } else {
        await reload();
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Não foi possível cancelar');
    }
  };

  if (loading) {
    return <div className="p-6 text-muted-foreground">Carregando contrato...</div>;
  }
  if (!contract) {
    return (
      <div className="p-6">
        <div className="text-foreground font-semibold">Contrato não encontrado</div>
        {errorText && <div className="text-sm text-red-600 mt-2">{errorText}</div>}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/portal/crm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1">
        <span className="material-icons text-sm">arrow_back</span>
        CRM
      </Link>
      <PortalPageHeader eyebrow="CRM" title={contract.title} />

      {errorText && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="material-icons text-sm align-middle mr-1">error</span>
          {errorText}
        </div>
      )}

      {/* Assinatura eletrônica panel */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="material-icons text-foreground">draw</span>
            <div>
              <div className="font-semibold text-foreground">Assinatura eletrônica</div>
              <div className="text-xs text-muted-foreground">
                Via DropboxSign (requer configuração) — assinatura incorporada, sem troca de e-mails.
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESIGN_COLOR[esignStatus] ?? 'bg-gray-100 text-gray-700'}`}>
            {ESIGN_LABEL[esignStatus] ?? esignStatus}
          </span>
        </div>

        {contract.esignSignerEmail && (
          <div className="text-sm text-muted-foreground">
            Signatário: <span className="font-medium text-foreground">{contract.esignSignerName}</span>{' '}
            &lt;{contract.esignSignerEmail}&gt;
            {contract.esignSentAt && (
              <span className="ml-2">· sent {new Date(contract.esignSentAt).toLocaleString()}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {canSend && (
            <button
              onClick={() => setSendDialogOpen(true)}
              className={pBtnPrimary}
            >
              <span className="material-icons text-base">send</span>
              Enviar para assinatura
            </button>
          )}
          {canSign && (
            <button
              onClick={handleSignNow}
              disabled={signLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              <span className="material-icons text-base">edit_note</span>
              {signLoading ? 'Carregando…' : 'Assinar agora'}
            </button>
          )}
          {canCancel && (
            <button
              onClick={handleCancel}
              className={pBtnGhost}
            >
              <span className="material-icons text-base">block</span>
              Cancelar pedido de assinatura
            </button>
          )}
          {esignStatus === 'signed' && contract.esignAuditFileUrl && (
            <a
              href={contract.esignAuditFileUrl}
              target="_blank"
              rel="noreferrer"
              className={pBtnGhost}
            >
              <span className="material-icons text-base">picture_as_pdf</span>
              Baixar PDF assinado
            </a>
          )}
        </div>
      </div>

      {/* Trilha de auditoria */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons text-muted-foreground">history</span>
          <h2 className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-foreground">Trilha de auditoria</h2>
        </div>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">Nenhum evento de assinatura ainda.</div>
        ) : (
          <ol className="space-y-2">
            {events.map(ev => (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <span className="material-icons text-base text-muted-foreground mt-0.5">
                  {EVENT_ICON[ev.kind] ?? 'event'}
                </span>
                <div>
                  <div>
                    <span className="font-medium text-foreground capitalize">{ev.kind.replace('_', ' ')}</span>
                    {ev.actorEmail && <span className="text-muted-foreground"> · {ev.actorEmail}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(ev.occurredAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Send dialog */}
      {sendDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full">
            <h3 className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-foreground mb-3">Enviar contrato para assinatura</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Nome do signatário</span>
                <input
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Maria Silva"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">E-mail do signatário</span>
                <input
                  value={signerEmail}
                  onChange={e => setSignerEmail(e.target.value)}
                  type="email"
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="maria@exemplo.com.br"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSendDialogOpen(false)}
                className={pBtnGhost}
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !signerEmail || !signerName}
                className={pBtnPrimary}
              >
                {sending ? 'Enviando…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign-now embedded modal */}
      {signUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-foreground">Assinar contrato</div>
              <button
                onClick={() => {
                  setSignUrl(null);
                  void reload();
                }}
                className="material-icons text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                close
              </button>
            </div>
            <iframe
              src={signUrl}
              title="DropboxSign"
              className="flex-1 w-full"
              // The DropboxSign embed page handles its own permissions.
            />
          </div>
        </div>
      )}
    </div>
  );
}
