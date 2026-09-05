import { supabase } from './supabase_client';
import type { Expense, ExpenseFormData } from '../models/expense';

export const expenseService = {
  async getExpenses(expansionId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('expansion_id', expansionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addExpense(expansionId: string, formData: ExpenseFormData): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        expansion_id: expansionId,
        amount: Number(formData.amount),
        note: formData.note ? formData.note.trim() : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  calculateTotals(budget: number, expenses: Expense[]): { totalSpent: number; remainingBudget: number } {
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const remainingBudget = Number(budget) - totalSpent;
    return {
      totalSpent,
      remainingBudget,
    };
  },
};
