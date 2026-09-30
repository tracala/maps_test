const maxZoom=22;
const minZoom=4;

const DELAY=1000;
const USE_FGB=true;

const murl=document.location.href.toLowerCase();
const BATCH_SIZE=5000;



let MIN_ZOOM_FOR_DATA_=6;


let LAYER_TO_LOAD_;
let CLICK_TEMPLATE_;
let initial_zoom;

initial_coordinates=[-5.931243896484375,43.27820513231556];
initial_zoom=9;
CLICK_TEMPLATE_="<p>Referencia: <b>${REFCAT}</b></p><p>Area: <b>${AREA}</b></p>";

let layer_data=[]


let coef=10;
let map;
let debug;



function init_fileinput(){
    const fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;

        if (files.length == 1) {
              const file = files[0];

              console.log(`Sending: ${file.name}`);

              const stream = file.stream();
              let s=file.name.toLowerCase();
              s=s.substring(0,s.indexOf('.'));
              load_fgb(s,stream,'SIMPLE',10,10);
        }else
        if(files.length==2){
              const fileA = files[0];
              const fileB = files[1];

              console.log(`Sending: ${fileA.name} y ${fileB.name}`);

              // TRUCO: Convertir File -> ReadableStream
              const streamA = fileA.stream();
              const streamB = fileB.stream();
              function getStream(ext){
                return (fileA.name.toLowerCase().indexOf('.'+ext.toLowerCase())>0)?streamA:streamB
              }
              const streamSHP=getStream('shp');
              const streamDBF=getStream('dbf');
              let s=fileA.name.toLowerCase();
              s=s.substring(0,s.indexOf('.'));
              load_shp(s,streamSHP,streamDBF,'SIMPLE',10,10);
        }
        else{
          alert("Por favor selecciona archivos.");
          return;
        }
    });
}


document.addEventListener("DOMContentLoaded", init_fileinput);
