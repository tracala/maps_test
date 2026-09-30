let  myWorker;
const latitude=40;
const dd_zoomFromScale=(156543.03392 * Math.cos(latitude * Math.PI / 180));

function getZoomFromScale(scale) {
  return Math.log2(dd_zoomFromScale/scale);
}

let dynamic_delay=1000;

function dynamic_throttle(fn) {
  let lastTime = 0;

  return function (...args) {
	const now = Date.now();
	if (now - lastTime >= dynamic_delay) {
	  fn.apply(this, args);
	  lastTime = now;
	}
  };
}

function dynamic_debounce(fn) {
  let timer;
  return function (...args) {
	clearTimeout(timer);
	timer = setTimeout(() => fn.apply(this, args), dynamic_delay);
  };
}



function throttle(fn, delay) {
  let lastTime = 0;

  return function (...args) {
	const now = Date.now();
	if (now - lastTime >= delay) {
	  fn.apply(this, args);
	  lastTime = now;
	}
  };
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
	clearTimeout(timer);
	timer = setTimeout(() => fn.apply(this, args), delay);
  };
}


async function flatgeobuf_deserialize(fgb){
    const fc = {type: "FeatureCollection", features: []};
    let i = 0;
    for await (const f of flatgeobuf.deserialize(fgb, undefined, undefined)) {
        fc.features.push({...f, id: i});
        i += 1;
    }
    return fc;
}


function deserialize_and_load(e,f){
    if(e.data.command=='getFGB'){
      let init_deserialize=performance.now();  
      flatgeobuf_deserialize(e.data.fgb).then(g=>{console_log('deserialize',performance.now()-init_deserialize);f(g)})
    }
    else {
        f(e.data.geojson);
    }

}

let debug_t;

function replaceNull(templateVars){
  for (const key in templateVars) {
    if(templateVars[key]==='null') templateVars[key]='';
  }
  return templateVars;
}

const fillTemplate = function(templateString, templateVars){
  if(!templateString||templateString.length==0){
    let res='';
    for (const key in templateVars) {
      res+=`<p><b>${key}:</b> ${templateVars[key]}</p>`;
    }
    return res;
  }else{
    let s=templateString;
    if(s.indexOf('${this.')<0)
      s=s.replaceAll('${','${this.');
    return new Function("return `"+ s +"`;").call(replaceNull(templateVars));
  }
}


function clearOldDataAUX(v){
  if(v)
    while(v.length>0) v.pop().remove();
  else console_log('clearOldDataAUX v is null');
}


function startReading_channel_block(port, useBatch, f) {

    let ar = [];
    cancel_current_reads = false;

    port.onmessage = (e) => {

        if (cancel_current_reads) {
            console_log('Cancelling current reads');
            cancel_current_reads = false;
            port.close();
            return;
        }

        const type = e.type;
        //const value = e.data;

        // Mensaje especial de fin
        if (type === 'end') {
            if (ar.length > 0) {
                f(ar);
            }
            ar = [];
            port.close();
            return;
        }

        
        //console.log('payload',e.data.payload);
        if(e.data)
           if(e.data.payload)
              ar.push(...e.data.payload);

        if (useBatch && ar.length >= BATCH_SIZE) {
            f(ar);
            ar = [];
        }
    };
}

function startReading_channel(port, useBatch, f) {

    let ar = [];
    cancel_current_reads = false;

    port.onmessage = (e) => {

        if (cancel_current_reads) {
            console_log('Cancelling current reads');
            cancel_current_reads = false;
            port.close();
            return;
        }

        const data = e.data;

        // Mensaje especial de fin
        if (data === '__END__') {
            if (ar.length > 0) {
                f(ar);
            }
            ar = [];
            port.close();
            return;
        }

        
        ar.push(data);

        if (useBatch && ar.length >= BATCH_SIZE) {
            f(ar);
            ar = [];
        }
    };
}


async function startReading_stream(readable,useBatch,f) {
        const reader = readable.getReader();

        let ar=[];
        cancel_current_reads=false;
        while (true) {
            if(cancel_current_reads) {
              console_log('Cancelling current reads');
              cancel_current_reads=false;
              break;
            }
            const { value, done } = await reader.read();
            if (done) {
                if(ar.length>0) f(ar);
                ar=[];
                break;
            }
            //console.log('startReading',value);
            ar.push(value);
            if(useBatch){
              if(ar.length>=BATCH_SIZE){
                  f(ar);
                  ar=[];
              }
            }
        }
    }

function init_stream_single(params,useBatch,f){
      let command='getStream';
      const { readable, writable } = new TransformStream();
      myWorker.postMessage({...params,command:command,stream:writable},[writable]);
      startReading_stream(readable,useBatch,function(ar){f(ar,params.LAYER_TO_LOAD)});
}

