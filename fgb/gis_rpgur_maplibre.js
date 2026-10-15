const PNOAWMSZOOMLEVEL=21;
const showHeaderInfo=url.indexOf('debug')>0;;

const PNOA_WMS='https://www.ign.es/wms-inspire/pnoa-ma';
const PNOA_WMTS='https://www.ign.es/wmts/pnoa-ma';


let map;

function filterString(feature,atribute){
	let s=feature.properties[atribute];
	return (s?s:'');
}


const fillTemplate = function(templateString, templateVars){
	return new Function("return `"+templateString +"`;").call(templateVars);
}

let params = new URLSearchParams(document.location.search);
let background_tiles_index = 0;

if(params.get("background_tiles_index")) background_tiles_index=parseInt(params.get("background_tiles_index"), 0);



let background_tiles=[
	'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
	'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
	'http://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=0&dir=dir_n’',
	'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
	'https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{y}.jpeg',
	'https://tms-ign-base.idee.es/1.0.0/IGNBaseTodo/{z}/{x}/{y}.jpeg'
];



    document.addEventListener("DOMContentLoaded", async () => {
        // basic MapLibre map
        map = new maplibregl.Map({
            container: "map",
			 
            //style: "https://demotiles.maplibre.org/style.json",
			style: {
					'version': 8,
					'sources': {
						'raster-tiles': {
							'type': 'raster',
							'tiles': [
								background_tiles[background_tiles_index]
							],
							'tileSize': 256							
						}
					},
					'glyphs': 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
					'layers': [
						{
							'id': 'simple-tiles',
							'type': 'raster',
							'source': 'raster-tiles',
							'minzoom': 0,
							'maxzoom': 22
						}
					]
				},
			
            center: initial_coordinates,
            zoom: initial_zoom,
            maxZoom: maxZoom,
            minZoom: minZoom,
        });

        // optionally show some meta-data about the FGB file
        function handleHeaderMeta(headerMeta) {
            const header = document.getElementById("header")
            const formatter = new JSONFormatter(headerMeta, 10)
            header.appendChild(formatter.render())
        }

        // convert the rect into the format flatgeobuf expects
        function fgBoundingBox() {
            
			const { _sw, _ne } = map.getBounds();
			return { minX: _sw.lng, minY: _sw.lat, maxX: _ne.lng, maxY: _ne.lat};
        }

        function getRect() {
            const bbox = fgBoundingBox();
            const coords = [[
                [bbox.minX, bbox.minY],
                [bbox.maxX, bbox.minY],
                [bbox.maxX, bbox.maxY],
                [bbox.minX, bbox.maxY],
                [bbox.minX, bbox.minY],
            ]];
            return {
                type: "FeatureCollection",
                features: [{
                    type: "Feature",
                    geometry: { type: "Polygon", coordinates: coords }
                }]
            }
        }

        async function updateResults() {
			capas.map(async capa=>
			{
				const fc = {type: "FeatureCollection", features: []};
				
				if((map.getZoom()>(capa.minimum_zoom-1)) && (map.getZoom()<=capa.maximum_zoom)){
					try{
						let i = 0;
						let iter = flatgeobuf.deserialize(folder+'/'+capa.filename+'.fgb', 
							{rect: fgBoundingBox(), headerMetaFn:showHeaderInfo?handleHeaderMeta:null});

						for await (let feature of iter) {
							fc.features.push({...feature, id: i});
							i += 1;
						}
						map.getSource("blocks_"+capa.filename).setData(fc);
					}catch(error){
						console.log('Error procesando '+capa.filename+'   '+error);
					}
				} else map.getSource("blocks_"+capa.filename).setData(fc);
				
			});
        }

        
		map.on("load", () => {
            

 	   /*
	   map.addSource('wms-test-source', {
            'type': 'raster',
            'tiles': [
				PNOA_WMTS+'?SERVICE=WMTS&REQUEST=GetTile&VERSION=&LAYER={layer}&STYLE=&FORMAT=image/png&TILEMATRIXSET={tileMatrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'
            ],
            'tileSize': 256
        });
        map.addLayer(
            {
                'id': 'wms-test-layer',
                'type': 'raster',
                'source': 'wms-test-source',
                'paint': {}
            },
            'OI.OrthoimageCoverage'
        );
		*/
 

			
			capas.forEach((d) =>{
				map.addSource("blocks_"+d.filename, {
					type: "geojson",
					data: {type: "FeatureCollection", features: []},
				});
				/*
				const pop = ["to-number", ["get", "Area"], 0];
				const color = [
					"case",
					[">", pop, 750], "#800026",
					[">", pop, 500], "#BD0026",
					[">", pop, 250], "#E31A1C",
					[">", pop, 100], "#FC4E2A",
					[">", pop, 50], "#FD8D3C",
					[">", pop, 25], "#FEB24C",
					[">", pop, 10], "#FED976",
					"#FF0000",
				];*/
				let color="#FF0000";
				let opacity=0.4;
				if(d.thematic){
					let res=['match',["get", d.thematic_attribute]];
					let res2=res.slice();
					for(let l of d.thematic) {
						res.push(l.valor);res.push(l.fillColor);
						res2.push(l.valor);res2.push(l.opacity);
					};						
					res.push(color);
					res2.push(opacity);
					color=res;
					opacity=res2;
				} 
				else
				if(d.colorScale){
					color=d.colorScale(1); //feature.properties[d.colorScale_attribute]
				}
				
				//console.log('color',color);
				
				map.addLayer({
					id: "blocks-fill_"+d.filename,
					type: "fill",
					source: "blocks_"+d.filename,
					paint: {
						"fill-color": color,
						"fill-opacity": [
							"case",
							["boolean", ["feature-state", "hover"], false],
							0.8,
							0.6
						],
					},
				});
				map.addLayer({
					id: "blockes-line_"+d.filename,
					type: "line",
					source: "blocks_"+d.filename,
					paint: {
						"line-color": color,
						"line-opacity": 0.8,
						"line-width": 2,
					},
				});
				
				if(d.label){
					  map.addLayer({
						'id': "blockes-text_"+d.filename,
						'type': 'symbol',
						'source': "blocks_"+d.filename,
						'layout': {
							'text-field': ['get', d.label],
							'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
							'text-radial-offset': 0.5,
							'text-justify': 'auto'
						}
					});
				}

				if(showRectangle){
					map.addSource("rectangle", {
						type: "geojson",
						data: {type: "FeatureCollection", features: []},
					});
					map.addLayer({
						id: "rectangle",
						type: "line",
						source: "rectangle",
						paint: {
							"line-color": "#0000FF",
							"line-opacity": 0.9,
							"line-width": 3,
						},
					});
				}

				let hoveredStateId = null;
				for(let capa of capas){
					map.on("click", "blocks-fill_"+capa.filename, (e) => {
						const props = e.features[0].properties;
						const html = my_tooltip=fillTemplate(capa.tooltip, props);
						new maplibregl.Popup()
							.setLngLat(e.lngLat)
							.setHTML(html)
							.addTo(map);
					});
				
				



				map.on("mousemove", "blocks-fill_"+capa.filename, (e) => {
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							map.setFeatureState(
								{ source: "blocks_"+capa.filename, id: hoveredStateId },
								{ hover: false }
							);
						}
						hoveredStateId = e.features[0].id;
						map.setFeatureState(
							{ source: "blocks_"+capa.filename, id: hoveredStateId },
							{ hover: true }
						);
					}
				});
				map.on("mouseenter", "blocks-fill_"+capa.filename, () => {
					map.getCanvas().style.cursor = "pointer";
				});

				map.on("mouseleave", "blocks-fill_"+capa.filename, () => {
					map.getCanvas().style.cursor = "";
					if (hoveredStateId !== null) {
						map.setFeatureState(
							{ source: "blocks_"+capa.filename, id: hoveredStateId },
							{ hover: false }
						);
					}
					hoveredStateId = null;
				});



				}

			});
			
			

            // if the user is panning around alot, only update once per second max
            updateResults = _.throttle(updateResults, 1000);

            // show a rectangle corresponding to our bounding box
            if(showRectangle)
				map.getSource("rectangle").setData(getRect());

            // show results based on the initial map
            updateResults();

            // ...and update the results whenever the map moves
            map.on("moveend", function(s){
                if(showRectangle) map.getSource("rectangle").setData(getRect());
                updateResults();
            });
        });
    });

