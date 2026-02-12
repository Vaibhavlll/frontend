import React, { useState, useMemo, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Hooks & Constants
import { useSidebarLogic } from "./hooks/useSidebarLogic";
import { FLUID_STYLES, ACCORDION_CONFIG } from "./constants";

import ProductPreview from "../PreviewProduct";
import ProductsTab from "../Product";
import CustomerInfo from "../CustomerInfo";
import ConversationSummary from "../ConversationSummary";


import AnalyticsSection from "../AnalyticsSection";
import AccordionSection from "./AccordionSection";
import TagDropdown from "./TagDropdown";

// Types & Libs
import { Conversation } from "@/components/types/conversation";
import { Product } from "@/components/types/product";
import FetchTemplates from "./FetchTemplates";

interface SidebarProps {
  selectedConversationId: string;
  onShareProduct: (product: Product) => void;
  onConversationSelect: (id: string) => void;
  onToggleVisibility?: () => void;
  conversation?: Conversation | null;
  currentAgentUsername: string;
}

const Sidebar = ({
  selectedConversationId,
  onShareProduct,
  conversation: passedConversation,
  onToggleVisibility,
  currentAgentUsername,
}: SidebarProps) => {
  // Logic Extracted to Hook
  const {
    conversation,
    allTags,
    assignedTags,
    isUpdatingTags,
    handleToggleTag,
    saveCustomerInfo,
  } = useSidebarLogic(selectedConversationId, passedConversation);

  const [uiState, setUiState] = useState({
    showCustomerInfo: false,
    accordionValue: "summary",
  });

  const [selectedData, setSelectedData] = useState<{
    product: Product | null;
  }>({ product: null });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleUi = (key: keyof typeof uiState, value: any) => {
    setUiState((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedData((prev) => ({ ...prev, product }));
  }, []);

  const handleProductShare = useCallback(
    (product: Product) => {
      onShareProduct(product);
      setSelectedData((prev) => ({ ...prev, product: null }));
    },
    [onShareProduct],
  );

  const handleRemoveTag = useCallback(
    (tag: string, event: React.MouseEvent) => {
      event.stopPropagation();
      handleToggleTag(tag);
    },
    [handleToggleTag],
  );

  // Derived Data
  const contactPhone = useMemo(() => {
    if (!selectedConversationId) return "Not Available";

    const rawPhone = selectedConversationId.replace(
      /^(instagram_|whatsapp_)/,
      "",
    );

    if (selectedConversationId.startsWith("whatsapp_")) {
      const countryCode = rawPhone.slice(0, 2);
      const phoneNumber = rawPhone.slice(2);
      return `+${countryCode}-${phoneNumber}`;
    }

    return rawPhone;
  }, [selectedConversationId]);

  const customerInitial = useMemo(
    () => conversation?.customer_name?.charAt(0).toUpperCase() || "U",
    [conversation?.customer_name],
  );

  // Re-ordering Logic (RESTORED)
  // This ensures the open accordion item moves to the top of the list
  const orderedSections = useMemo(() => {
    if (!uiState.accordionValue) return ACCORDION_CONFIG;

    const activeSection = ACCORDION_CONFIG.find(
      (s) => s.value === uiState.accordionValue,
    );
    const otherSections = ACCORDION_CONFIG.filter(
      (s) => s.value !== uiState.accordionValue,
    );

    return activeSection ? [activeSection, ...otherSections] : ACCORDION_CONFIG;
  }, [uiState.accordionValue]);

  // Render Logic for Accordion Content
  const renderAccordionContent = (sectionValue: string) => {
    switch (sectionValue) {
      case "summary":
        return (
          <ConversationSummary
            selectedConversationId={selectedConversationId}
          />
        );
      case "templates":
        return (
          <FetchTemplates selectedConversationId={selectedConversationId} />
        );
      case "products":
        return (
          <ProductsTab
            selectedConversationId={selectedConversationId}
            onProductSelect={handleProductSelect}
            onShareProduct={onShareProduct}
          />
        );
      case "analytics":
        return (
          <AnalyticsSection
            selectedConversationId={selectedConversationId}
            currentAgentUsername={currentAgentUsername}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <style>{FLUID_STYLES}</style>



      <Dialog
        open={uiState.showCustomerInfo}
        onOpenChange={(v) => toggleUi("showCustomerInfo", v)}
      >
        <DialogContent className="max-w-4xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Customer Information
            </DialogTitle>
          </DialogHeader>
          {conversation && (
            <CustomerInfo
              name={conversation.customer_name || "Not Saved"}
              email={conversation.email || "Not Available"}
              billingaddress={conversation.billingAddress || "Not Saved"}
              shippingaddress={conversation.shippingAddress || "Not Saved"}
              platform={conversation.platform || ""}
              selectedConversationId={selectedConversationId}
              saveCustomerInfo={saveCustomerInfo}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- Sidebar UI --- */}
      <Card className="h-full max-h-screen bg-white/95 backdrop-blur-sm flex flex-col border-l border-gray-200/60 shadow-lg">
        <div className="bg-white/40 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-[var(--sidebar-padding)] py-1.5">
          <h2 className="font-semibold text-gray-900 text-sm">Contact</h2>
          {onToggleVisibility && (
            <Button
              onClick={onToggleVisibility}
              variant="ghost"
              size="icon"
              className="bg-white/60 hover:bg-white/90 rounded-xl transition-all h-8 w-8"
            >
              <X className="text-gray-600 h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 ios-scrollbar min-h-0">
          <div className="bg-white p-[var(--sidebar-padding)]">
            {/* Header Profile */}
            <div className="flex items-start gap-[var(--sidebar-gap)] pb-3.5 mb-3.5 border-b border-gray-200">
              <div className="flex flex-col gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-full flex items-center justify-center w-[calc(var(--avatar-size)*0.85)] h-[calc(var(--avatar-size)*0.85)] shadow-md">
                    <span className="text-black font-semibold text-[calc(var(--sidebar-text-sm)*0.85)]">
                      {customerInitial}
                    </span>
                  </div>
                </div>

                {/* Tags Label */}
                <label className="font-sans text-xs text-gray-800 leading-relaxed font-semibold mt-2.5 ml-1 self-start">
                  Tags
                </label>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Customer Name, Phone & Profile Button */}
                <div className="flex items-center justify-between gap-2">
                  {/* Name & Phone */}
                  <div className="flex flex-col min-w-0">
                    <h3
                      className="font-bold text-gray-900 truncate leading-snug"
                      style={{ fontSize: "var(--sidebar-text-sm)" }}
                    >
                      {conversation?.customer_name || "Unknown"}
                    </h3>

                    {/* Phone Number Row */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-500">
                      <span className="text-[11px] font-medium truncate leading-none pt-[1px]">
                        {contactPhone}
                      </span>
                    </div>
                  </div>

                  {/* Profile Action Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleUi("showCustomerInfo", true)}
                        className="text-gray-400 hover:text-blue-600 h-7 w-7 flex items-center justify-center rounded-md hover:bg-blue-50 transition-all shrink-0"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      Customer details
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="w-full self-start pt-1 ml-2">
                  <TagDropdown
                    assignedTags={assignedTags}
                    allTags={allTags}
                    isUpdatingTags={isUpdatingTags}
                    onToggleTag={handleToggleTag}
                    onRemoveTag={handleRemoveTag}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="flex-1 flex flex-col -mt-4">
            <Accordion
              type="single"
              collapsible
              value={uiState.accordionValue}
              onValueChange={(v) => toggleUi("accordionValue", v)}
              className="w-full"
            >
              {/* Uses orderedSections instead of ACCORDION_CONFIG to enable sorting */}
              {orderedSections.map((section) => (
                <AccordionSection
                  key={section.value}
                  value={section.value}
                  icon={section.icon}
                  title={section.title}
                  subtitle={section.subtitle}
                  color={section.color}
                >
                  {renderAccordionContent(section.value)}
                </AccordionSection>
              ))}
            </Accordion>
          </div>
        </ScrollArea>

        {selectedData.product && (
          <ProductPreview
            product={selectedData.product}
            onClose={() =>
              setSelectedData((prev) => ({ ...prev, product: null }))
            }
            onShare={handleProductShare}
            open={!!selectedData.product}
          />
        )}
      </Card>
    </TooltipProvider>
  );
};

export default memo(Sidebar);
