/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Info,
  Upload,
  MapPin,
  Smile,
  Code,
  Strikethrough,
  Italic,
  Bold,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"


import { AppSetup, Button, Variable } from "@/components/types/template_types";

import { insertFormatting, insertEmoji } from "./textFormatting";
import FileUploadHandler from './FileUploadHandler';


interface TemplateEditorProps {
  templateName: string;

  setTemplateName: (name: string) => void;

  language: string;

  setLanguage: (language: string) => void;

  variables: Variable[];

  setVariables: (variables: Variable[]) => void;

  showVariableModal: boolean;

  setShowVariableModal: (show: boolean) => void;

  messageBody: string;

  setMessageBody: (body: string) => void;

  header: string;

  setHeader: (header: string) => void;

  newVariable: Variable;

  setNewVariable: (variable: Variable) => void;

  footer: string;

  setFooter: (footer: string) => void;

  button: Button[];

  showButtonModal: boolean;

  setShowButtonModal: (show: boolean) => void;

  newButton: Button;

  headerType: string;

  setHeaderType: (type: string) => void;

  headerContent: string | null;

  setHeaderContent: (content: string | null) => void;

  previewFile: string | null;

  setPreviewFile: (file: string | null) => void;

  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;

  insertVariable: (variable: Variable) => void;

  removeVariable: (id: string) => void;

  removeButton: (id: string) => void;

  languages: string[];

  headerVariables: Variable[];
  bodyVariables: Variable[];

  onAddVariable: (variable: Variable) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  templateType: string;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;

}
const headerTypes = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "location", label: "Location" },
];

