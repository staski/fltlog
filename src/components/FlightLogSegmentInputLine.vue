<script setup>
import { computed } from 'vue';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

import FlightLogInput from './FlightLogInput.vue';

const model = defineModel();
const props = defineProps({ event: String,
                            label: String,
                            disabled: Boolean
});

const airport = defineModel('airport');
const blocktime = defineModel('blocktime');
const eventtime = defineModel('eventtime');
const hobbs = defineModel('hobbs');

const airportLabel = computed (()=>  {
    return props.event == "departure" ? "From" : "To"
})

const blockLabel = computed (()=>  {
    return props.event == "departure" ? "Off Block" : "On Block"
})

const eventLabel = computed (()=>  {
    return props.event == "departure" ? "Takeoff" : "Landing"
})
const hobbsLabel = computed (()=>  {
    return props.event == "departure" ? "Hobbs Start" : "Hobbs Landing"
})

</script>

<template>
<div class="row">
    <div class="col">
        <FlightLogInput type="text" v-model="airport" :label="airportLabel" />
    </div>
    <div class="col">
        <FlightLogInput type="time" v-model="blocktime" :label="blockLabel" />
    </div>
    <div class="col">
        <FlightLogInput type="time" v-model="eventtime" :label="eventLabel" />
    </div>
    <div class="col">
        <FlightLogInput type="text" v-model="hobbs" :label="hobbsLabel" />
    </div>
</div>
</template>

<style>
</style>

