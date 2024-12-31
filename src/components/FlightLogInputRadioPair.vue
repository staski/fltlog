<script setup>

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

const model = defineModel();
const props = defineProps({
  type: String,
  label: String,
  disabled: Boolean,
  flightmode: String,
  placeholder: String
});
</script>

<template>
  <form>
    <div class="mb-3">
      <label class="form-check-label" for="flightLogInputRadioPair">Flight Rules</label>
      <div class="form-check form-check-inline" id="flightLogInputRadioPair">
        <input class="form-check-input" type="radio" id="rulesVFR" name="radioRules" value="VFR" v-model="model">
        <label class="form-check-label" for="rulesVFR">VFR</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" id="rulesIFR" name="radioRules" value="IFR" v-model="model">
        <label class="form-check-label" for="rulesIFR">IFR</label>
      </div>
    </div>
  </form>
</template>

<style></style>
