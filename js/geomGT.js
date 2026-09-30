// ===============================
//  Cálculo del nuevo sistema
// ===============================

function buildSystemAB(A, B) {
    const Ax = A.x, Ay = A.y;
    const Bx = B.x, By = B.y;

    // Longitud AB
    const L = Math.hypot(Bx - Ax, By - Ay);
    if (L === 0) throw new Error("Los puntos A y B no pueden ser iguales.");

    // Punto medio (origen del sistema nuevo)
    const M = {
        x: (Ax + Bx) / 2,
        y: (Ay + By) / 2
    };

    // Vector unitario u = eje x' (dirección AB)
    const ux = (Bx - Ax) / L;
    const uy = (By - Ay) / L;

    // Vector unitario v = eje y' (perpendicular +90°)
    const vx = -uy;
    const vy = ux;

    return { M, ux, uy, vx, vy };
}

// ===============================
//  Transformación P → P' (sistema original → sistema AB)
// ===============================

function transformToAB(P, sys) {
    const { M, ux, uy, vx, vy } = sys;

    // Vector desde el origen nuevo M
    const dx = P.x - M.x;
    const dy = P.y - M.y;

    // Coordenadas en el sistema AB
    const xp = dx * ux + dy * uy;
    const yp = dx * vx + dy * vy;

    return { x: xp, y: yp };
}

// ===============================
//  Transformación inversa P' → P (sistema AB → original)
// ===============================

function transformFromAB(Pp, sys) {
    const { M, ux, uy, vx, vy } = sys;

    const x = M.x + Pp.x * ux + Pp.y * vx;
    const y = M.y + Pp.x * uy + Pp.y * vy;

    return { x, y };
}




function puntoPerpendicular_AB( t, d, A, B){
  let sys=buildSystemAB(A,B);
  return transformFromAB({x:t,y:d},sys);
}

function gaptree_dataTH_AB(p,A,B){
  let sys=buildSystemAB(A,B);
  let l=transformToAB(p,sys);
  return {t:l.x,h:l.y};
}

/*
function test_GP_AUX(P,A,B){
  console.log('****************************');
  let {t,h}=gaptree_dataTH(P,A,B);
  console.log(P,A,B);
  console.log(t,h);
  let P2=puntoPerpendicular(t,h,A,B);
  if(distance(P,P2)>0.002) console.log('MAL',P,P2); else console.log('BIEN',t,h);
}
*/

const MIN_BPP=2;
const MAX_BPP=10;
const DEBUG_BPP=false;


let puntoPerpendicular={};
let gaptree_dataTH={};

function setStrategyMode(SIMPLE,layer_name,MULT){
  //console.log('setstrategy',SIMPLE,layer_name,MULT);
  let f=SIMPLE?puntoPerpendicular_SIMPLE:puntoPerpendicular_AB;
  puntoPerpendicular[layer_name]=function(t,d,A,B){ t/=MULT;d/=MULT;return f(t,d,A,B)};
  let f2=SIMPLE?gaptree_dataTH_SIMPLE:gaptree_dataTH_AB;
  gaptree_dataTH[layer_name]=function(p,A,B){ let r=f2(p,A,B); return {t:Math.round(r.t*MULT),h:Math.round(r.h*MULT)}};
}

