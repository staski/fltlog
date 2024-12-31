<template>
    <div class="row my-3" v-show="model">
        <div class="col px-3" id="timer-night">
            <FlightLogInput type="time" v-model="mytimers.nighttime" @change="emitTimersChanged" label="Night Time" />
        </div>
        <div class="col px-3" id="timer-ifr">
            <FlightLogInput type="time" v-model="mytimers.ifrtime" @change="emitTimersChanged" label="IFR Time" />
        </div>
        <div class="col px-3" id="timer-pic">
            <FlightLogInput type="time" v-model="mytimers.pictime" label="PIC Time" disabled/>
        </div>
        <div class="col px-3" id="timer-dual">
            <FlightLogInput type="time" v-model="mytimers.dualtime" label="DUAL Time" disabled/>
        </div>
        <div class="col px-3" id="timer-fi">
            <FlightLogInput type="time" v-model="mytimers.fitime" label="FI Time" disabled/>
        </div>
    </div>
</template>

<script>
 var mytimers;
</script>

<script setup>
import { ref } from 'vue';
import FlightLogInput from './FlightLogInput.vue';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

const model = defineModel();
const props = defineProps({ timers : {
                                nighttime: String,
                                ifrtime: String,
                                pictime: String,
                                dualtime: String,
                                fitime: String,
                            }
 });

 mytimers = ref (props.timers);


const emit = defineEmits(['timersChanged', mytimers]);

function emitTimersChanged() {
    emit('timersChanged', mytimers);
}
</script>
