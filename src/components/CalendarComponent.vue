<!--CalendarComponent.vue-->
<template>
  <div class="container min-vh-100" style="max-width: 1000px">
    <!-- Calendar Container with dynamic classes -->
    <div class="calendar-wrapper mt-5" >

      <!-- maand weergave en navigatie -->
      <div class="d-flex justify-content-around align-items-center py-4 border rounded-top month-title">
        <button @click="prevMonth" class="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center navigation-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h2 class="fs-4 fw-bold mb-0 text-light text-capitalize">
          {{ monthName }} {{ year }}
        </h2>
        <button @click="nextMonth" class="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center navigation-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <!-- kalender weergave -->
      <div class="calendar-container p-3 bg-white">
        <div class="calendar-grid">
          <!-- Week days -->
          <div
              v-for="(day, index) in dayNames"
              :key="index"
              class="calendar-header text-center fw-bold"
          >
            {{ day }}
          </div>

          <!-- dagen van de maand -->
          <div
              v-for="(day, index) in monthDays"
              :key="index"
              class="calendar-cell text-center position-relative"
              :class="{
                'text-muted': day.getMonth() !== state.monthIndex,
                'today': isToday(day),
                'hover-effect': day,
                'droppable': day
              }"
              @dragover.prevent="handleDragOver"
              @drop.prevent="(event) => handleDrop(event, day)"
              @dragenter.prevent
              @click="handleDayClick(day)"
          >
            <span class="day-number">{{ day.getDate() }}</span>

            <!-- task indicators -->
            <div class="task-indicators">
              <div
                  v-for="task in getTasksForDay(day)"
                  :key="task.id"
                  class="task-dot"
                  :class="'priority-' + task.priority"
                  :title="task.title"
                  draggable="true"
                  @dragstart="(event) => handleDragStart(event, task)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- takenlijst -->
      <TaskList
          v-if="calendarStore.selectedDate"
          :selected-date="calendarStore.selectedDate"
          :tasks="calendarStore.tasks"
          @drag-start="handleDragStart"
          @edit-task="handleEditTask"
          @delete-task="handleDeleteTask"
          class="mt-4"
      >
        <template #actions>
          <button
              class="btn text-white mt-2 rounded"
              style="background: #4a90e2;"
              @click="showAddTaskModal = true"
          >
            Nieuwe Taak
            <i class="ms-2 bi bi-calendar-plus"></i>
          </button>
        </template>
      </TaskList>

    <!-- Add Task Modal -->
    <AddTaskModal
        v-if="showAddTaskModal && calendarStore.selectedDate"
        :selected-date="calendarStore.selectedDate"
        @close="showAddTaskModal = false"
    />

  </div>

  <!-- Watermerk -->
  <div class="position-fixed bottom-0 end-0 p-2 text-muted fst-italic opacity-75">Ontwikkeld door Gülümsu Sancak</div>

  <!-- Alert container -->
  <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 5">
    <div v-for="alert in calendarStore.alerts"
         :key="alert.id"
         class="alert alert-dismissible fade show"
         :class="`alert-${alert.type}`">
      <!-- Success icon (check) for success alerts -->
      <i v-if="alert.type === 'success'" class="bi bi-check-circle-fill me-2"></i>
      <!-- Danger icon (x) for danger alerts -->
      <i v-if="alert.type === 'danger'" class="bi bi-x-circle-fill me-2"></i>
      <!-- Info icon (i) for info alerts -->
      <i v-if="alert.type === 'info'" class="bi bi-info-circle-fill me-2"></i>
      {{ alert.message }}
      <button
          type="button"
          class="btn-close"
          @click="calendarStore.alerts = calendarStore.alerts.filter(a => a.id !== alert.id)">
      </button>
    </div>
  </div>

</template>

<script>
import { computed, reactive, ref, onMounted } from 'vue';
import { useCalendarStore } from '@/stores/calendarStore';
import TaskList from './TaskList.vue';
import AddTaskModal from './AddTaskModal.vue';

