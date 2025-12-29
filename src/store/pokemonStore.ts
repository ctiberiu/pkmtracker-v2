import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface CaughtPokemon {
  id: string;
  pokedex_id: string;
  pokemon_id: number;
  tcg_card_id?: string;
  tcg_card_name?: string;
  created_at: string;
}

interface PokemonStore {
  caughtPokemon: Map<number, CaughtPokemon>;
  loading: boolean;
  error: string | null;

  fetchCaughtPokemon: (pokedexId: string) => Promise<void>;
  toggleCaughtPokemon: (pokedexId: string, pokemonId: number) => Promise<void>;
  setCaughtPokemon: (pokedexId: string, pokemonId: number, caught: boolean) => Promise<void>;
  setTcgCard: (pokemonId: number, tcgCardId: string, tcgCardName: string) => Promise<void>;
  removeTcgCard: (pokemonId: number) => Promise<void>;
  isCaught: (pokemonId: number) => boolean;
}

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  caughtPokemon: new Map(),
  loading: false,
  error: null,

  fetchCaughtPokemon: async (pokedexId: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('caught_pokemon')
        .select('*')
        .eq('pokedex_id', pokedexId);

      if (error) throw error;

      const caughtMap = new Map<number, CaughtPokemon>();
      (data || []).forEach((pokemon) => {
        caughtMap.set(pokemon.pokemon_id, pokemon);
      });

      set({ caughtPokemon: caughtMap, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch caught pokemon',
        loading: false,
      });
    }
  },

  toggleCaughtPokemon: async (pokedexId: string, pokemonId: number) => {
    const { caughtPokemon } = get();
    const isCaught = caughtPokemon.has(pokemonId);

    if (isCaught) {
      await get().setCaughtPokemon(pokedexId, pokemonId, false);
    } else {
      await get().setCaughtPokemon(pokedexId, pokemonId, true);
    }
  },

  setCaughtPokemon: async (pokedexId: string, pokemonId: number, caught: boolean) => {
    try {
      set({ error: null });
      const { caughtPokemon } = get();

      if (caught) {
        const { data, error } = await supabase
          .from('caught_pokemon')
          .insert({
            pokedex_id: pokedexId,
            pokemon_id: pokemonId,
          })
          .select()
          .single();

        if (error) throw error;

        const newMap = new Map(caughtPokemon);
        newMap.set(pokemonId, data as CaughtPokemon);
        set({ caughtPokemon: newMap });
      } else {
        const { error } = await supabase
          .from('caught_pokemon')
          .delete()
          .eq('pokedex_id', pokedexId)
          .eq('pokemon_id', pokemonId);

        if (error) throw error;

        const newMap = new Map(caughtPokemon);
        newMap.delete(pokemonId);
        set({ caughtPokemon: newMap });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update caught pokemon',
      });
    }
  },

  setTcgCard: async (pokemonId: number, tcgCardId: string, tcgCardName: string) => {
    try {
      set({ error: null });
      const { caughtPokemon } = get();
      const pokemon = caughtPokemon.get(pokemonId);

      if (!pokemon) {
        throw new Error('Pokemon not found in caught list');
      }

      const { error } = await supabase
        .from('caught_pokemon')
        .update({
          tcg_card_id: tcgCardId,
          tcg_card_name: tcgCardName,
        })
        .eq('id', pokemon.id);

      if (error) throw error;

      const newMap = new Map(caughtPokemon);
      newMap.set(pokemonId, {
        ...pokemon,
        tcg_card_id: tcgCardId,
        tcg_card_name: tcgCardName,
      });
      set({ caughtPokemon: newMap });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to set TCG card',
      });
    }
  },

  removeTcgCard: async (pokemonId: number) => {
    try {
      set({ error: null });
      const { caughtPokemon } = get();
      const pokemon = caughtPokemon.get(pokemonId);

      if (!pokemon) {
        throw new Error('Pokemon not found in caught list');
      }

      const { error } = await supabase
        .from('caught_pokemon')
        .update({
          tcg_card_id: null,
          tcg_card_name: null,
        })
        .eq('id', pokemon.id);

      if (error) throw error;

      const newMap = new Map(caughtPokemon);
      newMap.set(pokemonId, {
        ...pokemon,
        tcg_card_id: undefined,
        tcg_card_name: undefined,
      });
      set({ caughtPokemon: newMap });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove TCG card',
      });
    }
  },

  isCaught: (pokemonId: number) => {
    return get().caughtPokemon.has(pokemonId);
  },
}));
