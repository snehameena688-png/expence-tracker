import { supabase } from './supabase_client';
import type { Expansion, ExpansionFormData, ExpansionStatus } from '../models/expansion';

export const expansionService = {
  async getExpansions(userId: string): Promise<Expansion[]> {
    const { data, error } = await supabase
      .from('expansions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getExpansion(id: string): Promise<Expansion | null> {
    const { data, error } = await supabase
      .from('expansions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createExpansion(userId: string, formData: ExpansionFormData): Promise<Expansion> {
    const { data, error } = await supabase
      .from('expansions')
      .insert({
        user_id: userId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        budget: Number(formData.budget),
        status: formData.status || 'active',
        progress: Math.min(100, Math.max(0, Number(formData.progress) || 0)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateExpansion(id: string, formData: Partial<ExpansionFormData>): Promise<Expansion> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.name !== undefined) updatePayload.name = formData.name.trim();
    if (formData.category !== undefined) updatePayload.category = formData.category.trim();
    if (formData.budget !== undefined) updatePayload.budget = Number(formData.budget);
    if (formData.status !== undefined) updatePayload.status = formData.status;
    if (formData.progress !== undefined) {
      updatePayload.progress = Math.min(100, Math.max(0, Number(formData.progress)));
    }

    const { data, error } = await supabase
      .from('expansions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(id: string, progress: number, status?: ExpansionStatus): Promise<Expansion> {
    const updatePayload: Record<string, any> = {
      progress: Math.min(100, Math.max(0, progress)),
      updated_at: new Date().toISOString(),
    };
    if (status) {
      updatePayload.status = status;
    }

    const { data, error } = await supabase
      .from('expansions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpansion(id: string): Promise<void> {
    await supabase.from('expenses').delete().eq('expansion_id', id);

    const { error } = await supabase
      .from('expansions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
