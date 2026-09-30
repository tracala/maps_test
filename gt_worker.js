const DATA_FOLDER='data';
const MAX_TEXTURES=10;
const AREA_DIFF=10;
let cancel_current_reads=false;

let  MAX_ELEMS=50000;
let EXPAND_BBOX=null;

let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if(isSafari) {console.log('Safari');MAX_ELEMS=1000;}



const js_list='lib/dexie,lib/topojson-client.min,lib/FastIntegerCompression,lib/Flatbush,lib/FastBitSet,lib/shapefile,lib/cborx,utils_c,simbology,geomGT,worker_opfs,compact2geojson.lite_,compacttp2geojson.lite_'; //cbor,utils,shp2compact,
const ar=js_list.split(',').map(s=>'js/'+s+'.js');
importScripts.apply(this, ar);


async function convertGeoJSONtoFGB(geojsonObject) {
    const fgbArrayBuffer = await flatgeobuf.serialize(geojsonObject);
    return fgbArrayBuffer;
}


let loaded_data={};
let petition_counter={};
let cancel_previous={};

let commands={};
commands['load']=function(ar){
        decompress(ar.LAYER_TO_LOAD,ar.transform_epsg3857ToEpsg4326,ar.addId,ar.istopojson).then(() => {
          loaded_data[ar.LAYER_TO_LOAD]=true;
          console.log('Leido fichero '+ar.LAYER_TO_LOAD);
          postMessage({command:'load'});
        });
}
commands['load_shp']=function(ar){
        let layer_name=ar.LAYER_TO_LOAD;
        shp2compact(layer_name,ar.STREAMSHP,ar.STREAMDBF,
                    ar.STRATEGY,ar.MULT,ar.TOLERANCE).then(()=>{
          loaded_data[layer_name]=true;
          console_log('Loaded SHP',layer_name);
          postMessage({command:'load_shp',name:layer_name,geometry_type:layers_data[layer_name].geometry_type});
        });
}

commands['load_fgb']=function(ar){
        let layer_name=ar.LAYER_TO_LOAD;
        fgb2compact(layer_name,ar.STREAM,
                    ar.STRATEGY,ar.MULT,ar.TOLERANCE).then(()=>{
          loaded_data[layer_name]=true;
          console_log('Loaded FGB',layer_name);
          postMessage({command:'load_fgb',name:layer_name,geometry_type:layers_data[layer_name].geometry_type});
        });
}


commands['load_shp_server']=function(ar){
          let layer_name=ar.LAYER_TO_LOAD;
          shp2compact_server(layer_name,ar.STRATEGY,ar.MULT,ar.TOLERANCE).then(()=>{
            loaded_data[layer_name]=true;
            console_log('Loaded SHP',layer_name);
            postMessage({command:'load_shp',name:layer_name});
          });
}


commands['cancel']=function(layer){
            if(!petition_counter[layer]) petition_counter[layer]=0;
            petition_counter[layer]++;  
            postMessage({command:'cancel',counter:petition_counter[layer]});
}


let last_area=0;


async function getStream_transferable(e){
          let layer=e.data.LAYER_TO_LOAD;
          //if(!petition_counter[layer]) petition_counter[layer]=0;
          //petition_counter[layer]++;  
          //TODO

          let petition=(e.data.petition)?e.data.petition:petition_counter[layer];
          const writable = e.data.stream;
          const writer = writable.getWriter();  
          let new_area=(e.data.xmax-e.data.xmin)*(e.data.ymax-e.data.ymin);
          let preserve_data=( (last_area)<=(new_area + AREA_DIFF))
          
          if(clean_when_zoom_out){
            if(new_area>last_area*1.10) preserve_data=false;
          }
          //Math.abs(last_area-new_area)<AREA_DIFF;
          last_area=new_area;

          if(CUT_OUTSIDE_LINES(e.data.LAYER_TO_LOAD)) preserve_data=false;

          if(!preserve_data) {
            loaded_ids={};
            cancel_current_reads=true;
            postMessage({command:'clearOldData'})
          };
          let d=e.data.DINAMIC_MIN_DISTANCE;
          //if(LITE_MODE) d=0;
          let arg=[layer,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,d,preserve_data];
          let istopojson = (topo_layers[layer]!=null);

          let f=istopojson?reload_iterable_tp:reload_iterable_gt;
          //console.log('getStream',...arg);
          let iterable_start=performance.now();
          const iterable=f(...arg);
          for await (const feature of iterable) {
            if(petition_counter[layer]>petition) {console.log('New operation in progress');break;}
            writer.write(feature);
          }
          await writer.close();
          //console.log('iterable v1 '+layer+' '+(performance.now()-iterable_start)/1000);
}

async function getStream_channel_BLOCK(e){
          const CHANNEL_BATCH_SIZE=BATCH_SIZE;
          
          let layer=e.data.LAYER_TO_LOAD;
          if(!petition_counter[layer]) petition_counter[layer]=0;
          petition_counter[layer]++;  
          let petition=petition_counter[layer];
          const port = e.data.port;
          let new_area=(e.data.xmax-e.data.xmin)*(e.data.ymax-e.data.ymin);
          let preserve_data=( (last_area)<=(new_area + AREA_DIFF))
          
          if(clean_when_zoom_out){
            if(new_area>last_area*1.10) preserve_data=false;
          }
          //Math.abs(last_area-new_area)<AREA_DIFF;
          last_area=new_area;

          if(CUT_OUTSIDE_LINES(e.data.LAYER_TO_LOAD)) preserve_data=false;

          if(!preserve_data) {loaded_ids={};cancel_current_reads=true;postMessage({command:'clearOldData'})};
          
          let arg=[layer,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,e.data.DINAMIC_MIN_DISTANCE,preserve_data];
          let istopojson = (topo_layers[layer]!=null);

          let f=istopojson?reload_iterable_tp:reload_iterable_gt;
          //console.log('getStream',...arg);
          let iterable_start=performance.now();
          const iterable=f(...arg);
          let block=[];
          for await (const feature of iterable) {
            if(petition_counter[layer]>petition) {console.log('New operation in progress');break;}
            block.push(feature);
            if(block.length>=CHANNEL_BATCH_SIZE){
              port.postMessage({type: 'data',payload:block});
              block=[];
            }
            //port.postMessage(feature);
          }
          if(block.length>0)
              port.postMessage({type: 'data',payload:block});

           port.postMessage({type:'end'});
          //console.log('iterable v1 '+layer+' '+(performance.now()-iterable_start)/1000);
}


