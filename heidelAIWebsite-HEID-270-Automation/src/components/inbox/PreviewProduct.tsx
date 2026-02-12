import React from "react";
import {
  Tag,
  Clock,
  Warehouse,
  ShoppingCart,
  Link2,
  Share2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Product } from "../types/product";

interface ProductPreviewProps {
  product: Product;
  onClose: () => void;
  onShare: (product: Product) => void;
  open: boolean;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  product,
  onClose,
  onShare,
  open,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 rounded-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b bg-white">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Product Preview
          </DialogTitle>
        </DialogHeader>

        {/* Scroll Body */}
        <ScrollArea className="max-h-[75vh] p-5">
          <div className="space-y-8">

            {/* ---------------------------------- */}
            {/* TOP SECTION - IMAGE + DETAILS */}
            {/* ---------------------------------- */}
            <div className="flex flex-col lg:flex-row gap-8">

              {/* LEFT IMAGE */}
              <div className="w-full lg:w-1/2">
                <div
                  className="w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {product.onsale && (
                  <Badge className="mt-3 w-fit" variant="destructive">
                    On Sale
                  </Badge>
                )}
              </div>

              {/* RIGHT INFO */}
              <div className="w-full lg:w-1/2 space-y-4">

                {/* Title */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h2 className="text-xl sm:text-2xl font-medium leading-snug">
                        {product.product_name}
                      </h2>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {product.product_name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Price */}
                <div>
                  <span className="text-3xl font-bold text-emerald-600">
                    ₹{product.price || product.regularprice}
                  </span>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-gray-500" />
                  {product.stock > 0 ? (
                    <Badge variant="success">
                      In Stock ({product.stock})
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {/* Mini Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Category
                    </p>
                    <p className="font-medium">{product.category}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      Product ID
                    </p>
                    <p className="font-medium">{product.product_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------- */}
            {/* BOTTOM INFO GRID */}
            {/* ---------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">

              {/* Product Link */}
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Product Link
                </p>

                <div className="flex gap-3 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(product.permalink, "_blank")}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(product.permalink);
                      toast.success("Copied!");
                    }}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Last Updated */}
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last Updated
                </p>
                <p className="font-medium mt-2 text-sm">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* ---------------------------------- */}
        {/* FOOTER BUTTON */}
        {/* ---------------------------------- */}
        <div className="px-5 py-4 border-t bg-white flex justify-end">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              onShare(product);
              onClose();
            }}
          >
            <Share2 className="h-4 w-4" />
            Share in Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPreview;
