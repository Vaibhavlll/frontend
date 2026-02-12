import { useState } from "react";
import { CartItem } from "../../types";
import { ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const CartMessage = ({ items }: { items: CartItem[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const total = items.reduce(
    (sum, item) => sum + item.item_price * item.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="flex flex-col w-fit mb-4 bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center gap-4">
          <img
            src={items[0].product_data.image_url}
            alt={items[0].product_data.name}
            className="w-24 h-24  rounded"
          />
          <div className="flex flex-col space-y-2">
            <div className="relative flex space-x-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <div className="font-medium ">{totalQuantity} items</div>
            </div>
            <div className="text-sm">
              ₹{total.toLocaleString("en-IN")} (estimated total)
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => setIsModalOpen(true)}
        >
          View Cart ({totalQuantity} items)
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto p-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 border-b pb-4">
                <img
                  src={item.product_data.image_url}
                  alt={item.product_data.name}
                  className="w-24 h-24  rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2">
                    {item.product_data.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span>Quantity: {item.quantity}</span>
                    <div className="text-right">
                      <div className="font-medium">
                        ₹
                        {(item.item_price * item.quantity).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} × ₹
                        {item.item_price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-4 text-lg font-medium">
              <span>Total ({totalQuantity} items)</span>
              <span className="font-bold">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};