export default {
  components: {
    TaskList,
    AddTaskModal
  },

//composition API met setup functie
  setup() {
    const calendarStore = useCalendarStore(); //pinia

// reactieve state met reactive
    const state = reactive({
      year: 2025,
      monthIndex: new Date().getMonth(),
    });

    const showAddTaskModal = ref(false);
    const draggedTask = ref(null);

    const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  // computed property voor kalenderberekening
    const monthDays = computed(() => {
      let days = [];
      const date = new Date(state.year, state.monthIndex, 1);

      // bereken de dag van de week (0-6, waarbij 0 zondag is)
      let firstDayOfMonth = date.getDay();

      // converteer van zondag=0 naar maandag=0 formaat
      // als het zondag is (0), maak er 6 van, anders trek 1 af
      firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

      // voeg dagen van de vorige maand toe
      if (firstDayOfMonth > 0) {
        const prevMonthLastDate = new Date(state.year, state.monthIndex, 0);
        const prevMonthDays = prevMonthLastDate.getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
          const day = prevMonthDays - firstDayOfMonth + i + 1;
          const prevMonthYear = state.monthIndex === 0 ? state.year - 1 : state.year;
          const prevMonth = state.monthIndex === 0 ? 11 : state.monthIndex - 1;
          days.push(new Date(prevMonthYear, prevMonth, day));
        }
      }
      // bereken het aantal dagen in de huidige maand
      const daysInMonth = new Date(state.year, state.monthIndex + 1, 0).getDate();

      // voeg alle dagen van de huidige maand toe
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(state.year, state.monthIndex, i));
      }
      return days;
    });

    // met pinia store taken ophalen
    const getTasksForDay = (day) => {
      if (!day) return [];
      return calendarStore.tasks.filter(task =>
          new Date(task.date).toDateString() === day.toDateString()
      );
    };

    // drag en drop functionaliteit
    const handleDragStart = (event, task) => {
      draggedTask.value = task;
      event.dataTransfer.setData('text/plain', JSON.stringify(task));
    };

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    // pinia store actie aanroepen om taak te bewerken na drop
    const handleDrop = (event, targetDay) => {
      if (!targetDay) return;
      const taskData = event.dataTransfer.getData('text/plain');
      const task = JSON.parse(taskData);

      // Update de taak datum in de store
      const updatedTask = Object.assign({}, task, { date: targetDay });
      calendarStore.editTask(updatedTask);
    };

    // pinia voor geselecteerde datum
    const handleDayClick = (day) => {
      calendarStore.setSelectedDate(day);
    };

    // voeg een nieuwe taak toe via de store
    const handleAddTask = (newTask) => {
      calendarStore.addTask(newTask);
      showAddTaskModal.value = false;
    };

    // bewerk een taak via de store
    const handleEditTask = (updatedTask) => {
      calendarStore.editTask(updatedTask);
    };

    // verwijder een taak via de store
    const handleDeleteTask = (taskToDelete) => {
      calendarStore.deleteTask(taskToDelete);
    };

    // laad taken uit localStorage bij het mounten
    onMounted(() => {
      calendarStore.loadTasksFromLocalStorage();
    });

    return {
      // computed properties
      monthName: computed(() => {
        const date = new Date(state.year, state.monthIndex);
        return date.toLocaleString('nl-NL', { month: 'long' });
      }),
      year: computed(() => state.year),
      monthDays,
      dayNames,
      calendarStore,
      showAddTaskModal,
      handleDayClick,
      handleAddTask,
      handleEditTask,
      handleDeleteTask,
      getTasksForDay,
      handleDragStart,
      handleDragOver,
      handleDrop,
      state,
      //helper functies
      isToday: (day) => {
        const today = new Date();
        return day &&
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
      },
      prevMonth: () => {
        if (state.monthIndex === 0) {
          state.monthIndex = 11;
          state.year -= 1;
        } else {
          state.monthIndex -= 1;
        }
      },
      nextMonth: () => {
        if (state.monthIndex === 11) {
          state.monthIndex = 0;
          state.year += 1;
        } else {
          state.monthIndex += 1;
        }
      }
    };
  },
};
</script>

<style scoped>
*{
  font-family: 'Montserrat', sans-serif;
}
.container {
  transition: padding-top 0.7s ease-in-out;
}

.container.has-selected-date {
  padding-top: 2rem;
}

.calendar-wrapper {
  transition: transform 0.7s ease-in-out;

}

.calendar-container {
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.navigation-btn {
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;
}

.navigation-btn:hover {
  transform: scale(1.1);
}

.month-title {
  background-color:  #4a90e2;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.calendar-header {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 5px 0;
}

.calendar-cell {
  aspect-ratio: 1;
  background-color: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 40px;
}

.calendar-cell.hover-effect:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.today {
  background-color: #e7f5ff;
  border: 2px solid #007bff;
}

.today .day-number {
  color: #007bff;
  font-weight: 700;
}

.text-muted .day-number {
  color: #dee2e6;
}

/* Task indicators styling */
.task-indicators {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 3px;
  padding: 2px;
  max-width: 100%;
  overflow: hidden;
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #6c757d;
  transition: transform 0.2s ease;
}

.task-dot.priority-hoog {
  background-color: #dc3545;
}

.task-dot.priority-gemiddeld {
  background-color: #ffc107;
}

.task-dot.priority-laag {
  background-color: #0dcaf0;
}

.calendar-cell:hover .task-dot {
  transform: scale(1.2);
}

/* For showing "..." when there are many tasks */
.task-indicators:has(> .task-dot:nth-child(10)) {
  padding-right: 12px;
}

.task-indicators:has(> .task-dot:nth-child(10))::after {
  content: "...";
  position: absolute;
  right: 2px;
  bottom: 0;
  font-size: 10px;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-grid {
    gap: 4px;
  }

  .calendar-cell {
    min-height: 35px;
  }

  .day-number {
    font-size: 0.8rem;
  }
}

.calendar-cell.droppable {
  transition: background-color 0.3s ease;
}

.calendar-cell.droppable:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.task-dot {
  cursor: grab;
}

.task-dot:active {
  cursor: grabbing;
}


</style>