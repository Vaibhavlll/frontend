import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddProduct from "@/components/inbox/AddProduct";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, Send, Plus, Search, Eye, Share2, AlertTriangle, MoreVertical, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useApi } from "@/lib/session_api";
import { Product } from "../types/product";
import { useOrganization, useUser } from "@clerk/nextjs";
import { m } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import SingleProductForm from "./product/SingleProductForm";
import BulkUploadForm from "./product/BulkUploadForm";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
type PlatformType = "pinecone" | "shopify" | "other" | undefined;

const WS_URL = 'wss://egenie-whatsapp.koyeb.app/cs';

// interface Product {
//   id: string;
//   category: string;
//   description: string;
//   images: string;
//   name: string;
//   on_sale: string;
//   permalink: string;
//   price: number;
//   product_id: number;
//   purchasable: string;
//   regular_price: string;
//   sale_price: string;
//   slug: string;
//   stock_quantity: number;
// }

interface ProductsTabProps {
  selectedConversationId?: string;
  onProductSelect: (product: Product) => void;
  onShareProduct: (product: Product) => void;
}

const LoadingState = () => (
  <div className="p-3 mb-2 bg-white shadow-sm">
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="flex-1 relative">
        <Input
          placeholder="Search products..."
          className="pl-8 pr-3 py-1.5 text-sm border-gray-300 focus:ring-1 focus:ring-blue-500"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      <div className="relative">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new product</TooltipContent>
        </Tooltip> */}
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
          <Skeleton className="w-10 h-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProductsTab = ({
  onProductSelect,
  selectedConversationId,
  onShareProduct
}: ProductsTabProps) => {
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [retries, setRetries] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  // const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"single" | "bulk">("single");
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { user } = useUser();
  const { organization } = useOrganization({
    memberships: true
  })
  const api = useApi();
  const { isAdmin } = useRole();

  const maxRetries = 5;
  const retryDelay = 3000;




  const fetchProducts = async (conversationId: string) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/products`);
      // console.log('Fetched products:', response.data);

      if (response.status !== 200) {
        setError('Failed to fetch products');
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      setError(null);
      const productsData = Array.isArray(response.data.products) ? response.data.products : [];
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProducts([]);
      setFilteredProducts([]);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };


  const deletProduct = async (productId: number | string) => {
    try {
      const response = await api.delete(`/api/products/${productId}`);
      if (response.status === 200) {
        setProducts((prev) => prev.filter((prod) => prod.product_id !== productId));
        setFilteredProducts((prev) => prev.filter((prod) => prod.product_id !== productId));
      }
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  }
  // const checkRole = async () => {
  //   if (!organization || !user) return;
  //   try {
  //     const memberships = await organization.getMemberships()
  //     const membership = memberships.data.find(
  //       (m) => m.publicUserData?.userId === user.id
  //     );
  //     if (membership && (membership.role === 'org:admin' || membership.role === 'admin')) {
  //       setIsAdmin(true);
  //     } else {
  //       setIsAdmin(false);
  //     }
  //     console.log('User role:', membership?.role);


  //   } catch (err) {
  //     console.error('Error checking user role:', err);
  //   }
  // }

  // useEffect(() => {
  //   checkRole();
  // }, [organization, user, selectedConversationId]);
  useEffect(() => {
    if (!selectedConversationId) {
      setLoading(false);
      return;
    }

    fetchProducts(selectedConversationId);

    const connectWebSocket = () => {
      try {
        const wsConnection = new WebSocket(`${WS_URL}/client-${Date.now()}`);

        wsConnection.onopen = () => {
          setRetries(0);
        };

        wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'products_updated' && data.conversation_id === selectedConversationId) {
              fetchProducts(selectedConversationId);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        wsConnection.onerror = (e) => {
          console.error('WebSocket error:', e);
          setError('WebSocket connection failed');
          if (retries < maxRetries) {
            setRetries(prev => prev + 1);
            setTimeout(connectWebSocket, retryDelay);
          }
        };

        wsConnection.onclose = () => {
          if (retries < maxRetries) {
            setRetries(prev => prev + 1);
            setTimeout(connectWebSocket, retryDelay);
          }
        };

        setWs(wsConnection);
      } catch (e) {
        console.error('WebSocket connection error:', e);
        setError('WebSocket connection failed');
      }
    };

    if (typeof window !== 'undefined') {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedConversationId]);

  // If we need to refresh products after the modal closes (e.g., after adding/editing),
  // use a ref to track previous isModalOpen value and only fetch when it transitions from true to false.
  const prevModalOpenRef = useRef(isModalOpen);
  useEffect(() => {
    if (
      prevModalOpenRef.current === true &&
      isModalOpen === false &&
      selectedConversationId
    ) {
      fetchProducts(selectedConversationId);
    }
    prevModalOpenRef.current = isModalOpen;
  }, [isModalOpen, selectedConversationId]);

  useEffect(() => {
    if (!searchProduct.trim()) {
      setFilteredProducts(products);
      return;
    }

    // Try to find by _id first
    const byId = products.find(
      (product) => product._id === searchProduct.trim()
    );

    if (byId) {
      setFilteredProducts([byId]);
      return;
    }

    // Otherwise, filter by name and category
    const filtered = products.filter((product) => {
      const matchesSearch = product.product_name
        .toLowerCase()
        .includes(searchProduct.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchProduct, selectedCategory, products]);

  const handleOptionSelect = (platform: PlatformType) => {
    setSelectedPlatform(platform);
    setShowForm(true);
    setShowOptions(false);
  };

  const handleAddProductClick = () => {
    setIsModalOpen(!isModalOpen);
    setShowOptions(false);
  }

  // Update delete logic to use _id and refetch products
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const response = await api.delete(`/api/products/${productToDelete._id}`);
      if (response.status === 200) {
        toast.success('Product deleted successfully');
        // Refetch products after deletion
        await fetchProducts(selectedConversationId!);
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };


  const getDropdownDirection = (index: number) => {
    // If product is in the last 3 items, open upwards
    return index >= filteredProducts.length - 1 ? "up" : "down";
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="p-3 mb-2 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search products..."
              className="pl-9 pr-3 py-1.5 text-sm border-gray-300 focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {isAdmin && (
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add new product</TooltipContent>
              </Tooltip>
            </div>
          )}

        </div>
        <div className="p-4 my-4 text-red-500 bg-white rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search products..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />

        </div>
        {/* Only show Add Product button for admin */}
        {isAdmin && (
          <div className="relative" ref={dropdownRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add new product</TooltipContent>
            </Tooltip>
            {showOptions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleOptionSelect("pinecone")}
                    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-transparent hover:border-gray-300 hover:bg-gray-50 text-left transition-all"
                  >
                    Add to Pinecone
                  </button>
                  <button
                    onClick={() => handleOptionSelect("shopify")}
                    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-transparent hover:border-gray-300 hover:bg-gray-50 text-left transition-all"
                  >
                    Add to Shopify
                  </button>
                  <button
                    onClick={() => handleOptionSelect("other")}
                    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-transparent hover:border-gray-300 hover:bg-gray-50 text-left transition-all"
                  >
                    Add to Wordpress
                  </button>
                  <button
                    onClick={() => handleAddProductClick()}
                    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-transparent hover:border-gray-300 hover:bg-gray-50 text-left transition-all" >
                    Add Product Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 h-[400px] overflow-y-auto hide-scrollbar">
        {filteredProducts.map((product, idx) => (
          <div
            key={product._id}
            className="group flex items-center gap-4 p-3 bg-white rounded-lg border hover:border-blue-200"
            onClick={() => onProductSelect(product)}
          >
            <div className="w-20 bg-gray-50 rounded-md overflow-hidden">
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-[80px] h-[50px] object-contain transition-opacity group-hover:opacity-90"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {product.product_name}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  ₹{product.price}
                </p>
              </div>
            </div>

            <div className="relative ml-auto">

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuProductId(
                    openMenuProductId === product._id ? null : product._id
                  );
                }}
              >

                <MoreVertical className="h-4 w-4" />
              </Button>

              {openMenuProductId === product._id && (
                <div
                  className={`absolute right-0 z-50 w-36 bg-white border border-gray-200 rounded-lg shadow-lg
              ${getDropdownDirection(idx) === "up" ? "bottom-10" : "top-10"}
            `}
                >
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductSelect(product);
                      setOpenMenuProductId(null);
                    }}
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareProduct(product);
                      setOpenMenuProductId(null);
                    }}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  {isAdmin && (
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToDelete(product);
                        setDeleteDialogOpen(true);
                        setOpenMenuProductId(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}

                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          No products found matching your criteria
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onOpenChange={async (open) => {
          setIsModalOpen(open);
          if (!open && selectedConversationId) {
            await fetchProducts(selectedConversationId);
          }
        }}
      >
        <DialogContent
          className="w-[95%] max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] rounded-xl max-h-[92vh] overflow-y-auto p-4 sm:p-5 hide-scrollbar">
          {/* Header */}
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Add a single product manually or upload multiple items using a CSV file.
            </DialogDescription>
          </DialogHeader>

          {/* Main Section */}
          <div className="mt-4">

            {/* Segmented Control */}
            <div
              className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 text-sm"
            >
              <button
                onClick={() => setSelectedMode("single")}
                className={`py-2 rounded-md font-medium transition ${selectedMode === "single"
                  ? "bg-white text-gray-700 border border-gray-500 shadow-sm"
                  : "text-gray-700"
                  }`}
              >
                Single Product
              </button>

              <button
                onClick={() => setSelectedMode("bulk")}
                className={`py-2 rounded-md font-medium transition ${selectedMode === "bulk"
                  ? "bg-white text-gray-700 border border-gray-500 shadow-sm"
                  : "text-gray-700"
                  }`}
              >
                Bulk Upload
              </button>
            </div>

            {/* Form */}
            <div
              className="mt-4 border border-gray-200 bg-white rounded-xl shadow-sm p-4"
            >
              {selectedMode === "single" && (
                <SingleProductForm setIsModalOpen={setIsModalOpen} />
              )}

              {selectedMode === "bulk" && (
                <BulkUploadForm setIsModalOpen={setIsModalOpen} />
              )}
            </div>
          </div>

        </DialogContent>
      </Dialog>




      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowForm(false);
            setSelectedPlatform(undefined);
          }}
        >
          <AddProduct
            closeForm={() => {
              setShowForm(false);
              setSelectedPlatform(undefined);
            }}
            setIsModalOpen={setIsModalOpen}
            platform={selectedPlatform}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[50vw] bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <DialogTitle>Delete Product</DialogTitle>
          <div className="py-2">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{productToDelete?.product_name}</span>?
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteProduct}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTab;
