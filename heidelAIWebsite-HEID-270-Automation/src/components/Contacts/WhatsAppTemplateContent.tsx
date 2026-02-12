/* eslint-disable @typescript-eslint/no-explicit-any */
// whatsapp-template-content.tsx
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppTemplate } from "../types/template";
import { ScrollArea } from "../ui/scroll-area";

interface WhatsAppTemplateContentProps {
  template: WhatsAppTemplate;
  editable?: boolean;
  onTemplateChange?: (template: WhatsAppTemplate) => void;
}

const AutoResizeTextArea = ({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} min-h-[24px]`}
      style={{ 
        resize: 'none',
        overflowY: 'hidden',
        wordWrap: 'break-word'
      }}
    />
  );
};

export const WhatsAppTemplateContent = ({
  template,
  editable = false,
  onTemplateChange,
}: WhatsAppTemplateContentProps) => {
  const [editableTemplate, setEditableTemplate] = useState(template);

  const handleTextChange = (
    componentIndex: number,
    field: string,
    value: string
  ) => {
    const updatedComponents = [...(editableTemplate.components || [])];
    if (field === "text") {
      updatedComponents[componentIndex].text = value;
    } else if (
      field === "buttons" &&
      Array.isArray(updatedComponents[componentIndex].buttons)
    ) {
      updatedComponents[componentIndex].buttons = updatedComponents[
        componentIndex
      ].buttons.map((btn: any, btnIndex: number) =>
        btnIndex === Number(field.split("-")[1]) ? { ...btn, text: value } : btn
      );
    }
    const newTemplate = { ...editableTemplate, components: updatedComponents };
    setEditableTemplate(newTemplate);
    onTemplateChange?.(newTemplate);
  };

  const renderBody = (component: any, index: number) => {
    if (component.type !== "BODY") return null;

    let text = component.text || "";
    if (component.example?.body_text?.[0]) {
      component.example.body_text[0].forEach((value: string, idx: number) => {
        text = text.replace(`{{${idx + 1}}}`, value);
      });
    }

    return (
      <div className="mb-4 text-gray-800">
        {editable ? (
          <AutoResizeTextArea
            value={text}
            onChange={(e) => handleTextChange(index, "text", e.target.value)}
            className="w-full bg-transparent outline-none border-none p-0 text-gray-800 placeholder:text-gray-500 text-base leading-normal"
            placeholder="Message body will appear here"
          />
        ) : (
          <p className="whitespace-pre-wrap text-base leading-normal">{text}</p>
        )}
      </div>
    );
  };

  const renderFooter = (component: any, index: number) => {
    if (component.type !== "FOOTER") return null;

    return (
      <div className="mt-2 mb-4 text-sm text-gray-500">
        {editable ? (
          <AutoResizeTextArea
            value={component.text || ""}
            onChange={(e) => handleTextChange(index, "text", e.target.value)}
            className="w-full bg-transparent outline-none border-none p-0 text-gray-500 placeholder:text-gray-400 text-sm leading-normal"
            placeholder="Footer text here"
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-normal">{component.text}</p>
        )}
      </div>
    );
  };

  const renderButtons = (component: any, index: number) => {
    if (component.type !== "BUTTONS") return null;

    return (
      <div className="space-y-2">
        {component.buttons.map((button: any, btnIndex: number) => (
          <button
            key={btnIndex}
            className="w-full p-3 text-center bg-gray-50 text-blue-500 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            {editable ? (
              <AutoResizeTextArea
                value={button.text || ""}
                onChange={(e) =>
                  handleTextChange(index, `buttons-${btnIndex}`, e.target.value)
                }
                className="w-full bg-transparent outline-none border-none p-0 text-blue-500 placeholder:text-gray-400 text-center text-sm font-medium"
                placeholder={`Button ${btnIndex + 1}`}
              />
            ) : (
              <span>{button.text}</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-[#E5DDD5] p-4 rounded-lg">
      <div className="bg-white rounded-lg shadow-sm p-4">
        {editableTemplate.components?.map((component, index) => (
          <div key={index}>
            {renderBody(component, index)}
            {renderFooter(component, index)}
            {renderButtons(component, index)}
          </div>
        ))}
      </div>
    </div>
  );
};