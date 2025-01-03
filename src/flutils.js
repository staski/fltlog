import Sheets from 'xlsx';
import XLSX from 'xlsx';

const inputValues = {
    files: [],
    rules: [
      { text: "VFR", value: 'VFR' },
      { text: "IFR", value: 'IFR' }
    ],
    functions: [
      { text: "PIC", value: 'PIC' },
      { text: "DUAL", value: 'DUAL' },
      { text: "FI", value: 'FI' }
    ],
  };
  
function secondsToDateString (timer){
    var date = new Date(timer * 1000)
    var day  = date.getDate ()
    day = (day >= 10 ? day : "0" + day)
    var month = date.getMonth () + 1
    month = (month >= 10 ? month : "0" + month)
    var year = date.getFullYear ()
    return day + "." + month + "." + year
}

function secondsToDateFormInputString (timer){
    var date = new Date(timer * 1000)
    var day  = date.getDate ()
    day = (day >= 10 ? day : "0" + day)
    var month = date.getMonth () + 1
    month = (month >= 10 ? month : "0" + month)
    var year = date.getFullYear ()
    return year + "-" + month + "-" + day;
}

function  secondsToTimeString (timer){
    var date = new Date(timer * 1000)
    var hours = date.getUTCHours()
    hours = (hours >= 10 ? hours : "0" + hours)
    var minutes = date.getUTCMinutes ()
    var seconds = date.getUTCSeconds ()
    minutes = seconds < 30 ? minutes : minutes + 1
    minutes = (minutes >= 10 ? minutes : "0" + minutes)

    return hours + ":" + minutes
}

//return the time according to timer seconds since epoch as JS object (corrected to account
// for UTC output in Excel
// objects of type Date will converted to "Date"-cells automatically
function secondsToSpreadsheetTime(timer){
    // hack offset for UTC output in Excel!
    var date = new Date(timer * 1000)
    var offset = (date.getHours() - date.getUTCHours()) * 3600 
    return new Date((timer - offset)*1000)
}

//return the time according to timer seconds since epoch as XLS reporesentation number: days sine
// 1.1.1900 as floating number  (corrected to account
function secondsToSpreadsheetTimeXLS(timer){
    // hack offset for UTC output in Excel!
    let date = new Date(timer * 1000)
    let converted = 25569.0 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
    return converted;
}

function spreadsheetDuration ( timer ){
    return timer /( 3600 * 24 )
}

// objects of type Number will converted to "Number"-cells automatically
function spreadsheetNumber(num){
    return Number(num)
}

function timestringToSeconds( timestring ){
    const [hours, minutes]= timestring.split(":");
    return hours * 3600 + minutes * 60;
}

function difftimeSeconds ( t1, t2 ){
    var s1 = timestringToSeconds(t1);
    var s2 = timestringToSeconds(t2);

    if (s1 < s2){
        s1 = s1 + 24 * 3600; 
    }
    return s1 - s2;

}

let filename = 'FlightLog.xlsx';
let sheetname = 'FlightLog';

function exportExcelLog(columns, data) {
    let dataTableArray = [];
    let dataTableColumnsArray = [];
    let columnFormat = [];

    if (columns.length === 0){
        console.log("Empty Columns");
        return;
    }
    if (data.length === 0){
        console.log("No Data");
        return;
    }
    columns.forEach(function(value, index) {
        dataTableColumnsArray.push(value.label);
        if (value.dataFormat)
        {
            columnFormat.push(value.dataFormat)
        }
        else 
        {
            columnFormat.push("")
        }
    });

    dataTableArray.push(dataTableColumnsArray);
    data.forEach(function(value, i) {
        let innerRowData = [];
        columns.forEach(function(val, j) {
            var fieldValue

            // here goes the content of the cell.
            // first case "sub": the cell is determined by a subcobject of the actual tablerow object
            // second case "field == row": the actual value is a function of the complete row
            // third case "normal": the content is either the actual field value or a function thereof
            if (val.sub){
                fieldValue = value[val.sub][val.field]
            } 
            else if (val.field === 'row')
            {
                fieldValue = value
            } else
            {
                if (Reflect.has(value, val.field)){
                    fieldValue = value[val.field]
                } else
                    fieldValue = val.field
            }

            // determine whether the field value or a function therof goes into the cell's content
            if (val.dataCalc && typeof val.dataCalc === 'function')
            {
                
                innerRowData.push(val.dataCalc(fieldValue));
            }
            else
            {
                innerRowData.push(fieldValue);
            }

        });
        dataTableArray.push(innerRowData);
    });
    let workBook = Sheets.utils.book_new();
    let workSheet = Sheets.utils.aoa_to_sheet(dataTableArray);

    // once the worksheet is available we can store the format of the individual cells
    columnFormat.forEach(function(val, i){
        if (val !== ""){       
            dataTableArray.forEach(function(row, num){
                if (num >= 1){                
                    const address = XLSX.utils.encode_cell({c: i, r: num})
                    const cell = workSheet[address]
                    delete cell.w
                    cell.z = val
                    XLSX.utils.format_cell(cell)
                }
            })
        }
    })
    Sheets.utils.book_append_sheet(workBook, workSheet, sheetname);
    Sheets.writeFile(workBook, filename);
}

function validateCharPilot(char){
    if (char.match(/[A-Z0-9äüö \-\.]/i) == null) 
    {
        return false
    }
    else 
    {
        return true
    }
}

function formatterPilot(value){
    var newstring = "";

    let l = Math.min(50, value.length)
    for (let i = 0; i < l; i++){
        if (this.validateCharPilot(value.charAt(i)) == true) {
            newstring += value.charAt(i)
        }
    }
    return newstring.trim()
}

function validateCharRegistration(char){
    if (char.match(/[A-Z0-9\-.]/i) == null) 
    {
        return false
    }
    else 
    {
        return true
    }
}

function formatterRegistration(value){
    var newstring = "";

    let l = Math.min(10, value.length)
    for (let i = 0; i < l; i++){
        if (this.validateCharRegistration(value.charAt(i)) == true) {
            newstring += value.charAt(i)
        }
    }
    return newstring.trim()
}

function eot() {
    var lat = 49.3173;
    var lon = 8.4412;
    
    var t1 = new Date(2022,1,1).getTime();
    var now = new Date(Date.now())
    var t2 = now.getTime();
    
    var days = (t2 - t1) / (1000 * 24 * 3600);
    var w = 36000.0 / 36524.0
    
    var A = (days + 9) * w
    var B = A + 1.914 * Math.sin((days - 3) * w * Math.PI / 180.0)
    var C = A - (180.0 / Math.PI) * Math.atan(Math.tan(B) / Math.cos(23.44 * (Math.PI / 180.0)))
    C = C / 180
    var NC = Math.floor(C + 0.5)
    
    return "EOT for " + now.toString() + " is " + 12 * (C - NC);
}


export default { inputValues, secondsToDateString, secondsToDateFormInputString, secondsToTimeString, timestringToSeconds,secondsToSpreadsheetTime, secondsToSpreadsheetTimeXLS, spreadsheetDuration, spreadsheetNumber, difftimeSeconds, exportExcelLog, validateCharPilot, validateCharRegistration, formatterPilot, formatterRegistration }
