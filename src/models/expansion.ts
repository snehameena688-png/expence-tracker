export type ExpansionStatus = 'active' | 'completed' | 'paused';

export interface Expansion {
  id: string;
  user_id: string;
  name: string;
  category: string;
  budget: number;
  status: ExpansionStatus;
  progress: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExpansionFormData {
  name: string;
  category: string;
  budget: number;
  status: ExpansionStatus;
  progress: number;
}
