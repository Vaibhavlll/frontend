import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomerInfoDialog = ({showCustomerInfo, setShowCustomerInfo, conversation, selectedConversationId} : {showCustomerInfo: boolean, setShowCustomerInfo: (value: boolean) => void, conversation: any, selectedConversationId: string | null}) => {
    return (
        <Dialog open={showCustomerInfo} onOpenChange={setShowCustomerInfo}>
            <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle className="text-2xl">
                Customer Information
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                <div className="rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                    Contact Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-base">
                    <div className="space-y-1">
                    <div className="text-gray-500">Name</div>
                    <div className="font-medium">
                        {conversation?.customer_name}
                    </div>
                    </div>
                    <div className="space-y-1">
                    <div className="text-gray-500">
                        {conversation?.platform === "instagram"
                        ? "Username"
                        : "Phone"}
                    </div>
                    <div className="font-medium">
                        {conversation?.platform === "instagram"
                        ? selectedConversationId?.split("_")[1]
                        : selectedConversationId
                            ?.split("_")[1]
                            ?.replace(/^(\d{2})(\d+)/, "+$1 $2")}
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </DialogContent>
        </Dialog>
    )
}

export default CustomerInfoDialog;