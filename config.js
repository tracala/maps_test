const maxZoom=22;
const minZoom=2; //4

const DELAY=1000;
const USE_FGB=true;

const murl=document.location.href.toLowerCase();


let LITE_MODE=false;

let MIN_ZOOM_FOR_DATA_=9;



let LAYER_TO_LOAD_=null;
let CLICK_TEMPLATE_;
let LABEL=null;
let initial_zoom;
let istopojson=false;


let coef=400; //10;
let map;
let debug;


initial_coordinates=[-5.931243896484375,43.27820513231556];
initial_zoom=9;
CLICK_TEMPLATE_="<p>Referencia: <b>${REFCAT}</b></p><p>Area: <b>${AREA}</b></p>";


let params = new URLSearchParams(document.location.search);

let coef2=params.get("coef");
if(coef2) {
	coef=parseFloat(coef2);
	console.log('coef',coef);
}

let lite=params.get('lite');
if(lite && lite.toLocaleLowerCase()==='true') {
	LITE_MODE=true;
	console.log('LITE_MODE');
}


function withPattern(s){
	let ar=with_pattern.toLowerCase().split(',');

	return ar.indexOf(s.toLowerCase())>=0;
}


if(murl.indexOf('?swc')>0){
	MIN_ZOOM_FOR_DATA_=10;
	LAYER_TO_LOAD_='swc';
	CLICK_TEMPLATE_="${id_session}";
    initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
}else
if(murl.indexOf('?mundo')>0){
	MIN_ZOOM_FOR_DATA_=0;
	LAYER_TO_LOAD_='mundo';
	CLICK_TEMPLATE_="<p>Pais: <b>${NAME_0}</b><p>Reg: <b>${NAME_1}</b><p>Prov: <b>${NAME_2}</b>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=3;
}else
if(murl.indexOf('?codigos_postales')>0){
	MIN_ZOOM_FOR_DATA_=6;
	LAYER_TO_LOAD_='codigos_postales';
	CLICK_TEMPLATE_="<p>Codigo: <b>${CUSEC}</b></p><p>Municipio: <b>${NMUN}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=7;
}else
if(murl.indexOf('?distritos')>0){
	MIN_ZOOM_FOR_DATA_=6;
	LAYER_TO_LOAD_='distritos10m';
	CLICK_TEMPLATE_="<p>Codigo: <b>${CUSEC}</b></p><p>Municipio: <b>${NMUN}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=7;
}else
if(murl.indexOf('?curvas50')>0){
	MIN_ZOOM_FOR_DATA_=5;
	LAYER_TO_LOAD_='curvas50';
	CLICK_TEMPLATE_="<p>Cota: <b>${COTA}</b></p><p>Categoria: <b>${CATEG_0202}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=5;
}else
if(murl.indexOf('?curvas1')>0){
	MIN_ZOOM_FOR_DATA_=5;
	LAYER_TO_LOAD_='curvas1';
	CLICK_TEMPLATE_="<p>Cota: <b>${COTA}</b></p><p>Categoria: <b>${CATEG_0202}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=5;
}else
if(murl.indexOf('?curvas')>0){
	MIN_ZOOM_FOR_DATA_=5;
	LAYER_TO_LOAD_='curvas';
	CLICK_TEMPLATE_="<p>Cota: <b>${COTA}</b></p><p>Categoria: <b>${CATEG_0202}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=5;
}else
if(murl.indexOf('?rustica')>0){
	MIN_ZOOM_FOR_DATA_=11; //12
	LAYER_TO_LOAD_='rustica';
 	CLICK_TEMPLATE_="<p>Referencia: <b>${REFCAT}</b></p><p>Area: <b>${AREA}</b></p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=9;
 }else
if(murl.indexOf('?urbana')>0){
    MIN_ZOOM_FOR_DATA_=9;
	LAYER_TO_LOAD_='parcelas_catastro';
	CLICK_TEMPLATE_="<p>Referencia: <b>${REFCAT}</b></p><p>Area: <b>${AREA}</b></p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=9;
 }else
