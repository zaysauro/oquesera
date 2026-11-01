/**
 * Settings tab — meeting metadata (title/description/duration), buffers,
 * advance windows, timezone, active toggle, video-conferencing choice,
 * thumbnail picker, and the danger-zone delete affordance.
 *
 * This was the largest tab in the original page — it owns all the basic
 * "what is this booking page" fields.
 */
'use client';

import MediaPicker from '@/components/admin/MediaPicker';
import { DURATION_OPTIONS } from '../_lib/constants';

interface SettingsPanelProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  bufferBefore: number;
  setBufferBefore: (v: number) => void;
  bufferAfter: number;
  setBufferAfter: (v: number) => void;
  maxAdvanceDays: number;
  setMaxAdvanceDays: (v: number) => void;
  minNoticeMins: number;
  setMinNoticeMins: (v: number) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
  conferenceType: string;
  setConferenceType: (v: string) => void;
  thumbnail: string;
  setThumbnail: (v: string) => void;
  // Monetization
  price: number | null;
  setPrice: (v: number | null) => void;
  priceLabel: string;
  setPriceLabel: (v: string) => void;
  enableAddOns: boolean;
  setEnableAddOns: (v: boolean) => void;
  enableGiftCertificates: boolean;
  setEnableGiftCertificates: (v: boolean) => void;
  enableDiscountCodes: boolean;
  setEnableDiscountCodes: (v: boolean) => void;
  enableWaivers: boolean;
  setEnableWaivers: (v: boolean) => void;
  waiverContent: string;
  setWaiverContent: (v: string) => void;
  requireWaiverBeforeBooking: boolean;
  setRequireWaiverBeforeBooking: (v: boolean) => void;
  deleteConfirm: boolean;
  setDeleteConfirm: (v: boolean) => void;
  onDelete: () => void;
}

const CONFERENCE_OPTIONS = [
  { value: 'none', label: 'None', icon: 'videocam_off', desc: 'No video call' },
  { value: 'google_meet', label: 'Google Meet', icon: 'video_call', desc: 'Requires Google Calendar' },
  { value: 'zoom', label: 'Zoom', icon: 'video_camera_front', desc: 'Requires Zoom connection' },
];

