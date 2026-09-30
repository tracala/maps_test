const USE_LINES=10000;
const CHUNK_SIZE=500;
const TPDATA_FOLDER='tpdata'
const COEF_MIN_DISTANCE=1.5;
const DRAFT_MODE_DISTANCE=50000000;

let draft_mode=false;
let transform_epsg3857ToEpsg4326_topojson=false;



let tick=new TTick();

let db={};


function init_dexie(database_name){
  db[database_name] = new Dexie(database_name);
  db[database_name].version(1).stores({
    data: '++,data'
  });

}

function add_dexie_data(database_name,ar)
{
  init_dexie(database_name);

  db[database_name].data
    .bulkPut(ar)
    .then(() => {
      console.log('dexie:  '+database_name+' '+ar.length);
    })
    .catch((e) => {
      if (e.name === 'BulkError') {
        // Explicitly catching the bulkPut() operation makes those successful
        // additions commit despite that there were errors.
        console.error('Dexie error');
      } else {
        console.log(e);
        throw e; // We're only handling BulkError here.
      }
    });
}

function init_dexie_t(database_name){
  db[database_name] = new Dexie(database_name);
  db[database_name].version(1).stores({
    //data: 'id,p1,p2,buf1_th1,buf_th2,bitSet' //bin
    data: 'id,p1,p2,buf1_th1Offset,buf_th2Offset,bitSetOffset,buf1_th1Length,buf_th2Length,bitSetLength' //bin
  });

}

function add_dexie_data_t_old(database_name_,ar)
{
  console.log('add_dexie_data_t',ar.length);
  let database_name=database_name_+'_t';
  init_dexie_t(database_name);

  let ar2=ar.map(i=>CBOR.encode(i));

  db[database_name].data
    .bulkPut(ar2)
    .then(() => {
      console.log('dexie_t:  '+database_name+' '+ar.length);
    })
    .catch((e) => {
      if (e.name === 'BulkError') {
        // Explicitly catching the bulkPut() operation makes those successful
        // additions commit despite that there were errors.
        console.error('Dexie error');
      } else {
        console.error(e);
        throw e; // We're only handling BulkError here.
      }
    });
}


async function  add_dexie_data_t_old2(database_name_,ar_){
  console.log('add_dexie_data_t',ar_.length);
  let ar=ar_.map( (d,i)=>({id:i,...d}));
  //console.log(ar);
  
  let database_name=database_name_+'_t';
  init_dexie_t(database_name);


  await db[database_name].transaction('rw', db[database_name].data, async () => {

      const CHUNK = 1000;

      for (let i = 0; i < ar.length; i += CHUNK) {
          await db[database_name].data.bulkPut(
              ar.slice(i, i + CHUNK)
          );
          console.log('transaccion NN'+i);
      }

  });
}