function test_GP(){
  test_GP_AUX({x:0,y:80},{x:0,y:0},{x:0,y:100});
  test_GP_AUX({x:0,y:100},{x:100,y:0},{x:50,y:50});
  test_GP_AUX({x:0,y:100},{x:100,y:0},{x:50,y:70});
  test_GP_AUX({x:100,y:200},{x:100,y:0},{x:50,y:70});
  test_GP_AUX({x:100,y:0},{x:50,y:70},{x:-100,y:200});
  test_GP_AUX({x:0,y:0},{x:1050,y:1070},{x:100,y:-200});
  test_GP_AUX({x:0,y:100},{x:100,y:0},{x:50,y:-50});
  test_GP_AUX({x:0,y:100},{x:100,y:0},{x:50,y:-70});
  test_GP_AUX({x:-100,y:-200},{x:100,y:0},{x:50,y:70});
  test_GP_AUX({x:100,y:0},{x:-50,y:70},{x:100,y:200});
  test_GP_AUX({x:0,y:0},{x:-1050,y:1070},{x:-100,y:200});
  test_GP_AUX({x:1000,y:1000},{x:1010,y:1010},{x:50,y:50});

  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+80},{x:X_CENTER+0,y:Y_CENTER+0},{x:X_CENTER+0,y:Y_CENTER+100});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+100},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER+50});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+100},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER+70});
  test_GP_AUX({x:X_CENTER+100,y:Y_CENTER+200},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER+70});
  test_GP_AUX({x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER+70},{x:X_CENTER-100,y:Y_CENTER+200});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+0},{x:X_CENTER+1050,y:Y_CENTER+1070},{x:X_CENTER+100,y:Y_CENTER-200});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+100},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER-50});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+100},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER-70});
  test_GP_AUX({x:X_CENTER-100,y:Y_CENTER-200},{x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER+50,y:Y_CENTER+70});
  test_GP_AUX({x:X_CENTER+100,y:Y_CENTER+0},{x:X_CENTER-50,y:Y_CENTER+70},{x:X_CENTER+100,y:Y_CENTER+200});
  test_GP_AUX({x:X_CENTER+0,y:Y_CENTER+0},{x:X_CENTER-1050,y:Y_CENTER+1070},{x:X_CENTER-100,y:Y_CENTER+200});
  test_GP_AUX({x:X_CENTER+1000,y:Y_CENTER+1000},{x:X_CENTER+1010,y:Y_CENTER+1010},{x:X_CENTER+50,y:Y_CENTER+50});


}

//test_GP();

function puntoPerpendicular_SIMPLE( t, d, A, B){
  let xx=(A.x+B.x)/2;
  let yy=(A.y+B.y)/2;
  xx=(xx+t);
  yy=(yy+d);
  return {x:xx,y:yy};
}



function gaptree_dataTH_SIMPLE(p,a,b){

  let xx=(a.x+b.x)/2;
  let yy=(a.y+b.y)/2;
  
  xx=p.x-xx;
  
  yy=p.y-yy;
	
  return {t:xx,h:yy};
}



async function gaptree2geomGen(d,layer_name,coef_size){
  if(Array.isArray(d)){
    return Promise.all(d.map(x=>gaptree2geomGen(x,layer_name,coef_size)));
  }
    else{
      if(d.p1)
        return gaptree2polygon(d,layer_name,coef_size);
      else {console.log('Dato vacio');return [];}
    }
	    
}



async function gaptree2geometry(g,layer_name){
  let geometryType=getGeometryTypeFromCode(g.type);
      return { "type": geometryType, "coordinates": await gaptree2geomGen(g.coordinates,layer_name,g.coef_size)};
}



function getGeometryTypeFromCode(code){
  let geometryType='';
  switch(code){
    case 4:geometryType='MultiPolygon';break;
    case 3:geometryType='Polygon';break;
    case 2:geometryType='MultiLineString';break;
    case 1:geometryType='LineString';break;
    default: console.log('Tipo de geometría no soportado:',geometryType);break;
  }
  return geometryType;
}


function getCodeFromGeometryType(geometryType){
  let code=-1;
  switch(geometryType){
    case 'MultiPolygon':code=4;break;
    case 'Polygon':code=3;break;
    case 'MultiLineString':code=2;break;
    case 'LineString':code=1;break;
    default: console.log('Tipo de geometría no soportado:',geometryType);break;
  }
  return code;
}


/*COMPRESS*/
class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.izq = null;
    this.der = null;
  }
}

function log_preorder(nodo){
  if(nodo==null) {console.log('null');return;}
  console.log(nodo.valor);
  log_preorder(nodo.izq);
  log_preorder(nodo.der); 
}

let pend_log_bfs=[]
function log_bfs(nodo){
  pend_log_bfs.push(nodo);
  while(pend_log_bfs.length>0){
    let nodo=pend_log_bfs.shift();
    console.log(nodo.valor);
    if(nodo.izq) pend_log_bfs.push(nodo.izq);else console.log('nullizq');
    if(nodo.der) pend_log_bfs.push(nodo.der);else console.log('nullder');
  }

}


