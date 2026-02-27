export type Role = 'user' | 'agent' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
}