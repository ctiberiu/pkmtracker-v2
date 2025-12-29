import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Pokedex {
  id: string;
  name: string;
  created_at: string;
  generations: number[];
  user_id: string;
}

interface PokedexStore {
  pokedexes: Pokedex[];
  currentPokedex: Pokedex | null;
  loading: boolean;
  error: string | null;

  fetchPokedexes: (userId: string) => Promise<void>;
  setCurrentPokedex: (pokedex: Pokedex | null) => void;
  createPokedex: (userId: string, name: string, generations: number[]) => Promise<Pokedex | null>;
  deletePokedex: (pokedexId: string) => Promise<void>;
  updatePokedex: (pokedexId: string, name: string, generations: number[]) => Promise<void>;
}

export const usePokedexStore = create<PokedexStore>((set) => ({
  pokedexes: [],
  currentPokedex: null,
  loading: false,
  error: null,

  fetchPokedexes: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('pokedexes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ pokedexes: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch pokedexes',
        loading: false,
      });
    }
  },

  setCurrentPokedex: (pokedex) => set({ currentPokedex: pokedex }),

  createPokedex: async (userId: string, name: string, generations: number[]) => {
    try {
      set({ error: null });
      const { data, error } = await supabase
        .from('pokedexes')
        .insert({
          user_id: userId,
          name,
          generations,
        })
        .select()
        .single();

      if (error) throw error;

      const newPokedex = data as Pokedex;
      set((state) => ({
        pokedexes: [newPokedex, ...state.pokedexes],
      }));

      return newPokedex;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pokedex';
      set({ error: errorMessage });
      return null;
    }
  },

  deletePokedex: async (pokedexId: string) => {
    try {
      set({ error: null });
      const { error } = await supabase
        .from('pokedexes')
        .delete()
        .eq('id', pokedexId);

      if (error) throw error;

      set((state) => ({
        pokedexes: state.pokedexes.filter((p) => p.id !== pokedexId),
        currentPokedex: state.currentPokedex?.id === pokedexId ? null : state.currentPokedex,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete pokedex',
      });
    }
  },

  updatePokedex: async (pokedexId: string, name: string, generations: number[]) => {
    try {
      set({ error: null });
      const { error } = await supabase
        .from('pokedexes')
        .update({ name, generations })
        .eq('id', pokedexId);

      if (error) throw error;

      set((state) => ({
        pokedexes: state.pokedexes.map((p) =>
          p.id === pokedexId ? { ...p, name, generations } : p
        ),
        currentPokedex:
          state.currentPokedex?.id === pokedexId
            ? { ...state.currentPokedex, name, generations }
            : state.currentPokedex,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update pokedex',
      });
    }
  },
}));