function construirArbolBFS(valores,tope,bitSet_) {
  const LOG=false;
  //console.log(bitSet_);
  let bitSet=new BitSet();
  bitSet.words=bitSet_;
  bitSet.maxIndex=bitSet_.length*32-1;
  //BITSETLOG
  if(LOG)bitSet.log();
  //console.log('valores',valores.length,tope);
  
  if (!valores || valores.length === 0) {
    return null;
  }

  const raiz = new Nodo(valores[0]);
  const cola = [raiz];
  const ar_pos=[0];
  let i = 1;

  if(!tope) tope=valores.length;

  while (cola.length > 0 && i < tope) {
    const nodo = cola.shift();
    //const pos=(i-1)*2;
    const pos=2*ar_pos.shift();

    // Hijo izquierdo
    if ((i < tope) && (bitSet.get(pos)==1)) {
      if(LOG)console.log('izq'+i+' pos '+pos);
      nodo.izq = new Nodo(valores[i]);
      cola.push(nodo.izq);
      ar_pos.push(i);
      i++;
    }

    // Hijo derecho
    if ((i < tope) && (bitSet.get(pos+1)==1)) {
      if(LOG)console.log('der'+i+' pos '+pos);
      nodo.der = new Nodo(valores[i]);
      cola.push(nodo.der);
      ar_pos.push(i);
      i++;
    }
  }

  //BITSETLOG
  if(LOG)log_bfs(raiz);
  if(LOG)log_preorder(raiz);
  return raiz;
}



function construirArbolBFS_OLD(valores,tope) {
  if (!valores || valores.length === 0 || valores[0].h === 0) {
    return null;
  }

  const raiz = new Nodo(valores[0]);
  const cola = [raiz];
  let i = 1;

  if(!tope) tope=valores.length;

  while (cola.length > 0 && i < tope) {
    const nodo = cola.shift();

    // Hijo izquierdo
    if (i < tope && valores[i].h !== 0) {
      nodo.izq = new Nodo(valores[i]);
      cola.push(nodo.izq);
    }
    i++;

    // Hijo derecho
    if (i < tope && valores[i].h !== 0) {
      nodo.der = new Nodo(valores[i]);
      cola.push(nodo.der);
    }
    i++;
  }

  return raiz;
}



function outOfRect(p1,p2,p3){
  if(VIEW_RECT){

    if( (p1.x<VIEW_RECT[0]) && (p2.x<VIEW_RECT[0]) && (p3.x<VIEW_RECT[0]) ) return true;
    if( (p1.x>VIEW_RECT[2]) && (p2.x>VIEW_RECT[2]) && (p3.x>VIEW_RECT[2]) ) return true;

    if( (p1.y<VIEW_RECT[1]) && (p2.y<VIEW_RECT[1]) && (p3.y<VIEW_RECT[1]) ) return true;
    if( (p1.y>VIEW_RECT[3]) && (p2.y>VIEW_RECT[3]) && (p3.y>VIEW_RECT[3]) ) return true;
  }
  return false;

}
function pointInRect(p){
  let bo=true;
  if(VIEW_RECT){
    bo= (
      (p.x>=VIEW_RECT[0]) && (p.x<=VIEW_RECT[2]) &&
      (p.y>=VIEW_RECT[1]) && (p.y<=VIEW_RECT[3]) 
    );
  }
  return bo;
}

function indexArray2polygon_profundidad(d,tol,layer_name,cut_lines){
  
  let arbol;
	if(CUT_TREE){
		let tope=d['dataArray'].length;
		//console.log('tol',tol);
		//console.log('FULL_RESOLUTION',FULL_RESOLUTION);
		if(tol>FULL_RESOLUTION) {
			//18
			let ll=Math.pow(2,14-Math.ceil(Math.log2(tol)));
			if(ll<15) ll=15;
			if(tope>ll) tope=ll;
			//console.log(tol,ll,distance(d.p1,d.p2));
		}
		 arbol=construirArbolBFS(d['dataArray'],tope,d['bitSet']);
	}
	else
  		 arbol=construirArbolBFS(d['dataArray'],null,d['bitSet']);

	let res=[];

  	function decode(nodo,p1,p2){
      if(nodo==null) return;
      
      if(!puntoPerpendicular[layer_name]){
        console.log(layer_name+ ' no cargado...');
        return [];
      }
      let dd2=puntoPerpendicular[layer_name](nodo.valor.t,nodo.valor.h,p1,p2);
			let dd=nodo.valor.h;
			
      let continue_process=true;

      if(!cut_lines) cut_lines=CUT_OUTSIDE_LINES(layer_name);
      if(cut_lines){
      
        if(outOfRect(p1,p2,dd2)){
          console.log('Fuera de la ventada de visualizacion');
          console.log(VIEW_RECT);
          console.log(p1,p2,dd2);

          OUT_OF_RECT=true;
          //Ponemos el punto intermedio?
          //res.push(dd2);
          continue_process=false;
          //res.push(p1);
          //res.push(p2);
        }
      }
      
      if(continue_process){

        if(isGeographic) dd*=distanciaWGS84(p1.y,p1.x,p2.y,p2.x);
        else dd*=distance(p1,p2);
        dd=Math.abs(dd);
        if(dd>tol) decode(nodo.izq,p1,dd2);
        res.push(dd2);
        if(dd>tol) decode(nodo.der,dd2,p2);

      }
  	}
	
    decode(arbol,d['p1'],d['p2']);

    let addPoint=true;
    let t='p1';
    //TODO: ver caso de lineas
    //if(cut_lines) if(!pointInRect(d[t])) addPoint=false;
    if(addPoint)  res.unshift(d[t]); 
    addPoint=true;
    t='p2';
    //if(cut_lines) if(!pointInRect(d[t])) addPoint=false;
    if(addPoint)  res.push(d[t]); 
    return res;

  }






