# fltlog - a flight log frontend

fltlog allows you to upload your flight tracks (as *.gpx files) to the [mngfltlg](https://github.com/staski/mngfltlg) backend, which converts the files to log entries and returns them in JSON format. The log entries are displayed as an html table. You can select and edit individual entries and export them in excel format either as pilot log entries or as aricraft log entries.

In addtion to the log entries, basic flight statistics are collected, returned and can be displayed for each flight.

Neither fltlog nor its associated backend service (cgi-script [gpx2fltlog](https://github.com/staski/mngfltlg/blob/master/gpx2fltlog.pl)) stores any data. The gpx files and any data derived therof are are discarded in the backend after the log entries have been returned to the frontend.


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
git clone git@github.com:staski/fltlog.git
cd fltlog
npm install
npm run dev
```

    
### Compile and Minify for Production

```sh
npm run build
```
