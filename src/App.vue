<script setup>
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'

import { ref, reactive, onMounted } from 'vue'
import FlightLogTable from './components/FlightLogTable.vue'
import FlUtils from './flutils.js'
import FlightLogInputSelect from './components/FlightLogInputSelect.vue'
import FlightLogInput from './components/FlightLogInput.vue';

const file = ref(0)
const showUploadForm = ref(false);

var rules = ref(localStorage.favrules ? localStorage.favrules : 'VFR');
var pilotfunction = ref(localStorage.favfunction ? localStorage.favfunction : 'PIC');
var plane = ref(localStorage.favplane ? localStorage.favplane : '');
var pilot = ref(localStorage.favpilot ? localStorage.favpilot : '');

var debug = 0

const allflights = reactive([])

const aircraftlogcolumns = [
  { label: "Date", field: "takeoffTime", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "dd\.mm\.yy" },
  { label: "Registration", field: "plane" },
  { label: "Pilot", field: "pilot" },
  { label: "Flight from", field: "departureAirport" },
  { label: "Flight to", field: "landingAirport" },
  { label: "Off Block", field: "offBlock", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "On Block", field: "onBlock", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "Departure", field: "takeoffTime", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "Arrival", field: "landingTime", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "Number of Landings", field: "landingCount" },
  { label: "Operational Condition", field: "rules" },
  { label: "Pilot Function", field: "function" },
  { label: "Flight Distance", sub: "stats", field: "flightDistanceNM", dataCalc: FlUtils.spreadsheetNumber }
];
const pilotlogcolumns = [
  { label: "Date", field: "takeoffTime", dataCalc: FlUtils.spreadsheetTime, dataFormat: "dd\.mm\.yy" },
  { label: "Aircraft Type", field: "" },
  { label: "Registration", field: "plane" },
  { label: "Type (SEP/MEP)", field: "SEP" },
  { label: "Flight from", field: "departureAirport" },
  { label: "Flight to", field: "landingAirport" },
  { label: "Time of Departure", field: "offBlock", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "Time of Arrival", field: "onBlock", dataCalc: FlUtils.secondsToSpreadsheetTime, dataFormat: "hh:mm" },
  { label: "Total Time of Flight", field: "row", dataCalc: getFlightTotalTime, dataFormat: "hh:mm" },
  { label: "Number of Landings Day", field: "landingCount" },
  { label: "Number of Landings Night", field: "nightLandings" },
  { label: "Pilot", field: "pilot" },
  { label: "Operational Condition Time Night", field: "nightTime", dataCalc: FlUtils.spreadsheetDuration, dataFormat: "hh:mm" },
  { label: "Operational Condition Time IFR", field: "ifrtime_s", dataCalc: FlUtils.spreadsheetDuration, dataFormat: "hh:mm" },
  { label: "Pilot Function Time PIC", field: "row", dataCalc: getPICTime, dataFormat: "hh:mm" },
  { label: "Pilot Function Time Dual", field: "row", dataCalc: getDualTime, dataFormat: "hh:mm" },
  { label: "Pilot Function Time FI", field: "row", dataCalc: getFITime, dataFormat: "hh:mm" },
  { label: "Remarks", field: "" },
  { label: "Endorsments", field: "" },
  { label: "Flight Distance", sub: "stats", field: "flightDistanceNM", dataCalc: FlUtils.spreadsheetNumber }
]

onMounted(() => {
  if (import.meta.env.VITE_FLTLG_LOCALTEST == 1) {
    var dummyObj = { "ifrtime_s": 4995, "plane": "DETES", "onBlock": 1731770909, "pilot": "Carl Philipp Staszkiewicz", "stats": { "altMax": 5600, "descendMinutes": 17.5, "totalClimbFt": 6038, "elapsedMinutes": 90.5, "speedMax": 156, "taxiMinutes": 5, "levelMinutes": 41.5, "flightDistanceNM": 125, "flyingMinutes": 73, "climbMinutes": 14, "totalDescendFt": -6210, "restMinutes": 6 }, "departureAirport": "EDRY", "timestamp": 1733261190, "function": "PIC", "landingAirport": "EDRY", "rules": "IFR", "takeoffTime": 1731766284, "nightLandings": 0, "nightTime": 0, "id": -1, "landingCount": 1, "landingTime": 1731770631, "offBlock": 1731765914, "new": false, "duplicate": false };
    allflights.push(dummyObj);
  }
});

function saveFlightSegment(item, index) {
  allflights[index] = item;
}

function deleteFlightSegment(index) {
  allflights.splice(index, 1);
}


let base_url = import.meta.env.PROD === true ? 'flight-log.venus-flytrap.de' : 'localhost/~staskialt/cvtfltlg'
let screateurl = 'https://' + base_url + '/gpx2fltlog.cgi?action=create'

async function handleFileUpload() {
  var files = Array.from(file.value.files)
  for (let i = 0; i < files.length; i++) {
    await submitFile(files[i])
  }
}

