# fltlog - a flight log frontend

fltlog allows you to upload your flight tracks (as *.gpx files) to the [mngfltlg](mngfltlg) backend, which converts the files to log entries and returns them in JSON format. The log entries are displayed in a html table. You can select and edit individual entries and export them in excel format either as pilot log entries or as aricraft log entries.

In addtion to the log entries, some flight statistics are calculated and may be shown for each flight.

Neither fltlog nor its associated backend store any data persistently. The gpx files are only sent to the backend for conversion to the log format.


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
