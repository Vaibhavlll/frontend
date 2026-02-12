import { MapPin } from "lucide-react";
import { AddressData } from "../../types";

export const AddressMessage = ({ data }: { data: AddressData }) => {
  return (
    <div className="flex flex-col w-fit mb-4 bg-gray-50 rounded-lg p-4 border max-w-md hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <MapPin className="h-5 w-5 text-blue-600" />
        <div className="font-medium">Delivery Address</div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium">{data.address.full_name}</span>
          <span className="text-gray-600">{data.address.email}</span>
          <span className="text-gray-600">+{data.sender_id}</span>
        </div>

        <div className="flex flex-col">
          <span>{data.address.address}</span>
          <span>
            {data.address.city}, {data.address.state}
          </span>
          <span>{data.address.pin_code}</span>
          <span>{data.address.country.replace("0_", "")}</span>
        </div>

        <div className="pt-3 border-t">
          <div className="text-xs text-gray-500 mb-1">Order Summary</div>
          {data.order_details.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.quantity} items</span>
              <span className="font-medium">
                {item.currency} {item.item_price.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};