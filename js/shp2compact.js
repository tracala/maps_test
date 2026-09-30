const FASTINT=true;
const METHOD='gzip';
const MIN_POINTS_TO_COMPRESS=64;

let pendientes=[];
let polygonCounter=0;


function array2gaptree(points, tolerance,LAYER_TO_LOAD) {

  let res=[];
  let maxDistance = 0;
  let i=0;
  let aux;
  
	let dataArray_i=0;
	let dataArray=[];

	function push_dataArray(d){
		dataArray[dataArray_i]=d;
		dataArray_i++;
	}
  
  let douglasPeucker = function (min,max) {
    
	if ((max-min+1) <= 2) {
      push_dataArray({t:0,h:0});
      return false;
    }

    maxDistance = 0
    let maxDistanceIndex = 0
	let p;
	
    for (i = min+1; i <= max - 1; i++) {
      let distance = distantePointToLine(points[i],points[min],points[max]);
      if (distance > maxDistance) {
        maxDistance = distance
        maxDistanceIndex = i
      }
    }
    // check if the max distance is greater than our tollerance allows
    if ( (maxDistance>0) && (maxDistance >= tolerance) ) {
	  
	  p=points[maxDistanceIndex];
	  
	  aux=gaptree_dataTH[LAYER_TO_LOAD](p,points[min],points[max]);
	  
    push_dataArray(	  
	  {
      x:p.x-(points[min].x+points[max].x)/2,
      y:p.y-(points[min].y+points[max].y)/2,
      t:aux.t,
      h:aux.h
	  }
	  );
	  
	  
	  pendientes.push([min, maxDistanceIndex]);
	  pendientes.push([maxDistanceIndex, max]);
    return true;
	  
    } else {
      push_dataArray({t:0,h:0});
  	  return false;
    }
  }
  //douglasPeucker(0, points.length-1);
  
  pendientes.push([0, points.length-1]);
  let item;
  while(pendientes.length>0){
	  item=pendientes.shift();
	  douglasPeucker(item[0],item[1]);
  }



  res['p1']=points[0];
  res['p2']=points[points.length-1];

  res['dataArray']=dataArray;

  return res;
}


async function polygon2gaptree(coord,reorder,TOLERANCE_SIMP,LAYER_TO_LOAD){

    let coords;
		if(isGeographic) 
		 coords=coord.map(([x,y])=>({'x':(x*GEOGRAPHIC_COORDS_MULT),'y':(y*GEOGRAPHIC_COORDS_MULT)}));
		else
		 coords=coord.map(([x,y])=>({'x':x,'y':y}));
		if(reorder) coords=reorderPolygonByMaxEdge(coords);
		let d=array2gaptree(coords,TOLERANCE_SIMP,LAYER_TO_LOAD);
        //console_log(d.dataArray.length);

		var ar_th=[];
		for(let t of d.dataArray){ 
			ar_th.push(t.t);
			ar_th.push(t.h);
		}
		

    let buf_th1;
    let buf_th2;
    
    if(FASTINT){
      if(ar_th.length>MIN_POINTS_TO_COMPRESS){
        let l=Math.ceil(ar_th.length/4);
        if((l % 2 )==1) l++;
        buf_th1=FastIntegerCompression.compressSigned(ar_th.slice(0,l));
        buf_th2=FastIntegerCompression.compressSigned(ar_th.slice(l));
      }else{
        buf_th1=FastIntegerCompression.compressSigned(ar_th);
        buf_th2=null;

      }
    }
    else
       buf_th1 = await compressArray(ar_th);

    
    avgX+=d.p1.x;
		avgY+=d.p1.y; 

		global_x[polygonCounter*2]=d.p1.x;
		global_x[polygonCounter*2+1]=d.p2.x;
		
		global_y[polygonCounter*2]=d.p1.y;
		global_y[polygonCounter*2+1]=d.p2.y;
		polygonCounter++;			
		
		let data;
    if(FASTINT)
     data ={
        p1:d.p1,
        p2:d.p2,
        buf_th1:(buf_th1!=null)?new Uint8Array(buf_th1):null,
        buf_th2:(buf_th2!=null)?new Uint8Array(buf_th2):null
      };
    else
     data={p1:d.p1,p2:d.p2,buf_th:buf_th1}; //V2:p1:d.p1,p2:d.p2
    return data;
}

async function geometry2gaptreeGen(ar,bo,TOLERANCE_SIMP,LAYER_TO_LOAD){
  if(!Array.isArray(ar[0][0])){return polygon2gaptree(ar,bo,TOLERANCE_SIMP,LAYER_TO_LOAD)}
  else return Promise.all(ar.map(x=>geometry2gaptreeGen(x,bo,TOLERANCE_SIMP,LAYER_TO_LOAD)));
}


let global_x=[];
let global_y=[];
let avgX=0;
let avgY=0;



