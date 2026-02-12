/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  MessageSquare,
  Trash2,
  Loader2,
  Edit2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/lib/session_api";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface CannedResponse {
  id: string;
  org_id: string;
  shortcut: string;
  response: string;
  updated_at: string;
}

interface ApiResponse<T> {
  canned_responses?: T[];
  message?: string;
  error?: string;
}

interface CannedResponsesProps {
  onInsertResponse?: (message: string) => void;
}

interface DeleteConfirmation {
  isOpen: boolean;
  id: string | null;
  shortcut: string | null;
}

type ApiErrorResponse = { message?: string; error?: string };
type UnknownError = AxiosError<ApiErrorResponse> | Error | unknown;

const getErrorMessage = (error: UnknownError, fallback: string): string => {
  const axiosErr = error as AxiosError<ApiErrorResponse>;

  return (
    axiosErr.response?.data?.message ||
    axiosErr.response?.data?.error ||
    (axiosErr as any)?.message ||
    fallback
  );
};

const SHORTCUT_MAX_LENGTH = 50;
const RESPONSE_MAX_LENGTH = 2000;
const SHORTCUT_PREFIX = "/";

const CannedResponses: React.FC<CannedResponsesProps> = ({
  onInsertResponse,
}) => {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(
    null
  );
  const [formData, setFormData] = useState({ shortcut: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      id: null,
      shortcut: null,
    });
  const api = useApi();

  const fetchCannedResponses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/canned_responses");

      if (response.data?.canned_responses) {
        setResponses(response.data.canned_responses);
      } else {
        setResponses([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch canned responses";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCannedResponse = async (
    shortcut: string,
    message: string
  ): Promise<void> => {
    const payload = { shortcut, response: message };

    const response = await api.post("/api/canned_responses", payload);

    if (response.data?.canned_responses) {
      setResponses(response.data.canned_responses);
      toast.success("Canned response created successfully!");
    } else {
      throw new Error("Invalid response format from server");
    }
  };

  const updateCannedResponse = async (
    id: string,
    shortcut: string,
    message: string
  ): Promise<void> => {
    if (!id) {
      throw new Error("Cannot update: Response ID is missing");
    }

    const payload = { shortcut, response: message };

    const response = await api.put(`/api/canned_responses/${id}`, payload);

    if (response.data && response.data.id) {
      setResponses((prevResponses) =>
        prevResponses.map((r) => (r.id === id ? response.data : r))
      );
      toast.success("Canned response updated successfully!");
    } else {
      throw new Error("Invalid response format from server");
    }
  };

  const deleteCannedResponse = async (id: string): Promise<void> => {
    if (!id) {
      throw new Error("Cannot delete: Response ID is missing");
    }

    console.log("Deleting canned response ID:", id);

    await api.delete(`/api/canned_responses/${id}`);
    setResponses((prev) => prev.filter((r) => r.id !== id));
    toast.success("Canned response deleted successfully!");
  };

  const handleSubmit = async () => {
    const { shortcut, message } = formData;

    if (!shortcut.trim() || !message.trim()) {
      setError("Both shortcut and message are required");
      return;
    }

    const formattedShortcut = shortcut.startsWith(SHORTCUT_PREFIX)
      ? shortcut.trim()
      : `${SHORTCUT_PREFIX}${shortcut.trim()}`;

    if (!editingResponse) {
      const duplicate = responses.find((r) => r.shortcut === formattedShortcut);
      if (duplicate) {
        setError(`Shortcut "${formattedShortcut}" already exists`);
        return;
      }
    } else if (editingResponse.shortcut !== formattedShortcut) {
      const duplicate = responses.find(
        (r) => r.shortcut === formattedShortcut && r.id !== editingResponse.id
      );
      if (duplicate) {
        setError(`Shortcut "${formattedShortcut}" already exists`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingResponse && editingResponse.id) {
        await updateCannedResponse(
          editingResponse.id,
          formattedShortcut,
          message.trim()
        );
      } else {
        await createCannedResponse(formattedShortcut, message.trim());
      }

      resetForm();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        `Failed to ${editingResponse ? "update" : "create"} canned response`
      );

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string, shortcut: string) => {
    setDeleteConfirmation({
      isOpen: true,
      id,
      shortcut,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.id) return;

    const id = deleteConfirmation.id;
    setDeletingId(id);
    setDeleteConfirmation({ isOpen: false, id: null, shortcut: null });
    setError(null);

    try {
      await deleteCannedResponse(id);
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Failed to delete canned response"
      );

      setError(errorMessage);
      toast.error(errorMessage);

      try {
        await fetchCannedResponses();
      } catch (refreshErr) {
        const refreshMessage = getErrorMessage(
          refreshErr,
          "Failed to refresh responses after delete error"
        );
        console.error(refreshMessage);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, id: null, shortcut: null });
  };

  const startEditing = (response: CannedResponse) => {
    setEditingResponse(response);
    setFormData({
      shortcut: response.shortcut,
      message: response.response,
    });
    setIsModalOpen(true);
    setError(null);
  };

  const resetForm = () => {
    setFormData({ shortcut: "", message: "" });
    setEditingResponse(null);
    setIsModalOpen(false);
    setError(null);
  };

  useEffect(() => {
    fetchCannedResponses();
  }, [fetchCannedResponses]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading canned responses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-white p-4 rounded-t-lg border-b mb-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200 flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Canned Responses
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {responses.length}{" "}
                {responses.length === 1 ? "response" : "responses"}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span className="font-medium">Add Response</span>
            </button>
          </div>

          <p className="text-gray-600 text-sm">
            Pre-written reply templates. Type shortcuts starting with &apos;
            {SHORTCUT_PREFIX}&apos; to insert.
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
          {responses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg bg-white">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium text-lg mb-2">
                No canned responses yet
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Create your first template to get started
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Create First Response
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => {
                const isDeleting = deletingId === response.id;
                const titleId = `canned-response-title-${response.id}`;

                return (
                  <article
                    key={response.id}
                    role="article"
                    aria-labelledby={titleId}
                    className={`bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all ${isDeleting ? "opacity-50 pointer-events-none" : ""
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3
                            id={titleId}
                            className="inline-flex items-center text-sm text-blue-700 font-mono font-semibold bg-blue-50 px-3 py-1 rounded-md border border-blue-200"
                          >
                            {response.shortcut}
                          </h3>
                          <time
                            className="text-xs text-gray-400"
                            dateTime={response.updated_at}
                          >
                            {new Date(response.updated_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </time>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {response.response}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEditing(response)}
                          disabled={isDeleting}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(response.id, response.shortcut)
                          }
                          disabled={isDeleting}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) =>
            e.target === e.currentTarget && !isSaving && resetForm()
          }
          onKeyDown={(e) => {
            if (e.key === "Escape" && !isSaving) {
              e.stopPropagation();
              resetForm();
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingResponse
                  ? "Edit Canned Response"
                  : "New Canned Response"}
              </h3>
              <button
                onClick={resetForm}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="shortcut"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Shortcut <span className="text-red-500">*</span>
                </label>
                <input
                  id="shortcut"
                  type="text"
                  value={formData.shortcut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortcut: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/greeting"
                  disabled={isSaving}
                  maxLength={SHORTCUT_MAX_LENGTH}
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Must start with {SHORTCUT_PREFIX}
                </p>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Response Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter your template message..."
                  disabled={isSaving}
                  maxLength={RESPONSE_MAX_LENGTH}
                  required
                />
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-gray-500">Message to insert</p>
                  <span className="text-xs text-gray-400">
                    {formData.message.length}/{RESPONSE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
                  disabled={
                    isSaving ||
                    !formData.shortcut.trim() ||
                    !formData.message.trim()
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {editingResponse ? "Updating..." : "Creating..."}
                      </span>
                    </>
                  ) : (
                    <span>{editingResponse ? "Update" : "Create"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && handleDeleteCancel()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              handleDeleteCancel();
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Canned Response?
            </h3>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete the shortcut
              </p>
              <div className="inline-flex items-center bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <code className="text-red-700 font-mono font-semibold">
                  {deleteConfirmation.shortcut}
                </code>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CannedResponses;
