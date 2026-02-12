import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgentsSettings from './Agent_management';
import TeamsConfiguration from './Team_configuration';
import { InboxSettings, LabelsSettings, CustomAttributesSettings, Billing, MacrosSettings, IntegrationsSettings, AuditLogsSettings, CustomRolesSettings, SLASettings } from './SidebarItem';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CannedResponses from './CannedResponsesContext';

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

const SettingsSections = [
  { 
    icon: Users, 
    name: 'Agents', 
    component: AgentsSettings 
  },
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
    icon: Workflow, 
    name: 'Billing',
    component: Billing 
  },
  { 
    icon: FileText, 
    name: 'Macros', 
    component: MacrosSettings 
  },
  { 
    icon: List, 
    name: 'CannedResponses', 
    component: () => <CannedResponses onInsertResponse={(message: string) => {
    }} />
  },
  { 
    icon: Link, 
    name: 'Integrations', 
    component: IntegrationsSettings 
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
    badge: 'Beta'
  },
  { 
    icon: Clock, 
    name: 'SLA', 
    component: SLASettings,
    badge: 'Beta'
  }
];

const SettingsDashboard = () => { 
  const router = useRouter();
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
    <Card className="h-full w-full max-w-full mx-auto shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-6 flex h-full gap-6 min-h-0">
        
        {/* Sidebar - Desktop Only */}
        <div className="w-64 border-r pr-4 flex-shrink-0 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
          
          <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
            {SettingsSections.map((section) => (
              <Button
                key={section.name}
                variant={activeSection.name === section.name ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => handleSectionChange(section)}
              >
                <section.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{section.name}</span>
                {section.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex-shrink-0">
                    {section.badge}
                  </span>
                )}
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