if(murl.indexOf('?limite_municipio')>0){
	MIN_ZOOM_FOR_DATA_=6;
	LAYER_TO_LOAD_='limite_municipio';
	CLICK_TEMPLATE_="<p>Codigo: <b>${natcode}</b></p><p>Municipio: <b>${municipio}</b></p>";
    initial_coordinates=[-4.255267599609965,40.247621510212895];
	initial_zoom=7;
 }else
if(murl.indexOf('?cauces')>0){
	MIN_ZOOM_FOR_DATA_=7; //12
	LAYER_TO_LOAD_='cauces_5000';
 	CLICK_TEMPLATE_="<p>Nombre: <b>${NOMBRE}</b></p><p>Tipo: <b>${ID_TIPO}</b></p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
 }else
if(murl.indexOf('?cuencas5')>0)
	{
	MIN_ZOOM_FOR_DATA_=7; //12
	LAYER_TO_LOAD_='cuencas5';
 	CLICK_TEMPLATE_="<p>Nombre: <b>${Nom_Rio}</b></p><p>Longitud: <b>${LngTramo_m}</b></p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
 }else
if(murl.indexOf('?cuencas')>0)
	{
	MIN_ZOOM_FOR_DATA_=7; //12
	LAYER_TO_LOAD_='cuencas';
 	CLICK_TEMPLATE_="<p>Nombre: <b>${Nom_Rio}</b></p><p>Longitud: <b>${LngTramo_m}</b></p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
 } else
if(murl.indexOf('?unidad_geologica')>0)
	{
	MIN_ZOOM_FOR_DATA_=7; //12
	LAYER_TO_LOAD_='unidad_geologica';
 	CLICK_TEMPLATE_="<p>Nombre</p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
	istopojson=true;
 } else
if(murl.indexOf('?gadm2')>0)
	{
	MIN_ZOOM_FOR_DATA_=3; //12
	LAYER_TO_LOAD_='gadm2';
 	CLICK_TEMPLATE_="<p>shapeName: <b>${shapeName}</b></p><p>shapeGroup: <b>${shapeGroup}</b></p><p>shapeType: <b>${shapeType}</b></p>";
	LABEL='shapeName';
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
	istopojson=true;
 }else
if(murl.indexOf('?gadm')>0)
	{
	MIN_ZOOM_FOR_DATA_=10; //12
	LAYER_TO_LOAD_='gadm';
 	CLICK_TEMPLATE_="<p>N1: <b>${NAME_0}</b></p><p>V1:<b>${VARNAME_0}</b></p><p>N2: <b>${NAME_1}</b></p><p>V2:<b>${VARNAME_1}</b> </p>";
	initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
	istopojson=true;
 }else

 


