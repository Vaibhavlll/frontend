export interface Company {
    id: string;
    name: string;
    industry?: string;
    domain?: string;
    created_at: string;
    subscription_status: string;
  }
  
  export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    company_id: string;
    role: 'admin' | 'agent';
    created_at: string;
  }
  
  export interface Invite {
    id: string;
    email: string;
    company_id: string;
    token: string;
    created_at: string;
  }
  
  export interface AuthUser {
    id: string;
    email: string;
  }
  
  export interface OnboardingState {
    step: 'company_info' | 'industry' | 'domain' | 'google_integration' | 'product_url' | 'completed';
  }
  