export function SettingsPanel(props: SettingsPanelProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    duration,
    setDuration,
    bufferBefore,
    setBufferBefore,
    bufferAfter,
    setBufferAfter,
    maxAdvanceDays,
    setMaxAdvanceDays,
    minNoticeMins,
    setMinNoticeMins,
    timezone,
    setTimezone,
    active,
    setActive,
    conferenceType,
    setConferenceType,
    thumbnail,
    setThumbnail,
    price,
    setPrice,
    priceLabel,
    setPriceLabel,
    enableAddOns,
    setEnableAddOns,
    enableGiftCertificates,
    setEnableGiftCertificates,
    enableDiscountCodes,
    setEnableDiscountCodes,
    enableWaivers,
    setEnableWaivers,
    waiverContent,
    setWaiverContent,
    requireWaiverBeforeBooking,
    setRequireWaiverBeforeBooking,
    deleteConfirm,
    setDeleteConfirm,
    onDelete,
  } = props;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            placeholder="Descreva o atendimento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Duração</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Intervalo antes (min)</label>
          <input
            type="number"
            min={0}
            value={bufferBefore}
            onChange={(e) => setBufferBefore(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Intervalo depois (min)</label>
          <input
            type="number"
            min={0}
            value={bufferAfter}
            onChange={(e) => setBufferAfter(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Antecedência máxima (dias)</label>
          <input
            type="number"
            min={1}
            value={maxAdvanceDays}
            onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Antecedência mínima (min)</label>
          <input
            type="number"
            min={0}
            value={minNoticeMins}
            onChange={(e) => setMinNoticeMins(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fuso horário</label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <label id="booking-active-label" className="text-sm font-medium text-foreground">Ativo</label>
          <button
            type="button"
            onClick={() => setActive(!active)}
            role="switch"
            aria-checked={active}
            aria-labelledby="booking-active-label"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Videoconferência */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <span className="material-icons text-lg">videocam</span>
          Videoconferência
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Gere automaticamente um link de videochamada para cada agendamento. O link vai no e-mail de confirmação.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {CONFERENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConferenceType(opt.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                conferenceType === opt.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span
                className={`material-icons text-xl mb-1 ${
                  conferenceType === opt.value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {opt.icon}
              </span>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Miniatura do bloco */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <span className="material-icons text-lg">image</span>
          Miniatura do bloco
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Imagem usada como miniatura quando esta página aparece no seu site.
        </p>
        <MediaPicker
          value={thumbnail}
          onChange={(url) => setThumbnail(url)}
          label="Selecionar miniatura"
          apiEndpoint="/api/portal/media"
        />
      </div>

      {/* Payments & Waivers */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <span className="material-icons text-lg">payments</span>
          Payments &amp; Waivers
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Cobre pelos agendamentos, exija sinal, colete assinaturas e aceite vales-presente ou cupons.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Preço</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price ?? ''}
                onChange={(e) => setPrice(e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deixe em branco para agendamentos gratuitos</p>
          </div>

          {/* Price label */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rótulo do preço</label>
            <input
              type="text"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              placeholder="ex.: Por sessão"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Texto curto exibido ao lado do preço</p>
          </div>
        </div>

        {/* Payment feature toggles */}
        <div className="mt-4 space-y-3">
          {(
            [
              {
                id: 'gift-certificates',
                label: 'Aceitar vales-presente',
                desc: 'Allow customers to redeem gift certificates at checkout',
                value: enableGiftCertificates,
                set: setEnableGiftCertificates,
                icon: 'card_giftcard',
              },
              {
                id: 'discount-codes',
                label: 'Aceitar cupons de desconto',
                desc: 'Allow customers to enter promo/discount codes',
                value: enableDiscountCodes,
                set: setEnableDiscountCodes,
                icon: 'local_offer',
              },
              {
                id: 'add-ons',
                label: 'Ativar adicionais',
                desc: 'Let customers purchase optional add-ons with their booking',
                value: enableAddOns,
                set: setEnableAddOns,
                icon: 'add_shopping_cart',
              },
            ] as const
          ).map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="material-icons text-lg text-muted-foreground mt-0.5">{item.icon}</span>
                <div>
                  <p id={`payment-toggle-${item.id}-label`} className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => item.set(!item.value)}
                role="switch"
                aria-checked={item.value}
                aria-labelledby={`payment-toggle-${item.id}-label`}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  item.value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    item.value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Waivers */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <span className="material-icons text-lg text-muted-foreground mt-0.5">draw</span>
              <div>
                <p id="require-waiver-label" className="text-sm font-medium text-foreground">Exigir termo / assinatura</p>
                <p className="text-xs text-muted-foreground">O cliente precisa assinar antes da confirmação</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnableWaivers(!enableWaivers)}
              role="switch"
              aria-checked={enableWaivers}
              aria-labelledby="require-waiver-label"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                enableWaivers ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableWaivers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enableWaivers && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Texto do termo</label>
                <textarea
                  value={waiverContent}
                  onChange={(e) => setWaiverContent(e.target.value)}
                  rows={5}
                  placeholder="Digite o termo de responsabilidade que o cliente deve aceitar..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-sm"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p id="block-booking-until-signed-label" className="text-sm font-medium text-foreground">Bloquear o agendamento até a assinatura</p>
                  <p className="text-xs text-muted-foreground">Impede a confirmação até o termo ser assinado</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireWaiverBeforeBooking(!requireWaiverBeforeBooking)}
                  role="switch"
                  aria-checked={requireWaiverBeforeBooking}
                  aria-labelledby="block-booking-until-signed-label"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                    requireWaiverBeforeBooking ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requireWaiverBeforeBooking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Zona de risco</h3>
        {deleteConfirm ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Tem certeza? Não é possível desfazer.</p>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Sim, excluir
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <span className="material-icons text-lg">delete</span>
            Excluir página de agendamento
          </button>
        )}
      </div>
    </div>
  );
}