async function  add_dexie_data_t(database_name_,ar_){
  let database_name=database_name_+'_t';
  let with_log=false;
  let tick_add_dexie_data_t=new TTick();


  if(with_log) console.log('inicio add_dexie_data_t',ar_.length);
  tick_add_dexie_data_t.init();
  //let ar=ar_.map( (d,i)=>({id:i,...d}));
  //console.log(ar);
  
  //grabar en opfs
  await init_opfs('delete_bitSet.bin');
  tick_add_dexie_data_t.tick('add_dexie_data_t add binary data');

  for(let ii of ar_){
    //if(ii.bitSet.length==0) console.log(ii);

    let offset;

    if(ii.buf_th1 && (ii.buf_th1.byteLength>0)){
      offset=appendChunk8(ii.buf_th1);
      ar_.buf_th1Offset=offset;
      ar_.buf_th1Length=ii.buf_th1.byteLength;
      if(with_log) console.log('add_dexie_data_t1',ar_.buf_th1Offset,ar_.buf_th1Length);
    }
    
    if(ii.buf_th2 && (ii.buf_th2.byteLength>0)){
      offset=appendChunk8(ii.buf_th2);
      ar_.buf_th2Offset=offset;
      ar_.buf_th2Length=ii.buf_th2.byteLength;
      if(with_log) console.log('add_dexie_data_t2',ar_.buf_th2Offset,ar_.buf_th2Length);
    }
    
    
    if(ii.bitSet && (ii.bitSet.byteLength>0)){
      offset=appendChunk32(ii.bitSet);
      ar_.bitSetOffset=offset;
      ar_.bitSetLength=ii.bitSet.byteLength;
      if(with_log) console.log('add_dexie_data_t bitSet',ar_.bitSetOffset,ar_.bitSetLength);
    }
  }
  flush();

  tick_add_dexie_data_t.tick('add_dexie_data_t after flush');

  if(with_log)console.log('med add_dexie_data_t'+ar_.length);

  let ar=ar_.map( (d,i)=>({
    id:i,x1:d.x1,x2:d.x2,y1:d.y1,y2:d.y2,
    buf_th1Offset:d.buf_th1Offset,
    buf_th1Length:d.buf_th1Length,
    buf_th2Offset:d.buf_th2Offset,
    buf_th2Length:d.buf_th2Length,
    bitSetOffset:d.bitSetOffset,
    bitSetLength:d.bitSetLength
  }));
  tick_add_dexie_data_t.tick('add_dexie_data_t after ar map');

  init_dexie_t(database_name);
  tick_add_dexie_data_t.tick('add_dexie_data_t before bulkPut');
  await db[database_name].data.bulkPut(ar);
  if(with_log) console.log('fin add_dexie_data_t'+ar_.length);
  tick_add_dexie_data_t.tick('add_dexie_data_t '+database_name+' '+ar_.length);
}



function get_dexie_data(database_name,i_ar){
  return db[database_name].data.bulkGet(i_ar.map(i=>i+1));
}


function decodeArc(topology, arc) {
  var x = 0, y = 0;
  return arc.map(function(position) {
    position = position.slice();
    position[0] = (x += position[0]) * topology.transform.scale[0] + topology.transform.translate[0];
    position[1] = (y += position[1]) * topology.transform.scale[1] + topology.transform.translate[1];
    return position;
  });
}

function decodeArcSimple(arc) {
  var x = 0, y = 0;
  return arc.map(function(position) {
    position = position.slice();
    position[0] = (x += position[0]) ;
    position[1] = (y += position[1]) ;
    return position;
  });
}

function encodeArcSimple(arc, round) {
  var x = 0, y = 0;
  return arc.map(function(position) {
    var dx = position[0] - x;
    var dy = position[1] - y;
    
    // Actualizamos el acumulador con el valor absoluto actual
    x = position[0];
    y = position[1];
    
    // Retornamos el delta calculado
    return round?[Math.round(dx), Math.round(dy)]:[dx, dy];
  });
}




async function descomprimirAString(binario, format = 'gzip') {
  const ds = new DecompressionStream(format);
  const decompressedStream = new Blob([binario]).stream().pipeThrough(ds);
  const response = new Response(decompressedStream);
  const buffer = await response.arrayBuffer();
  
  return new TextDecoder().decode(buffer);
}

async function descomprimirFichero(file_name){
  const file=`${TPDATA_FOLDER}/${file_name}.gz`;
  return descomprimirAString(await fetch(file).then(response => response.arrayBuffer()));
}


async function readCompressedCBOR(file_name) {
  // 1. Descargar el archivo
  let tick_readCompressedCBOR=new TTick();
  tick_readCompressedCBOR.init();

  const response = await fetch(`${TPDATA_FOLDER}/${file_name}.bin`);
  tick_readCompressedCBOR.tick('Leido '+file_name);

  // 2. Obtener el stream del body
  const compressedStream = response.body;

  // 3. Descomprimir (gzip)
  const decompressedStream = compressedStream.pipeThrough(
    new DecompressionStream('gzip')
  );

  // 4. Convertir a ArrayBuffer
  const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
  tick_readCompressedCBOR.tick('decompressedBuffer '+file_name);

  // 5. Decodificar CBOR
  let decoded_data=CBOR.decode(new Uint8Array(decompressedBuffer));
  tick_readCompressedCBOR.tick('decoded_data '+file_name);
  return decoded_data;
}



