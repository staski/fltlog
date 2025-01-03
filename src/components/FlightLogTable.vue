<template>
  <div class="table-responsive">
    <table class="table table-sm table-striped table-hover">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Plane</th>
          <th scope="col">Pilot</th>
          <th scope="col">From</th>
          <th scope="col">To</th>
          <th scope="col">Takeoff</th>
          <th scope="col">Landung</th>
          <th scope="col">Airborne time</th>
          <th scope="col">Landing count</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(segment, index) in flightSegments" key="segment.takeoff">
          <td>{{ FlUtils.secondsToDateString(segment.takeoffTime) }}</td>
          <td>{{ segment.plane }}</td>
          <td>{{ segment.pilot }}</td>
          <td>{{ segment.departureAirport }}</td>
          <td>{{ segment.landingAirport }}</td>
          <td>{{ FlUtils.secondsToTimeString(segment.takeoffTime) }}</td>
          <td>{{ FlUtils.secondsToTimeString(segment.landingTime) }}</td>
          <td>{{ showAirborneTime(segment) }}</td>
          <td>{{ segment.landingCount }}</td>
          <td>

            <button type="button" class="btn btn-sm btn-secondary"  @click="showFlightSegmentForm(segment, index)"> Edit </button>
            <button type="button" class="btn btn-sm btn-secondary" @click="deleteFlightSegment(segment, index)">
              Delete
            </button>
          </td>
        </tr>
        <FlightLogDetailsForm :item="item" :index="index" v-model="modal" @flight-segment-updated="saveFlightSegment">
        </FlightLogDetailsForm>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

button {
  margin-right: .2rem;
  margin-left: .2rem;
}

</style>

<script setup>
import { ref } from 'vue'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';

import FlUtils from '../flutils.js'
import FlightLogDetailsForm from './FlightLogDetailsForm.vue';

var modal = ref(false);
var item = {};
var index = 0;

const props = defineProps({ flightSegments: Array });
const emit = defineEmits({
  itemDelete: null,
  itemSave: null,
});

var flightSegmentForm = {
  type: '',
  registration: '',
  pilot: '',
  date: '',
  from: '',
  to: '',
  offblock: '',
  takeoff: '',
  landing: '',
  onblock: '',
  duration: '',
  hobbsstart: '0.00',
  hobbsend: '0.00',
  landingcount: '',
  nightlandings: '',
  rules: '',
  function: '',
  totaltime: 0,

  ifrtime_s: 0,

  airbornetime: 0,
  timers: {
    ifrtime: '',
    pictime: '',
    dualtime: '',
    fitime: '',
    nighttime: '',
  },
  stats: null
};

function deleteFlightSegment(item,index){
  emit('itemDelete', index);
}

function saveFlightSegment(item, index) {
  modal.value  = false;
  emit('itemSave', item,index);
}

function showFlightSegmentForm(i, idx) {
  item = i;
  index = idx;
  modal.value = true;
}

function formForFlightSegment(item) {
  flightSegmentForm.type = 'SEP'
  flightSegmentForm.registration = item.plane
  flightSegmentForm.pilot = item.pilot
  flightSegmentForm.from = item.departureAirport
  flightSegmentForm.to = item.landingAirport
  flightSegmentForm.date = FlUtils.secondsToDateFormInputString(item.takeoffTime);
  flightSegmentForm.offblock = FlUtils.secondsToTimeString(item.offBlock)
  flightSegmentForm.takeoff = FlUtils.secondsToTimeString(item.takeoffTime)
  flightSegmentForm.landing = FlUtils.secondsToTimeString(item.landingTime)
  flightSegmentForm.onblock = FlUtils.secondsToTimeString(item.onBlock)
  flightSegmentForm.landingcount = item.landingCount
  flightSegmentForm.nightlandings = item.nightLandings
  flightSegmentForm.duration = showAirborneTime(item)
  flightSegmentForm.rules = item.rules
  flightSegmentForm.function = item.function
  flightSegmentForm.totaltime = FlUtils.secondsToTimeString(item.onBlock - item.offBlock)

  flightSegmentForm.timers.nighttime = FlUtils.secondsToTimeString(item.nightTime)
  flightSegmentForm.ifrtime_s = item.ifrtime_s ? item.ifrtime_s :
    item.rules == "IFR" ? item.onBlock - item.offBlock : 0
  flightSegmentForm.timers.ifrtime = FlUtils.secondsToTimeString(flightSegmentForm.ifrtime_s)

  flightSegmentForm.timers.pictime = item.function === "PIC" ?
    FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)
  flightSegmentForm.timers.dualtime = item.function === "DUAL" ?
    FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)
  flightSegmentForm.timers.fitime = item.function === "FI" ?
    FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)

  flightSegmentForm.stats = item.stats
};

function showAirborneTime(line) {
  var duration = line.landingTime - line.takeoffTime
  return FlUtils.secondsToTimeString(duration)
}
</script>
