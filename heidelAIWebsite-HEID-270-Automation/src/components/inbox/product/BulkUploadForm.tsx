"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import { Download, Upload, FileCheck, File } from "lucide-react";

interface BulkUploadFormProps {
  setIsModalOpen: (open: boolean) => void;
}

const BulkUploadForm = ({ setIsModalOpen }: BulkUploadFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const api = useApi()

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const res = await api.post("/api/products/bulk-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setLoading(false);

    if (res.status !== 200) {
      toast.error("Bulk upload failed!");
      return;
    }

    toast.success("Bulk upload successful!");
    setIsModalOpen(false);
  };

  return (
    <form
      onSubmit={handleBulkUpload}
      className="w-full max-w-full mx-auto space-y-4"
    >
      {/* Template Download Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
              <File className="w-4 h-4 text-blue-700" />
              Sample Template
            </h3>
            <p className="text-sm text-gray-600">
              Download and fill product details following the format.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => window.open("add_product_template.xlsx", "_blank")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-900">
          Upload File
        </Label>

        <input
          type="file"
          id="file-upload"
          name="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setSelectedFileName(file ? file.name : null);
          }}
        />

        <label
          htmlFor="file-upload"
          className={`
            flex flex-col items-center justify-center 
            w-full 
            p-6 sm:p-8
            border-2 border-dashed 
            rounded-xl 
            cursor-pointer 
            text-center 
            transition-all

            ${selectedFileName
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }
          `}
        >
          {!selectedFileName ? (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="font-medium text-gray-900 text-sm">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-600">
                CSV or XLSX (Max 10MB)
              </p>
            </>
          ) : (
            <>
              <FileCheck className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium text-gray-900 text-sm">
                {selectedFileName}
              </p>
              <p className="text-xs text-green-600">
                File selected
              </p>
            </>
          )}
        </label>
      </div>

      {/* Submit Buttons */}
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
          disabled={!selectedFileName || loading}
          className="flex-1 h-10 text-sm font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {loading ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </form>
  );
};

export default BulkUploadForm;
