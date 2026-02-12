import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CustomerInfo = ({
  name,
  email,
  billingaddress,
  shippingaddress,
  platform,
  selectedConversationId,
  saveCustomerInfo, // New prop for saving data
}: {
  name: string;
  email: string;
  billingaddress: string;
  shippingaddress: string;
  platform: string;
  selectedConversationId: string;
  saveCustomerInfo: (updatedData: {
    name: string;
    email: string;
    billingaddress: string;
    shippingaddress: string;
    gstin: string;
    phoneOrUserId: string;
  }) => Promise<void>; // Function to save data
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name,
    email,
    billingaddress,
    shippingaddress,
    gstin: "",
    phoneOrUserId:
      platform === "whatsapp"
        ? selectedConversationId
            ?.replace(/^whatsapp_/, "")
            ?.replace(/^(\d{2})(\d+)/, "+$1 $2")
        : selectedConversationId?.replace(/^(instagram_|whatsapp_)/, "") || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        shippingaddress: prev.billingaddress,
      }));
    }
  };

  const handleSave = async () => {
    try {
      await saveCustomerInfo(formData); // Call the save function
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Failed to save customer info:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {platform === "whatsapp" ? "Phone Number" : "User ID"}
          </label>
          <Input
            name="phoneOrUserId"
            value={formData.phoneOrUserId}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            GSTIN
          </label>
          <Input
            name="gstin"
            value={formData.gstin}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Address
          </label>
          <Input
            name="billingaddress"
            value={formData.billingaddress}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Shipping Address
          </label>
          <Input
            name="shippingaddress"
            value={formData.shippingaddress}
            onChange={handleInputChange}
            readOnly={!isEditing}
          />
          {isEditing && (
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  onChange={handleCheckboxChange}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Same as Billing Address
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Buttons at the bottom-right */}
      <div className="flex justify-end gap-2 mt-6">
        {isEditing && (
          <Button variant="outline" onClick={handleSave}>
            Save
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
    </div>
  );
};

export default CustomerInfo;
