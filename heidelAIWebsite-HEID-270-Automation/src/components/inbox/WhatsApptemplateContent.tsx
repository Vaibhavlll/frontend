/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppTemplate } from "../types/template";
import { ScrollArea } from "../ui/scroll-area";
import { FileText, MapPin } from "lucide-react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
})

interface WhatsAppTemplateContentProps {
  template: WhatsAppTemplate;
  languageCode?: string;
  setMediaId: (id: string | null) => void;
  setPreviewFile: (url: string | null) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void; // Add this prop
}

export const WhatsAppTemplateContent: React.FC<WhatsAppTemplateContentProps & { onInputChange: (key: string, value: string) => void }> = React.memo(({ template, onInputChange, languageCode, setMediaId, setPreviewFile, onLocationSelect }) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [localPreviewFiles, setLocalPreviewFiles] = useState<{ [key: string]: string | null }>({});
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [mediaIdMap, setMediaIdMap] = useState<{ [key: string]: string | null }>({});
  const [uploadSuccess, setUploadSuccess] = useState<{ [key: string]: boolean }>({});

  const calculateInputWidth = (text: string, fontSize: number = 14): number => {
    if (typeof document === 'undefined') return 100;
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.fontSize = `${fontSize}px`;
    span.style.fontFamily = "inherit";
    span.innerText = text || "";
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width + 25; // Add padding
  };

  const calculateHeaderInputWidth = (text: string): number => {
    if (typeof document === 'undefined') return 100;
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.fontSize = '16px';
    span.style.fontFamily = 'inherit';
    span.style.fontWeight = '600'; // Add bold font weight for header
    span.innerText = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width + 20;
  };

  const renderVariableText = (text: string, variables: string[] = [], isHeader: boolean = false) => {
    const parts = text.split(/(\{\{\d+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{(\d+)\}\}/);
      if (match) {
        const varIndex = parseInt(match[1], 10) - 1;
        const exampleValue = variables[varIndex] || "";
        return (
          <input
            key={index}
            type="text"
            value={exampleValue}
            placeholder={exampleValue || "Enter value"}
            className={`inline-block px-1 mx-1 ${isHeader ? 'font-semibold' : ''}`}
            style={{ width: `${isHeader ? calculateHeaderInputWidth(exampleValue) : calculateInputWidth(exampleValue)}px` }}
            onChange={(e) => onInputChange(`${isHeader ? 'header' : 'body'}_${varIndex}`, e.target.value)}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const processText = (text: string, exampleValues: string[] = [], isHeader: boolean = false) => {
    const parts = text.split(/(\{\{\d+\}\})|(\*\*.*?\*\*)|(_.*?_)|(~~.*?~~)|(`.*?`)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      const varMatch = part.match(/\{\{(\d+)\}\}/);
      if (varMatch) {
        const varIndex = parseInt(varMatch[1]) - 1;
        const exampleValue = exampleValues?.[varIndex] || '';
        return (
          <input
            key={idx}
            type="text"
            defaultValue={exampleValue}
            placeholder={exampleValue}
            className={`inline-block px-1 mx-1 border border-gray-300 rounded focus:outline-none focus:border-[#25D366] text-sm ${isHeader ? 'font-semibold' : ''}`}
            style={{ width: `${isHeader ? calculateHeaderInputWidth(exampleValue) : calculateInputWidth(exampleValue)}px` }}
            onChange={(e) => onInputChange(`${isHeader ? 'header' : 'body'}_${varIndex}`, e.target.value)}
          />
        );
      }

      // Process markdown
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={idx}>{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx}>{part.slice(1, -1)}</code>;
      }

      return <span key={idx}>{part}</span>;
    });
  };

  const renderHeader = (component: { type: string; text?: string; format?: string; example?: { header_text?: string[], header_handle?: string[] } }, cardIndex: number, componentIndex: number) => {
    if (component.type !== "HEADER") return null;

    const text = component.text || "";
    const exampleValues = component.example?.header_text;
    const uniqueKey = `${cardIndex}-${componentIndex}`;

    // Render media upload option if present
    if (component.format === "IMAGE" || component.format === "VIDEO" || component.format === "DOCUMENT") {
      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          setLocalPreviewFiles(prev => ({ ...prev, [uniqueKey]: fileUrl }));
          setPreviewFile(fileUrl);
          setIsUploading(prev => ({ ...prev, [uniqueKey]: true }));
          setErrors(prev => ({ ...prev, [uniqueKey]: null }));
          setUploadSuccess(prev => ({ ...prev, [uniqueKey]: false }));

          // Upload the file to the endpoint
          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch("https://egenie-whatsapp.koyeb.app/api/media/upload", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              const mediaId = data.media_id;
              setMediaId(mediaId); // Save the media_id from the response
              setMediaIdMap(prev => ({ ...prev, [uniqueKey]: mediaId }));
              setUploadSuccess(prev => ({ ...prev, [uniqueKey]: true })); // Save the media_id from the response
              // console.log("Uploaded media_id:", mediaId); // Log the media_id to the console
            } else {
              console.error("Failed to upload media");
              setErrors(prev => ({ ...prev, [uniqueKey]: "Failed to upload media" }));
              setUploadSuccess(prev => ({ ...prev, [uniqueKey]: false }));
            }
          } catch (error) {
            console.error("Error uploading media:", error);
            setErrors(prev => ({ ...prev, [uniqueKey]: "Error uploading media" }));
          } finally {
            setIsUploading(prev => ({ ...prev, [uniqueKey]: false }));
          }
        }
      };

      const handleRemoveFile = () => {
        setLocalPreviewFiles(prev => ({ ...prev, [uniqueKey]: null }));
        setMediaId(null);
        setMediaIdMap(prev => ({ ...prev, [uniqueKey]: null }));
        setUploadSuccess(prev => ({ ...prev, [uniqueKey]: false }));
        const input = fileInputRefs.current[uniqueKey];
        if (input) {
          input.value = "";
        }
      };

      return (
        <div className="mb-4">
          {!localPreviewFiles[uniqueKey] ? (
            <div className="relative mb-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept={component.format === "IMAGE" ? "image/*" : component.format === "VIDEO" ? "video/*" : component.format === "DOCUMENT" ? "application/pdf" : ""}
                className="hidden"
                id={`file-upload-${uniqueKey}`}
                disabled={isUploading[uniqueKey]}
                ref={el => { fileInputRefs.current[uniqueKey] = el; }}
              />
              <label
                htmlFor={`file-upload-${uniqueKey}`}
                className={`
                  flex flex-col items-center justify-center p-6 
                  border-2 border-dashed rounded-lg cursor-pointer
                  transition-colors duration-200
                  ${isUploading[uniqueKey] ? 'bg-gray-50' : 'hover:bg-gray-50'}
                `}
                aria-label="Upload file"
              >
                {isUploading[uniqueKey] ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload file (images, PDFs, videos)</p>
                  </>
                )}
              </label>
              {errors[uniqueKey] && (
                <p className="mt-2 text-sm text-red-600">{errors[uniqueKey]}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              {component.format === "IMAGE" && localPreviewFiles[uniqueKey] && (
                <div className="flex flex-col">
                  <img
                    src={localPreviewFiles[uniqueKey] || ""}
                    alt="Header"
                    className="w-full h-auto max-h-[300px] object-contain rounded-md"
                  />
                  {uploadSuccess[uniqueKey] && mediaIdMap[uniqueKey] && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Image uploaded successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              )}
              {component.format === "VIDEO" && localPreviewFiles[uniqueKey] && (
                <div>
                  <video controls className="w-full rounded-md max-h-[100px] object-contain">
                    <source src={localPreviewFiles[uniqueKey] ?? undefined} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {uploadSuccess[uniqueKey] && mediaIdMap[uniqueKey] && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Image uploaded successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {component.format === "DOCUMENT" && localPreviewFiles[uniqueKey] && (
                <div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">PDF Document</span>
                        <span className="text-xs text-gray-500">Attached</span>
                      </div>
                    </div>
                    <a
                      href={localPreviewFiles[uniqueKey] || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded transition-colors"
                    >
                      <FileText className="w-6 h-6 text-gray-600" />
                    </a>
                    {uploadSuccess[uniqueKey] && mediaIdMap[uniqueKey] && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              Image uploaded successfully!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (component.format === "LOCATION") {
      return (
        <div className="mb-4">
          <Map onLocationSelect={onLocationSelect} />
        </div>
      );
    }

    return (
      <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
        {processText(text, exampleValues || [], true)}
      </h3>
    );
  };

  const renderBody = (component: { type: string; text?: string; example?: { body_text?: string[] } }, index: number) => {
    if (component.type !== "BODY") return null;

    const text = component.text || "";
    const exampleValues = component.example?.body_text?.[0];

    // Process markdown and variables
    const processText = (text: string) => {
      const parts = text.split(/(\{\{\d+\}\})|(\*\*.*?\*\*)|(_.*?_)|(~~.*?~~)|(`.*?`)/g);

      return parts.map((part, idx) => {
        if (!part) return null;

        const varMatch = part.match(/\{\{(\d+)\}\}/);
        if (varMatch) {
          const varIndex = parseInt(varMatch[1]) - 1;
          const exampleValue = exampleValues?.[varIndex] || '';
          return (
            <input
              key={idx}
              type="text"
              defaultValue={exampleValue}
              placeholder={exampleValue}
              className="inline-block px-1 mx-1 border border-gray-300 rounded focus:outline-none focus:border-[#25D366] text-sm"
              style={{ width: `${calculateInputWidth(exampleValue)}px` }}
              onChange={(e) => onInputChange(`body_${varIndex}`, e.target.value)}
            />
          );
        }

        // Process markdown
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <em key={idx}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('~~') && part.endsWith('~~')) {
          return <del key={idx}>{part.slice(2, -2)}</del>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx}>{part.slice(1, -1)}</code>;
        }

        return <span key={idx}>{part}</span>;
      });
    };

    // Split text by newlines and create multiple paragraphs
    const paragraphs = text.split('\n').filter(Boolean);

    return (
      <div className="text-gray-800 mb-4">
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className={idx < paragraphs.length - 1 ? 'mb-2' : ''}>
            {processText(paragraph)}
          </p>
        ))}
      </div>
    );
  };

  const renderFooter = (component: { type: string; text?: string }) => {
    if (component.type !== "FOOTER") return null;
    return <p className="text-[13px] text-gray-500 italic mb-2">{component.text}</p>;
  };

  const renderButtons = (component: { type: string; buttons: { text: string }[] }) => {
    if (component.type !== "BUTTONS") return null;

    return (
      <div className="flex flex-col gap-2 w-full">
        {component.buttons.map((button: { text: string }, index: number) => (
          <Button
            key={index}
            variant="outline"
            className="text-blue-500"
          >
            {button.text}
          </Button>
        ))}
      </div>
    );
  };

  const renderCarousel = (component: { type: string; cards: any[] }) => {
    if (component.type !== "CAROUSEL") return null;

    return (
      <div className="carousel-container flex overflow-x-auto space-x-4 w-[350px] scrollbar-hide">
        {component.cards.map((card, cardIndex) => (
          <Card key={cardIndex} className="carousel-card p-2 flex-shrink-0 w-[300px]">
            {card.components.map((cardComponent: any, componentIndex: number) => (
              <div key={componentIndex} className="mb-5 component-wrapper">
                {renderHeader(cardComponent, cardIndex, componentIndex)}
                {renderBody(cardComponent, componentIndex)}
                {renderFooter(cardComponent)}
                {cardComponent.buttons && renderButtons({ type: cardComponent.type, buttons: cardComponent.buttons.filter((button: { text: string }) => button && button.text) })}
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  };

  // A generic processText function to handle variables and markdown for fallback
  const processTextForFallback = (text: string, exampleValues: string[], isHeader: boolean) => {
    const parts = text.split(/(\{\{\d+\}\})|(\*\*.*?\*\*)|(_.*?_)|(~~.*?~~)|(`.*?`)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      const varMatch = part.match(/\{\{(\d+)\}\}/);
      if (varMatch) {
        const varIndex = parseInt(varMatch[1]) - 1;
        const exampleValue = exampleValues[varIndex] || '';
        return (
          <input
            key={idx}
            type="text"
            defaultValue={exampleValue}
            placeholder={exampleValue}
            className={`inline-block px-1 mx-1 border border-gray-300 rounded focus:outline-none focus:border-[#25D366] ${isHeader ? 'text-base' : 'text-sm'}`}
            style={{ width: `${calculateInputWidth(exampleValue)}px` }}
            onChange={(e) => onInputChange(`${isHeader ? 'header' : 'body'}_${varIndex}`, e.target.value)}
          />
        );
      }

      // Process markdown
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={idx}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={idx}>{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx}>{part.slice(1, -1)}</code>;
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (


    <ScrollArea className="max-h-[400px] overflow-y-auto">
      <div className="bg-[#f6f2e0aa] min-h-[300px] p-4">
        <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-sm p-4 space-y-3">
          {template.components && template.components.length > 0 ? (
            template.components.map((component, index) => (
              <div key={index} className="message-bubble">
                {component.type === "CAROUSEL" && 'cards' in component ? renderCarousel(component as { type: string; cards: any[] }) : (
                  <>
                    {renderHeader(component, index, index)}
                    {renderBody(component, index)}
                    {renderFooter(component)}
                    {component.buttons && renderButtons({ type: component.type, buttons: component.buttons.filter(button => button && button.text) })}
                  </>
                )}
              </div>
            ))
          ) : (
            /* Fallback for Prebuilt Templates with traditional structure */
            <div className="message-bubble">
              {template.header && (
                <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">
                  {processTextForFallback(
                    typeof template.header === 'string'
                      ? template.header
                      : (typeof template.header === 'object' &&
                         template.header !== null &&
                         'content' in template.header &&
                         typeof template.header.content === 'string'
                           ? template.header.content
                           : ''),
                    template.header_params || [],
                    true
                  )}
                </h3>
              )}
              {template.body && (() => {
                const bodyLines = template.body.split('\n').filter(Boolean);
                const lastIndex = bodyLines.length - 1;
                return (
                  <div className="text-gray-800 mb-4">
                    {bodyLines.map((paragraph, idx) => (
                      <p key={idx} className={idx < lastIndex ? 'mb-2' : ''}>
                        {processTextForFallback(paragraph, template.body_params || [], false)}
                      </p>
                    ))}
                  </div>
                );
              })()}
              {template.footer && (
                <p className="text-[13px] text-gray-500 italic mb-2">{template.footer}</p>
              )}
              {template.buttons && template.buttons.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  {template.buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-blue-500"
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
});

WhatsAppTemplateContent.displayName = "WhatsAppTemplateContent";