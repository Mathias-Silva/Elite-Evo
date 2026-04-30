
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
  },
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (!existingItem) {
        state.items.push({ ...newItem, quantity: 1 });
      } else {
        existingItem.quantity++;
      }
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    updateQuantity: (state, action) => {
      const { id, amount } = action.payload; // amount pode ser 1 ou -1
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, item.quantity + amount);
      }
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
  }
});

export const { addItem, removeItem, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;