// Add this line to define the languages array
export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateName,
  setTemplateName,
  language,
  setLanguage,
  setShowVariableModal,
  messageBody,
  setMessageBody,
  header,
  setHeader,
  newVariable,
  setNewVariable,
  footer,
  setFooter,
  button,
  setShowButtonModal,
  headerType,
  setHeaderType,
  headerContent,
  setHeaderContent,
  setPreviewFile,
  handleFileUpload,
  insertVariable,
  removeVariable,
  removeButton,
  languages,
  headerVariables,
  bodyVariables,
  onAddVariable,
  activeTab,
  setActiveTab,
  templateType,
  isChecked,
  setIsChecked,
  selectedTime,
  setSelectedTime,

}) => {


  const [apps, setApps] = useState<AppSetup[]>([
    { packageName: "", signatureHash: "" },
  ]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiSelect = (emojiString: string) => {
    insertEmoji(textareaRef, emojiString, messageBody, setMessageBody);
    setEmojiPickerVisible(false);
  };

  const validityPeriods = [
    "10 minutes",
    "30 minutes",
    "1 hour",
    "2 hours",
    "3 hours",
    "4 hours",
    "5 hours",
    "6 hours",
  ];

  const handleFileUploadComplete = (s3Url: string, fileHandle: string) => {
    // Set the S3 URL as the preview file
    setPreviewFile(s3Url);

    // Set the file_handle as the header content
    setHeaderContent(fileHandle);


    // console.log('S3 URL:', s3Url);
    // console.log('File Handle:', fileHandle);
  };

  const addApp = () => {
    if (apps.length < 5) {
      setApps([...apps, { packageName: "", signatureHash: "" }]);
    }
  };

  const updateApp = (index: number, field: keyof AppSetup, value: string) => {
    const newApps = [...apps];
    newApps[index] = { ...newApps[index], [field]: value };
    setApps(newApps);
  };

  return (
    <div className="text-sm space-y-4 sm:space-y-6 overflow-y-auto hide-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Template name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., welcome_message"
            className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            maxLength={512}
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-gray-400 font-medium">
              {templateName.length} / 512
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(activeTab === "marketing" || activeTab === "utility") && (
        <>
          {/* Header Section */}
          {/* Header Section with Variables */}
          <div className="border p-4 sm:p-5 rounded-xl bg-white shadow-sm border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-800">Header</h3>
                <p className="text-xs text-gray-500">Add a title or use media for your message</p>
              </div>
              <button
                onClick={() => {
                  setNewVariable({ ...newVariable, section: "header" });
                  setShowVariableModal(true);
                }}
                disabled={headerVariables.length >= 5}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add Variable
              </button>
            </div>

            {/* Header Variables */}
            <div className="space-y-2 mb-4">
              {headerVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-white"
                >
                  <div>
                    <span className="text-sm font-medium">{variable.name}</span>
                    <p className="text-sm text-gray-600">
                      Type: {variable.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      Example: {variable.example}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => insertVariable(variable)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => removeVariable(variable.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Header Input */}
            <div>
              <div className="mb-6">
                <select
                  value={headerType}
                  onChange={(e) => {
                    setHeaderType(e.target.value);
                    setHeaderContent(null);
                    setPreviewFile(null);
                  }}
                  className="w-full p-2 border rounded-md mb-4"
                >
                  {headerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {headerType === "text" && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={headerContent || ""}
                      onChange={(e) => {
                        setHeaderContent(e.target.value);
                        setHeader(e.target.value); // Sync header
                      }}
                      className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="Enter header text"
                      maxLength={60}
                    />
                    <div className="flex justify-end">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {header.length} / 60
                      </span>
                    </div>
                  </div>
                )}

                {(headerType === "image" ||
                  headerType === "video" ||
                  headerType === "document") && (
                    <FileUploadHandler
                      setPreviewFile={setPreviewFile}
                      onUploadComplete={handleFileUploadComplete}
                      setHeaderContent={setHeaderContent}
                      accept={
                        headerType === "image"
                          ? "image/*"
                          : headerType === "video"
                            ? "video/*"
                            : "*"
                      }
                      className="w-full"
                    />
                  )}

                {headerType === "location" && (
                  <div className="border rounded-lg p-4">
                    <MapPin className="w-6 h-6 mb-2" />
                    <p>Location will be requested when sending</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border p-4 sm:p-5 rounded-xl bg-white shadow-sm border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-800">Body</h3>
                <p className="text-xs text-gray-500">The main content of your message</p>
              </div>
              <button
                onClick={() => {
                  setNewVariable({ ...newVariable, section: "body" });
                  setShowVariableModal(true);
                }}
                disabled={bodyVariables.length >= 5}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add Variable
              </button>
            </div>

            {/* Body Variables */}
            <div className="space-y-2 mb-4">
              {bodyVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-white"
                >
                  <div>
                    <span className="text-sm font-medium">{variable.name}</span>
                    <p className="text-sm text-gray-600">
                      Type: {variable.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      Example: {variable.example}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => insertVariable(variable)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => removeVariable(variable.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Body Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Message Body
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-white border rounded-md shadow-sm">
                  <button
                    onClick={() => insertFormatting("bold", textareaRef, messageBody, setMessageBody)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => insertFormatting("italic", textareaRef, messageBody, setMessageBody)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    onClick={() => insertFormatting("strikethrough", textareaRef, messageBody, setMessageBody)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </button>
                  <button
                    onClick={() => insertFormatting("monospace", textareaRef, messageBody, setMessageBody)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Monospace"
                  >
                    <Code size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-0.5" />
                  <div className="relative">
                    <button
                      className={`p-1.5 rounded transition-colors ${emojiPickerVisible ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                      onClick={() => setEmojiPickerVisible((prev) => !prev)}
                      title="Emojis"
                    >
                      <Smile size={16} />
                    </button>
                    {emojiPickerVisible && (
                      <div className="absolute right-0 bottom-full mb-2 z-[100] shadow-2xl border rounded-xl overflow-hidden">
                        <EmojiPicker
                          onEmojiClick={(emoji: EmojiClickData) => handleEmojiSelect(emoji.emoji)}
                          width={320}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <textarea
                  ref={textareaRef}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Enter your message content here..."
                  className="w-full p-4 border rounded-xl h-48 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                  maxLength={1024}
                />
                <div className="absolute bottom-3 right-4">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${messageBody.length > 900 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {messageBody.length} / 1024
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="border p-4 sm:p-5 rounded-xl bg-white shadow-sm border-gray-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Footer (Optional)</h3>
              <p className="text-xs text-gray-500">Add a short line of text at the bottom of your message</p>
            </div>
            <div className="space-y-1">
              <input
                type="text"
                placeholder="e.g., Reply STOP to opt-out"
                className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                maxLength={60}
              />
              <div className="flex justify-end">
                <span className="text-[10px] text-gray-400 font-medium">{footer.length}/60</span>
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Buttons {button.length}/10
              </label>
              <button
                onClick={() => setShowButtonModal(true)}
                disabled={button.length >= 10}
                className="text-blue-500 hover:text-blue-600 disabled:text-gray-400 text-sm flex items-center gap-1 w-fit"
              >
                <Plus size={16} />
                Add Button
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800 leading-relaxed">
                Create buttons that let customers respond to your message or
                take action. You can add up to 10 buttons. If you add more than
                3 buttons, they will appear in a list.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {button.map((buttons) => (
              <div
                key={buttons.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div>
                  <span className="text-sm font-medium capitalize">
                    {" "}
                    {buttons.type}
                  </span>
                  <p className="text-sm text-gray-600">{buttons.text}</p>
                </div>

                <button
                  onClick={() => removeButton(buttons.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "utility" ? (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-2">
            Message validity period
          </h3>
          <p className="text-gray-600 mb-4">
            You can set a custom validity period that your utility message must
            be delivered by before it expires. If a message is not delivered
            within this timeframe, you will not be charged and your customer
            will not see the message.
          </p>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">
                Set custom validity period for your message
              </h4>
              <p className="text-sm text-gray-600">
                If you don&apos;t set a custom validity period, the standard 10
                minutes WhatsApp message validity period will be applied.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {isChecked && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Validity Period (Minutes)
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="30s">30 seconds</option>
                <option value="1m">1 minute</option>
                <option value="2m">2 minutes</option>
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="3h">3 hours</option>
                <option value="6h">6 hours</option>
                <option value="12h">12 hours</option>
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mt-8 border-t pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-500" />
            <h4 className="font-medium">Sample Content</h4>
          </div>
          <p className="text-sm text-gray-600">
            To help us review your message template, please add an example of
            each variable to your body text. Do not use real customer
            information. Meta&apos;s hosted cloud API reviews template and variable
            parameters to protect the security and integrity of our services.
          </p>
        </div>
      )}
    </div>
  );
};