function init_stream_multiworker_streams(params,useBatch,f){
      let command='getStream';
      const { readable, writable } = new TransformStream();
      if(workers[params.LAYER_TO_LOAD]) 
        workers[params.LAYER_TO_LOAD].postMessage({...params,command:command,stream:writable},[writable]);
      startReading_stream(readable,useBatch,function(ar){f(ar,params.LAYER_TO_LOAD)});
}

function init_stream_multiworker_channel(params,useBatch,f){
      let command='getStream';
      const channel = new MessageChannel();
      if(workers[params.LAYER_TO_LOAD]) 
        workers[params.LAYER_TO_LOAD].postMessage({...params,command:command,port:channel.port1},[channel.port1]);
      startReading_channel(channel.port2,useBatch,function(ar){f(ar,params.LAYER_TO_LOAD)});
}

let init_stream_multiworker=USE_CHANNEL?init_stream_multiworker_channel:init_stream_multiworker_streams;



let element_to_load=0;
let default_useOrigCRS=false;

function loadNextLayer(){
  console.log('loadNextLayer');
  if(element_to_load<layer_data.length){
    let l=layer_data[element_to_load];
    element_to_load++;
    myWorker.postMessage({command:'load',LAYER_TO_LOAD:l.name,transform_epsg3857ToEpsg4326:!default_useOrigCRS,addId:true, istopojson:l.istopojson});
  }
}

function load_data(useOrigCRS){
	default_useOrigCRS=useOrigCRS;
  loadNextLayer();
  /*
  let i=0;
  for(let l of layer_data) {
      setTimeout(function(){myWorker.postMessage({command:'load',LAYER_TO_LOAD:l.name,transform_epsg3857ToEpsg4326:!useOrigCRS,addId:true, istopojson:l.istopojson})},i*3000);
      i++;
    }
  */
}



function load_shp_server(LAYER_TO_LOAD,STRATEGY,MULT,TOLERANCE){
	addId=true;
	transform_epsg3857ToEpsg4326=true;

	myWorker.postMessage({command:'load_shp_server',LAYER_TO_LOAD:LAYER_TO_LOAD,STRATEGY:STRATEGY,MULT:MULT,TOLERANCE:TOLERANCE});
}

function load_shp(LAYER_TO_LOAD,streamSHP,streamDBF,STRATEGY,MULT,TOLERANCE){
	addId=true;
	transform_epsg3857ToEpsg4326=true;

	myWorker.postMessage({command:'load_shp',LAYER_TO_LOAD:LAYER_TO_LOAD,STREAMSHP:streamSHP,STREAMDBF:streamDBF,
		STRATEGY:STRATEGY,MULT:MULT,TOLERANCE:TOLERANCE},[streamSHP, streamDBF]);
}

function load_fgb(LAYER_TO_LOAD,stream,STRATEGY,MULT,TOLERANCE){
	addId=true;
	transform_epsg3857ToEpsg4326=true;

	myWorker.postMessage({command:'load_fgb',LAYER_TO_LOAD:LAYER_TO_LOAD,STREAM:stream,
		STRATEGY:STRATEGY,MULT:MULT,TOLERANCE:TOLERANCE},[stream]);
}


 

function setDefaultOnMessage(updateResults,clearOldData){
  myWorker.onmessage = function (oEvent) {
        if(oEvent.data.command=='load') {console.log('Capa cargada. Se actualiza mapa');updateResults();setTimeout(loadNextLayer,500);}
        else if(oEvent.data.command=='clearOldData') clearOldData();
        else alert('Mensaje desconocido');
    };
}



function setDefaultOnMessageMultiWorker(updateResults,clearOldData,w){
  w.onmessage = function (oEvent) {
        if(oEvent.data.command=='load') {console.log('Capa cargada. Se actualiza mapa');updateResults();}
        else if(oEvent.data.command=='clearOldData') clearOldData();
        else if(oEvent.data.command=='cancel') {if(!getNewMap) console.log('getNewMap null');getNewMap(oEvent.data.counter);}
        else alert('Mensaje desconocido');
    };
}

function setDefaultOnMessageMultiWorker2(updateResults,clearOldData,getNewMap,w){
  w.onmessage = function (oEvent) {
        if(oEvent.data.command=='load') {console.log('Capa cargada. Se actualiza mapa');updateResults();}
        else if(oEvent.data.command=='clearOldData') clearOldData();
        else if(oEvent.data.command=='cancel') {if(!getNewMap) console.log('getNewMap null');getNewMap(oEvent.data.counter);}
        else alert('Mensaje desconocido');
    };
}

