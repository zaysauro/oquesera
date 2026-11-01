import { EMAIL_DOMAIN } from '@/config/brand';
import { sendEmail } from './index';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://example.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `portal@${EMAIL_DOMAIN}`;

interface InviteEmailData {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  inviterName: string;
  role: string;
  inviteToken: string;
}

export async function sendInviteEmail(data: InviteEmailData) {
  const inviteUrl = `${BASE_URL}/portal/invite/${data.inviteToken}`;

  const roleLabel = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro da equipe',
    viewer: 'Leitor',
  }[data.role] || 'Membro da equipe';

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="padding:40px 32px;text-align:center;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;">Você recebeu um convite</h1>
        <p style="margin:8px 0 0;font-size:15px;color:#64748b;">para participar de <strong>${data.companyName}</strong> no Kumo One</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:15px;color:#334155;line-height:1.6;">
          Olá, ${data.recipientName},
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.6;">
          <strong>${data.inviterName}</strong> convidou você para participar de <strong>${data.companyName}</strong> com o papel de <strong>${roleLabel}</strong>.
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.6;">
          Clique no botão abaixo para criar sua senha e acessar o painel.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:#facc15;color:#0a0a0a;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
            Aceitar convite
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;line-height:1.5;">
          Este convite expira em 7 dias. Se o botão não funcionar, copie e cole este link no navegador:
        </p>
        <p style="font-size:13px;color:#0a0a0a;word-break:break-all;">
          ${inviteUrl}
        </p>
      </div>
      <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">
          Kumo One
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    from: `Kumo One <${FROM_EMAIL}>`,
    to: data.recipientEmail,
    subject: `${data.inviterName} convidou você para ${data.companyName}`,
    html,
  });
}
