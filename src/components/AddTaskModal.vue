<!--AddTaskModal.vue-->
<template>
  <!-- Bootstrap Modal Structure -->
  <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nieuwe Taak Toevoegen</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Taaknaam</label>
              <input
                  v-model="taskForm.title"
                  type="text"
                  class="form-control"
                  required
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Beschrijving</label>
              <textarea
                  v-model="taskForm.description"
                  class="form-control"
                  rows="3"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Prioriteit</label>
              <select v-model="taskForm.priority" class="form-select">
                <option value="hoog">Hoog</option>
                <option value="gemiddeld">Gemiddeld</option>
                <option value="laag">Laag</option>
              </select>
            </div>

            <div class="modal-footer">
              <button
                  type="button"
                  class="btn btn-secondary"
                  @click="closeModal"
              >
                Annuleren
              </button>
              <button
                  type="submit"
                  class="btn btn-primary"
              >
                Taak Toevoegen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Backdrop -->
  <div class="modal-backdrop fade" :class="{ show: showModal }"></div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useCalendarStore } from '@/stores/calendarStore'; // Importeer de store

export default {
  name: 'AddTaskModal',
  props: {
    selectedDate: {
      type: Date,
      required: true
    }
  },
  emits: ['close'], // Alleen het 'close' event is nodig
  setup(props, { emit }) {
    const calendarStore = useCalendarStore(); // Gebruik de store
    const showModal = ref(true);
    const taskForm = reactive({
      title: '',
      description: '',
      priority: 'gemiddeld'
    });

    const handleSubmit = () => {
      // Voeg de nieuwe taak toe via de store
      calendarStore.addTask({
        ...taskForm,
        id: Date.now(), // Genereer een unieke ID
        date: props.selectedDate // Gebruik de geselecteerde datum
      });

      closeModal();
    };

    const closeModal = () => {
      showModal.value = false;
      emit('close');
    };

    return {
      showModal,
      taskForm,
      handleSubmit,
      closeModal
    };
  }
};
</script>