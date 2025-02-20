import { defineStore } from 'pinia';

export const useCalendarStore = defineStore('calendarStore', {
    state: () => ({
        selectedDate: new Date().toISOString().split('T')[0], // Standaard op de huidige datum
        filters: {
            priority: 'all',
        },
    }),
    actions: {
        setSelectedDate(date) {
            this.selectedDate = date;
        },
        setPriorityFilter(priority) {
            this.filters.priority = priority;
        },
    },
});
