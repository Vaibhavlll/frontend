import { ArrowUpFromLine, Copy, MapPin, Upload } from "lucide-react";
import React, { useState } from "react";
import CatalogPreview from "./CatlogPreview";
import { AuthPreview } from "./AuthPreview";


export interface PreviewButton {
  id: string;
  text: string;
}

interface AppSetup {
  packageName: string;
  signatureHash: string;
}

interface TemplatePreviewProps {
  headerType: "none" | "text" | "image" | "video" | "document" | "location";
  headerContent: string | null;
  previewFile: string | null;
  messageBody: string;
  footer: string;
  button: PreviewButton[];
  getFormatedText: (text: string, type: "header" | "body") => React.ReactNode;
  templateType: string;
  templateName?: string;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  languages: string[];


  setTemplateName?: React.Dispatch<React.SetStateAction<string>>;
  codeDeliveryMethod: string;
  setCodeDeliveryMethod: React.Dispatch<React.SetStateAction<"zero_tap" | "one_tap" | "copy_code">>
  addSecurityRecommendation: boolean;
  addExpirationTime: boolean;
  setAddExpirationTime: (value: boolean) => void;
  validityPeriod: string;
  autofillText: string;
  setAutofillText: (text: string) => void;
  setAddSecurityRecommendation: (value: boolean) => void;
  setValidityPeriod: (period: string) => void;
  copyCodeText: string;
  setCopyCodeText: (text: string) => void;
  apps: AppSetup[];
  setApps: React.Dispatch<React.SetStateAction<AppSetup[]>>;
  customValidityPeriod: boolean;
  setCustomValidityPeriod: (value: boolean) => void;
  validityPeriods: string[];
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  headerType,
  headerContent,
  previewFile,
  messageBody,
  footer,
  button,
  getFormatedText,
  templateType,
  templateName = "",
  codeDeliveryMethod,
  setCodeDeliveryMethod,
  addSecurityRecommendation,
  setAddSecurityRecommendation,
  addExpirationTime,
  setAddExpirationTime,
  validityPeriod,
  autofillText,
  setAutofillText,
  setValidityPeriod,
  copyCodeText,
  setCopyCodeText,
  apps,
  setApps,
  customValidityPeriod,
  setCustomValidityPeriod,
  validityPeriods,


}) => {
  const [catalogFormat, setCatalogFormat] = useState<"catalog" | "multi-product">("catalog");

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // State for app setup

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


  // const formatMessageBody = (text: string) => {
  //   return text
  //   .replace(/\*(.*?)\*/g, "**$1**") // Bold
  //     .replace(/_(.*?)_/g, '<em>$1</em>') // Italic
  //     .replace(/~(.*?)~/g, '<del>$1</del>') // Strikethrough
  //     .replace(/```(.*?)```/g, '<code>$1</code>'); // Monospace
  // };


  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      <div className="bg-[#E5DDD5] p-4 rounded-lg flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          {templateType === "catalog" ? (
            <CatalogPreview
              templateName={templateName}
              messageBody={messageBody}
              catalogFormat={catalogFormat}
              footer={footer}
              getFormatedText={getFormatedText}
              isUnified={true}
            />
          ) : templateType === "one-time_Passcode" ? (
            <AuthPreview
              addSecurityRecommendation={addSecurityRecommendation}
              setAddSecurityRecommendation={setAddSecurityRecommendation}
              addExpirationTime={addExpirationTime}
              setAddExpirationTime={setAddExpirationTime}
              validityPeriod={validityPeriod}
              autofillText={autofillText}
              setValidityPeriod={setValidityPeriod}
              codeDeliveryMethod={codeDeliveryMethod}
              setCodeDeliveryMethod={setCodeDeliveryMethod}
              copyCodeText={copyCodeText}
              setCopyCodeText={setCopyCodeText}
              apps={apps}
              setApps={setApps}
              customValidityPeriod={customValidityPeriod}
              setCustomValidityPeriod={setCustomValidityPeriod}
              validityPeriods={validityPeriods}
              isUnified={true}
            />
          ) : templateType === "custom" ? (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              {headerType !== "none" && headerContent && (
                <div className="font-medium mb-2 whitespace-pre-wrap break-words">
                  {headerType === "text" &&
                    <strong> {getFormatedText(headerContent || "", "header")}</strong>}
                  {headerType === "image" && previewFile && (
                    <img
                      src={previewFile}
                      alt="Preview"
                      className="w-full rounded"
                    />
                  )}
                  {headerType === "video" && previewFile && (
                    <video
                      src={previewFile}
                      controls
                      className="w-full rounded"
                    />
                  )}
                  {headerType === "document" && (
                    <div className="flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      <span>{headerContent}</span>
                    </div>
                  )}
                  {headerType === "location" && (
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>Location</span>
                    </div>
                  )}
                </div>
              )}
              <div
                className="mb-2  whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: getFormatedText(messageBody, "body") as string
                }}
              />

              {footer && (
                <div className="mt-2 pt-2 text-sm text-gray-500">
                  {footer}
                </div>
              )}

              {button.length > 0 && (
                <div className="mt-2 pt-2 border-t space-y-2">
                  {button.map((buttons) => (
                    <button
                      key={buttons.id}
                      className="w-full p-2 text-center bg-gray-50 text-blue-500 rounded"
                    >
                      {buttons.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
