export interface ApiContact {
  platform: string;
  full_name: string | null;
  country?: string | null;
  profile_url?: string | null;
  conversation_id: string;
  email?: string | null;
  categories: string[];
  created_at?: {
    $date: string;
  };
  updated_at?: {
    $date: string;
  };
  phone_number?: string;
  instagram_id?: string;
  username?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  tags: string[];
  platform?: string;
  profile_url?: string | null;
  username?: string;
  instagram_id?: string;
  full_name?: string;
  conversation_id?: string;
  categories?: string[];
  city?: string;
  bio?: string;
}

// export interface Tag {
//   id: string;
//   name: string;
//   tag_description: string;
//   created_at?: string;
// }
