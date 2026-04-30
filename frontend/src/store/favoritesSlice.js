import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
  },
  reducers: {
    addFavorite: (state, action) => {
      const product = action.payload;
      const already = state.items.find(item => item.id === product.id);
      if (!already) {
        state.items.push(product);
      }
    },

    removeFavorite: (state, action) => {
      const id = action.payload;
      const targetId = typeof id === 'object' ? id.id : id;
      state.items = state.items.filter(item => item.id !== targetId);
    },

    // ✅ NOVO: atualiza dados do produto nos favoritos sem removê-lo
    updateFavorite: (state, action) => {
      const updatedProduct = action.payload;
      const index = state.items.findIndex(item => item.id === updatedProduct.id);
      if (index !== -1) {
        state.items[index] = { ...updatedProduct };
      }
    },
  },
});

export const { addFavorite, removeFavorite, updateFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;