function getPolygonBBox(polygon) {
  //console.log(polygon);
  if (!Array.isArray(polygon) || polygon.length === 0) {
    throw new Error("El polígono debe ser un array de coordenadas");
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let i=0;i<polygon.length;i+=2) {
      let x=polygon[i];
      let y=polygon[i+1];
    
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    return [
      [minX,
      minY],
      [maxX,
      maxY]
    ];
};


function geometry2bbox(ar){
  return getPolygonBBox(ar.flat(3));
}



/**
 * Reordena un polígono de forma que el primer punto sea el que
 * tiene mayor distancia al siguiente punto.
 * 
 * @param {Array<[number, number]>} coords - Array de coordenadas [[x, y], ...]
 * @returns {Array<[number, number]>} Nuevo array con el primer punto reajustado
 */
function reorderPolygonByMaxEdge(coords) {
  if (coords.length < 2) return coords;

  let maxDist = -Infinity;
  let indexMax = 0;

  // Recorremos todos los pares consecutivos (incluyendo el último con el primero)
  for (let i = 0; i < coords.length; i++) {
    const current = coords[i];
    const next = coords[(i + 1) % coords.length]; // cicla al inicio

    const dx= next.x-current.x;
    const dy= next.y-current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      maxDist = dist;
      indexMax = i;
    }
  }
  
  //console.log(' reorderPolygonByMaxEdge indexMax:'+indexMax+'  MAxDist='+maxDist);

  // Reordenamos el array para que el punto más distante sea el primero
  const reordered = [
    ...coords.slice(indexMax+1),
    ...coords.slice(0, indexMax+1)
  ];

  return reordered;
}




function distantePointToLine(point,p1,p2){
      // slope
      let m = (p2.y - p1.y) / (p2.x - p1.x)
      // y offset
      let b = p1.y - (m * p1.x)
      let d = Math.abs(point.y - (m * point.x) - b) / Math.sqrt(Math.pow(m, 2) + 1);
      let d1=Math.sqrt(
          Math.pow((point.x - p1.x), 2) +
          Math.pow((point.y - p1.y), 2));
	  if(d1<d) d=d1;
      d1=Math.sqrt(
          Math.pow((point.x - p2.x), 2) +
          Math.pow((point.y - p2.y), 2));
	  if(d1<d) d=d1;
      // return the smallest distance
      return d;
}



/*SHP*********************************************************************/
function getFF(s){
    return "data/shp/" + s; // + ".shp";
}

async function* iteratorFromSource(source) {
  while (true) {
    const result = await source.read();
    if (result.done) return;
    yield result.value;
  }
}

async function compress_shp_file(LAYER_TO_LOAD,STRATEGY,MULT,TOLERANCE,feature_count){
  
  setStrategyMode(STRATEGY=='SIMPLE',LAYER_TO_LOAD,MULT);

  let features=[];
  polygonCounter=0;
  spatial_index[LAYER_TO_LOAD]=new Flatbush(feature_count,16,Int32Array,ArrayBuffer);

  return shapefile.open(getFF(LAYER_TO_LOAD))
  .then(async (source) => {
    
    let geometry_type='Line';
    let counter=1;
    for await (const feature of iteratorFromSource(source)) {
      //console.log(feature);
      let geometryType=feature.geometry.type;
      let reorder=false;
      if(geometryType.toLowerCase().indexOf('polygon')>=0) {geometry_type='Polygon';reorder=true};
     

      let ar=geometry2bbox(feature.geometry.coordinates);
      spatial_index[LAYER_TO_LOAD].add(Math.round(ar[0][0]),Math.round(ar[0][1]),Math.round(ar[1][0]),Math.round(ar[1][1]));

      feature.gaptree={type:getCodeFromGeometryType(geometryType),coordinates:await geometry2gaptreeGen(feature.geometry.coordinates,reorder,TOLERANCE,LAYER_TO_LOAD)};
      /*TEST
      MIN_DISTANCE=1;
      console.log('MIN_DISTANCE',MIN_DISTANCE);
      console.log('aaa',await gaptree2geometry(feature.gaptree,LAYER_TO_LOAD));
      */


      delete feature.geometry;

      if(feature.type) if(feature.type=='Feature') delete feature.type;
      if(addId) if(!feature.id) feature.id=counter++;
      features.push(feature);
      
    }
    //await source.cancel();
    

    const SRS="3857";
    layers_data[LAYER_TO_LOAD]={
            "type": "FeatureCollection",
            "name": file_name,
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::"+SRS } },
            "features": features,
            "mult":MULT,
            "strategy":STRATEGY,
            "num_features":feature_count,
            "srs":SRS,
            "geometry_type":geometry_type
            }
            
          spatial_index[LAYER_TO_LOAD].finish();
          //json_data.geometryType=geometryType;
        //console_log('SIZE='+ new TextEncoder().encode(JSON.stringify(layers_data[LAYER_TO_LOAD])).length);

  })
  .catch(error => console.error(error.stack));
}


