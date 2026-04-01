import { useSQLiteContext } from 'expo-sqlite';

export function useProductServices() {
  const database = useSQLiteContext();

  async function getBestSellers() {
    try {
      // Busca produtos com a tag 'ESGOTADO' ou 'NOVIDADE' 
      const all = await database.getAllAsync('SELECT * FROM products WHERE tag IS NOT NULL');
      return all;
    } catch (error) {
      throw error;
    }
  }

  return { getBestSellers };
}