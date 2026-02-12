/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  LightbulbIcon,
  AlertCircle,
  Trash2,
  Smile,
  Plus,
  Code,
  Strikethrough,
  Italic,
  Bold,
  X,
  Search,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"


import { insertFormatting, insertEmoji } from "./textFormatting";
import { Input } from "@/components/ui/input";

type Variable = {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "currency" | "datetime";
  example: string;
  section: "header" | "body";
};

type Button = {
  id: string;
  type: "reply" | "url" | "phone" | "copy";
  text: string;
  content: string;
  value: string;
};

interface CatalogProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  messageBody: string;
  setMessageBody: (body: string) => void;
  button: Button[];
  headerType: "text" | "image" | "video" | "document" | "location" | "none";
  headerContent: string | null;
  languages: string[];
  previewFile: string | null;
  setPreviewFile: (file: string | null) => void;
  header: string;
  headerVariables: Variable[];
  bodyVariables: Variable[];
  footer: string;
  insertVariable: (variable: Variable) => void;
  removeVariable: (id: string) => void;
  setFooter: (footer: string) => void;
  setShowVariableModal: (show: boolean) => void;
  newVariable: Variable;
  setNewVariable: (variable: Variable) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  templateName,
  setTemplateName,
  language,
  setLanguage,
  messageBody,
  setMessageBody,
  languages,
  footer,
  setFooter,
  bodyVariables,
  insertVariable,
  removeVariable,
  setShowVariableModal,
  newVariable,
  setNewVariable,
}) => {
  const [catalogFormat, setCatalogFormat] = useState<
    "catalog" | "multi-product"
  >("catalog");
  const buttonText = "View catalog";
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const handleEmojiSelect = (emoji: any) => {
    // Append selected emoji to message body at cursor position
    insertEmoji(textareaRef, emoji, messageBody, setMessageBody);
    setEmojiPickerVisible(false); // Optionally hide picker after selection
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <div className="grid gap-5">
      <div className="space-y-6 px-2">
        {/* Template Name and Language Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a template name"
              className="w-full p-2 border rounded-md"
              maxLength={512}
            />
            <div className="text-xs text-gray-500 mt-1">
              {templateName.length} / 512
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Format Section */}
        <div className="bg-gray-600">
          <div className="bg-white p-1 rounded-lg shadow-sm">
            <h2 className="text-md font-semibold  text-gray-900 mb-3">
              Catalog format
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose the message format that best fits your needs.
            </p>

            <div
              className="space-y-4"
              role="radiogroup"
              aria-labelledby="catalog-format"
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={catalogFormat === "catalog"}
                  onChange={() => setCatalogFormat("catalog")}
                  className="mt-1"
                  name="catalogFormat"
                  aria-label="Catalog message"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Catalog message
                  </span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Include the entire catalog to give your users a
                    comprehensive view of all your products.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={catalogFormat === "multi-product"}
                  onChange={() => setCatalogFormat("multi-product")}
                  className="mt-1"
                  name="catalogFormat"
                  aria-label="Multi-product message"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Multi-product message
                  </span>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Include up to 30 products from the catalog.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Catalog Setup Section */}
        <div className="bg-white p-1 rounded-lg shadow-sm">
          <h2 className="text-md font-semibold text-gray-900 mb-3">
            Catalog setup
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Connecting a catalog will allow customers to view, message and send
            carts containing your products and services via WhatsApp.{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Learn More
            </a>
          </p>

          <div className="bg-gray-200 p-4 rounded-md flex items-start space-x-3 mb-4">
            <AlertCircle
              className="h-5 w-5 text-gray-500 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-600">
              Please note that you cannot add media to this template. Instead,
              you can link your catalog to showcase your products.
            </p>
          </div>

          <button
            onClick={() => setShowCatalog(true)}
            className="bg-[#00A884] text-white px-4 py-2 rounded-md hover:bg-[#008f70] transition-colors"
          >
            Connect Catalog
          </button>
        </div>

        <div className="relative bg-gray-50 rounded-sm p-1">
          {showCatalog && (
            <div className="inset-0 p-1">
              <div className="bg-white rounded-lg w-full max-w-2xl h-[10vh] overflow-y-auto">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">

                      <span className="font-semibold">Connect Catalog</span>
                    </div>
                    <button
                      onClick={() => setShowCatalog(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-2 text-gray-600 text-sm">
                <p>Connecting a Catalog will allow customers to view, message and send carts containing your products and services via WhatsApp.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Search Catalog by Name or ID"
                  className="flex-1"
                />
              </div>
            </div>

          )}
        </div>

        <div className="border  p-2 rounded-lg bg-gray-50 ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Message Body Section</h3>
            <button
              onClick={() => {
                setNewVariable({ ...newVariable, section: "body" });
                setShowVariableModal(true);
              }}
              disabled={bodyVariables.length >= 5}
              className="text-blue-500 hover:text-blue-600 disabled:text-gray-400 text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Body Variable
            </button>
          </div>

          {/* Variables List */}
          <div className="space-y-2 mb-4 ">
            {bodyVariables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-2 border rounded-md bg-white"
              >
                <div>
                  <span className="text-sm font-medium">{variable.name}</span>
                  <p className="text-sm text-gray-600">Type: {variable.type}</p>
                  <p className="text-sm text-gray-600">
                    Example: {variable.example}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => insertVariable(variable)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Insert
                  </button>
                  <button
                    onClick={() => removeVariable(variable.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Message Body Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Body
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Enter your message"
                className="w-full p-2 border rounded-md h-32 bg-white"
                maxLength={1024}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                {/* Emoji Picker Toggle */}
                <div className="relative">
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setEmojiPickerVisible((prev) => !prev)}
                    aria-label="Toggle emoji picker"
                  >
                    <Smile size={16} />
                  </button>
                  {emojiPickerVisible && (
                    <div className="absolute mt-2 z-50 bg-white border rounded shadow-lg">
                      <EmojiPicker
                        onEmojiClick={(emoji: EmojiClickData) => {
                          handleEmojiSelect(emoji.emoji)
                        }}
                      />

                    </div>
                  )}
                </div>

                {/* Formatting Buttons */}

                <button
                  onClick={() =>
                    insertFormatting("bold", textareaRef, messageBody, setMessageBody)
                  }
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() =>
                    insertFormatting("italic", textareaRef, messageBody, setMessageBody)
                  }
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() =>
                    insertFormatting(
                      "strikethrough",
                      textareaRef,
                      messageBody,
                      setMessageBody
                    )
                  }
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
                <button
                  onClick={() =>
                    insertFormatting("monospace", textareaRef, messageBody, setMessageBody)
                  }
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Monospace"
                >
                  <Code size={16} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {messageBody.length} / 1024
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="border p-2 rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Footer (Optional)
        </label>
        <textarea
          placeholder="Enter footer text"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          maxLength={60}
          className="w-full p-2  rounded-md"
        />
        <div className="text-sm text-gray-500 mt-1">{footer.length}/60</div>
      </div>

      {/* Button Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
        <h2 className="text-md font-semibold text-gray-900 mb-3">Button</h2>

        <div className="bg-blue-50/50 p-3 sm:p-4 rounded-md flex items-start space-x-3 mb-4 border border-blue-100">
          <LightbulbIcon
            className="h-5 w-5 text-blue-500 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-blue-800 leading-relaxed">
            Only one button is supported for this type of template. The button
            text is not editable.
          </p>
        </div>

        <div>
          <label
            htmlFor="buttonText"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Button Text
          </label>
          <div className="relative">
            <input
              id="buttonText"
              type="text"
              value={buttonText}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed pr-16"
              maxLength={25}
              aria-label="Button text (not editable)"
            />
            <span
              className="absolute right-3 top-2.5 text-xs text-gray-500"
              aria-live="polite"
            >
              {buttonText.length}/25
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
