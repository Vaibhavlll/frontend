import { Plus, Search, Loader2, Megaphone, Settings, ShieldCheck, Globe } from "lucide-react";
import useTemplates from "./hooks/fetchTemplate";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { memo, useCallback, useEffect, useState } from "react";
import { WhatsAppTemplateDialog } from "../WhatsAppTemplateDialog";
import TemplateBuilders from "../TemplateBuilders";
import { WhatsAppTemplate } from "../../types/template";
import { cn } from "@/lib/utils";
const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="px-3 py-6 text-xs text-gray-400 text-center border-2 border-dashed border-gray-50 rounded-xl">
        {message}
    </div>
);

const TemplateCard = memo(({ template, onClick }: { template: WhatsAppTemplate; onClick: (t: WhatsAppTemplate) => void }) => {

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'MARKETING': return Megaphone;
            case 'AUTHENTICATION': return ShieldCheck;
            default: return Settings;
        }
    };
    const Icon = getCategoryIcon(template.category);

    return (
        <Card
            className={cn(
                "mb-2 cursor-pointer transition-all duration-300 border-l-[3px] group shadow-none border hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] bg-white overflow-hidden",
                {
                    "border-l-green-500 hover:border-green-200": template.status === "APPROVED",
                    "border-l-amber-500 hover:border-amber-200": template.status === "PENDING",
                    "border-l-red-500 hover:border-red-200": template.status === "REJECTED",
                    "border-gray-100": !template.status
                }
            )}
            onClick={() => onClick(template)}
        >
            <CardHeader className="p-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={cn("p-2 rounded-lg transition-colors duration-300 shrink-0", {
                                "bg-green-50 text-green-600": template.status === "APPROVED",
                                "bg-amber-50 text-amber-600": template.status === "PENDING",
                                "bg-red-50 text-red-600": template.status === "REJECTED",
                                "bg-gray-50 text-gray-400": !template.status
                            })}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <CardTitle className="text-[11px] font-bold text-gray-800 leading-tight truncate w-full">
                                    {template.name}
                                </CardTitle>
                                <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 shrink-0">
                                        <Globe className="h-2.5 w-2.5" />
                                        {template.language}
                                    </span>
                                    <span className="text-[10px] text-gray-300 shrink-0">•</span>
                                    <span className="text-[10px] font-medium text-gray-400 capitalize truncate">
                                        {template.category.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </CardHeader>
        </Card>
    );
});
TemplateCard.displayName = "TemplateCard";

const FetchTemplates = ({ selectedConversationId }: { selectedConversationId?: string }) => {
    const [isOpened, setIsOpened] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { data, isLoading } = useTemplates({ enabled: isOpened || searchQuery.length > 0 });
    const isAdmin = useRole();
    const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [searchTemplate, setSearchTemplate] = useState("");
    const [accordionValue, setAccordionValue] = useState<string[]>([]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            setAccordionValue(["prebuilt", "user"]);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (data) {
            setTemplates(data);
        }
    }, [data]);

    const filteredData = templates.filter((t: WhatsAppTemplate) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const prebuilt = filteredData.filter((t: WhatsAppTemplate) => t.type === "PREBUILT");
    const userCreated = filteredData.filter((t: WhatsAppTemplate) => t.type === "USER_CREATED");

    const handleTemplateClick = useCallback((template: WhatsAppTemplate) => {
        setSelectedTemplate(template);
        setIsPreviewOpen(true);
    }, []);

    if (!selectedConversationId) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 py-2 w-full max-w-full overflow-hidden">
            {/* Search */}
            <div className="flex flex-row px-[var(--sidebar-padding)]">
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search templates..."
                        className="pl-9 h-9 text-xs bg-gray-50/50 border-gray-100 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-lg w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="pl-2">
                    {isAdmin && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 border-gray-100 hover:bg-primary/5 hover:text-primary transition-colors focus-visible:ring-0 focus:ring-0"
                                    onClick={() => setIsTemplateBuilderOpen(true)}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add new template</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="px-[var(--sidebar-padding)] w-full overflow-hidden">
                <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={(value) => {
                        setAccordionValue(value);
                        if (value.length > 0) setIsOpened(true);
                    }}
                    className="w-full space-y-1"
                >
                    {/* Prebuilt Templates */}
                    <AccordionItem value="prebuilt" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest focus-visible:ring-0 focus:ring-0 outline-none">
                            Prebuilt Templates
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 px-0">
                            {isLoading ? (
                                <LoadingState />
                            ) : prebuilt?.length ? (
                                <div className="flex flex-col">
                                    {prebuilt.map((template: WhatsAppTemplate) => (
                                        <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No prebuilt templates found" />
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* User Created Templates */}
                    <AccordionItem value="user" className="border-none">
                        <AccordionTrigger className="hover:no-underline py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest focus-visible:ring-0 focus:ring-0 outline-none">
                            Your Templates
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 px-0">
                            {isLoading ? (
                                <LoadingState />
                            ) : userCreated?.length ? (
                                <div className="flex flex-col">
                                    {userCreated.map((template: WhatsAppTemplate) => (
                                        <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No custom templates yet" />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <WhatsAppTemplateDialog
                template={selectedTemplate}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                selectedConversationId={selectedConversationId}
            />

            <TemplateBuilders
                isOpen={isTemplateBuilderOpen}
                setIsOpen={setIsTemplateBuilderOpen}
                templates={templates}
                setTemplates={setTemplates}
                searchTemplate={searchTemplate}
                setSearchTemplate={setSearchTemplate}
            />
        </div>
    );
};

export default FetchTemplates;