function indexArray2polygon_inorden(d,tol,layer_name){
	let  res=[]
	function decode(i,p1,p2){

		if(i<d['dataArray'].length){
			let dd2=puntoPerpendicular[layer_name](
				d['dataArray'][i].t,
				d['dataArray'][i].h,
				p1,p2)				

			let dd=distance(dd2,p1);
			//let dd=Math.abs(d['dataArray'][i].h*distance(p1,p2));
			//console.log(dd,tol);
			if(dd>tol) if((i==0) || (d['indexArrayL'][i]==1) )  decode(i+1,p1,dd2);
			res.push(dd2);
			if(dd>tol) if(d['indexArrayR'][i]>0)  decode(d['indexArrayR'][i],dd2,p2);
		}
	}
	decode(0,d['p1'],d['p2']);
	res.unshift(d['p1']);
	res.push(d['p2']);
	return res;
}



let gaptree2polygon=gaptree2polygon_inorden;
let indexArray2polygon=indexArray2polygon_inorden;

if(true){ 
	gaptree2polygon=gaptree2polygon_profundidad;
	indexArray2polygon=indexArray2polygon_profundidad;
}

function gaptree2polygon_profundidad(d,layer_name,coef_size){
  let l=MIN_DISTANCE;
  return gaptree2polygon_profundidad_aux(d,layer_name,l,true);
}

function gaptree2polygon_profundidad_aux(d,layer_name,min_distance,full){

	if(!d) {console.log('gaptree2polygon_profundidad_aux devuelve null');return []};
	if(!d.p1) {console.log('gaptree2polygon_profundidad_aux devuelve []');return []};
  let d2={};

	d2.p1=d.p1;
	d2.p2=d.p2;

	  let ar_th;
  	let size=d.buf_th1.byteLength;

  	ar_th=FastIntegerCompression.uncompressSigned(d.buf_th1);
    if(full) if(d.buf_th2){
      ar_th=ar_th.concat(FastIntegerCompression.uncompressSigned(d.buf_th2));
      size+=d.buf_th2.byteLength;
    }

	d2.dataArray=[];
  d2.bitSet=d.bitSet;

	let i=0;
	while(i<ar_th.length){
		d2.dataArray.push({t:ar_th[i],h:ar_th[i+1]});
		i+=2;
	}
	
	let pol=indexArray2polygon(d2,min_distance,layer_name,false);

  if(DEBUG_BPP){
    let bpp=size/pol.length;
    if(bpp>MAX_BPP || bpp<MIN_BPP)
      console.log(pol.length + ' puntos '+ size + ' bytes per point '+bpp);  
  }

  /*
  if(pol.length>3)
    if(( (pol[0].x===pol[pol.length-2].x) && (pol[0].y===pol[pol.length-2].y)) &&
      ( (pol[1].x===pol[pol.length-1].x) && (pol[1].y===pol[pol.length-1].y) )
    ) {
      console.log('Poligono circular' ,pol);
      pol.pop();
    }
  */


  if(isGeographic)
		pol=pol.map((ar)=>[ar.x/GEOGRAPHIC_COORDS_MULT,ar.y/GEOGRAPHIC_COORDS_MULT]);
	else
		pol=pol.map((ar)=>[ar.x,ar.y]);

	if(transform_epsg3857ToEpsg4326) pol=pol.map(epsg3857ToEpsg4326);
	return pol
}



