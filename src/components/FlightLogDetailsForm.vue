<template>
    <div class="modal modal-lg" role="dialog" v-show="display" id="editSegment" title="Edit Flight Segment"
        tabindex="-1">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Flight Segment</h5>
                    <button type="button" class="btn-close" @click="display = !display" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row m-1">
                        <div class="col">
                            <FlightLogInput type="text" v-model="form.registration" label="Plane" />
                        </div>
                        <div class="col">
                            <FlightLogInput type="text" v-model="form.pilot" label="Pilot"/>
                        </div>
                        <div class="col">
                            <FlightLogInput type="date" v-model="form.day" label="Date"></FlightLogInput>
                        </div>
                    </div>
                    <div class="card m-3 text-bg-light">
                        <div class="card-header">Flight Segment </div>
                        <div class="card-body">
                            <FlightLogSegmentInputLine event="departure" v-model:airport="form.from"
                                v-model:blocktime="form.offblock" v-model:eventtime="form.takeoff"
                                v-model:hobbs="form.hobbsstart" />
                            <FlightLogSegmentInputLine event="landing" v-model:airport="form.to"
                                v-model:blocktime="form.onblock" v-model:eventtime="form.landing"
                                v-model:hobbs="form.hobbsend" />
                        </div>
                        <div>
                            <div class="row m-1">
                                <div class="col">
                                    <FlightLogInput type="number" v-model="form.landingcount"
                                        label="Landings (Day)" min="0" max="50" />
                                </div>
                                <div class="col">
                                    <FlightLogInput type="number" v-model="form.nightlandings"
                                        label="Landings (Night)" min="0" max="50" />
                                </div>
                                <div class="col">
                                    <FlightLogInputRadioPair v-model="form.rules" label="Flight Rules">
                                    </FlightLogInputRadioPair>
                                </div>
                                <div class="col-2">
                                    <FlightLogInputSelect :select-values="FlUtils.inputValues.functions"
                                        v-model="form.function" label="Function" />
                                </div>
                                <div class="col-2">
                                    <FlightLogInput type="time" v-model="mytotaltime" label="Total Time"
                                        disabled />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <button type="button" class="btn btn-secondary mx-1" @click="showStats = !showStats">Show
                                Stats</button>
                            <button type="button" class="btn btn-secondary mx-1" @click="showTimers = !showTimers">Show
                                Timers</button>
                        </div>
                    </div>
                    <FlightStats :stats="form.stats" v-model="showStats" v-if="form.stats"></FlightStats>
                    <FlightTimers :timers="form.timers" @timers-changed="onTimersChanged" v-model="showTimers">
                    </FlightTimers>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="saveFlightSegment(); display = !display">Save
                        changes</button>
                    <button type="button" class="btn btn-secondary" @click="display = !display">Dismiss</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal {
    display: block;
}

.modal-dialog {
    z-index: 1 !important;
}
</style>

<script setup>
import { watch, ref, reactive, computed } from 'vue';
import FlUtils from '../flutils.js';

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap/dist/js/bootstrap.min.js';
import FlightLogInput from './FlightLogInput.vue';
import FlightLogInputRadioPair from './FlightLogInputRadioPair.vue';
import FlightLogSegmentInputLine from './FlightLogSegmentInputLine.vue';
import FlightLogInputSelect from './FlightLogInputSelect.vue';
import FlightStats from './FlightStats.vue';
import FlightTimers from './FlightTimers.vue';


const showStats = ref(false);
const showTimers = ref(false);

var form = reactive({
        type: '',
        registration: '',
        pilot: '',
        day: '',
        date: 0,
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
});

const display = defineModel();

const props = defineProps({
    debug: Number,
    item: Object,
    index: Number,
});

const emit = defineEmits(['flightSegmentUpdated']);

const mytotaltime = computed(() => {
    if (form.onblock != '' && form.offblock != ''){ 
        return FlUtils.secondsToTimeString(FlUtils.difftimeSeconds(form.onblock, form.offblock));
    }
    return "0:00";
});