if(murl.indexOf('?secciones')>0){
	MIN_ZOOM_FOR_DATA_=2;
	LAYER_TO_LOAD_='secciones';
	CLICK_TEMPLATE_="<p>CUSEC: <b>${CUSEC}</b><p>CUMUN: <b>${CUMUN}</b><p>CSEC: <b>${CSEC}</b><p>CDIS: <b>${CDIS}</b><p>CMUN: <b>${CMUN}</b><p>CPRO: <b>${CPRO}</b><p>CCA: <b>${CCA}</b><p>CUDIS: <b>${CUDIS}</b><p>CLAU2: <b>${CLAU2}</b><p>NPRO: <b>${NPRO}</b><p>NCA: <b>${NCA}</b><p>CNUT0: <b>${CNUT0}</b><p>CNUT1: <b>${CNUT1}</b><p>CNUT2: <b>${CNUT2}</b><p>CNUT3: <b>${CNUT3}</b><p>NMUN: <b>${NMUN}</b>";
    initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=7;
	istopojson=true;
}else
if(murl.indexOf('?parroquias')>0){
	MIN_ZOOM_FOR_DATA_=3;
	LAYER_TO_LOAD_='parroquias';
	CLICK_TEMPLATE_="<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>";
	LABEL='NOMBRE';
    initial_coordinates=[-5.931243896484375,43.27820513231556];
	initial_zoom=9;
	istopojson=true;
}else
if(murl.indexOf('?edificios_madrid')>0){
	MIN_ZOOM_FOR_DATA_=10;
	LAYER_TO_LOAD_='edificios_madrid';
	CLICK_TEMPLATE_="<p>ETIQUETA: <b>${ETIQUETA}</b></p><p>FECHA_ALTA: <b>${FECHA_ALTA}</b></p>";
    initial_coordinates=[-3.686008,40.47746]; //-3.6754273067835186, 40.41769050313184
	initial_zoom=16;
	istopojson=true;
}else
if(murl.indexOf('?geoboundaries')>0){
	MIN_ZOOM_FOR_DATA_=2;
	LAYER_TO_LOAD_='geoboundaries';
	CLICK_TEMPLATE_="<p>shapeName: <b>${shapeName}</b></p><p>shapeGroup: <b>${shapeGroup}</b></p><p>shapeType: <b>${shapeType}</b></p>";
    initial_coordinates=[-3.6754273067835186, 40.41769050313184];
	initial_zoom=10;
	istopojson=true;
}




 
 let layer_data=[];
 if(LAYER_TO_LOAD_) {
	let geometry_type='Polygon';
	
	if('curvas,swc,'.indexOf(LAYER_TO_LOAD_+',')>=0) geometry_type='Line';
	if('edificios_madrid,'.indexOf(LAYER_TO_LOAD_+',')>=0) geometry_type='Extrusion';
	//console.log(geometry_type);
	
	layer_data=[
		{name:LAYER_TO_LOAD_,min_zoom:MIN_ZOOM_FOR_DATA_,max_zoom:24,CLICK_TEMPLATE:CLICK_TEMPLATE_,geometry_type:geometry_type,color:'AA0000',istopojson:istopojson,label:LABEL}
	 ];
}
 else
	 if(murl.indexOf('?capas_cuencas')>0) {layer_data=[
			{name:'cauces_5000',min_zoom:7,max_zoom:24,CLICK_TEMPLATE:"<p>Nombre: <b>${NOMBRE}</b></p><p>Tipo: <b>${ID_TIPO}</b></p>",geometry_type:'Line',color:'0000AA'},
			{name:'cuencas',min_zoom:7,max_zoom:24,CLICK_TEMPLATE:"<p>Nombre: <b>${Nom_Rio}</b></p><p>Longitud: <b>${LngTramo_m}</b></p>",geometry_type:'Polygon',color:'AA0000'}
	 ];
	 }else
		
 	 if(murl.indexOf('?tprustica')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=9;
			const LAYER_CHANGE=15
			layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'rustica',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>Referencia: <b>${REFCAT}</b></p><p>Area: <b>${AREA}</b></p>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
	 }else
 	 if(murl.indexOf('?siose')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=9;
			const LAYER_CHANGE=12
			layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'siose_asturias',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>Texto: <b>${TEXTO}</b></p><p>Superf: <b>${SUPERF_HA}</b></p><p>CODIIGE: <b>${CODIIGE}</b></p><p>HILUCS: <b>${HILUCS}</b></p><p>SELLADO: <b>${SELLADO}</b></p><p>FCC: <b>${FCC}</b></p><p>BLOQUE: <b>${CODBLQ}</b></p>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
	 }else
		if(murl.indexOf('?urbanismopa')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=9;
			const LAYER_CHANGE=15
			layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'urbanismopa',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
		}else
		
		if(murl.indexOf('?curbanismopa')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=9;
			const LAYER_CHANGE=12
			layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				//{name:'concejos',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>codigo_ine: <b>${codigo_ine}</b></p><p>concejo: <b>${concejo}</b></p><p>conceyu: <b>${conceyu}</b></p><p>shape_Leng: <b>${shape_Leng}</b></p><p>shape_Area: <b>${shape_Area}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				//{name:'urbanismopa',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
		}else
		
		if(murl.indexOf('?recintos_sigpac')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=9;
			const LAYER_CHANGE=15
			layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'recintos_sigpac',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>POLIGONO: <b>${POLIGONO}</b></p><p>PARCELA: <b>${PARCELA}</b></p><p>RECINTO: <b>${RECINTO}</b></p><p>PDTE_MEDIA: <b>${PDTE_MEDIA}</b></p><p>REFERENCIA: <b>${REFERENCIA}</b></p><p>USO: <b>${USO}</b></p>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
		}else
		if(murl.indexOf('?mfe')>0){
			initial_coordinates=[-5.931243896484375,43.27820513231556];
			initial_zoom=14;
			const LAYER_CHANGE=11
			layer_data=[
				{name:'secciones',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>CUSEC: <b>${CUSEC}</b></p><p>CUMUN: <b>${CUMUN}</b></p><p>CSEC: <b>${CSEC}</b></p><p>CDIS: <b>${CDIS}</b></p><p>CMUN: <b>${CMUN}</b></p><p>CPRO: <b>${CPRO}</b></p><p>CCA: <b>${CCA}</b></p><p>CUDIS: <b>${CUDIS}</b></p><p>CLAU2: <b>${CLAU2}</b></p><p>NPRO: <b>${NPRO}</b></p><p>NCA: <b>${NCA}</b></p><p>CNUT0: <b>${CNUT0}</b></p><p>CNUT1: <b>${CNUT1}</b></p><p>CNUT2: <b>${CNUT2}</b></p><p>CNUT3: <b>${CNUT3}</b></p><p>NMUN: <b>${NMUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'mfe',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>fid: <b>${fid}</b></p><p>TIPESTR: <b>${TIPESTR}</b></p><p>area: <b>${area}</b></p>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			];
			istopojson=true;
		}else
		{
			//por defecto corine
			initial_coordinates=[-3.686008,40.47746];
			initial_zoom=6;
			const LAYER_CHANGE=10
			layer_data=[
				{name:'secciones',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>CUSEC: <b>${CUSEC}</b></p><p>CUMUN: <b>${CUMUN}</b></p><p>CSEC: <b>${CSEC}</b></p><p>CDIS: <b>${CDIS}</b></p><p>CMUN: <b>${CMUN}</b></p><p>CPRO: <b>${CPRO}</b></p><p>CCA: <b>${CCA}</b></p><p>CUDIS: <b>${CUDIS}</b></p><p>CLAU2: <b>${CLAU2}</b></p><p>NPRO: <b>${NPRO}</b></p><p>NCA: <b>${NCA}</b></p><p>CNUT0: <b>${CNUT0}</b></p><p>CNUT1: <b>${CNUT1}</b></p><p>CNUT2: <b>${CNUT2}</b></p><p>CNUT3: <b>${CNUT3}</b></p><p>NMUN: <b>${NMUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
				{name:'corine',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>Codigo: <b>${CODE_18}</b></p><p>Area: <b>${AREA_HA}</b>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
			]
			istopojson=true;
		}
		
		/* corine parroquias
		{
		initial_coordinates=[-5.931243896484375,43.27820513231556];
		initial_zoom=9;
		const LAYER_CHANGE=11
		layer_data=[
				{name:'parroquias',min_zoom:3,max_zoom:LAYER_CHANGE,CLICK_TEMPLATE:"<p>NOMBRE: <b>${NOMBRE}</b></p><p>MUN: <b>${MUN}</b></p>",geometry_type:'Polygon',color:'0000AA',istopojson:true},
			{name:'corine',min_zoom:LAYER_CHANGE,max_zoom:24,CLICK_TEMPLATE:"<p>Codigo: <b>${CODE_18}</b></p><p>Area: <b>${AREA_HA}</b>",geometry_type:'Polygon',color:'AA0000',istopojson:true}
		];


	 }*/


let baseLayer={
	urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}

clean_when_zoom_out=(layer_data.length>1);

let base_layers=[
	['ocupacion_suelo','https://servicios.idee.es/wmts/ocupacion-suelo?layer=LC.LandCoverSurfaces&style=LC.LandCoverSurfaces.Default&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}'],
	['osm','https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'],
	['carto','https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'],
	['arcgis','https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
	['vacio','']
];


let base_layer="https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg";
for(let l of base_layers){
	if(document.location.href.toLowerCase().indexOf('base=' + l[0])>0) {
		base_layer=l[1];
	}
}



const ADD_DEBUG=true;
if(ADD_DEBUG){
	
	window.onerror = function(msg, url, line, col, error) {
		alert(
			'Error: ' + msg +
			'\nURL: ' + url +
			'\nLínea: ' + line +
			'\nColumna: ' + col
		);
	};

	window.addEventListener('unhandledrejection', function(event) {
		console.log(event.reason);
	});


}