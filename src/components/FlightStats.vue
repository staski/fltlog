<template>
    <div class="card m-3" bg-variant="light" v-show="model">
        <div class="card-body">
            <div class="card-title">Flight Statistics</div>
        </div>
 
        <ul class="list-group list-group-flush">
            <li class="list-group-item" > Total time: {{ props.stats.elapsedMinutes }} minutes</li>
            <li class="list-group-item" > Block time: {{ blockTime() }} minutes</li>
            <li class="list-group-item" > Taxi time: {{ props.stats.taxiMinutes + props.stats.restMinutes }} minutes 
                (thereof {{ props.stats.restMinutes }} minutes at rest)
                </li>
            <li class="list-group-item" > Flying time: {{ props.stats.flyingMinutes }} minutes ({{ props.stats.climbMinutes }} minutes climb,
                {{ stats.levelMinutes }} minutes level flight,
                {{ stats.descendMinutes }} minutes descend) </li>
            <li class="list-group-item" > Maximum altitude : {{ props.stats.altMax }} feet</li>
            <li class="list-group-item" > Flight distance: {{ props.stats.flightDistanceNM }} NM</li>
            <li class="list-group-item" > Maximum speed : {{ props.stats.speedMax }} kts</li>
            <li class="list-group-item" > Average speed : {{ avgSpeed() }} kts</li>

        </ul>
    </div>
</template>

<script setup>

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

const model = defineModel();
const props = defineProps({ stats: Object });

function blockTime () {
                return Number(props.stats.flyingMinutes) + Number(props.stats.taxiMinutes) + Number(props.stats.restMinutes)
            };

function avgSpeed () {
                return Math.round(3600 * props.stats.flightDistanceNM / (props.stats.flyingMinutes * 60))
            }

</script>


