export interface Expense {
  id: string;
  expansion_id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface ExpenseFormData {
  amount: number;
  note?: string;
}