function convertCoordsTo4326(coordinates){
  if(Array.isArray(coordinates[0])){
    if(!Array.isArray(coordinates[0][0])){
      return coordinates.map(epsg3857ToEpsg4326);
    }else{  
      return coordinates.map(convertCoordsTo4326);
    }
  } else return coordinates;
}



let topo_layers={};;
let l_properties_columns={};

async function decompresstp_(file_name){
  //Filtro por lista IDs + sacar solo arcos contenidos
  //spatial index + candidatos
  
  
  let DECOMPRESS_PROPERTIES=true;
  
  tick.init();
  //V3  Paralelizar con worker, comlink
  let useV3=true;
  

  let [topo_data,decoded_data2,gt_arcs]=await Promise.all([
      readCompressedCBOR(file_name+'_g'),
      readCompressedCBOR(file_name+'_a'),
      useV3?readCompressedCBOR(file_name+'_t'):null
  ]);
  

  tick.tick('Leido '+file_name);
  //await add_dexie_data_t('cb3_'+file_name,gt_arcs);
  
  console.log('gt_arc0',gt_arcs[0]);
  
  //No grabar en OPFS
  //await add_dexie_data_t('delete_'+file_name,gt_arcs);

  /*
  
  console.log('data_t',await get_dexie_data('cb2_'+file_name+'_t',[1,2,3]));
  */

  
  /*
  const CHUNK_SIZE=10000;
  for (let i = 0; i < gt_arcs.length ; i += CHUNK_SIZE) { //gt_arcs.length
      const chunk = gt_arcs.slice(i, i + CHUNK_SIZE);
      await add_dexie_data_t('cb_'+file_name, chunk);
      console.log(i);
  }
  */





  if(useV3) if(gt_arcs) topo_data.gt_arcs=gt_arcs;
          
        if(DECOMPRESS_PROPERTIES){
            await Promise.all(Object.keys(topo_data.objects).map(async  function(key) {
              let exist_dexie = await Dexie.exists(key);
              //exist_dexie=false; //TODO: quitar, solo para pruebas


              //TODO: varias entidades
              setStrategyMode(decoded_data2.objects[key].STRATEGY=='SIMPLE',file_name,decoded_data2.objects[key].MULT);  
              //console.log('strategy',decoded_data2.objects[key].STRATEGY,file_name,decoded_data2.objects[key].MULT);  

                
              topo_data.objects[key].spatial_index=new Flatbush(topo_data.objects[key].geometries.length,16,Int32Array,ArrayBuffer);
              topo_data.objects[key].bbox_array=[];

              try{
                let ar=decoded_data2.objects[key].bboxes;
                //FastIntegerCompression.uncompressSigned(decoded_data2.objects[key].bboxes);
                let x1=ar.slice(0,ar.length/4);
                let x2=ar.slice(ar.length/4,ar.length/2);
                let y1=ar.slice(ar.length/2,3*ar.length/4);
                let y2=ar.slice(3*ar.length/4);
                
                //console.log('properties_columns',decoded_data2.objects[key].properties_columns)

                l_properties_columns[key]=decoded_data2.objects[key].properties_columns.split(';').slice(0,-1);
                
                //console.log('properties_columns',properties_columns);
                //console.log('properties_columns',properties_columns.map((s)=>'<p>'+s+': <b>${'+s+'}</b></p>').join(''));
                // //await descomprimirAString(decoded_data2.objects[key].properties_values);
                //properties_data[key]=desc_text.split('\n');
                if(exist_dexie) {
                  await init_dexie(key);
                  await db[key].open();
                  let element_count=await db[key].data.count();
                  exist_dexie=element_count>0;
                  console.log(`La base de datos ${key} contiene ${element_count} elementos.`);
                }

                if(!exist_dexie) {
                  //leer fichero v
                  //let desc_text=decoded_data2.objects[key].properties_values;
                  let desc_text=await descomprimirFichero(file_name+'_v');
                  let temp_properties_data=desc_text.split('\n');
                  console.log(`La base de datos ${key} no existe, crearla`);
                  await add_dexie_data(key,temp_properties_data);
                }
                else {
                  console.log(`La base de datos ${key} existe, reusarla`);
                }
                
                /*
                delete decoded_data2.objects[key].bboxes;
                delete decoded_data2.objects[key].properties_columns;
                delete decoded_data2.objects[key].properties_values;
                */

              
              let ii=0;
              //console.log(topo_data.objects[key].geometries[0]);
              for (const l of topo_data.objects[key].geometries) {
                l.properties={};
                
                let range=[x1[ii],y1[ii],x2[ii],y2[ii]];
                topo_data.objects[key].spatial_index.add(...range);
                topo_data.objects[key].bbox_array.push(range);


                ii++;

                //if(ii%1E5==0) {console.log(ii,range);}
              }

              topo_data.objects[key].spatial_index.finish();
              

              } catch (error) {
                    console.error("Error procesando el fichero:", error.message,error);
              }
            }));


          }
  
  tick.tick('Procesado '+file_name);
  topo_layers[file_name]=topo_data;
  //console.log('Leido TP '+file_name);
}

