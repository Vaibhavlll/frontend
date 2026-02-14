import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { STEP_SECTIONS, StepIcon } from './stepDefinitions';

const TRIGGER_SECTIONS = STEP_SECTIONS.filter((s) => s.category === 'trigger');

interface AddStepMenuProps {
  onClose: () => void;
  onSelect?: (type: string, app?: string, logicType?: string) => void;
  onSelectStep?: (stepId: string) => void;
  isFirstStep?: boolean;
}

// App Icon Component
const AppIcon = ({ app, size = 'w-6 h-6' }: { app?: string; size?: string }) => {
  if (app === 'instagram') {
    return (
      <svg className={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-gradient-menu)" />
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
        <defs>
          <linearGradient id="instagram-gradient-menu" x1="2" y1="22" x2="22" y2="2">
            <stop offset="0%" stopColor="#FD5949" />
            <stop offset="50%" stopColor="#D6249F" />
            <stop offset="100%" stopColor="#285AEB" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  if (app === 'whatsapp') {
    return (
      <svg className={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#25D366" />
        <path d="M17.5 14.45c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z" fill="white" />
      </svg>
    );
  }
  
  if (app === 'email') {
    return (
      <svg className={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" fill="#3B82F6" />
        <path d="M3 7l9 6 9-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  
  return null;
};

export function AddStepMenu({ onClose, onSelect, onSelectStep, isFirstStep }: AddStepMenuProps) {
  const handleStepClick = (stepId: string) => {
    if (onSelectStep) {
      onSelectStep(stepId);
    } else if (onSelect) {
      const section = STEP_SECTIONS.flatMap((s) => s.steps).find((s) => s.id === stepId);
      if (section) {
        onSelect(section.type, section.app, section.logicType);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-[999]"
        onClick={onClose}
      />
      
      {/* Right Sidebar Panel – Choose Next Step (same list as left sidebar) */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-[1000] animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{isFirstStep ? 'Choose first step 👋' : 'Choose Next Step'}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {STEP_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all group text-left flex items-center gap-3"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${step.bgColor}`}>
                      <StepIcon step={step} size="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {step.label}
                        {(step as { pro?: boolean }).pro && (
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-bold rounded uppercase">PRO</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export interface TriggerSelectionModalProps {
  onClose: () => void;
  onSelectTrigger: (stepId: string) => void;
}

export function TriggerSelectionModal({ onClose, onSelectTrigger }: TriggerSelectionModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(TRIGGER_SECTIONS[0]?.title ?? 'Instagram');

  const filteredSteps = useMemo(() => {
    const section = TRIGGER_SECTIONS.find((s) => s.title === activeCategory);
    if (!section) return [];
    let steps = section.steps;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      steps = steps.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    return steps;
  }, [activeCategory, search]);

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Start automation when...</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in Instagram"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <aside className="w-48 border-r border-slate-100 p-3 space-y-0.5 shrink-0 bg-slate-50/50">
            {TRIGGER_SECTIONS.map((section) => (
              <button
                key={section.title}
                type="button"
                onClick={() => setActiveCategory(section.title)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                  activeCategory === section.title
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {section.title === 'Instagram' ? (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-trigger)" />
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                    <defs>
                      <linearGradient id="ig-trigger" x1="2" y1="22" x2="22" y2="2">
                        <stop offset="0%" stopColor="#FD5949" />
                        <stop offset="50%" stopColor="#D6249F" />
                        <stop offset="100%" stopColor="#285AEB" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">👤</span>
                )}
                {section.title}
              </button>
            ))}
          </aside>

          <main className="flex-1 overflow-y-auto p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Triggers</h3>
            <p className="text-sm text-slate-500 mb-4">Specific event that starts your automation.</p>
            <div className="space-y-2">
              {filteredSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectTrigger(step.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left group"
                >
                  <div className={`p-2 rounded-xl shrink-0 ${step.bgColor}`}>
                    <StepIcon step={step} size="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-2">
                      {step.label}
                      {(step as { pro?: boolean }).pro && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-bold rounded uppercase">PRO</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {filteredSteps.length === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">No triggers match your search.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export function ConnectChannelModal({ onClose }: { onClose: () => void }) {
  const channels = [
    { name: 'Instagram', app: 'instagram', desc: 'Sync DMs and Comment threads.' },
    { name: 'WhatsApp', app: 'whatsapp', desc: 'Enterprise business API integration.' },
    { name: 'Email (SMTP)', app: 'email', desc: 'Direct transactional server delivery.' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-slate-200">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Integrations</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Connect your workspace to target channels.</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-2xl font-light">✕</button>
        </div>
        <div className="p-10 space-y-4 overflow-y-auto">
          {channels.map(ch => (
            <div key={ch.name} className="p-5 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-400 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all">
                  <AppIcon app={ch.app} size="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">{ch.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight">{ch.desc}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-slate-100 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">Authorize</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TemplatesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[75vh] overflow-hidden border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Flow Library</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-2xl font-light">✕</button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-56 border-r border-slate-100 p-8 space-y-6 bg-slate-50/30">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Industry</h4>
              <p className="text-xs font-bold text-indigo-600 cursor-pointer">E-Commerce</p>
              <p className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">SaaS Lead Gen</p>
              <p className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Support</p>
            </div>
          </aside>

          <main className="flex-1 p-8 overflow-y-auto grid grid-cols-2 gap-6 bg-[#fcfcfd]">
            <TemplateCard 
              title="Post Comment to Discount" 
              desc="Auto-replies to Reel comments with a trackable discount link."
              apps={['instagram', 'email']}
            />
            <TemplateCard 
              title="Keyword Intent Redirect" 
              desc="Parses DMs for 'support' and connects to human agent."
              apps={['whatsapp']}
            />
            <TemplateCard 
              title="Email Follow-up Sequence" 
              desc="Automated multi-day drip for abandoned checkout events."
              apps={['email']}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

const TemplateCard = ({ title, desc, apps }: { title: string; desc: string; apps: string[] }) => (
  <div className="p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between">
    <div>
      <div className="flex items-center gap-2 mb-3">
        {apps.map((app, idx) => (
          <div key={idx} className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white transition-all">
            <AppIcon app={app} size="w-4 h-4" />
          </div>
        ))}
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h4>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="pt-5 border-t border-slate-50 mt-4 flex items-center justify-between">
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Production Ready</span>
      <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">Use Blueprint →</button>
    </div>
  </div>
);