function gaptree2polygon_inorden(d,layer_name){
	let d2={};
	d2.p1=d.p1;
	d2.p2=d.p2;
	
	let ar_th=FastIntegerCompression.uncompressSigned(d.buf_th);
	let indexLR=FastIntegerCompression.uncompress(d.buf_lr);
	
	d2.dataArray=[];
	d2.indexArrayL=indexLR.slice(0,(indexLR.length/2));
	d2.indexArrayR=indexLR.slice(indexLR.length/2);

	for(let i=0;i<ar_th.length/2;i++) d2.dataArray.push({t:ar_th[i],h:ar_th[i+ar_th.length/2]});
	
	//return d;
	let pol=indexArray2polygon(d2,MIN_DISTANCE,layer_name);

	if(isGeographic)
		pol=pol.map((ar)=>[ar.x/GEOGRAPHIC_COORDS_MULT,ar.y/GEOGRAPHIC_COORDS_MULT]);
	else
		pol=pol.map((ar)=>[ar.x,ar.y]);
		
	if(transform_epsg3857ToEpsg4326) pol=pol.map(epsg3857ToEpsg4326);
	return pol
}

function logBinaryArray(arr){
      arr.forEach((n, i) => {
        console.log(`arr[${i}] = ${n.toString(2).padStart(32, '0')}`);
      });
}


class BitSet {
  constructor(size) {
    this.maxIndex=0;
    this.words = new Uint32Array(Math.ceil(size / 32));
  }

  set(i) {
    if(i>this.maxIndex) this.maxIndex=i;
    this.words[i >>> 5] |= (1 << (i & 31));
  }

  unset(i) {
    this.words[i >>> 5] &= ~(1 << (i & 31));
  }

  get(i) {
    return (this.words[i >>> 5] & (1 << (i & 31))) !== 0 ? 1 : 0;
  }

  getWords(){
    return this.words.slice(0,Math.ceil(this.maxIndex / 32));
  }

  log(){
      console.log('');
      console.log(this.maxIndex);
      logBinaryArray(this.words);
  }

}




let bbox_array={};

function bufArrToSpatialIndex(buf_arr,key){
  let init=performance.now();
  let ar=FastIntegerCompression.uncompressSigned(buf_arr);
  let ar_x=ar.slice(0,ar.length/2);
  let ar_y=ar.slice(ar.length/2);
  let spatial_index=new Flatbush(ar.length/4,16,Int32Array,ArrayBuffer);
  bbox_array[key]=[];
  for(let i=0;i<ar_x.length;i+=2){
    let range=[ar_x[i],ar_y[i],ar_x[i+1],ar_y[i+1]];
    spatial_index.add(...range);
    bbox_array[key].push(range);
   }
  spatial_index.finish();
  console.log('Indice espacial '+key+':', Math.round(performance.now() - init), 'ms');
  return spatial_index;
}



/*
async function gaptree2polygon(d){
	let d2={};


	d2.p1=d.p1;
	d2.p2=d.p2;

  if(V2){
    d2.p1={};
    d2.p2={};

    d2.p1.x=global_x[polygonCounter*2];
    d2.p2.x=global_x[polygonCounter*2+1];

    d2.p1.y=global_y[polygonCounter*2];
    d2.p2.y=global_y[polygonCounter*2+1];
  }
	polygonCounter++;

  let ar_th;
  let size=d.buf_th1.byteLength;
  if(FASTINT){
      ar_th=FastIntegerCompression.uncompressSigned(d.buf_th1);
      if(FULL) {
        if(d.buf_th2!=null){
          ar_th=ar_th.concat(FastIntegerCompression.uncompressSigned(d.buf_th2));
          size+=d.buf_th2.byteLength;
        }
      }
     }
  else
     ar_th=await decompressArray(d.buf_th1);
  
  d2.dataArray=[];
	let i=0;
  while(i<ar_th.length){
    d2.dataArray.push({t:ar_th[i],h:ar_th[i+1]});
    i+=2;
  }
	
	//return d;
	let pol=indexArray2polygon(d2,MIN_DISTANCE);
  let bpp=size/pol.length;
  
  if(bpp>MAX_BPP || bpp<MIN_BPP)
    console.log(pol.length + ' puntos '+ size + ' bytes per point '+bpp);
	if(isGeographic)
		pol=pol.map((ar)=>[ar.x/GEOGRAPHIC_COORDS_MULT,ar.y/GEOGRAPHIC_COORDS_MULT]);
	else
		pol=pol.map((ar)=>[ar.x,ar.y]);
	return pol
}
*/