const {DeckGL, GeoJsonLayer, TextLayer} = deck;

const myMapStyle={
  "version": 8,
  "name": "RPGUR",
  "sources":{},
  "metadata": {},
  "sprite": "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/sprite",
  "glyphs": "https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "layout": {
        "visibility": "visible"
      },
      "paint": {
        "background-color": "#fafaf8",
        "background-opacity": 1
      }
    }],
	"id":'1',
	"owner":'carto'
}


let myDeckGL;

 const DIST=1.5;
 
 const coordToBBOX = (x,y,xdist,ydist)=>{
        return { minX: x-xdist, minY: y-ydist, maxX: x+xdist, maxY: y+ydist};
 }
 
 const viewStateToBbox = (v) => {
        /*
		const vp = new deck.WebMercatorViewport(v);
        const nw = vp.unproject([0, 0]),
        se = vp.unproject([vp.width, vp.height]);
        return { minX: nw[0], minY: se[1], maxX: se[0], maxY: nw[1] };
		  */
		const xdist=DIST;
		const ydist=xdist;
		const x=v.longitude;
		const y=v.latitude;
		return coordToBBOX(x,y,xdist,ydist);
	
      };
	  
let debounce = null;


  const fetchData = async (v) => {
      let bbox=null;
	  if(v) bbox=viewStateToBbox(v);

      const layerDataPromises = capas.map(async (layer) => {
		let add_layer=false;
		
		if(!myDeckGL) {if(layer.filename=='pg_vigentes_1') add_layer=true;}
		else
			if(v)
				if((v.zoom>(layer.minimum_zoom-1)) && (v.zoom<=layer.maximum_zoom))			
					add_layer=true;
		
        if(add_layer){
			//if(v) console.log('Adding '+layer.filename + layer.minimum_zoom +' ' + layer.maximum_zoom+' '+v.zoom);
			const fc = { type: "FeatureCollection", features: [] };
			let i = 0;

		
			let r;
			let fgb_filename=folder+'/'+layer.filename+'.fgb';
			if(bbox!=null) 
				r=flatgeobuf.deserialize(fgb_filename,bbox);
			else 
				r=flatgeobuf.deserialize(fgb_filename,coordToBBOX(initial_coordinates[0],initial_coordinates[1],DIST,DIST));
			
			for await (const feature of r ) {
			  fc.features.push({ ...feature, id: i });
			  i += 1;
			}

			
			
			let my_getFillColor=hexToRgb('#ffaaaa');
			if(layer.thematic){
				var ar={};
				for(let l of layer.thematic)
					ar[l.valor]=l.fillColor;
				my_getFillColor=createThematicFunction(ar,layer.thematic_attribute); 
			}
			
			
			return geoJsonLayer = new GeoJsonLayer({
				  id: layer.filename,
				  data: fc,
				  opacity: 0.8,
				  stroked: true,
				  filled: true,
				  extruded: false,
				  wireframe: false,
				  getFillColor:my_getFillColor,
				  getLineColor:[0, 0, 0, 200],
				  getLineWidth: 10,
				  pickable: true
				});
				
			
		}
		else return;
      });

      let fetchedLayersData = await Promise.all(layerDataPromises);
	  fetchedLayersData=fetchedLayersData.filter(p=>((p!=null)&&(p!=undefined)));


		
	  if(!myDeckGL)	{
		myDeckGL=new DeckGL({
			  mapStyle: myMapStyle,
			  initialViewState: {
				longitude: initial_coordinates[0],
				latitude: initial_coordinates[1],
				zoom: initial_zoom,
				maxZoom: 16,
				pitch: 0
			  },
			  controller: true,
			  layers: fetchedLayersData,
			  onViewStateChange: ({ viewState, interactionState }) => {
					  if (interactionState.isDragging) return;
					  clearTimeout(debounce);
					  debounce = setTimeout(() => update(viewState), 300);
					},
			  //getTooltip
			});
	  }



      return fetchedLayersData;
    };





      async function update(v) {
		let my_layers=await fetchData(v);
        myDeckGL.setProps({ layers: my_layers });
      }
      



update(null);

  function campo(l,attr,label){
		return (l[attr]!=null)?(label+': '+l[attr])+'\n':'';
	}
		
	function getTooltip({object}) {
	  let res=null;
	  if(object){
		  let l=object.properties;
		  res=`${campo(l,'NOMBRE','Parroquia')}${campo(l,'SUPERFICIE','Sup')}`;
	  }
      return res;
    }
	

function createThematicFunction(ar,attribute){
	return function(p){
		let val=p.properties[attribute];
		let f=(ar[val]);
		if(!f) f='#AAAAAA';
		return hexToRgb(f);
	}
}

function hexToRgb(hex) {
  const match = hex.match( /[\da-f]{2}/gi ); 

  if (match) {
    const r = parseInt(match[0], 16);
    const g = parseInt(match[1], 16);
    const b = parseInt(match[2], 16);
    return [r, g, b];
  }

  return null; 
}


const fillTemplate = function(templateString, templateVars){
	return new Function("return `"+templateString +"`;").call(templateVars);
}
