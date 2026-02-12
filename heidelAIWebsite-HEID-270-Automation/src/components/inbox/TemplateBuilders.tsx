/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Copy, Link, Link2, X } from "lucide-react";
import { WhatsAppTemplate } from "../types/template";
import { useEffect, useState } from "react";
import { TemplateSetup } from "./templateUI/TemplateSetup";
import { TemplateEditor } from "./templateUI/TemplateEditor";
import { TemplatePreview } from "./templateUI/TemplatePreview";
import { VariableModal } from "./templateUI/Variablemodal";
import { ButtonModal } from "./templateUI/ButtonModal";
import { AppSetup, Button, Variable } from "../types/template_types";
import Catlog from "./templateUI/CatlogTemplate";
import AuthTemplate from "./templateUI/AuthTemplate";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


type TemplateBuildersProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templates: WhatsAppTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<WhatsAppTemplate[]>>;
  searchTemplate: string;
  setSearchTemplate: React.Dispatch<React.SetStateAction<string>>;

}

// Helper function to format template name

const TemplateBuilders = ({ isOpen, setIsOpen, templates, setTemplates, searchTemplate, setSearchTemplate }: TemplateBuildersProps) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("marketing");
  const [templateType, setTemplateType] = useState("custom");
  const [templateName, setTemplateName] = useState("");
  const [language, setlanguage] = useState("English");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [header, setHeader] = useState("");
  const [newVariable, setNewVariable] = useState<Variable>({
    id: "",
    name: "",
    type: "text",
    example: "",
    section: "body",
  });
  const [footer, setFooter] = useState("");
  const [button, setButton] = useState<Button[]>([]);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [newButton, setNewButton] = useState<Button>({
    id: "",
    type: "reply",
    text: "",
    content: "",
    value: "",
  });
  const [headerType, setHeaderType] = useState<"none" | "text" | "image" | "video" | "document" | "location">("text");
  const [headerContent, setHeaderContent] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [codeDeliveryMethod, setCodeDeliveryMethod] = useState<"zero_tap" | "one_tap" | "copy_code">("zero_tap");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [apps, setApps] = useState<AppSetup[]>([{ packageName: "", signatureHash: "" },]);
  const [addSecurityRecommendation, setAddSecurityRecommendation] = useState(true);
  const [addExpirationTime, setAddExpirationTime] = useState(false);
  const [customValidityPeriod, setCustomValidityPeriod] = useState(false);
  const [validityPeriod, setValidityPeriod] = useState("10 minutes");
  const [autofillText, setAutofillText] = useState("Autofill");
  const [copyCodeText, setCopyCodeText] = useState("Copy code");
  const [templateTypeSelected, setTemplateTypeSelected] = useState(false);
  const [stepButton, setStepButton] = useState<any>(null);
  const [bodyContent, setBodyContent] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const validityPeriods = ["10 minutes",
    "30 minutes",
    "1 hour",
    "2 hours",
    "3 hours",
    "4 hours",
    "5 hours",
    "6 hours",];


  const headerTypes = [
    { value: "none", label: "None" },
    { value: "text", label: "Text" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "document", label: "Document" },
    { value: "location", label: "Location" },
  ];

  const removeVariable = (id: string) => {
    setVariables(variables.filter((variable) => variable.id !== id));
  };

  const insertVariable = (variable: Variable) => {
    const variableText = `{{${variable.name}}}`;
    if (variable.section === "header") {
      const updatedHeader = (header || "") + variableText;
      setHeader(updatedHeader);
      setHeaderContent(updatedHeader); // Sync headerContent
    } else {
      setMessageBody((messageBody || "") + variableText)
      setBodyContent(messageBody);
    }
  };

  const removeButton = (id: string) => {
    setButton(button.filter((button) => button.id !== id));
  };

  const resetForm = () => {
    setStep(1);
    setActiveTab("marketing");
    setTemplateType("custom");
    setTemplateName("");
    setlanguage("English");
    setVariables([]);
    setShowVariableModal(false);
    setMessageBody("");
    setHeader("");
    setNewVariable({
      id: "",
      name: "",
      type: "text",
      example: "",
      section: "body",
    });
    setFooter("");
    setButton([]);
    setShowButtonModal(false);
    setNewButton({
      id: "",
      type: "reply",
      text: "",
      content: "",
      value: "",
    });
    setHeaderType("text");
    setHeaderContent(null);
    setPreviewFile(null);
    setCodeDeliveryMethod("zero_tap");
    setTermsAccepted(false);
    setApps([{ packageName: "", signatureHash: "" }]);
    setAddSecurityRecommendation(true);
    setAddExpirationTime(false);
    setCustomValidityPeriod(false);
    setValidityPeriod("10 minutes");
    setAutofillText("Autofill");
    setCopyCodeText("Copy code");
    setTemplateTypeSelected(false);
    setStepButton(null);
    setBodyContent(null);
    setIsChecked(false);
    setSelectedTime("");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      setIsOpen(false);
      setStep(1);
    }
    resetForm(); // Reset form when going back
  };


  const handleNext = () => {
    // Proceed based on the selected template type
    if (step === 1) {
      if (templateType === "custom") {
        setStepButton("next");
        setStep(2);
      } else if (templateType === "catalog") {
        setStepButton("editor2");
        setStep(2);
      } else if (templateType === "one-time_Passcode") {
        setStepButton("editor3");
        setStep(2);
      }
    }
  };



  useEffect(() => {
    setTemplateName('');
    setHeader('');
    setMessageBody('');
    setFooter('');
  }, [activeTab, templateType]);


  const getFormatedText = (text: string, type: string) => {
    let formattedText = text;

    // Replace variables with their example values
    variables
      .filter((v) => v.section === type)
      .forEach((variable) => {
        const regex = new RegExp(`{{${variable.name}}}`, "g");
        formattedText = formattedText.replace(regex, variable.example);
      });

    // Handle formatting (bold, italic, strikethrough, monospace)
    formattedText = formattedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/_(.*?)_/g, '<em>$1</em>')               // Italic
      .replace(/~~(.*?)~~/g, '<del>$1</del>')           // Strikethrough
      .replace(/`(.*?)`/g, '<code>$1</code>');   // Monospace

    // Ensure all remaining placeholders are replaced (including numeric ones)
    formattedText = formattedText.replace(
      /{{(\d+)}}/g, // Match numeric placeholders like {{1}}, {{2}}, etc.
      (_, number) => {
        const variable = variables.find((v) => v.name === number && v.section === type);
        return variable ? variable.example : `{{${number}}}`; // Fallback if no match
      }
    );

    return formattedText;
  };

  const addButton = () => {
    if (button.length < 10) {
      const newBtn: Button = {
        ...newButton,
        id: Math.random().toString(36).substr(2, 9),
      };
      setButton([...button, newBtn]);
      setShowButtonModal(false);
      setNewButton({ id: "", type: "reply", text: "", content: "", value: "" });
    }
  };

  const addVariable = () => {
    if (variables.length < 10) {
      const variable: Variable = {
        ...newVariable,
        id: Math.random().toString(36).substr(2, 9),
      };
      setVariables([...variables, variable]);
      setShowVariableModal(false);
      setNewVariable({
        id: "",
        name: "",
        type: "text",
        example: "",
        section: "body",
      });
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // redundant fetch removed as templates are passed via props



  const languages = [
    "Afrikaans",
    "Albanian",
    "Arabic",
    "Azerbaijani",
    "Bengali",
    "Bulgarian",
    "Catalan",
    "Chinese (CHN)",
    "Chinese (HKG)",
    "Chinese (TAIWAN)",
    "Croatian",
    "Czech",
    "Danish",
    "Dutch",
    "English",
    "English (UK)",
    "English (US)",
    "Estonian",
    "Filipino",
    "Finnish",
    "French",
    "Georgian",
    "German",
    "Greek",
    "Gujarati",
    "Hausa",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Indonesian",
    "Irish",
    "Italian",
    "Japanese",
    "Kannada",
    "Kazakh",
    "Kinyarwanda",
    "Korean",
    "Kyrgyz (Kyrgyzstan)",
    "Lao",
    "Latvian",
    "Lithuanian",
    "Macedonian",
    "Malay",
    "Malayalam",
    "Marathi",
    "Norwegian",
    "Persian",
    "Polish",
    "Portuguese (BR)",
    "Portuguese (POR)",
    "Punjabi",
    "Romanian",
    "Russian",
    "Serbian",
    "Slovak",
    "Slovenian",
    "Spanish",
    "Spanish (ARG)",
    "Spanish (MEX)",
    "Spanish (SPA)",
    "Swahili",
    "Swedish",
    "Tamil",
    "Telugu",
    "Thai",
    "Turkish",
    "Ukrainian",
    "Urdu",
    "Uzbek",
    "Vietnamese",
    "Zulu",
  ];

  const languageMapping: { [key: string]: string } = {
    "Afrikaans": "af",
    "Albanian": "sq",
    "Arabic": "ar",
    "Azerbaijani": "az",
    "Bengali": "bn",
    "Bulgarian": "bg",
    "Catalan": "ca",
    "Chinese (CHN)": "zh_CN",
    "Chinese (HKG)": "zh_HK",
    "Chinese (TAIWAN)": "zh_TW",
    "Croatian": "hr",
    "Czech": "cs",
    "Danish": "da",
    "Dutch": "nl",
    "English": "en",
    "English (UK)": "en_GB",
    "English (US)": "en_US",
    "Estonian": "et",
    "Filipino": "fil",
    "Finnish": "fi",
    "French": "fr",
    "Georgian": "ka",
    "German": "de",
    "Greek": "el",
    "Gujarati": "gu",
    "Hausa": "ha",
    "Hebrew": "he",
    "Hindi": "hi",
    "Hungarian": "hu",
    "Indonesian": "id",
    "Irish": "ga",
    "Italian": "it",
    "Japanese": "ja",
    "Kannada": "kn",
    "Kazakh": "kk",
    "Kinyarwanda": "rw",
    "Korean": "ko",
    "Kyrgyz (Kyrgyzstan)": "ky_KG",
    "Lao": "lo",
    "Latvian": "lv",
    "Lithuanian": "lt",
    "Macedonian": "mk",
    "Malay": "ms",
    "Malayalam": "ml",
    "Marathi": "mr",
    "Norwegian": "no",
    "Persian": "fa",
    "Polish": "pl",
    "Portuguese (BR)": "pt_BR",
    "Portuguese (POR)": "pt_PT",
    "Punjabi": "pa",
    "Romanian": "ro",
    "Russian": "ru",
    "Serbian": "sr",
    "Slovak": "sk",
    "Slovenian": "sl",
    "Spanish": "es",
    "Spanish (ARG)": "es_AR",
    "Spanish (MEX)": "es_MX",
    "Spanish (SPA)": "es_ES",
    "Swahili": "sw",
    "Swedish": "sv",
    "Tamil": "ta",
    "Telugu": "te",
    "Thai": "th",
    "Turkish": "tr",
    "Ukrainian": "uk",
    "Urdu": "ur",
    "Uzbek": "uz",
    "Vietnamese": "vi",
    "Zulu": "zu",
  };

  const headerVariables = variables.filter((v) => v.section === "header");
  const bodyVariables = variables.filter((v) => v.section === "body");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFile(reader.result as string);
        setHeaderContent(file.name)
      };
      reader.readAsDataURL(file);
    }
  };

  // const filteredTemplates = (templates || []).filter((template) =>
  //   template?.name?.toLocaleLowerCase().includes(searchTemplate.toLocaleLowerCase()) &&
  //   template.status === 'APPROVED' &&
  //   template.type === 'utility'
  // );

  //  const exportData = () => {
  //   // Convert the full language name to its ISO code
  //   const languageCode = languageMapping[language as keyof typeof languageMapping] || "en"; // Default to "en" if no match

  //   const data = {
  //     category: activeTab,
  //     type: templateType,
  //     template: {
  //       name: templateName,
  //       language: {
  //         code: languageCode, // Use the mapped ISO code
  //       },
  //       components: [
  //         // Header Component
  //         headerType !== "none" && {
  //           type: "header",
  //           format: headerType,
  //           ...(headerType === "text" && {
  //             text: header,
  //             example: {
  //               header_text: variables
  //                 .filter((v) => v.section === "header")
  //                 .map((variable) => [variable.example]),
  //             },
  //           }),
  //           ...(headerType === "image" && { image: { link: headerContent } }),
  //           ...(headerType === "video" && { video: { link: headerContent } }),
  //           ...(headerType === "document" && { document: { link: headerContent } }),
  //         },

  //         // Body Component
  //         {
  //           type: "body",
  //           text: messageBody,
  //           example: {
  //             body_text: variables
  //               .filter((v) => v.section === "body")
  //               .map((variable) => [variable.example]),
  //           },
  //         },

  //         // Footer Component
  //         footer && {
  //           type: "footer",
  //           text: footer,
  //         },

  //         // Button Components
  //         ...button.map((btn, index) => ({
  //           type: "button",
  //           sub_type: btn.type === "reply" ? "quick_reply" : btn.type,
  //           index: index.toString(),
  //           parameters: [
  //             btn.type === "url"
  //               ? { type: "text", text: btn.value }
  //               : btn.type === "phone"
  //               ? { type: "text", text: btn.value }
  //               : { type: "payload", payload: btn.content || "default_payload" },
  //           ],
  //         })),
  //       ].filter(Boolean), // Remove any undefined components
  //     },
  //   };

  //   console.log(JSON.stringify(data, null, 2));
  // };

  const exportData = async () => {
    try {
      // Map language to ISO code
      const languageCode = languageMapping[language as keyof typeof languageMapping] || "en";

      // Validate required fields
      if (!templateName || !languageCode) {
        throw new Error("Template name and language are required.");
      }

      let payload;

      if (templateType === "one-time_Passcode") {
        // One-Time Passcode Template
        payload = {
          name: templateName.toLowerCase(),
          language: languageCode,
          category: "authentication",
          message_send_ttl_seconds: 60,
          components: [
            {
              type: "body",
              add_security_recommendation: false,
            },
            {
              type: "buttons",
              buttons: [
                {
                  type: "otp",
                  otp_type: "one-tap",
                  text: "Copy code",
                  autofill_text: "Autofill",
                  package_name: "",
                  signature_hash: "",
                },
              ],
            },
          ].filter(Boolean),
        };
      } else if (templateType === "catalog") {
        // Catalog Template
        payload = {
          name: templateName.toLowerCase(),
          language: languageCode,
          category: "MARKETING",
          components: [
            {
              type: "BODY",
              text: messageBody,
              example: {
                body_text: variables
                  .filter((v) => v.section === "body")
                  .map((variable) => variable.example),
              },
            },
            footer && {
              type: "FOOTER",
              text: footer,
            },
            {
              type: "BUTTONS",
              buttons: [
                {
                  type: "CATALOG",
                  text: "View catalog",
                },
              ],
            },
          ].filter(Boolean),
        };
      } else {
        // Custom Template
        payload = {
          name: templateName.toLowerCase(),
          language: languageCode,
          category: activeTab.toUpperCase(),
          components: [
            headerType !== "none" && {
              type: "HEADER",
              format: headerType.toUpperCase(),
              ...(headerType === "text" && {
                text: header,
                example: {
                  header_text: variables
                    .filter((v) => v.section === "header")
                    .map((variable) => variable.example),
                },
              }),
              ...(["image", "video", "document"].includes(headerType) && {
                example: {
                  header_handle: [headerContent],
                },
              }),
            },
            {
              type: "BODY",
              text: messageBody,
              example: {
                body_text: variables
                  .filter((v) => v.section === "body")
                  .map((variable) => variable.example),
              },
            },
            footer && {
              type: "FOOTER",
              text: footer,
            },
            {
              type: "BUTTONS",
              buttons: button.map((btn) => {
                if (btn.type === "reply") {
                  return {
                    type: "QUICK_REPLY",
                    text: btn.text,
                  };
                } else if (btn.type === "url") {
                  return {
                    type: "URL",
                    text: btn.text,
                    url: btn.value,
                  };
                } else if (btn.type === "phone") {
                  return {
                    type: "PHONE_NUMBER",
                    text: btn.text,
                    phone_number: btn.value,
                  };
                } else if (btn.type === "copy") {
                  return {
                    type: "COPY_TEXT",
                    text: btn.text,
                    copy_text: btn.value,
                  };
                }
                return null;
              }).filter(Boolean),
            },
          ].filter(Boolean),
        };
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during exportData:", error.message);
      } else {
        console.error("Error during exportData:", error);
      }
    }
  };
  // Helper function to send POST request


  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-white w-full h-[100vh] md:h-[75vh] lg:h-[80vh] flex flex-col overflow-hidden hide-scrollbar">
            {/* header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold">Set up a template</span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Create and configure your WhatsApp message templates.
                </DialogDescription>
              </div>
              <div className="text-sm flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center
                      ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  >
                    1
                  </div>
                  <span className={step === 1 ? "text-blue-500" : "text-gray-500"}>
                    Set up a template
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                  >
                    2
                  </div>
                  <span className={step === 2 ? "text-blue-500" : "text-gray-500"}>
                    Edit template
                  </span>
                </div>
              </div>
            </div>

            {/* content area */}
            <div className="flex-1 overflow-y-auto md:overflow-hidden">
              <div className="text-sm flex flex-col md:grid md:grid-cols-2 md:h-full">
                {/* Left Column: Editor/Form */}
                <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r h-auto md:h-full overflow-y-auto hide-scrollbar">
                  <div>
                    {step === 1 ? (
                      <TemplateSetup
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        templateType={templateType}
                        setTemplateType={setTemplateType}
                        newVariable={newVariable}
                        setNewVariable={setNewVariable}
                        bodyVariables={bodyVariables}
                      />
                    ) : step === 2 && templateType === "custom" && stepButton === "next" ? (
                      <TemplateEditor
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                        language={language}
                        setLanguage={setlanguage}
                        variables={variables}
                        setVariables={setVariables}
                        showVariableModal={showVariableModal}
                        setShowVariableModal={setShowVariableModal}
                        messageBody={messageBody}
                        setMessageBody={setMessageBody}
                        header={header}
                        setHeader={setHeader}
                        footer={footer}
                        setFooter={setFooter}
                        button={button}
                        showButtonModal={showButtonModal}
                        handleFileUpload={handleFileUpload}
                        setShowButtonModal={setShowButtonModal}
                        newButton={newButton}
                        headerType={headerType}
                        setHeaderType={(type: string) =>
                          setHeaderType(
                            type as
                            | "none"
                            | "text"
                            | "image"
                            | "video"
                            | "document"
                            | "location"
                          )
                        }
                        headerContent={headerContent}
                        setHeaderContent={setHeaderContent}
                        previewFile={previewFile}
                        setPreviewFile={setPreviewFile}
                        insertVariable={insertVariable}
                        removeVariable={removeVariable}
                        removeButton={removeButton}
                        languages={languages}
                        headerVariables={headerVariables}
                        onAddVariable={(variable: Variable) => {
                          setNewVariable(variable);
                          setShowVariableModal(true);
                        }}
                        newVariable={newVariable}
                        setNewVariable={setNewVariable}
                        bodyVariables={bodyVariables}
                        templateType={templateType}
                        isChecked={isChecked}
                        setIsChecked={setIsChecked}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                      />
                    ) : step === 2 && templateType === "catalog" && stepButton === "editor2" ? (
                      <Catlog
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                        language={language}
                        setLanguage={setlanguage}
                        messageBody={messageBody}
                        setMessageBody={setMessageBody}
                        header={header}
                        button={button}
                        headerType={headerType}
                        headerContent={headerContent}
                        previewFile={previewFile}
                        setPreviewFile={setPreviewFile}
                        languages={languages}
                        headerVariables={headerVariables}
                        bodyVariables={bodyVariables}
                        footer={footer}
                        setFooter={setFooter}
                        insertVariable={insertVariable}
                        removeVariable={removeVariable}
                        setShowVariableModal={setShowVariableModal}
                        newVariable={newVariable}
                        setNewVariable={setNewVariable}
                      />
                    ) : step === 2 && templateType === "one-time_Passcode" && stepButton === "editor3" ? (
                      <AuthTemplate
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                        language={language}
                        setLanguage={setlanguage}
                        languages={languages}
                        codeDeliveryMethod={codeDeliveryMethod}
                        setCodeDeliveryMethod={setCodeDeliveryMethod}
                        addSecurityRecommendation={addSecurityRecommendation}
                        setAddSecurityRecommendation={setAddSecurityRecommendation}
                        addExpirationTime={addExpirationTime}
                        setAddExpirationTime={setAddExpirationTime}
                        validityPeriod={validityPeriod}
                        setValidityPeriod={setValidityPeriod}
                        autofillText={autofillText}
                        setAutofillText={setAutofillText}
                        copyCodeText={copyCodeText}
                        setCopyCodeText={setCopyCodeText}
                        apps={apps}
                        setApps={setApps}
                        customValidityPeriod={customValidityPeriod}
                        setCustomValidityPeriod={setCustomValidityPeriod}
                        validityPeriods={validityPeriods}
                      />
                    ) : null}
                  </div>

                  {/* Action button */}
                  <div className="text-sm flex justify-end gap-4 mt-8 pt-4 border-t bg-white">
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      {step === 1 ? "Go Back" : "Previous"}
                    </button>
                    <button
                      onClick={step === 1 ? handleNext : exportData}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {step === 1 ? "Next" : "Export Template"}
                    </button>
                  </div>
                </div>

                {/* Right Column: Preview */}
                <div className="h-auto md:h-full bg-gray-50 border-t md:border-t-0 md:border-l p-4 sm:p-6 flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
                  {step === 2 ? (
                    <div className="flex-1 min-h-0">
                      <TemplatePreview
                        headerType={headerType}
                        headerContent={headerContent}
                        previewFile={previewFile}
                        messageBody={messageBody}
                        footer={footer}
                        button={button}
                        getFormatedText={getFormatedText}
                        templateType={templateType}
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                        language={language}
                        setLanguage={setlanguage}
                        languages={languages}
                        codeDeliveryMethod={codeDeliveryMethod}
                        setCodeDeliveryMethod={setCodeDeliveryMethod}
                        addSecurityRecommendation={addSecurityRecommendation}
                        setAddSecurityRecommendation={setAddSecurityRecommendation}
                        addExpirationTime={addExpirationTime}
                        setAddExpirationTime={setAddExpirationTime}
                        validityPeriod={validityPeriod}
                        setValidityPeriod={setValidityPeriod}
                        autofillText={autofillText}
                        setAutofillText={setAutofillText}
                        copyCodeText={copyCodeText}
                        setCopyCodeText={setCopyCodeText}
                        apps={apps}
                        setApps={setApps}
                        customValidityPeriod={customValidityPeriod}
                        setCustomValidityPeriod={setCustomValidityPeriod}
                        validityPeriods={validityPeriods}
                      />
                    </div>
                  ) : step === 1 && activeTab === "marketing" ? (
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-4">Preview</h3>
                      <div className="bg-[#E5DDD5] p-4 rounded-lg flex-1 overflow-y-auto">
                        <div className="max-w-sm mx-auto">
                          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                            <div className="mb-2 text-gray-800">
                              Message body will appear here
                            </div>
                            <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                              Sample footer content here
                            </div>
                            <div className="mt-2 pt-2 border-t space-y-2">
                              <button className="w-full p-2 text-center bg-gray-50 text-blue-500 rounded">
                                Button 1
                              </button>
                              <button className="w-full p-2 text-center bg-gray-50 text-blue-500 rounded">
                                Button 2
                              </button>
                            </div>
                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[11px] text-gray-500">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : step === 1 && activeTab === "utility" ? (
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-4">Preview</h3>
                      <div className="bg-[#E5DDD5] p-4 rounded-lg flex-1 overflow-y-auto">
                        <div className="max-w-sm mx-auto">
                          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                            <div className="mb-2 text-gray-800">
                              Finalize account set-up
                            </div>
                            <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                              Hi John, Your new account has been created
                              successfully. Please verify your email address to
                              complete your profile.
                            </div>
                            <div className="mt-2 pt-2 border-t space-y-2">
                              <button className="flex items-center justify-center w-full p-2 text-center bg-gray-50 text-blue-500 rounded">
                                <Link2 size={16} className="mr-2" />
                                Verify
                              </button>
                            </div>
                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[11px] text-gray-500">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : step === 1 && activeTab === "Authentication" ? (
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-4">Preview</h3>
                      <div className="bg-[#E5DDD5] p-4 rounded-lg flex-1 overflow-y-auto">
                        <div className="max-w-sm mx-auto">
                          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                            <div className="mb-2 text-gray-800">
                              Here is One-Time PassCode 225566
                            </div>
                            <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                              Please use OTP it will be valid for next 2 minutes
                            </div>
                            <div className="mt-2 pt-2 border-t space-y-2">
                              <button className="flex items-center justify-center w-full p-2 text-center bg-gray-50 text-blue-500 rounded">
                                <Copy size={16} className="mr-2" />
                                Copy
                              </button>
                            </div>
                            <div className="mt-1.5 flex justify-end">
                              <span className="text-[11px] text-gray-500">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showVariableModal && (
        <VariableModal
          newVariable={newVariable}
          setNewVariable={setNewVariable}
          setShowVariableModal={setShowVariableModal}
          addVariable={addVariable}
        />
      )}

      {showButtonModal && (
        <ButtonModal
          newButton={newButton}
          setNewButton={setNewButton}
          setShowButtonModal={setShowButtonModal}
          addButton={addButton}
        />
      )}
    </>
  );
};

export default TemplateBuilders;