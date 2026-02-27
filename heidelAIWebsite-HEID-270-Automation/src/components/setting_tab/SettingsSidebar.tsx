import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgentsSettings from './Agent_management';
import TeamsConfiguration from './Team_configuration';
import { InboxSettings, LabelsSettings, CustomAttributesSettings, MacrosSettings, IntegrationsSettings, AuditLogsSettings, CustomRolesSettings, SLASettings } from './SidebarItem';
import {
  Users,
  List,
  Inbox,
  Tag,
  Puzzle,
  Workflow,
  FileText,
  Shield,
  Clock,
  UserCog,
  Link,
  CreditCard,
  Sparkle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CannedResponses from './CannedResponsesContext';
import { BillingSection } from './BillingSection';
import AIPlaygroundSection from './AIPlaygroundSection';
import { useAuth } from '@clerk/nextjs';

interface AgentMember {
  id: string | number;
  identifier: string;
  role_name: string;
  user_id: string;
  public_user_data?: {
    identifier?: string;
    user_id?: string;
  };
}

interface InvitedAgent {
  id: string | number;
  email_address: string;
  status: string;
}

const AGENT_LIMIT = 5;

const ORG_IDS_ALLOWED = ['org_2zV2OOhodLocEnTybzR8t9MIYCE', 'org_39pssl1DyvwwtyKAX8euKkraGDF']

const ComingSoonSections = [
  {
    icon: UserCog,
    name: 'Teams',
    component: TeamsConfiguration
  },
  {
    icon: Inbox,
    name: 'Inboxes',
    component: InboxSettings
  },
   {
    icon: Tag,
    name: 'Labels',
    component: LabelsSettings
  },
  {
    icon: Puzzle,
    name: 'Custom Attributes',
    component: CustomAttributesSettings
  },
  {
    icon: FileText,
    name: 'Macros',
    component: MacrosSettings
  },
  {
    icon: Shield,
    name: 'Audit Logs',
    component: AuditLogsSettings
  },
  {
    icon: Users,
    name: 'Custom Roles',
    component: CustomRolesSettings,
    // badge: 'Beta'
  },
  {
    icon: Clock,
    name: 'SLA',
    component: SLASettings,
    // badge: 'Beta'
  },
]



const SettingsDashboard = () => {
  const { orgId } = useAuth();
  const router = useRouter();

  const SettingsSections = [
    {
      icon: Users,
      name: 'Agents',
      component: AgentsSettings
    },
    {
      icon: Link,
      name: 'Integrations',
      component: IntegrationsSettings
    },
    {
      icon: List,
      name: 'Canned Responses',
      component: () => <CannedResponses onInsertResponse={(message: string) => {
      }} />
    },
    ...(ORG_IDS_ALLOWED.includes(orgId as string) 
      ? [{
          icon: Sparkle,
          name: 'AI Playground',
          component: AIPlaygroundSection
        }] 
      : []
    ),
    {
      icon: CreditCard,
      name: 'Billing',
      component: BillingSection
    },
  ];

  const [activeSection, setActiveSection] = useState(SettingsSections[0]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const section = SettingsSections.find((s) => s.name.toLowerCase() === hash.toLowerCase());
    if (section) {
      setActiveSection(section);
    }
  }, []);

  // Listen for integrations open event
  useEffect(() => {
    const handleOpenIntegrations = () => {
      const integrationsSection = SettingsSections.find(s => s.name === 'Integrations');
      if (integrationsSection) {
        setActiveSection(integrationsSection);
        router.push('#integrations');
      }
    };

    window.addEventListener('openIntegrationsSettings', handleOpenIntegrations);

    return () => {
      window.removeEventListener('openIntegrationsSettings', handleOpenIntegrations);
    };
  }, [router]);

  const handleSectionChange = (section: typeof SettingsSections[0]) => {
    setActiveSection(section);
    router.push(`#${section.name.toLowerCase()}`);
  };

  return (
    <Card className="h-full w-full max-w-full mx-auto rounded-none shadow-lg overflow-hidden">
      <CardContent className="p-6 flex h-full gap-6 min-h-0">

        {/* Sidebar - Desktop Only */}
        <div className="w-52 border-r pr-4 flex-shrink-0 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>

          <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
            {/* 1. Main Settings Sections */}
            {SettingsSections.map((section) => (
              <Button
                key={section.name}
                size={'nav'}
                variant={activeSection.name === section.name ? 'activeNavElement' : 'defaultNavElement'}
                className="w-full justify-start text-sm"
                onClick={() => handleSectionChange(section)}
              >
                <section.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{section.name}</span>
                {/* {section.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex-shrink-0">
                    {section.badge}
                  </span>
                )} */}
              </Button>
            ))}

            {/* 2. Visual Separator / Section Header */}
            <div className="py-2">
              <div className="flex-grow border-t border-gray-200"></div>
     
            </div>

            {/* 3. Coming Soon Sections */}
            {ComingSoonSections.map((section) => (
              <Button
                key={section.name}
                size={'nav'}
                variant={activeSection.name === section.name ? 'activeNavElement' : 'defaultNavElement'}
                // Added opacity-75 to make them look slightly muted compared to main settings
                className="w-full justify-start text-sm "
                onClick={() => handleSectionChange(section)}
              >
                <section.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{section.name}</span>

              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {activeSection.name === 'Agents' ? (
            <AgentsSettings />
          ) : (
            React.createElement(activeSection.component)
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsDashboard;