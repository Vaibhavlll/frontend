import {Product} from "../../../../types/product";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";

export const SharedProductPreview = ({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) => (
  <div className="flex items-center w-fit gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 mb-2">
    <div className="w-15 h-15 relative">
      <Image
        src={product.image_url}
        alt={product.product_name}
        height={80}
        width={80}
        className="rounded object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-base font-medium text-gray-900 ">
        {product.product_name.length > 50
          ? `${product.product_name.substring(0, 50)}...`
          : product.product_name}
      </p>
      <p className="text-sm text-gray-500">₹{product.price}</p>
    </div>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onRemove}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);