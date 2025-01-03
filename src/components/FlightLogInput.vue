<script setup>

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

const model = defineModel();
const props = defineProps({
  type: String,
  label: String,
  disabled: Boolean,
  placeholder: String
});
</script>

<template>
  <form>
    <div class="mb-3">
      <label for="flightLogInputItem" class="form-label text-nowrap">{{ props.label }}</label>
      <input :type="props.type" class="form-control" id="flightLogInputItem" :placeholder="props.placeholder"
        :disabled="props.disabled" v-model="model" minlength="3" maxlength="50">
    </div>
  </form>
</template>

<style scoped>
input[type="text"]:invalid {
  border: 2px solid red;
}
</style>
