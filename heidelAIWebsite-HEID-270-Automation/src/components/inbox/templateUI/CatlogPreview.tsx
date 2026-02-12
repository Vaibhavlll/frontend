import React from 'react';


interface CatalogTemplatePreviewProps {
  templateName: string;
  messageBody: string;
  catalogFormat: "catalog" | "multi-product";
  footer?: string;
  getFormatedText: (text: string, type: "header" | "body") => React.ReactNode;
  isUnified?: boolean;
}

const CatalogPreview: React.FC<CatalogTemplatePreviewProps> = ({
  templateName,
  messageBody,
  catalogFormat,
  footer,
  getFormatedText,
  isUnified
}) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const content = (
    <div className={`${isUnified ? '' : 'mt-14'} space-y-4`}>
      {/* Message Bubble */}
      <div className="bg-white rounded-lg p-4 max-w-[100%] shadow-sm relative">
        <div className="flex items-start space-x-3">
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[#00A884] text-[15px] leading-snug">
              View {templateName || '[BIZ_NAME]'}&apos;s Catalog on WhatsApp
            </h4>
            <p className="text-[13px] text-gray-600 mt-0.5">
              Browse pictures and details of their offerings.
            </p>
          </div>
        </div>

        <div
          className="mb-2"
          dangerouslySetInnerHTML={{
            __html: getFormatedText(messageBody, "body") as string
          }}
        />

        {footer && (
          <div className="mt-4 pt-4 text-[12px] text-gray-500">
            {footer}
          </div>
        )}

        <div className="flex items-center justify-center mt-4 border-t pt-3">
          <button className="text-[#00A884] font-medium text-[14px]">
            View catalog
          </button>
        </div>

        <div className="mt-1.5 flex justify-end">
          <span className="text-[11px] text-gray-500">{currentTime}</span>
        </div>

        {/* Message Tail */}
        <div className="absolute top-0 -left-2 w-4 h-4 overflow-hidden">
          <div className="absolute w-2 h-2 bg-white rotate-45 transform origin-center translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (isUnified) {
    return content;
  }

  return (
    <div className="bg-[#EFE7DE] p-6 rounded-lg h-full relative shadow-lg overflow-y-auto">
      <div className="bg-white  py-3 rounded-t-lg absolute top-0 left-0 right-0 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
      </div>
      {content}
    </div>
  );
};

export default CatalogPreview;