function setDefaultOnMessageSHP(updateResults,clearOldData,addLayerToMap){
  myWorker.onmessage = function (oEvent) {
        if(oEvent.data.command=='load_shp') {
          let color=getRandomColor();
          let layer_name=oEvent.data.name;
          layer_data.push({name:layer_name,min_zoom:1,max_zoom:24});

      		if(addLayerToMap) addLayerToMap(layer_name,'',oEvent.data.geometry_type,color);
          updateResults();
        
        }
        else if(oEvent.data.command=='clearOldData') clearOldData();
        else alert('Mensaje desconocido: '+oEvent.data.command);
    };
}


function getUpdateResultsFunction(u,m_delay,use_throttle){
  if(!m_delay) m_delay=DELAY;
  return (use_throttle)?throttle(u,m_delay):debounce(u,m_delay); 
}

function startWorker(){
  console.log('start worker');
  myWorker = new Worker("gt_worker.js");
}


let workers={};



function default_init_single(updateResults,clearOldData,useOrigCRS=false)  {
    startWorker();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js");
    }
    setDefaultOnMessage(updateResults,clearOldData);
    load_data(useOrigCRS);
}


function default_init_multiworker(updateResults,clearOldData,useOrigCRS=false)  {
    if ("serviceWorker" in navigator) {
      console.log('Registering service worker');
      navigator.serviceWorker.register("sw.js");
    }
    for(l of layer_data){
      workers[l.name]=new Worker("gt_worker.js");
      setDefaultOnMessageMultiWorker(updateResults,clearOldData,workers[l.name]);
      workers[l.name].postMessage({command:'load',LAYER_TO_LOAD:l.name,transform_epsg3857ToEpsg4326:!useOrigCRS,addId:true, istopojson:l.istopojson});
    }
}

function default_init_multiworker2(updateResults,clearOldData,getNewMap,useOrigCRS=false)  {
    if ("serviceWorker" in navigator) {
      console.log('Registering service worker');
      navigator.serviceWorker.register("sw.js");
    }
    for(l of layer_data){
      workers[l.name]=new Worker("gt_worker.js");
      setDefaultOnMessageMultiWorker2(updateResults,clearOldData,getNewMap,workers[l.name]);
      workers[l.name].postMessage({command:'load',LAYER_TO_LOAD:l.name,transform_epsg3857ToEpsg4326:!useOrigCRS,addId:true, istopojson:l.istopojson});
    }
}


  function cleanLayerDEF(layer_name){
      console.log('Layer '+layer_name+' not in zoom range');
  }

function getNewMapGen(m_petition,range,screen_width,cleanLayer,coef2,loadGeoJsonDataArray_){
				let map_width=(range[2]-range[0]);
				
				let zoom=27.135-Math.log2(map_width);
				//console.log('zoom',zoom,map.getZoom());

				let DINAMIC_MIN_DISTANCE=Math.round(map_width/screen_width)*coef;
				if(coef2) DINAMIC_MIN_DISTANCE*=coef2;
        if(LITE_MODE) DINAMIC_MIN_DISTANCE*=4;
			  let command='getStream';

				if(map_width<5000) {
          DINAMIC_MIN_DISTANCE=0;
          console.log('DINAMIC_MIN_DISTANCE set to 0');
        }
        
          //console.log('DINAMIC_MIN_DISTANCE',DINAMIC_MIN_DISTANCE);

          for(let l of layer_data){
					let ll=l.min_zoom;
					if(LITE_MODE) ll+=1;
					if((zoom>=ll) && (zoom<=l.max_zoom)){
						//console.log('Layer '+l.name+' in zoom range');
						let params={command:command,LAYER_TO_LOAD:l.name,
							DINAMIC_MIN_DISTANCE:DINAMIC_MIN_DISTANCE,
							xmin:range[0],ymin:range[1],xmax:range[2],ymax:range[3],
							petition:m_petition};
            if(!loadGeoJsonDataArray_) loadGeoJsonDataArray_=loadGeoJsonDataArray;
						init_stream(params,true,loadGeoJsonDataArray_); //true TODO
					} else {
						if(!cleanLayer) cleanLayer=cleanLayerDEF;
            cleanLayer(l.name);
					}
				}
}

  function default_update_results(){
  for(let l of layer_data){
    let params={command:'cancel',LAYER_TO_LOAD:l.name};
    if(workers[l.name]) workers[l.name].postMessage(params);else console.log('No se encuentra worker');
        }
    }




const MULTIWORKER=true;
const default_init=(MULTIWORKER)?default_init_multiworker:default_init_single;
const init_stream=(MULTIWORKER)?init_stream_multiworker:init_stream_single;

