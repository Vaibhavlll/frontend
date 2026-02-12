import React, { useState, ChangeEvent, FormEvent } from "react";
// Define the platform type
type PlatformType = "pinecone" | "shopify" | "other" | undefined;

// Define props interface
interface AddProductProps {
  closeForm: () => void;
  platform: PlatformType;
  setIsModalOpen?: (isOpen: boolean) => void;
}


// Define form data interface
interface ProductFormData {
  category: string;
  description: string;
  images: string;
  name: string;
  on_sale: string;
  permalink: string;
  price: string;
  product_id: string;
  purchasable: string;
  regular_price: string;
  sale_price: string;
  slug: string;
  stock_quantity: string;
  shopify_url?: string;
}

const platformEndpoints: Record<NonNullable<PlatformType>, string> = {
  pinecone: "/api/pinecone",
  shopify: "/api/shopify",
  other: "/api/products"
};

function isProductFormField(key: string): key is keyof ProductFormData {
  return [
    'category',
    'description',
    'images',
    'name',
    'on_sale',
    'permalink',
    'price',
    'product_id',
    'purchasable',
    'regular_price',
    'sale_price',
    'slug',
    'stock_quantity',
    'shopify_url'
  ].includes(key);
}

const AddProduct: React.FC<AddProductProps> = ({ closeForm, platform, setIsModalOpen }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    category: "",
    description: "",
    images: "",
    name: "",
    on_sale: "True",
    permalink: "",
    price: "",
    product_id: "",
    purchasable: "True",
    regular_price: "",
    sale_price: "",
    slug: "",
    stock_quantity: "",
    // Add any platform-specific fields here if needed
    ...(platform === "shopify" && { shopify_url: "" })
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Get endpoint with fallback for undefined platform
      const endpoint = platform ? platformEndpoints[platform] : "/api/products";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert(`Product added to ${platform || 'system'} successfully!`);
        setFormData({
          category: "",
          description: "",
          images: "",
          name: "",
          on_sale: "True",
          permalink: "",
          price: "",
          product_id: "",
          purchasable: "True",
          regular_price: "",
          sale_price: "",
          slug: "",
          stock_quantity: "",
          ...(platform === "shopify" && { shopify_url: "" })
        });
        closeForm();
      } else {
        alert("Failed to add product. Please try again.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg w-full max-w-md"
      onClick={(e) => e.stopPropagation()} // Add this line
    > 
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 backdrop-blur-sm">
      <form
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 transition-all transform"
        onSubmit={handleSubmit}
      >
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8 font-poppins">
          {platform ? `Add to ${platform.charAt(0).toUpperCase() + platform.slice(1)}` : "Add Product"}
        </h2>

        {/* Platform-specific fields */}
        {platform === "shopify" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Shopify Store URL
            </label>
            <input
              type="text"
              name="shopify_url"
              value={formData.shopify_url}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="https://your-store.myshopify.com"
            />
          </div>
        )}

        {Object.keys(formData).map((field) => {
          if (platform === "shopify" && field === "shopify_url") return null;
          if (!isProductFormField(field)) return null;
          
          return (
            <div key={field} className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              {field === "category" || field === "on_sale" || field === "purchasable" ? (
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
                >
                  {/* ...existing select options... */}
                </select>
              ) : field === "description" ? (
                <textarea
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  rows={3}
                  placeholder="Enter product description..."
                ></textarea>
              ) : (
                <input
                  type={
                    field.includes("price") || field.includes("quantity")
                      ? "number"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={`Enter ${field.replace(/_/g, " ")}...`}
                />
              )}
            </div>
          );
        })}

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
          >
            Submit to {platform || "System"}
          </button>
          <button
            type="button"
            onClick={closeForm}
            className="flex-1 bg-gray-100 text-gray-600 px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all border border-gray-200 hover:border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    </div>

  );
};

export default AddProduct;