watch(display, (newModel) => {
    showStats.value = false;
    showTimers.value = false;
    if (newModel == true) {
        selectFlightSegmentAndFillForm(props.item);
    } 
});

function onTimersChanged(timers) {
    form.timers = timers;
}

function selectFlightSegmentAndFillForm(item) {
    formForFlightSegment(item);
};

function formForFlightSegment(item) {
    form.type = 'SEP'
    form.registration = item.plane
    form.pilot = item.pilot
    form.from = item.departureAirport
    form.to = item.landingAirport
    form.date = item.takeoffTime;
    form.day = FlUtils.secondsToDateFormInputString(item.takeoffTime)

    form.offblock = FlUtils.secondsToTimeString(item.offBlock)
    form.takeoff = FlUtils.secondsToTimeString(item.takeoffTime)
    form.landing = FlUtils.secondsToTimeString(item.landingTime)
    form.onblock = FlUtils.secondsToTimeString(item.onBlock)
    form.landingcount = item.landingCount
    form.nightlandings = item.nightLandings
    form.duration = showAirborneTime(item)
    form.rules = item.rules
    form.function = item.function
    form.totaltime = FlUtils.secondsToTimeString(item.onBlock - item.offBlock)

    form.timers.nighttime = FlUtils.secondsToTimeString(item.nightTime)
    form.timers.ifrtime = FlUtils.secondsToTimeString(item.ifrtime_s ? item.ifrtime_s :
        item.rules == "IFR" ? item.onBlock - item.offBlock : 0);

    form.timers.pictime = item.function === "PIC" ?
        FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)
    form.timers.dualtime = item.function === "DUAL" ?
        FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)
    form.timers.fitime = item.function === "FI" ?
        FlUtils.secondsToTimeString(item.onBlock - item.offBlock) : FlUtils.secondsToTimeString(0)

    form.stats = item.stats
};

function saveFlightSegment() {
    var segment = flightSegmentForForm();
    var idx = props.index;
    emit('flightSegmentUpdated', segment, idx);
}

function flightSegmentForForm() {
    var litem = {};
    var lform = form;

    const [year, month, day] = lform.day.split("-")
    var takeoff = new Date(lform.date * 1000)

    var offBlock, takeoffTime, landingTime, onBlock;

    offBlock = takeoffTime = landingTime = onBlock =
        new Date(Date.UTC(year, month - 1, day));

    litem.plane = lform.registration
    litem.type = lform.type
    litem.pilot = lform.pilot
    litem.departureAirport = lform.from
    litem.landingAirport = lform.to


    litem.offBlock = setTimeFromForm(lform.offblock, offBlock).getTime() / 1000
    litem.takeoffTime = setTimeFromForm(lform.takeoff, takeoffTime).getTime() / 1000
    litem.landingTime = setTimeFromForm(lform.landing, landingTime).getTime() / 1000
    litem.onBlock = setTimeFromForm(lform.onblock, onBlock).getTime() / 1000


    litem.landingCount = lform.landingcount
    litem.nightLandings = lform.nightlandings
    litem.rules = lform.rules
    litem.function = lform.function

    litem.ifrtime_s = FlUtils.timestringToSeconds(lform.timers.ifrtime);
    if (litem.ifrtime_s >= litem.onBlock - litem.offBlock){
        litem.ifrtime_s = litem.onBlock - litem.offBlock;
    }
    litem.nightTime = FlUtils.timestringToSeconds(lform.timers.nighttime);
    if (litem.nightTime >= litem.onBlock - litem.offBlock){
        litem.nightTime = litem.onBlock - litem.offBlock;
    }

    litem.stats = lform.stats;
    return litem;
};

function setTimeFromForm(timestr, item) {

    //console.log("SET: " + item)
    item.setUTCHours(timestr.slice(0, 2))
    item.setUTCMinutes(timestr.slice(3, 5))

    return item
};

function showAirborneTime(line) {
    var duration = line.landingTime - line.takeoffTime
    return FlUtils.secondsToTimeString(duration)
};

</script>