async function* iterateFeatures_block_lines(topo_data,key, candidates,min_distance,layer){
              let arc_id=[];
              let ar_aux=candidates.map(i=>topo_data.objects[key].geometries[i]);
              let ar=ar_aux.map(g=>g.arcs);
              
              ar=ar.flat(Infinity);
              ar=ar.map(i=>(i>=0)?i:~i);
              arc_id=arc_id.concat(ar);

              arc_id=[...new Set(arc_id)].sort((a, b) => a - b);

              let arcs=[];
              for(let i of arc_id){
                let f={};
                f.type="Feature";
                let l=topo_data.gt_arcs[i];
                //TODO: MIN_DISTANCE
                let gt= gaptree2polygon_profundidad_aux(l,layer,min_distance,!draft_mode);
                //console.log(gt);
                gt=encodeArcSimple(gt,false);
                gt=decodeArc(topo_data,gt);
                if(transform_epsg3857ToEpsg4326_topojson){
                    gt=convertCoordsTo4326(gt);
                }
                //console.log(gt);
                f.geometry={};
                f.geometry.type="LineString";
                f.geometry.coordinates=gt;
                yield f;
              }

}


async function* iterateFeatures_block(topo_data,key, candidates,min_distance,layer){

              //TODO:filtrar los pequeños
              let output_topojson={};

              output_topojson.type=topo_data.type;
              
              if(transform_epsg3857ToEpsg4326)
                output_topojson.transform={"scale":[1,1],"translate":[0,0]};
              else
                output_topojson.transform=topo_data.transform;
              
              if(!output_topojson.objects) output_topojson.objects={};
              output_topojson.objects[key]={}
              output_topojson.objects[key].type=topo_data.objects[key].type;
              
              
              let dexie_data=await get_dexie_data(key,candidates);

              const dexie_data_map = Object.fromEntries(
                  candidates.map((candidate, i) => [candidate, dexie_data[i]])
              );              

              output_topojson.objects[key].geometries=candidates.map(
                i=>{
                  let l=topo_data.objects[key].geometries[i];

                  //console.log(properties_data[key][i]);
                  //let values_lines=properties_data[key][i].split(';');
                  
                  let values_lines='';
                  if(dexie_data_map[i]) values_lines=dexie_data_map[i].split(';');else console.log('dexie_data_map '+i+' vale null');
                  
                  let c_i=0;
                  for(let c of l_properties_columns[key]){
                    l.properties[c]=values_lines[c_i]??'';
                    c_i++;
                  }
                  //20260926
                  if(addColor) {
                    l.properties.color=getSymbology(key,l.properties,i);
                    if(!l.properties['TEXTO'])  l.properties['TEXTO']='';
                  }
                  if(addTexture) if(!l.properties.texture) l.properties.texture=i % MAX_TEXTURES; //Math.ceil(Math.random()*MAX_TEXTURES);




                  //console.log(l.properties);
                  return l;
                  
                });
              
              /*
              //let arc_id=[];
              let ar=output_topojson.objects[key].geometries.map(g=>g.arcs);
              ar=ar.flat(Infinity);
              ar=ar.map(i=>(i>=0)?i:~i);
              arc_id=arc_id.concat(ar);


              
              arc_id=[...new Set(arc_id)].sort((a, b) => a - b);
              */
          

              //console.log('v2');
              const arcSet = new Set();

              for (const g of output_topojson.objects[key].geometries) {
                const stack = [g.arcs];
                
                while (stack.length) {
                  const item = stack.pop();
                  
                  if (Array.isArray(item[0])) {
                    stack.push(...item);
                  } else {
                    for (let i of item) {
                      arcSet.add(i >= 0 ? i : ~i);
                    }
                  }
                }
              }

              const arc_id = Array.from(arcSet).sort((a,b)=>a-b);


              let arcs=[];
              for(let i of arc_id){
                let l=topo_data.gt_arcs[i];
                //TODO: MIN_DISTANCE
                let gt= gaptree2polygon_profundidad_aux(l,layer,min_distance,!draft_mode);

                //TODO: redondear?
                arcs[i]=encodeArcSimple(gt,false);
              }
              
              for(let i=0;i<arcs.length;i++){
                if(!arcs[i]) arcs[i]=[];
              }

                output_topojson.arcs=arcs;

                const geojson = topojson.feature(
                    output_topojson,
                    output_topojson.objects[key]
                );
                let counter=0;
                let features=geojson.features;
                for(let f of features){
                    if(addId) {
                        if(!f.id) f.id=candidates[counter];
                        counter++
                    }
                    if(transform_epsg3857ToEpsg4326_topojson){
                        f.geometry.coordinates=convertCoordsTo4326(f.geometry.coordinates);
                    }
                    yield f;
                }

}

