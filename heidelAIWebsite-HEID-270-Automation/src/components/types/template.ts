export interface WhatsAppTemplate {
  id?: string;

  type?: 'USER_CREATED' | 'PREBUILT';

  name: string;
  code: string;

  status: 'APPROVED' | 'PENDING' | 'REJECTED';

  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;

  topic?: string;
  usecase?: string;
  industry?: string[];

  template?: 'custom' | 'catalog' | 'one-time_Passcode';

  header?: string | {
    type: 'none' | 'text' | 'media' | 'location';
    content?: string;
  };

  body: string;

  footer?: string;

  buttons?: {
    id: string;
    type: 'REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY' | 'QUICK_REPLY';
    text: string;
    content?: string;
  }[];

  header_params?: string[];
  body_params?: string[];
  body_param_types?: ('TEXT' | 'NUMBER')[];


  cards?: {
    type: string;
    title: string;
    description: string;
  }[];

  example?: {
    header_text?: string[];
    body_text?: string[][];
    header_handle?: string[];
  };

  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type:
  | 'HEADER'
  | 'BODY'
  | 'FOOTER'
  | 'BUTTONS'
  | 'MEDIA'
  | 'LOCATION'
  | 'TEXT'
  | 'CAROUSEL';

  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';

  text?: string;

  buttons?: {
    type: 'PHONE_NUMBER' | 'URL' | 'QUICK_REPLY' | 'COPY' | 'REPLY';
    text: string;
    value?: string;
  }[];

  example?: {
    header_text?: string[];
    body_text?: string[];
    footer_text?: string[];
    header_handle?: string[];
  };

  /** Carousel support */
  cards?: Array<{
    components: WhatsAppTemplateComponent[];
  }>;
}
