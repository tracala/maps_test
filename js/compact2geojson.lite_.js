let debug_tol,debug_ll,debug_full;


//let MULT=1;
//let MULT2=1;
//let MULT3=1;

//const FULL_RESOLUTION=500; //50;
const FULL_RESOLUTION=30000; //50;

const FILTER_SMALL_GEOMETRIES=true;
const LOT_OF_FEATURES=3000;

//const SMALL_FILTER=1/250;//0.0001; //0.00001;

const SMALL_FILTER=1/500;
const CUT_TREE=false;


function distance(p1,p2){
	return Math.sqrt( (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
}

/*********************************************************************************************************************************************************** */


let file_name=''; //'parroquias_3857';
let addId=true;
let addColor=true;
let addTexture=true;
let transform_epsg3857ToEpsg4326=true;
let MIN_DISTANCE=100;
let VIEW_RECT=null;
let OUT_OF_RECT=false;
let CURRENT_ID=null;

const isGeographic=false;
const GEOGRAPHIC_COORDS_MULT=111320/0.1;
const MIN_DISTANCE_BBOX=1;

let layers_data=[];
let spatial_index=[];


async function getData(url) {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
		console.log('Error con '+url);
      throw new Error(`Error al leer el fichero: ${respuesta.status}`);
    }

    const buffer = await respuesta.arrayBuffer();
    return buffer;
  } catch (error) {
    console.error("Error:", error,url);
  }
}



function expandBoundingBox(bbox, porcentaje) {
  if (!Array.isArray(bbox) || bbox.length !== 4) {
    throw new Error("El bounding box debe ser un array de 4 números: [xMin, yMin, xMax, yMax]");
  }

  const [xMin, yMin, xMax, yMax] = bbox;
  const ancho = xMax - xMin;
  const alto = yMax - yMin;

  const factor = porcentaje / 100;

  // Calcular la cantidad a ampliar en cada dirección
  const deltaX = (ancho * factor) / 2;
  const deltaY = (alto * factor) / 2;

  // Devolver el bbox ampliado
  return [
    xMin - deltaX,
    yMin - deltaY,
    xMax + deltaX,
    yMax + deltaY
  ];
}



let geojson_template=null;
let geojson;



let loaded_ids={};


