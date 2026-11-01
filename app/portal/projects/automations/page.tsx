'use client';

import Link from 'next/link';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { pBtnGhost } from '@/components/portal/portal-ui';
import ProductAutomationSettings from '@/components/portal/ProductAutomationSettings';
import type { AutomationPreset } from '@/components/portal/ProductAutomationSettings';

const PROJECT_AUTOMATION_PRESETS: AutomationPreset[] = [
  {
    key: 'project_created_notify',
    name: 'Novo projeto Notification',
    description: 'Receber aviso quando um novo projeto for criado',
    icon: 'notifications_active',
    trigger: { event: 'project.created' },
    actions: [{ tool: 'create_support_ticket', params: { subject: 'New project created: {{event.name}}', body: 'A new project "{{event.name}}" has been created. Set up the board, assign team members, and define the first sprint.' } }],
  },
  {
    key: 'task_completed_notify',
    name: 'Task Completed Alert',
    description: 'Receber aviso quando uma tarefa for concluída',
    icon: 'task_alt',
    trigger: { event: 'task.completed' },
    actions: [{ tool: 'create_support_ticket', params: { subject: 'Task completed: {{event.title}}', body: 'Task "{{event.title}}" has been marked as completed. Review if there are any follow-up items needed.' } }],
  },
  {
    key: 'task_assigned_notify',
    name: 'Task Assignment Notification',
    description: 'Avisar membros quando uma tarefa for atribuída a eles',
    icon: 'assignment_ind',
    trigger: { event: 'task.assigned' },
    actions: [{ tool: 'create_support_ticket', params: { subject: 'Task assigned: {{event.title}}', body: 'You have been assigned the task "{{event.title}}". Check the project board for details and priority.' } }],
  },
  {
    key: 'project_status_change',
    name: 'Project Status Change Alert',
    description: 'Receber aviso quando o status do projeto mudar (ativo, pausado, concluído)',
    icon: 'swap_horiz',
    trigger: { event: 'project.status.changed' },
    actions: [{ tool: 'create_support_ticket', params: { subject: 'Project status changed: {{event.name}}', body: 'Project "{{event.name}}" status has changed to {{event.status}}. Review and update team accordingly.' } }],
  },
  {
    key: 'task_created_crm',
    name: 'Log Task in CRM',
    description: 'Criar uma atividade no CRM quando uma tarefa de cliente for criada',
    icon: 'contacts',
    trigger: { event: 'task.created' },
    actions: [{ tool: 'create_support_ticket', params: { subject: 'Project task for CRM tracking: {{event.title}}', body: 'A new task "{{event.title}}" was created. Consider logging this as a CRM activity if it involves client work.' } }],
  },
];

export default function ProjectAutomationsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PortalPageHeader
        eyebrow="Projetos"
        title="Automations"
        actions={
          <Link href="/portal/projects" className={pBtnGhost}>
            <span className="material-icons text-base">arrow_back</span>
            Voltar para Projetos
          </Link>
        }
      />

      <ProductAutomationSettings
        productScope="projects"
        presets={PROJECT_AUTOMATION_PRESETS}
        title="Automações de projetos"
        description="Automatize avisos e fluxos de projetos e tarefas"
      />
    </div>
  );
}
