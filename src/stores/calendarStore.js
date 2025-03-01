// calendarStore.js
import { defineStore } from 'pinia';

export const useCalendarStore = defineStore('calendar', {
    state: () => ({
        tasks: [],
        selectedDate: null,
        filters: {
            priority: 'all',
        },
        // Added alert-related state
        alerts: [],
        alertId: 0
    }),

    actions: {
        addTask(newTask) {
            // Using concat instead of spread operator
            this.tasks = this.tasks.concat(newTask);
            this.saveTasksToLocalStorage();
            // Show success alert when adding task
            this.showAlert(`De taak "${newTask.title}" is toegevoegd`, 'success');
            return newTask; // Return de nieuwe taak voor confirmatie
        },

        editTask(updatedTask) {
            const index = this.tasks.findIndex(task => task.id === updatedTask.id);
            if (index !== -1) {
                // Update the array with a new copy for reactivity
                this.tasks = this.tasks.slice(0, index)
                    .concat([updatedTask])
                    .concat(this.tasks.slice(index + 1));
                this.saveTasksToLocalStorage();
                // Show info alert when editing task
                this.showAlert(`De taak "${updatedTask.title}" is bijgewerkt`, 'info');
            }
        },

        deleteTask(taskToDelete) {
            this.tasks = this.tasks.filter(task => task.id !== taskToDelete.id);
            this.saveTasksToLocalStorage();
            // Show danger alert when deleting task
            this.showAlert(`De taak "${taskToDelete.title}" is verwijderd`, 'danger');
        },

        saveTasksToLocalStorage() {
            try {
                localStorage.setItem('calendar-tasks', JSON.stringify(this.tasks));
            } catch (error) {
                console.error('Error saving tasks to localStorage:', error);
            }
        },

        loadTasksFromLocalStorage() {
            try {
                const storedTasks = localStorage.getItem('calendar-tasks');
                if (storedTasks) {
                    this.tasks = JSON.parse(storedTasks);
                }
            } catch (error) {
                console.error('Error loading tasks from localStorage:', error);
                this.tasks = [];
            }
        },

        setSelectedDate(date) {
            this.selectedDate = date;
        },

        setPriorityFilter(priority) {
            this.filters.priority = priority;
        },

        // Added alert system action
        showAlert(message, type = 'success') {
            const id = this.alertId++;
            this.alerts.push({ id, message, type });

            setTimeout(() => {
                this.alerts = this.alerts.filter(alert => alert.id !== id);
            }, 10000);
        }
    },

    getters: {
        getFilteredTasks: (state) => (date) => {
            if (!date) return [];

            return state.tasks.filter(task => {
                const taskDate = new Date(task.date);
                const compareDate = new Date(date);

                return taskDate.toDateString() === compareDate.toDateString() &&
                    (state.filters.priority === 'all' || task.priority === state.filters.priority);
            });
        },
    },
});