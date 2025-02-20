<!-- TaskList.vue -->
<template>

  <div class="task-list-container p-3 bg-light rounded-bottom border mt-2 pb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fs-5 mb-0 text-capitalize text-primary fw-semibold">{{ formatDate(selectedDate) }}</h3>

      <select v-model="selectedPriority" class="form-select form-select-sm w-auto">
        <option value="all">Alle Prioriteiten</option>
        <option value="hoog">Hoog</option>
        <option value="gemiddeld">Gemiddeld</option>
        <option value="laag">Laag</option>
      </select>
    </div>


    <div v-if="!filteredTasks.length" class="text-center text-muted py-3">
      {{ selectedPriority === 'all' ? 'Geen taken voor deze dag' : 'Geen taken gevonden voor deze prioriteit' }}
    </div>

    <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item p-3 mb-2 rounded-3 border"
        :class="getTaskClasses(task.priority)"
        draggable="true"
        @dragstart="handleDragStart($event, task)"
    >
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fs-6 mb-1" :class="getTextClass(task.priority)">{{ task.title }}</h4>
          <p class="small mb-0" :class="getDescriptionClass(task.priority)">{{ task.description }}</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <div class="badge" :class="getBadgeClass(task.priority)">
            {{ task.priority }}
          </div>
          <div class="task-actions">
            <button
                class="btn btn-link text-secondary btn-sm p-0 me-2"
                @click="openEditModal(task)"
                title="Bewerk taak"
            >
              <i class="bi bi-pencil-square"></i>
            </button>
            <button
                class="btn btn-link btn-sm p-0 text-danger"
                @click="handleDelete(task)"
                title="Verwijder taak"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal fade" id="editTaskModal" tabindex="-1" ref="editModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Taak Bewerken</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleEditSubmit">
              <div class="mb-3">
                <label for="editTitle" class="form-label">Titel</label>
                <input
                    type="text"
                    class="form-control"
                    id="editTitle"
                    v-model="editingTask.title"
                    required
                >
              </div>
              <div class="mb-3">
                <label for="editDescription" class="form-label">Beschrijving</label>
                <textarea
                    class="form-control"
                    id="editDescription"
                    v-model="editingTask.description"
                    rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label for="editPriority" class="form-label">Prioriteit</label>
                <select
                    class="form-select"
                    id="editPriority"
                    v-model="editingTask.priority"
                >
                  <option value="hoog">Hoog</option>
                  <option value="gemiddeld">Gemiddeld</option>
                  <option value="laag">Laag</option>
                </select>
              </div>
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-secondary" @click="closeEditModal">Annuleren</button>
                <button type="submit" class="btn btn-primary">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <slot name="actions"></slot>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { Modal } from 'bootstrap';

export default {
  name: 'TaskList',
  props: {
    selectedDate: {
      type: Date,
      required: true
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },

  emits: ['drag-start', 'edit-task', 'delete-task'],

  setup(props, { emit }) {
    const selectedPriority = ref('all');
    const editModal = ref(null);
    const editingTask = ref({
      id: null,
      title: '',
      description: '',
      priority: 'gemiddeld'
    });

    // Watch for date changes and reset filter
    watch(
        () => props.selectedDate,
        () => {
          selectedPriority.value = 'all';
        }
    );

    const tasksForDay = computed(() => {
      return props.tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === props.selectedDate.toDateString();
      });
    });

    const filteredTasks = computed(() => {
      if (selectedPriority.value === 'all') {
        return tasksForDay.value;
      }
      return tasksForDay.value.filter(task => task.priority === selectedPriority.value);
    });

    // Modal handling
    const openEditModal = (task) => {
      editingTask.value = { ...task };
      const modal = new Modal(editModal.value);
      modal.show();
    };

    const closeEditModal = () => {
      const modal = Modal.getInstance(editModal.value);
      if (modal) {
        modal.hide();
      }
    };

    const handleEditSubmit = () => {
      emit('edit-task', { ...editingTask.value });
      closeEditModal();
    };

    const handleDelete = (task) => {
      if (window.confirm(`Wil je de taak "${task.title}" verwijderen?`)) {
        emit('delete-task', task);
      }
    };


    // Bootstrap class helpers
    const getTaskClasses = (priority) => {
      const classes = {
        'hoog': 'bg-danger-subtle border-danger-subtle shadow-sm',
        'gemiddeld': 'bg-warning-subtle border-warning-subtle shadow-sm',
        'laag': 'bg-info-subtle border-info-subtle shadow-sm'
      };
      return classes[priority] || 'bg-secondary-subtle';
    };

    const getTextClass = (priority) => {
      const classes = {
        'hoog': 'text-danger',
        'gemiddeld': 'text-warning-emphasis',
        'laag': 'text-info-emphasis'
      };
      return classes[priority] || 'text-secondary';
    };

    const getDescriptionClass = (priority) => {
      const classes = {
        'hoog': 'text-danger-emphasis',
        'gemiddeld': 'text-warning-emphasis',
        'laag': 'text-info-emphasis'
      };
      return classes[priority] || 'text-secondary';
    };

    const getBadgeClass = (priority) => {
      const classes = {
        'hoog': 'bg-danger text-white',
        'gemiddeld': 'bg-warning text-dark',
        'laag': 'bg-info text-white'
      };
      return classes[priority] || 'bg-secondary';
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const handleDragStart = (event, task) => {
      emit('drag-start', event, task);
    };

    return {
      selectedPriority,
      filteredTasks,
      formatDate,
      getTaskClasses,
      getTextClass,
      getDescriptionClass,
      getBadgeClass,
      handleDragStart,
      editModal,
      editingTask,
      openEditModal,
      closeEditModal,
      handleEditSubmit,
      handleDelete
    };
  }
};
</script>

<style scoped>
.task-item {
  transition: transform 0.2s ease-in-out;
}

.task-item:hover {
  transform: translateY(-2px);
}

.form-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.task-actions {
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.btn-link:hover {
  transform: scale(1.1);
}
</style>