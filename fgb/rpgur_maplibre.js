const url=document.location.href.toLowerCase();
const baselayerpnoa=url.indexOf('pnoa')>0;
	

const showRectangle=false;
//lon: -5.95902885535952, lat: 43.60809448949411
const initial_coordinates=[  -5.931243896484375,43.27820513231556];
const initial_zoom=8;
const maxZoom=(baselayerpnoa?24:22);
const minZoom=7
const folder='rpgur';


let capas=[
	 /*
	{
	 filename:'n01',
	 thematic:[
		{valor:'DOT',fillColor:'#0000cc',opacity:0.6},
		{valor:'ED',fillColor:'#ff0000',opacity:0.6},
		{valor:'EI',fillColor:'#ff0000',opacity:0.1},
		{valor:'MED',fillColor:'#ec0204',opacity:0.6},
		{valor:'MPE',fillColor:'#ff0000',opacity:0.1},
		{valor:'MPP',fillColor:'#ff0000',opacity:0.1},
		{valor:'PE',fillColor:'#ff0000',opacity:0.1},
		{valor:'PG',fillColor:'#000000',opacity:0.1},
		{valor:'PP',fillColor:'#ff0000',opacity:0.1},
		{valor:'PTE',fillColor:'#ff0000',opacity:0.1}
	 ],
	 tematic_attribute:'codtipo',
	 minimum_zoom:8,
	 maximum_zoom:10,
	 tooltip:'',
	 opacity:0.6,
	 zIndex:10
 }*/
 {
	 filename:'pg_vigentes_1',
	 thematic:[
		{like:true,valor:'NSPM',fillColor:'#d19728',opacity:0.5},
		{like:true,valor:'PGO ',fillColor:'#198179',opacity:0.5},
		{like:true,valor:'PGOU',fillColor:'#3f2a90',opacity:0.5}
	 ],
	 thematic_attribute:'TIPO',
	 minimum_zoom:8,
	 maximum_zoom:9,
	 label:'ETIQUETA',
	 tooltip:'${this.NOMBRE} ${this.ETIQUETA}',
	 opacity:0.6,
	 zIndex:10
 
 }
 ,
 {
	 filename:'n02',
	 thematic:[
		 {valor:'SUR',fillColor:'#0000ff',opacity:0.6},
		 {valor:'SNU',fillColor:'#006d00',opacity:0.6},
		 {valor:'SU',fillColor:'#f80000',opacity:0.6}
	 ],
	 thematic_attribute:'Clasificac',
	 minimum_zoom:10,
	 maximum_zoom:14,
	 tooltip:'n02 ${this.Clasificac}',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'n03',
	 thematic:[
		 {valor:'SU-C',fillColor:'#f80300',opacity:0.6},
		 {valor:'SU-NC',fillColor:'#006d00',opacity:0.6}
	 ],
	 thematic_attribute:'categoria',
	 minimum_zoom:12,
	 maximum_zoom:19,
	 tooltip:'n03 ${this.categoria} ${this.Nombre}',
	 opacity:0.6,
	 zIndex:10
 } ,
 {
	 filename:'n04_1',
	 thematic:[
		 {valor:'SUR-PR',fillColor:'#0000ff',opacity:0.5},
		 {valor:'SUR-S',fillColor:'#3333ff',opacity:0.5},
		 {valor:'SUR-NS',fillColor:'#000033',opacity:0.5}
	 ],
	 thematic_attribute:'tipo',
	 minimum_zoom:15,
	 maximum_zoom:19,
	 label:'Etiqueta',
	 tooltip:'n04 ${this.tipo}   ${this.Nombre}',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'n05',
	 thematic:[
		 {valor:'SNU-C',fillColor:'#00fafa',opacity:0.5},
		 {valor:'SNU-EP',fillColor:'#006d00',opacity:0.5},
		 {valor:'SNU-I',fillColor:'#7fff7f',opacity:0.5},
		 {valor:'SNU-IF',fillColor:'#cccccc',opacity:0.5},
		 {valor:'SNU-NR',fillColor:'#ffffff',opacity:0.5},
	 ],
	 thematic_attribute:'categoria',
	 minimum_zoom:14,
	 maximum_zoom:19,
	 label:'Etiqueta',
	 tooltip:'n05 ${this.categoria}   ${this.Etiqueta}',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'n06',
	 colorScale: ((d) => {
			return '#ffff4b'; 
		}),
	 thematic_attribute:'Etiqueta',
	 minimum_zoom:14,
	 maximum_zoom:19,
	 tooltip:'n06  ${this.Etiqueta}',
	 label:'Etiqueta',
	 opacity:0.6,
	 zIndex:10
 }
 ];
