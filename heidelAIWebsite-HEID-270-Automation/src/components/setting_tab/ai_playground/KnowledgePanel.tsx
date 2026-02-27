import React, { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { DataSourceCard } from './DataSourceCard';
import Image from 'next/image';
import Link from 'next/link';
import { useApi } from '@/lib/session_api';
import { toast } from 'sonner';

export function KnowledgePanel() {
    const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(false);
    const api = useApi()

    const handleToggleAutoReply = async () => {
        // Optimistic UI update
        const newState = !isAutoReplyEnabled;
        setIsAutoReplyEnabled(newState);

        try {
          const response = await api.post('/api/organization/toggle_ai', { enabled: newState });

          if (response.data.status !== 'success') {
            throw new Error('Failed to update AI Auto-Reply setting');
          }
          
          toast.success(`AI Auto-Reply ${newState ? 'enabled' : 'disabled'} successfully.`);

        }
        catch (error) {
          console.error('Failed to toggle AI Auto-Reply:', error);
          toast.error('Failed to update AI Auto-Reply setting. Please try again.');
          // Revert state on failure
          setIsAutoReplyEnabled(!newState);
        }
        
        // If API call fails, you can revert the state:
        // setIsAutoReplyEnabled(!newState);
    };

  return (
    <div className="flex flex-col gap-4 w-full ">
      {/* Banner */}
      <div className="bg-gradient-to-l from-blue-200 via-white to-white border-t border-l border-gray-100 rounded-xl p-8 relative overflow-hidden shadow-md">
        <div className="max-w-md relative z-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">AI Knowledge Access</h2>
          <p className="text-gray-700 text-sm">
            Control the data and business sources your AI agent uses to generate accurate, secure, and context-aware responses.
          </p>
        </div>
        {/* Placeholder for the 3D graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-58"> 
            <Image 
                height={400}
                width={400}
                quality={100}
                src="/settings/ai_playground.png" 
                alt="AI Playground Graphic" 
                className="h-full w-full object-contain"
            />
        </div> 
    </div>

    

      {/* Website Section */}
      <DataSourceCard 
        title="Website" 
        description="Add your website so that the AI agent knows everything it needs."
        buttonText="Add Website"
        onAdd={() => console.log('Add website')}
      >
        {/* <div className="flex justify-end mb-2">
          <button className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700">
            View All <ExternalLink className="w-3 h-3" />
          </button>
        </div> */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Image 
                height={20}
                width={20}
                src="/parijat-academy.png" 
                alt="parijat academy logo" 
                className="w-5 h-5 object-contain"
            />
            <span className="text-sm font-medium text-gray-700">paarijatacademy.in</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Link href={"https://paarijatacademy.in"} target='blank' className="hover:text-gray-600"><ExternalLink className="w-4 h-4" /></Link>
            {/* <button className="hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button> */}
          </div>
        </div>
      </DataSourceCard>

      {/* Documents Section */}
      <DataSourceCard 
        title="Documents" 
        description="Add documents to help HeidelAI understand your data and respond more accurately."
        buttonText="upload documents"
        onAdd={() => console.log('Upload doc')}
      >
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Image 
                height={200}
                width={200}
                quality={100}
                src="/icons/file-types/pdf.png" 
                alt="pdf icon" 
                className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-medium text-gray-700">Parijat Academy.pdf</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Link href={"https://res.cloudinary.com/djpc5zfgz/image/upload/v1771940875/Parijat_Academy_wddh5y.pdf"} target='blank' className="hover:text-gray-600"><ExternalLink className="w-4 h-4" /></Link>
            {/* <button className="hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button> */}
          </div>
        </div>
      </DataSourceCard>

      {/* Q&A Section */}
      {/* <DataSourceCard 
        title="Q&A lists" 
        description="Add frequently asked questions and answers that the ai should know."
        buttonText="Upload Q&A List"
        onAdd={() => console.log('Upload Q&A')}
      >
        <div className="text-center py-6 text-sm text-gray-400">
          No Documents currently
        </div>
      </DataSourceCard> */}


        {/* AI Toggle Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
            <h3 className="text-base font-semibold text-gray-900">AI Auto-Reply</h3>
            <p className="text-sm text-gray-500 ">
                When enabled, the AI assistant will automatically reply to incoming conversations.
            </p>
            </div>
            
            <button 
              onClick={handleToggleAutoReply}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-white ${
                isAutoReplyEnabled 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-300' 
                  : 'bg-gray-200'
              }`}
            >
              <span className="sr-only">Toggle AI Auto-Reply</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 shadow-sm transition-transform duration-200 ease-in-out ${
                  isAutoReplyEnabled ? 'translate-x-6 border-white' : 'translate-x-1'
                }`}
              />
            </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-200 via-blue-50 to-white shadow-sm rounded-lg p-4 m-0.5 flex items-start gap-2">
            <Info className="w-5 h-5 text-zinc-700 flex-shrink-0 " />
            <p className="text-sm text-zinc-700">
                Currently the chatbot can only process text message inputs.
            </p>
        </div>
    </div>
  );
}