function* reload_iterable_gt(layer,minX, minY, maxX, maxY,DINAMIC_MIN_DISTANCE,preserve_data){
  
  VIEW_RECT=[minX, minY, maxX, maxY];
  if(EXPAND_BBOX) [minX, minY, maxX, maxY]=expandBoundingBox([minX, minY, maxX, maxY],EXPAND_BBOX);
  
  
  let data=layers_data[layer];
  let start=performance.now();
	
	
	MIN_DISTANCE=DINAMIC_MIN_DISTANCE;
	
	let foundIds;
	let start_set=performance.now();
	if(FASTSET){
		foundIds = new FastBitSet(spatial_index[layer].search(minX, minY, maxX, maxY));
		if(!preserve_data) loaded_ids[layer]=foundIds;
		else{
			if(!loaded_ids[layer]) loaded_ids[layer]=new FastBitSet([]);
			foundIds.difference(loaded_ids[layer]);
			loaded_ids[layer].union(foundIds);
		}
		console_log(foundIds.size()+' elementos a representar ('+layer+')');
	}
	else{
		foundIds = new Set(spatial_index[layer].search(minX, minY, maxX, maxY));
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
	//console_log('SET Tarda ',(performance.now()-start_set).toFixed(2))

	//console_log(MIN_DISTANCE,FULL_RESOLUTION);

	let discarted=0;
	let num_features=foundIds.size();
	let big_lot_of_features=(num_features>LOT_OF_FEATURES);
	let coef_to_discard=SMALL_FILTER;
	
	/*
	if(num_features>(LOT_OF_FEATURES*50)) coef_to_discard*=5; else
	if(num_features>(LOT_OF_FEATURES*20)) coef_to_discard*=3; else
	if(num_features>(LOT_OF_FEATURES*15)) coef_to_discard*=2.5; else
	if(num_features>(LOT_OF_FEATURES*10)) coef_to_discard*=2; else
	if(num_features>(LOT_OF_FEATURES*5))  coef_to_discard*=1.5;
	*/

	if(coef_to_discard!=SMALL_FILTER) console.log('coef_to_discard',coef_to_discard,num_features);


	//console.log('big_lot_of_features',big_lot_of_features);
	for(let feature of foundIds){
			let addElement=true;
			
			
			//console.log(MIN_DISTANCE,FULL_RESOLUTION);
			//if(MIN_DISTANCE>FULL_RESOLUTION)
				let coef_size=1;
				if(data.features[feature]){
						let coord=(bbox_array[layer]);
						//console.log(coord);
						let distance_=distance({x:coord[0],y:coord[1]},{x:coord[2],y:coord[3]});
						coef_size=distance_/(maxX-minX);
						//console.log(coef_size);

				}
			
			
				if(big_lot_of_features && FILTER_SMALL_GEOMETRIES){
					//Mirar diagonal del bbox
					if(data.features[feature]){
						if(coef_size<coef_to_discard) {
							addElement=false;
							discarted++;
							//console.log('Descartada '+feature+' '+coef_size+'  '+distance_,maxX-minX);
						}
						}
			};
			if(addElement){
					OUT_OF_RECT=false;
					CURRENT_ID=feature;
					yield gaptree2geometry({...data.features[feature].gaptree,coef_size:coef_size},layer).then(geom=>{
					/*
					
					if(OUT_OF_RECT){

						if(FASTSET)
							loaded_ids[layer].difference(new FastBitSet([CURRENT_ID]));
						else
							loaded_ids[layer]=loaded_ids[layer].difference([CURRENT_ID]);

					}
					*/
					let l={};
					for(let ll of 'id,type,properties'.split(',')){
						//console.log(ll,data.features[feature][ll])
						l[ll]=data.features[feature][ll];
					}
					if(!l.type) l.type='Feature';
					l.geometry=geom;
					//console.log(geom);
					return l;
				});
			} 
	
	}	
	
	if(discarted>0) console_log('Descartados '+discarted+'/'+num_features+' elementos por ser pequeños ('+layer+')');
	console_log('Tarda '+Math.round(performance.now()-start));
}



async function decompress_(file_name){
	let d={};
	
	const ff=DATA_FOLDER+'/'+file_name+'.bin';
	const ar = await getData(ff);

	//Con cbor no hace falta
	const ar2=new Uint8Array(ar);

	layers_data[file_name]=CBOR.decode(ar2);
	let data=layers_data[file_name];
  	
	let counter=0;
	for(let f of data.features){
		if(addId) if(!f.id) f.id=counter++;
		if(addColor) f.properties.color=getRandomColor();
		if(addTexture) f.properties.texture=Math.ceil(Math.random()*MAX_TEXTURES);
		//console.log('texture',f.properties.texture);
	}


	spatial_index[file_name]=null;
	spatial_index[file_name]=bufArrToSpatialIndex(data.buf_arr,file_name);
	
	/*
	const mybuffer = data.spatial_index.buffer.slice(  data.spatial_index.byteOffset,  data.spatial_index.byteOffset + data.spatial_index.byteLength);
	spatial_index[file_name] = Flatbush.from(mybuffer);
	*/

	if(data.strategy){
		setStrategyMode(data.strategy=='SIMPLE',file_name,data.mult);
	} else {console.log('Falta STRATEGY:' + file_name);setStrategyMode(true,file_name,1);}

	return [];
}

async function decompress(file_name_,transform_epsg3857ToEpsg4326_,addId_,istopojson){
	file_name=file_name_;
  	//console.log('Leyendo '+file_name_);
	addId=addId_;
	if(istopojson){
		transform_epsg3857ToEpsg4326=false;
		transform_epsg3857ToEpsg4326_topojson=transform_epsg3857ToEpsg4326_;

	}else
		transform_epsg3857ToEpsg4326=transform_epsg3857ToEpsg4326_;
	let f=istopojson?decompresstp_:decompress_;
	return f(file_name_);
}