async function submitFile(file) {
  let formData = new FormData();
  let acturl = screateurl;
  if (debug == 1) {
    acturl = acturl + '&debug=1'
  }

  localStorage.favpilot = pilot.value;
  localStorage.favplane = plane.value;
  localStorage.favrules = rules.value;
  localStorage.favfunction = pilotfunction.value;

  formData.append('file', file);
  formData.append('pilot', pilot.value)
  formData.append('plane', plane.value)
  formData.append('rules', rules.value)
  formData.append('function', pilotfunction.value)

  try {
    const response = await axios.post(acturl,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
    var info = response.data
    fetchNewFlights(info)
  } catch (error) {
    console.log(error)
  }
}

function fetchNewFlights(myInfo) {
  var a = allflights

  myInfo.forEach(function (item) {
    item.duplicate = item.invalid = false

    // find duplicates or conflicting flights
    a.forEach(function (flight, idx) {
      flight.duplicate = false
      if (flight.offBlock == item.offBlock) {
        console.log("found dup " + item.id + " from " + item.departureAirport)
        flight.duplicate = true
        item.duplicate = true
        item.idx = idx
      }
      if ((flight.offBlock < item.offBlock && flight.onBlock > item.OffBlock) ||
        (flight.onBlock > item.onBlock && flight.offBlock < item.onBlock)
      ) {
        item.invalid = true;
        console.log("found invalid " + item.id + " from " + item.departureAirport + ": ")
        console.log(item)
        console.log(flight)
      }
    });
  });

  // insert into existing flights
  myInfo.forEach(function (item) {

    if (item.duplicate == true) {
      a.splice(item.idx, 1, item)
    } else if (item.invalid == false) {
      a.splice(0, 0, item);
    }
    // ignore and skip otherwise
  });

  a.sort((x, y) => {
    return y.offBlock - x.offBlock
  });

  //console.log(JSON.stringify(a[0]));
}

function handleExportAircraftLog() {
  FlUtils.exportExcelLog(aircraftlogcolumns, allflights)
}

function handleExportPilotLog() {
  FlUtils.exportExcelLog(pilotlogcolumns, allflights)
}
function getFlightTotalTime(row) {
  return FlUtils.secondsToSpreadsheetTimeXLS(row["onBlock"]) - FlUtils.secondsToSpreadsheetTimeXLS(row["offBlock"])
}

function getPICTime(row) {
  return row.function === "PIC" ? getFlightTotalTime(row) : 0;
}
function getDualTime(row) {
  return row.function === "DUAL" ? getFlightTotalTime(row) : 0;
}
function getFITime(row) {
  return row.function === "FI" ? getFlightTotalTime(row) : 0
}

</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark justify-content-between">
      <span class="navbar-brand h1 mx-3">LogMyFlights</span>
      <div class="mx-3">
        <button type="button" class="btn btn-secondary mx-1" @click="handleExportAircraftLog()"><i
            class="bi-file-spreadsheet"></i>
          Export Aircraft Log
        </button>
        <button type="button" class="btn btn-secondary mx-1" @click="handleExportPilotLog()"><i
            class="bi-file-spreadsheet" aria-hidden="true"></i>
          Export Pilot Log
        </button>
        <button @click="showUploadForm = !showUploadForm" class="btn btn-secondary mx-1">
          <i class="bi-upload" aria-hidden="true"></i>
          Upload
        </button>
        <a role="button" class="btn btn-outline-light mx-1" href="https://github.com/staski/fltlog/blob/main/README.md"
          target="_blank"><i class="bi-question-circle"></i>
        </a>
      </div>
    </nav>
    <div class="card  mt-3 bg-light" v-show="showUploadForm">
      <form>
        <div class="row mx-1">
          <div class="col">
            <FlightLogInput type="text" v-model="pilot" label="Pilot" placeholder="favpilot" />
          </div>
          <div class="col">
            <FlightLogInput type="text" v-model="plane" label="Plane" placeholder="favplane" />
          </div>
          <div class="col">
            <FlightLogInputSelect label="Flight Rules" :select-values="FlUtils.inputValues.rules" v-model="rules"
              placeholder="select one"></FlightLogInputSelect>
          </div>
          <div class="col">
            <FlightLogInputSelect label="Pilot Function" :select-values="FlUtils.inputValues.functions"
              v-model="pilotfunction" placeholder="select one"></FlightLogInputSelect>
          </div>
          <div class="col">
            <form>
              <div class="custom-file mb-1">
                <label class="custom-file-label mb-3" for="inputFile">Choose file</label>
                <input type="file" ref="file" id="inputFile" class="custom-file-input" placeholder="chose gpx file..."
                  drop-placeholder="Drop file here..." accept=".gpx" multiple @change="handleFileUpload()">
              </div>
            </form>
          </div>
        </div>
      </form>
    </div>
    <FlightLogTable :flight-segments="allflights" @item-delete="deleteFlightSegment" @item-save='saveFlightSegment' />
  </div>



</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
