<script setup>
import { ref } from 'vue';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

const model = defineModel();
const props = defineProps({
    label: String,
    selectValues: Array,
    placeholder: String,
})

const localValues = ref(props.selectValues);

</script>

<template>
    <form>
        <div class="mb-3">
            <label for="selectItem" class="form-label text-nowrap">{{ props.label }}</label>
            <select class="form-select" id="selectItem" aria-label="Select Function" v-model="model">
                <option disabled value="" v-if="placeholder">{{ placeholder }}</option>
                <option v-for="opts in localValues" :value="opts.value">{{ opts.text }}</option>
            </select>
        </div>
    </form>
</template>

<style scoped>

</style>