async function* iterateFeatures(topo_data,key, candidates, min_distance,layer){
            //let f=(candidates.length>USE_LINES)?iterateFeatures_block_lines:iterateFeatures_block;
            let f=iterateFeatures_block;
            if(draft_mode) f=iterateFeatures_block_lines;

            for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
                const chunk = candidates.slice(i, i + CHUNK_SIZE);

                yield* f(topo_data,key, chunk,min_distance,layer);
            }
}


async function* reload_iterable_tp(layer,minX, minY, maxX, maxY,DINAMIC_MIN_DISTANCE,preserve_data){

  
  let start=performance.now();
  draft_mode=(maxX-minX)>DRAFT_MODE_DISTANCE;
  
  VIEW_RECT=[minX, minY, maxX, maxY];



  let topo_data=topo_layers[layer];
  if(topo_data==null){
    console.log(layer +'no cargado');
    return;
  }

  let coef_min_distance_aux=(topo_data.transform.scale[0]+topo_data.transform.scale[0])/2;
  coef_min_distance_aux=1/coef_min_distance_aux;
  //console.log('coef_min_distance_aux',coef_min_distance_aux);

  let min_distance=DINAMIC_MIN_DISTANCE*coef_min_distance_aux; //COEF_MIN_DISTANCE
  //console.log('min_distance',min_distance);
  
  if(draft_mode) min_distance*1.5;
  MIN_DISTANCE=min_distance;


  //TODO: nombre de capa si hay más de una
  let key=null;
  if(!key) key= Object.keys(topo_data.objects)[0];

  //console.log('2',topo_data.objects[key].bbox_array[1]);
  
  
  //let candidates=topo_data.objects[key].spatial_index.search(minX,minY,maxX,maxY);
  //console.log('rango a buscar',minX, minY, maxX, maxY,'candidates',candidates.length);
  
  
    let foundIds;
    let elem=topo_data.objects[key].spatial_index.search(minX, minY, maxX, maxY);
    if(elem.length>MAX_ELEMS){
      elem=elem.slice(0,MAX_ELEMS);
      console.log('Se recorta numero resultados '+MAX_ELEMS);
    }
	if(FASTSET){
		foundIds = new FastBitSet(elem);
		if(!preserve_data) loaded_ids[layer]=foundIds;
		else{
			if(!loaded_ids[layer]) loaded_ids[layer]=new FastBitSet([]);
			foundIds.difference(loaded_ids[layer]);
			loaded_ids[layer].union(foundIds);
		}
		console_log(foundIds.size()+' elementos a representar ('+layer+')');
	}
	else{
		foundIds = new Set(elem);
		if(!preserve_data) loaded_ids[layer]=foundIds;
		else{
			//let ll=performance.now();
			//console_log(foundIds.size+' elementos a representar antes ('+layer+')');
			if(!loaded_ids[layer]) loaded_ids[layer]=new Set([]);
			foundIds=foundIds.difference(loaded_ids[layer]);
			loaded_ids[layer]=loaded_ids[layer].union(foundIds);
			//console.log('Set2 Tarda',performance.now()-ll);
		}
		console_log(foundIds.size+' elementos a representar ('+layer+')');
	}

    let candidates=[];

	let discarted=0;
	let num_features=foundIds.size();
	let big_lot_of_features=(num_features>LOT_OF_FEATURES);
	let coef_to_discard=SMALL_FILTER;
	
	if(false){
        if(num_features>(LOT_OF_FEATURES*50)) coef_to_discard*=5; else
        if(num_features>(LOT_OF_FEATURES*20)) coef_to_discard*=3; else
        if(num_features>(LOT_OF_FEATURES*15)) coef_to_discard*=2.5; else
        if(num_features>(LOT_OF_FEATURES*10)) coef_to_discard*=2; else
        if(num_features>(LOT_OF_FEATURES*5))  coef_to_discard*=1.5;
    }


	if(coef_to_discard!=SMALL_FILTER) console.log('coef_to_discard',coef_to_discard,num_features);


	//console.log('big_lot_of_features',big_lot_of_features);
	for(let feature of foundIds){
			let addElement=true;
			
			
			//console.log(MIN_DISTANCE,FULL_RESOLUTION);
			//if(MIN_DISTANCE>FULL_RESOLUTION)
				let coef_size=1;

                let coord=(topo_data.objects[key].bbox_array[feature]);
                //console.log(coord);
                let distance_=distance({x:coord[0],y:coord[1]},{x:coord[2],y:coord[3]});
                coef_size=distance_/(maxX-minX);
                //console.log(coef_size);

			
			
				if(big_lot_of_features && FILTER_SMALL_GEOMETRIES){
					//Mirar diagonal del bbox
                    if(coef_size<coef_to_discard) {
                        addElement=false;
                        discarted++;
                        //console.log('Descartada '+feature+' '+coef_size+'  '+distance_,maxX-minX);
                    }
			};
			if(addElement){
                    candidates.push(feature);
			} 
	
	}	
	
	if(discarted>0) console_log('Descartados '+discarted+'/'+num_features+' elementos por ser pequeños ('+layer+')');
    candidates=candidates.sort((a,b)=>a-b);
    console_log('RITP Tarda '+Math.round(performance.now()-start));
    //console_log(key,layer);
    yield* iterateFeatures(topo_data, key, candidates,min_distance,layer);
}
