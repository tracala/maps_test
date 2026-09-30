const VERSION='1.0.2';

const HALF_EARTH=20037508.34;
const FASTSET=true;

const BATCH_SIZE=500; //100; //5000
const USE_CHANNEL=true; //iphone

let clean_when_zoom_out=false;

function CUT_OUTSIDE_LINES(layer)
{
  let bo=false;
  if(layer=='rutas') bo=true;
  if(layer=='swc') bo=true;
  return bo;
}


function epsg3857ToEpsg4326(coordinates) {
  let x = coordinates[0];
  let y = coordinates[1];
  x = (x * 180) / HALF_EARTH;
  y = (y * 180) / HALF_EARTH;
  y = (Math.atan(Math.pow(Math.E, y * (Math.PI / 180))) * 360) / Math.PI - 90;
  return [x, y];
}

function epsg4326ToEpsg3857(coordinates) {
  let x = coordinates[0];
  let y = coordinates[1];
  x = (x * HALF_EARTH) / 180;
  y = Math.log(Math.tan(((90 + y) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * HALF_EARTH) / 180;
  return [x, y];
}


getLayerDataByName=function(name){
	return layer_data.filter(d=>(d.name==name))[0];
}


function console_log(...arg){
	let show_log=true;
  
  if(typeof document!=='undefined')
	  if(document.location.href.toLowerCase().indexOf('localhost')<0) show_log=false;
	
  if(show_log)
			console.log(...arg);
}


function TTick(){
  this.last_time=performance.now();
  this.init=function(){this.last_time=performance.now()};
  this.tick=function(s){
    let l=performance.now();
    let ll=l-this.last_time;
    if(ll>1000) console.log(s+' tarda '+((ll)/1000).toFixed(2));
    this.last_time=l;
  };
}

//console.log('Version '+VERSION);