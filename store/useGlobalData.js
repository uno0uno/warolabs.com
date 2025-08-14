// store/useGlobalData.js
import { defineStore } from 'pinia';

export const useGlobalData = defineStore('globalData', {
  state: () => ({
    globalLoading: false,
  }),
  actions: {
    setGlobalLoading(status) {
      this.globalLoading = status;
    }
  },
});