async function getStream_channel(e){
          
          let iterable_start=performance.now();

          let layer=e.data.LAYER_TO_LOAD;
          
          //if(!petition_counter[layer]) petition_counter[layer]=0;
          //petition_counter[layer]++;  

          //console.log('e.data.petition',e.data.petition);

          let petition=(e.data.petition)?e.data.petition:petition_counter[layer];

          const port = e.data.port;
          let new_area=(e.data.xmax-e.data.xmin)*(e.data.ymax-e.data.ymin);
          let preserve_data=( (last_area)<=(new_area + AREA_DIFF))
          
          if(clean_when_zoom_out){
            if(new_area>last_area*1.10) preserve_data=false;
          }
          //Math.abs(last_area-new_area)<AREA_DIFF;
          last_area=new_area;

          if(CUT_OUTSIDE_LINES(e.data.LAYER_TO_LOAD)) preserve_data=false;

          if(!preserve_data) {
            loaded_ids={};
            cancel_current_reads=true;
            cancel_previous[layer]=petition;
            postMessage({command:'clearOldData'})
          };
          
          let arg=[layer,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,e.data.DINAMIC_MIN_DISTANCE,preserve_data];
          let istopojson = (topo_layers[layer]!=null);

          let f=istopojson?reload_iterable_tp:reload_iterable_gt;
          //console.log('getStream',...arg);
          const iterable=f(...arg);
          let counter=0;
          let cancelled_message_sent=false;
          for await (const feature of iterable) {
            if(petition_counter[layer]>petition) {if(!cancelled_message_sent){console.log('Cancelled: New operation in progress ' + petition_counter[layer]+' ' +petition);cancelled_message_sent=true;/*break*/;}};
            if(cancel_previous[layer]) if(cancel_previous[layer]>petition) {if(!cancelled_message_sent){console.log('Reset old petition' + cancel_previous[layer]+' ' +petition);;break;}};
            counter++;
            if(counter>MAX_ELEMS) {console.log('MAX_ELEMS`:'+MAX_ELEMS);break;}
            port.postMessage(feature);
          }
          console.log('Petition ' + (petition??'') + ' '+layer+' '+(performance.now()-iterable_start).toFixed(2)+ '  '+counter);

           port.postMessage('__END__');
          //console.log('iterable v1 '+layer+' '+(performance.now()-iterable_start)/1000);
}

onmessage = async(e) => {

  if(e.data.command=='load'){
    commands['load'](e.data);
  }else
  if(e.data.command=='load_shp'){
    commands['load_shp'](e.data);
  }else
  if(e.data.command=='load_fgb'){
    commands['load_fgb'](e.data);
  }else
  if(e.data.command=='load_shp_server'){
    commands['load_shp_server'](e.data);
  }else
    {
    if(!loaded_data[e.data.LAYER_TO_LOAD]){
      console.log('Not yet loaded '+e.data.LAYER_TO_LOAD);
    }
      else 
       if(e.data.command=='deletebitmapindex'){
          //console.log('Deleteb de '+e.data.LAYER_TO_LOAD);
          loaded_ids[e.data.LAYER_TO_LOAD]=null;
      }  else
       if(e.data.command=='cancel'){
         commands['cancel'](e.data.LAYER_TO_LOAD);
      }  else
       if(e.data.command=='getStream'){
         if(USE_CHANNEL) await getStream_channel(e);else await getStream_transferable(e);
      }
      else 
      if(e.data.command=='getCBR'){
          const cbr=reload_cbr(e.data.LAYER_TO_LOAD,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,e.data.DINAMIC_MIN_DISTANCE);
          postMessage({command:'getCBR',cbr:cbr},[cbr.buffer]);
      }
      else      
      if(e.data.command=='getIterable'){
          const iterable=reload_iterable_gt(e.data.LAYER_TO_LOAD,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,e.data.DINAMIC_MIN_DISTANCE);
          postMessage({command:'getIterable',iterable:iterable});
      }
      else      
      {
        console.log('Comando ' +e.data.command);
        const geojson=reload(e.data.LAYER_TO_LOAD,e.data.xmin, e.data.ymin, e.data.xmax, e.data.ymax,e.data.DINAMIC_MIN_DISTANCE);
        if(e.data.command=='getData')
          postMessage({command:'getData',geojson:geojson});
        else
        if(e.data.command=='getFGB'){
          let init_serialize=performance.now();
          convertGeoJSONtoFGB(geojson).then(fgb=>{console_log('serialize',performance.now()-init_serialize);postMessage({command:'getFGB',fgb:fgb},[fgb.buffer])});  //,[fgb]
        }
        else{
          console_log('Comando desconocido '+e.data.command);
        }
      }
  }
};
