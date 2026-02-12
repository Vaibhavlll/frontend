/* eslint-disable @typescript-eslint/no-explicit-any */
//template_types.ts
export type Button = {
  id: string;
  type: 'reply' | 'url' | 'phone' | 'copy';
  text: string;
  content: string;  // Make sure to include this required property
  value: string;
};

export type Variable ={
  id: string;
  name: string;
  type: "text" | "number" | "date" | "currency" | "datetime";
  example: string;
  section: "header" | "body";
}

export type Header ={
  type: "none" | "text";
  content: string;
}

export type Footer ={
  type: "none" | "text";
  content: string;
}

export type Component = {
  type: Body | Footer | Button;
  format?: string;
  text?: string;
  example?: Record<string, any>;
  buttons?: { type: string; text: string }[];
}

export type AppSetup ={
  packageName: string;
  signatureHash: string;
}

export type CatalogTemplatePreviewProps ={
  templateName: string;
  messageBody: string;
  catalogFormat: "catalog" | "multi-product";
}
