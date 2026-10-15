const url=document.location.href.toLowerCase();
const baselayerpnoa=url.indexOf('pnoa')>0;
	

const showRectangle=false;

const initial_coordinates=[ 43.27820513231556, -5.931243896484375];
const initial_zoom=9;
const maxZoom=(baselayerpnoa?24:22);
const minZoom=4
const folder='rpgur';


let capas=[
	 /*
	{
	 filename:'n01',
	 tematico:[
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
	 colorScale_attribute:'codtipo',
	 minimun_zoom:8,
	 maximun_zoom:10,
	 tooltip:'',
	 opacity:0.6,
	 zIndex:10
 }*/
 {
	 filename:'pg_vigentes',
	 tematico:[
		{like:true,valor:'NSPM',fillColor:'#d19728',opacity:0.5},
		{like:true,valor:'PGO ',fillColor:'#198179',opacity:0.5},
		{like:true,valor:'PGOU',fillColor:'#3f2a90',opacity:0.5}
	 ],
	 colorScale_attribute:'INSTRUMENT',
	 minimun_zoom:8,
	 maximun_zoom:10,
	 label:'ETIQUETA',
	 tooltip:'${this.NOMBRE}',
	 opacity:0.6,
	 zIndex:10
 
 }
 ,
 {
	 filename:'n02',
	 tematico:[
		 {valor:'SUR',fillColor:'#0000ff',opacity:0.6},
		 {valor:'SNU',fillColor:'#006d00',opacity:0.6},
		 {valor:'SU',fillColor:'#f80000',opacity:0.6}
	 ],
	 colorScale_attribute:'Clasificac',
	 minimun_zoom:11,
	 maximun_zoom:14,
	 tooltip:'n02 ${this.Clasificac}',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'n03',
	 tematico:[
		 {valor:'SU-C',fillColor:'#f80300',opacity:0.6},
		 {valor:'SU-NC',fillColor:'#006d00',opacity:0.6}
	 ],
	 colorScale_attribute:'categoria',
	 minimun_zoom:12,
	 maximun_zoom:19,
	 tooltip:'n03 ${this.categoria} ${this.Nombre}',
	 opacity:0.6,
	 zIndex:10
 } ,
 {
	 filename:'n04',
	 tematico:[
		 {valor:'SUR-PR',fillColor:'#0000ff',opacity:0.5},
		 {valor:'SUR-S',fillColor:'#3333ff',opacity:0.5},
		 {valor:'SUR-NS',fillColor:'#000033',opacity:0.5}
	 ],
	 colorScale_attribute:'Tipo_de_Suelo_Urbanizable',
	 minimun_zoom:15,
	 maximun_zoom:19,
	 label:'Etiqueta',
	 tooltip:'n04 ${this.Tipo_de_Suelo_Urbanizable}   ${this.Nombre}',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'n05',
	 tematico:[
		 {valor:'SNU-C',fillColor:'#00fafa',opacity:0.5},
		 {valor:'SNU-EP',fillColor:'#006d00',opacity:0.5},
		 {valor:'SNU-I',fillColor:'#7fff7f',opacity:0.5},
		 {valor:'SNU-IF',fillColor:'#cccccc',opacity:0.5},
		 {valor:'SNU-NR',fillColor:'#ffffff',opacity:0.5},
	 ],
	 colorScale_attribute:'categoria',
	 minimun_zoom:15,
	 maximun_zoom:19,
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
	 colorScale_attribute:'Etiqueta',
	 minimun_zoom:15,
	 maximun_zoom:19,
	 tooltip:'n06  ${this.Etiqueta}',
	 label:'Etiqueta',
	 opacity:0.6,
	 zIndex:10
 }
 ];
