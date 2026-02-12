/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { MessageSquare, Wrench, ShieldCheck } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";

type TemplateSetupProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  templateType: string;
  setTemplateType: (type: string) => void;
  newVariable: any;
  setNewVariable: (variable: any) => void;
  bodyVariables: any;
};

export const TemplateSetup: React.FC<TemplateSetupProps> = ({
  activeTab,
  setActiveTab,
  templateType,
  setTemplateType,
}) => {
  return (
    <>
      <h2 className="text-md font-semibold mb-4">Set up your template</h2>
      <p className="text-gray-600 mb-6">
        Choose the category that best describes your message template. Then,
        choose the type of message you want to send.
      </p>

      {/* Template Type Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <button
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-lg border transition-all ${activeTab === "marketing" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
            }`}
          onClick={() => setActiveTab("marketing")}
        >
          <MessageSquare size={18} className={activeTab === "marketing" ? "text-blue-500" : "text-gray-500"} />
          <span className="font-medium">Marketing</span>
        </button>
        <button
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-lg border transition-all ${activeTab === "utility" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
            }`}
          onClick={() => setActiveTab("utility")}
        >
          <Wrench size={18} className={activeTab === "utility" ? "text-blue-500" : "text-gray-500"} />
          <span className="font-medium">Utility</span>
        </button>
        <button
          className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-lg border transition-all ${activeTab === "Authentication" ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
            }`}
          onClick={() => setActiveTab("Authentication")}
        >
          <ShieldCheck size={18} className={activeTab === "Authentication" ? "text-blue-500" : "text-gray-500"} />
          <span className="font-medium">Auth</span>
        </button>
      </div>

      {/* template type selection */}
      {activeTab === 'utility' ? (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${templateType === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            onClick={() => setTemplateType('custom')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${templateType === 'custom' ? 'border-4 border-blue-500' : 'border-gray-300'
                }`}>
              </div>
              <h3 className="font-semibold">Custom</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Send messages about an existing order or account.
            </p>
          </div>
          {/* <div
            className={`p-4 rounded-lg border ${
              templateType === 'pre-approved_utility' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setTemplateType('pre-approved_utility')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${
                templateType === 'pre-approved_utility' ? 'border-4 border-blue-500' : 'border-gray-300'
              }`}>
              </div>
              <h3 className="font-semibold">Pre-approved templates</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Save time by using pre-approved templates from our Template Library.
            </p>
          </div>          */}
        </div>
      ) : activeTab === 'Authentication' ? (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${templateType === 'one-time_Passcode' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            onClick={() => setTemplateType('one-time_Passcode')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${templateType === 'one-time_Passcode' ? 'border-4 border-blue-500' : 'border-gray-300'
                }`}></div>
              <h3 className="font-semibold">One-time Passcode</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Send messages about an existing order or account.
            </p>
          </div>
          {/* <div
            className={`p-4 rounded-lg border ${
              templateType === 'pre-approved_auth' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setTemplateType('pre-approved_auth')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${
                templateType === 'pre-approved_auth' ? 'border-4 border-blue-500' : 'border-gray-300'
              }`}></div>
              <h3 className="font-semibold">Pre-approved templates</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Save time by using pre-approved templates from our Template Library.
            </p>
          </div>          */}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${templateType === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            onClick={() => setTemplateType('custom')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${templateType === 'custom' ? 'border-4 border-blue-500' : 'border-gray-300'
                }`}></div>
              <h3 className="font-semibold">Custom</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Send promotions or announcements to increase awareness and engagement.
            </p>
          </div>
          <div
            className={`p-4 rounded-lg border ${templateType === 'catalog' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            onClick={() => setTemplateType('catalog')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${templateType === 'catalog' ? 'border-4 border-blue-500' : 'border-gray-300'
                }`}></div>
              <h3 className="font-semibold">Catalog</h3>
            </div>
            <p className="text-gray-600 ml-6">
              Send messages about your entire catalog or just a few of its products.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
