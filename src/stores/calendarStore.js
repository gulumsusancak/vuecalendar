//calendarStore.js
import { defineStore } from 'pinia';

// calendar is de unieke id voor deze store
export const useCalendarStore = defineStore('calendar', {
    // alle reactive data van de applicatie
    state: () => ({
        tasks: [],
        selectedDate: null,
        filters: {
            priority: 'all',
        },
        alerts: [],
        alertId: 0
    }),

    // methodes om de state te wijzigen
    actions: {
        addTask(newTask) {
            // update van de tasks array
            this.tasks = this.tasks.concat(newTask);
            // sla op in localStorage
            this.saveTasksToLocalStorage();
            // alert
            this.showAlert(`De taak "${newTask.title}" is toegevoegd`, 'success');
            return newTask;
        },

        editTask(updatedTask) {
            const index = this.tasks.findIndex(task => task.id === updatedTask.id);
            if (index !== -1) {
                // update van de tasks array met de bijgewerkte taak
                this.tasks = this.tasks.slice(0, index)
                    .concat([updatedTask])
                    .concat(this.tasks.slice(index + 1));
                // sla op in localStorage
                this.saveTasksToLocalStorage();
                // alert
                this.showAlert(`De taak "${updatedTask.title}" is bijgewerkt`, 'info');
            }
        },

        deleteTask(taskToDelete) {
            // filter de te verwijderen taak uit de array
            this.tasks = this.tasks.filter(task => task.id !== taskToDelete.id);
            // sla op in localStorage
            this.saveTasksToLocalStorage();
            // alert
            this.showAlert(`De taak "${taskToDelete.title}" is verwijderd`, 'danger');
        },

        // persistentie in localStorage
        saveTasksToLocalStorage() {
            try {
                localStorage.setItem('calendar-tasks', JSON.stringify(this.tasks));
            } catch (error) {
                console.error('Error saving tasks to localStorage:', error);
            }
        },

        // data laden uit localStorage
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

        // geselecteerde datum instellen
        setSelectedDate(date) {
            this.selectedDate = date;
        },

        // filter voor prioriteit instellen
        setPriorityFilter(priority) {
            this.filters.priority = priority;
        },

        //alerts tonen voor 10s
        showAlert(message, type = 'success') {
            const id = this.alertId++;
            this.alerts.push({ id, message, type });

            setTimeout(() => {
                this.alerts = this.alerts.filter(alert => alert.id !== id);
            }, 10000);
        }
    },

    getters: {
        // gefilterde taken ophalen op basis van datum en prioriteit
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