async function shp2compact(LAYER_TO_LOAD,shp,dbf,STRATEGY,MULT,TOLERANCE){
  
  setStrategyMode(STRATEGY=='SIMPLE',LAYER_TO_LOAD,MULT);

  let features=[];
  let spatial_index_data=[];
  polygonCounter=0;

  return shapefile.open(shp,dbf)
  .then(async (source) => {
    
    let geometry_type='Line';
    let counter=1;
    for await (const feature of iteratorFromSource(source)) {
      //console.log(feature);
      let geometryType=feature.geometry.type;
      let reorder=false;
      if(geometryType.toLowerCase().indexOf('polygon')>=0) {geometry_type='Polygon';reorder=true};
     

      let ar=geometry2bbox(feature.geometry.coordinates);
      spatial_index_data.push([Math.round(ar[0][0]),Math.round(ar[0][1]),Math.round(ar[1][0]),Math.round(ar[1][1])]);

      feature.gaptree={type:getCodeFromGeometryType(geometryType),coordinates:await geometry2gaptreeGen(feature.geometry.coordinates,reorder,TOLERANCE,LAYER_TO_LOAD)};


      delete feature.geometry;

      if(feature.type) if(feature.type=='Feature') delete feature.type;
      if(addId) if(!feature.id) feature.id=counter++;
      features.push(feature);
      
    }
    
    spatial_index[LAYER_TO_LOAD]=new Flatbush(spatial_index_data.length,16,Int32Array,ArrayBuffer);
    for(let l of spatial_index_data) spatial_index[LAYER_TO_LOAD].add(...l); 
    spatial_index[LAYER_TO_LOAD].finish();

    const SRS="3857";
    layers_data[LAYER_TO_LOAD]={
            "type": "FeatureCollection",
            "name": file_name,
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::"+SRS } },
            "features": features,
            "mult":MULT,
            "strategy":STRATEGY,
            "num_features":spatial_index_data.length,
            "srs":SRS,
            "geometry_type":geometry_type
            }
            

  })
  .catch(error => console.error(error.stack));
}

async function fgb2compact(LAYER_TO_LOAD,stream,STRATEGY,MULT,TOLERANCE){
  
  setStrategyMode(STRATEGY=='SIMPLE',LAYER_TO_LOAD,MULT);

  let features=[];
  let spatial_index_data=[];
  polygonCounter=0;

    
    let geometry_type='Line';
    let counter=1;
    for await (const feature of flatgeobuf.deserialize(stream)) {
      //console.log(feature);
      let geometryType=feature.geometry.type;
      let reorder=false;
      if(geometryType.toLowerCase().indexOf('polygon')>=0) {geometry_type='Polygon';reorder=true};
     

      //console.log(feature.geometry.coordinates);
      let ar=geometry2bbox(feature.geometry.coordinates);
      spatial_index_data.push([Math.round(ar[0][0]),Math.round(ar[0][1]),Math.round(ar[1][0]),Math.round(ar[1][1])]);

      feature.gaptree={type:getCodeFromGeometryType(geometryType),coordinates:await geometry2gaptreeGen(feature.geometry.coordinates,reorder,TOLERANCE,LAYER_TO_LOAD)};


      delete feature.geometry;

      if(feature.type) if(feature.type=='Feature') delete feature.type;
      if(addId) if(!feature.id) feature.id=counter++;
      features.push(feature);
      
    }
    
    spatial_index[LAYER_TO_LOAD]=new Flatbush(spatial_index_data.length,16,Int32Array,ArrayBuffer);
    for(let l of spatial_index_data) spatial_index[LAYER_TO_LOAD].add(...l); 
    spatial_index[LAYER_TO_LOAD].finish();

    const SRS="3857";
    layers_data[LAYER_TO_LOAD]={
            "type": "FeatureCollection",
            "name": file_name,
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::"+SRS } },
            "features": features,
            "mult":MULT,
            "strategy":STRATEGY,
            "num_features":spatial_index_data.length,
            "srs":SRS,
            "geometry_type":geometry_type
            }

  }


async function shp2compact_server(LAYER_TO_LOAD,STRATEGY,MULT,TOLERANCE){
  let ff=getFF(LAYER_TO_LOAD);
  return shapefile.open(ff)
  .then(async (source) => {
    let feature_count=0;
    
    for await (const feature of iteratorFromSource(source)) {
      feature_count++;
    }
  	console.log('feature_count',feature_count);
    await compress_shp_file(LAYER_TO_LOAD,STRATEGY,MULT,TOLERANCE,feature_count);
  })
  .catch(error => console.error(error.stack));
}

