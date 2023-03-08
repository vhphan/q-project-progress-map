import {defineStore} from 'pinia';

export const useMainStore = defineStore('main', {
    // other options...
    state: () => {
        return {
            isDark: false, loading: false,
        };
    }, persist: true,
});