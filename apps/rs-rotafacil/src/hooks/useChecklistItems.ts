import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChecklistItemPersonalizado {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  obrigatorio: boolean;
  tipo: 'boolean' | 'number' | 'text';
  created_at: string;
  updated_at: string;
}

export interface ChecklistItemFormData {
  nome: string;
  descricao?: string;
  obrigatorio: boolean;
  tipo: 'boolean' | 'number' | 'text';
}

export function useChecklistItems() {
  const [items, setItems] = useState<ChecklistItemPersonalizado[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('checklist_items_personalizados')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setItems((data || []) as ChecklistItemPersonalizado[]);
    } catch (error) {
      console.error('Erro ao buscar itens do checklist:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens do checklist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: ChecklistItemFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // Buscar a próxima ordem
      const { data: lastItem } = await supabase
        .from('checklist_items_personalizados')
        .select('ordem')
        .eq('user_id', userId)
        .order('ordem', { ascending: false })
        .limit(1);

      const nextOrder = lastItem && lastItem.length > 0 ? lastItem[0].ordem + 1 : items.length + 1;

      const { data, error } = await supabase
        .from('checklist_items_personalizados')
        .insert([{
          ...itemData,
          user_id: userId,
          ordem: nextOrder,
        }])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data as ChecklistItemPersonalizado]);
      toast({
        title: "Sucesso",
        description: "Item adicionado ao checklist!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<ChecklistItemFormData>) => {
    try {
      const { data, error } = await supabase
        .from('checklist_items_personalizados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } as ChecklistItemPersonalizado : item
      ));

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Marcar como inativo ao invés de deletar
      const { error } = await supabase
        .from('checklist_items_personalizados')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Item removido do checklist!",
      });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderItems = async (reorderedItems: ChecklistItemPersonalizado[]) => {
    try {
      // Atualizar a ordem de todos os itens
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        ordem: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('checklist_items_personalizados')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      setItems(reorderedItems);
      toast({
        title: "Sucesso",
        description: "Ordem dos itens atualizada!",
      });
    } catch (error) {
      console.error('Erro ao reordenar itens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os itens.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getActiveItems = () => {
    return items.filter(item => item.ativo);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    getActiveItems,
    refetch: fetchItems,
  };
}