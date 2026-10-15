const url=document.location.href.toLowerCase();
const baselayerpnoa=url.indexOf('pnoa')>0;
const rustica=url.indexOf('rustica')>0;
const RUSTICA_ZOOM_LEVEL=14;
	

const showRectangle=false;

const initial_coordinates=[ 43.27820513231556, -5.931243896484375];
const initial_zoom=9;
const maxZoom=(baselayerpnoa?24:22);
const minZoom=8
const folder='asturias';


let capas=[
 {
	 filename:'concejos_simp',
	 colorScale: ((d) => {
			return '#'+toHex(d/2000000)+'8D'+toHex(d/2000000);
		}),
	 colorScale_attribute:'Area',
	 minimun_zoom:8,
	 maximun_zoom:10,
	 tooltip:'${this.Nombre_ofi} -- ${this.Area} m2 de superfie.',
	 opacity:0.6,
	 zIndex:10
 },
 {
	 filename:'concejos',
	 colorScale: ((d) => {
			return '#'+toHex(d/2000000)+'8D'+toHex(d/2000000);
		}),
	 colorScale_attribute:'Area',
	 minimun_zoom:11,
	 maximun_zoom:12,
	 tooltip:'${this.Nombre_ofi} -- ${this.Area} m2 de superfie.',
	 opacity:0.6,
	 zIndex:10
	 
 },
 {
	 filename:'parroquias',
	 colorScale: ((d) => {
			return '#'+toHex(255-(d*12))+'66'+toHex(d*12);
		}),
	 colorScale_attribute:'SUPERFICIE',
	 minimun_zoom:RUSTICA_ZOOM_LEVEL-2,
	 maximun_zoom:RUSTICA_ZOOM_LEVEL-1,
	 tooltip:'${this.NOMBRE} -- ${this.SUPERFICIE} km2 de superfie.',
	 opacity:0.5,
	 zIndex:10

 },
 (rustica?
 {
	 filename:'rustica',
	 colorScale: ((d) => {
			return '#'+toHex(255-(d/3))+'AF'+toHex(d/3);
		}),
	 colorScale_attribute:'AREA',
	 minimun_zoom:RUSTICA_ZOOM_LEVEL,
	 maximun_zoom:maxZoom,
	 tooltip:'R\u00fastica ${this.REFCAT} -- ${this.AREA} m2 de superfie.',
	 opacity:0.4,
 	 zIndex:10
 }:
 {
	 filename:'parcelas',
	 colorScale: ((d) => {
			return '#'+toHex(255-(d/2))+'8D'+toHex(d/2);
		}),
	 colorScale_attribute:'AREA',
	 minimun_zoom:RUSTICA_ZOOM_LEVEL,
	 maximun_zoom:maxZoom,
	 tooltip:'Referencia ${this.REFCAT} -- ${this.AREA} m2 de superfie.',
	 opacity:0.4,
	 zIndex:20
  })
 ];
