"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";

interface SingleProductFormProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

const SingleProductForm = ({ setIsModalOpen }: SingleProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const api = useApi()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImagePreview(url || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    if (imageUrl) {
      formData.append("image_url", imageUrl);
    }

    const res = await api.post("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setLoading(false);

    if (res.status !== 200) {
      toast.error("Product creation failed!");
      return;
    }

    toast.success("Product created successfully!");
    setIsModalOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-full mx-auto space-y-4"
    >
      {/* Product Name */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium" htmlFor="product_name">
          Product Name
        </Label>
        <Input
          id="product_name"
          name="product_name"
          required
          placeholder="Enter product name"
          className="h-10 text-sm rounded-md"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium" htmlFor="description">
          Description
        </Label>
        <Input
          id="description"
          name="description"
          placeholder="Short description"
          className="h-10 text-sm rounded-md"
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium" htmlFor="price">
            Price (₹)
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium" htmlFor="stock">
            Stock Quantity
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            placeholder="0"
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium" htmlFor="image_url">
          Image URL (Optional)
        </Label>
        <Input
          id="image_url"
          name="image_url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          className="h-10 text-sm rounded-md"
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="flex justify-center overflow-hidden rounded-lg border border-gray-100 mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full h-auto max-h-[200px] object-contain transition-opacity"
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
          className="flex-1 h-10 text-sm font-medium"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-10 text-sm font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
        >
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default SingleProductForm;
