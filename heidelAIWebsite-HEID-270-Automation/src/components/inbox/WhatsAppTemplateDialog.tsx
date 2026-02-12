import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WhatsAppTemplate } from "../types/template";
import { WhatsAppTemplateContent } from "./WhatsApptemplateContent";
import { Share2 } from "lucide-react";
import { useApi } from "@/lib/session_api";

interface WhatsAppTemplateDialogProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  selectedConversationId?: string;
  languageCode?: string;
}

export const WhatsAppTemplateDialog = ({
  template,
  isOpen,
  onClose,
  selectedConversationId,
  languageCode,
}: WhatsAppTemplateDialogProps) => {
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null); // Add state for location

  useEffect(() => {
    if (template) {
      const initialVariables: { [key: string]: string } = {};

      if (template.components && template.components.length > 0) {
        template.components.forEach((component) => {
          if (component.type === "HEADER" && component.example?.header_text) {
            initialVariables[`header_0`] = component.example.header_text[0] || "";
          }
          if (component.type === "BODY" && component.example?.body_text) {
            const bodyText = component.example.body_text[0];
            if (Array.isArray(bodyText)) {
              bodyText.forEach((text, idx) => {
                initialVariables[`body_${idx}`] = text || "";
              });
            }
          }
        });
      } else {

        if (template.header_params) {
          template.header_params.forEach((param, idx) => {
            initialVariables[`header_${idx}`] = param || "";
          });
        }
        if (template.body_params) {
          template.body_params.forEach((param, idx) => {
            initialVariables[`body_${idx}`] = param || "";
          });
        }
      }
      setVariables(initialVariables);
    }
  }, [template]);

  const handleInputChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleRemoveFile = () => {
    setPreviewFile(null);
    setMediaId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const api = useApi();

  const constructPayload = (
    template: WhatsAppTemplate,
    selectedConversationId: string
  ) => {
    const [messagingProduct, recipientPhoneNumber] =
      selectedConversationId.split("_");
    const components: {
      type: string;
      parameters?: Array<{
        type: string;
        text?: string;
        image?: { id: string | null };
        video?: { id: string | null };
        document?: { id: string | null };
        location?: {
          longitude: number;
          latitude: number;
          name: string;
          address: string;
        };
        payload?: string;
        phone_number?: string;
      }>;
      sub_type?: string;
      index?: string;
    }[] = [];

    if (template.components && template.components.length > 0) {
      // Header Component
      if (template.components?.some((c) => c.type === "HEADER")) {
        const headerComponent = template.components.find(
          (c) => c.type === "HEADER"
        );

        if (headerComponent?.format === "TEXT") {
          const headerText =
            variables["header_0"] ||
            headerComponent?.example?.header_text?.[0] ||
            "";

          components.push({
            type: "header",
            parameters: [
              {
                type: "text",
                text: headerText,
              },
            ],
          });
        } else if (
          headerComponent?.format === "IMAGE" ||
          headerComponent?.format === "VIDEO" ||
          headerComponent?.format === "DOCUMENT"
        ) {
          components.push({
            type: "header",
            parameters: [
              {
                type: headerComponent.format.toLowerCase(), // "image", "video", or "document"
                [headerComponent.format.toLowerCase()]: {
                  id: mediaId, // Use the media_id from the uploaded file
                },
              },
            ],
          });
        } else if (headerComponent?.format === "LOCATION") {
          const locationText = headerComponent?.text || "Current Location";

          components.push({
            type: "header",
            parameters: [
              {
                type: "location",
                location: {
                  longitude: location?.lng || 0, // Use the selected longitude
                  latitude: location?.lat || 0, // Use the selected latitude
                  name: locationText,
                  address: location?.address || "", // Use the selected address
                },
              },
            ],
          });
        }
      }

      // Body Component
      if (template.components?.some((c) => c.type === "BODY")) {
        const bodyComponent = template.components.find((c) => c.type === "BODY");
        const bodyTextValues = Array.isArray(
          bodyComponent?.example?.body_text?.[0]
        )
          ? bodyComponent?.example?.body_text?.[0]
          : [];

        const updatedBodyTextValues = bodyTextValues?.map(
          (value: string, index: number) => variables[`body_${index}`] || value
        );

        components.push({
          type: "body",
          parameters: updatedBodyTextValues?.map((value: string) => ({
            type: "text",
            text: value,
          })),
        });
      }

      // Buttons Component
      if (template.components?.some((c) => c.type === "BUTTONS")) {
        const buttonsComponent = template.components.find(
          (c) => c.type === "BUTTONS"
        );
        const buttons = buttonsComponent?.buttons || [];

        buttons.forEach((button, index) => {
          const parameters = [];
          if (button.type === "URL") {
            parameters.push({
              type: "text",
              text: button.text,
            });
          } else if (button.type === "REPLY" || button.type === "COPY") {
            parameters.push({
              type: "payload",
              payload: button.text,
            });
          } else if (button.type === "PHONE_NUMBER") {
            parameters.push({
              type: "phone_number",
              phone_number: button.text,
            });
          }

          components.push({
            type: "button",
            sub_type: button.type === "REPLY" ? "QUICK_REPLY" : button.type,
            index: index.toString(),
            parameters: parameters,
          });
        });
      }
    } else {
      // Fallback for prebuilt templates
      const headerText = typeof template.header === "string"
        ? template.header
        : template.header?.content;

      if (headerText) {
        const headerParamsCount = headerText.match(/\{\{\d+\}\}/g)?.length || 0;
        const header_parameters = [];
        for (let i = 0; i < headerParamsCount; i++) {
          header_parameters.push({
            type: "text",
            text: variables[`header_${i}`] || template.header_params?.[i] || "",
          });
        }
        if (header_parameters.length > 0) {
          components.push({
            type: "header",
            parameters: header_parameters,
          });
        }
      }

      if (template.body) {
        const bodyParamsCount = template.body.match(/\{\{\d+\}\}/g)?.length || 0;
        const body_parameters = [];
        for (let i = 0; i < bodyParamsCount; i++) {
          body_parameters.push({
            type: "text",
            text: variables[`body_${i}`] || template.body_params?.[i] || "",
          });
        }
        if (body_parameters.length > 0) {
          components.push({
            type: "body",
            parameters: body_parameters,
          });
        }
      }

      // Add buttons for prebuilt fallback if they exist
      if (template.buttons && template.buttons.length > 0) {
        template.buttons.forEach((button, index) => {
          const parameters = [];
          const type = button.type.toUpperCase();

          if (type === "URL") {
            parameters.push({
              type: "text",
              text: button.text,
            });
          } else if (type === "REPLY" || type === "COPY" || type === "QUICK_REPLY") {
            parameters.push({
              type: "payload",
              payload: button.text,
            });
          } else if (type === "PHONE_NUMBER" || type === "PHONE") {
            parameters.push({
              type: "phone_number",
              phone_number: button.text,
            });
          }

          components.push({
            type: "button",
            sub_type: (type === "REPLY" || type === "QUICK_REPLY") ? "QUICK_REPLY" : type,
            index: index.toString(),
            parameters: parameters,
          });
        });
      }
    }

    // Final Payload
    return {
      messaging_product: messagingProduct,
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "template",
      template: {
        name: template.name, // Template name
        language: {
          code: languageCode || "en_US", // Dynamic language code
        },
        components: components,
      },
    };
  };

  const isButtonDisabled = () => {
    if (!template?.components || template?.components?.length === 0) {
      // Prebuilt template validation
      return false; // Assume prebuilt templates are valid if selected
    }

    const headerComponent = template?.components?.find(
      (c) => c.type === "HEADER"
    );
    if (!headerComponent) return true; // Disable if no header is present when components exist

    if (headerComponent.format === "TEXT") {
      return false;
    }

    if (
      headerComponent.format === "IMAGE" ||
      headerComponent.format === "VIDEO" ||
      headerComponent.format === "DOCUMENT"
    ) {
      return !mediaId;
    }

    if (headerComponent.format === "LOCATION") {
      return !location;
    }

    return false;
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-l">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
          <p>{template.name}</p>
        </DialogHeader>
        <div className="py-2">
          <WhatsAppTemplateContent
            template={template}
            onInputChange={handleInputChange}
            setMediaId={setMediaId}
            setPreviewFile={setPreviewFile}
            onLocationSelect={setLocation}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            onClick={() => {
              if (template && selectedConversationId) {
                const payload = constructPayload(
                  template,
                  selectedConversationId
                );

              }
            }}
            disabled={isButtonDisabled()}
          >
            <Share2 className="h-5 w-5" />
            <span className="font-medium">Share in Chat</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
