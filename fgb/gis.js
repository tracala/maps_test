const PNOAWMSZOOMLEVEL=21;


 function handleHeaderMeta(headerMeta) {
                const header = document.getElementById('header')
                const formatter = new JSONFormatter(headerMeta, 10)
                while (header.firstChild)
                    header.removeChild(header.firstChild)
                header.appendChild(formatter.render())
            }


document.addEventListener("DOMContentLoaded", async () => { 
	map = L.map('map').setView(initial_coordinates, initial_zoom).setMaxZoom(maxZoom).setMinZoom(minZoom);

	
	if(baselayerpnoa){
		
		var template =  'https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=&LAYER={layer}&STYLE=&FORMAT=image/png&TILEMATRIXSET={tileMatrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'

		var layer = L.tileLayer(template, {
			maxZoom: (PNOAWMSZOOMLEVEL-1),
			minZoom: minZoom,
		  layer: 'OI.OrthoimageCoverage',
		  tileMatrixSet: 'EPSG:3857',
		  noWrap: true
		}).addTo(map);
		
		PNOAWMS_LAYER=L.tileLayer.wms('https://www.ign.es/wms-inspire/pnoa-ma', {layers:'OI.OrthoimageCoverage',minZoom:PNOAWMSZOOMLEVEL,maxZoom:maxZoom }).addTo(map);


	}
	else	
	{
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			minZoom: minZoom,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

	}

	// For the example, we fix a visible Rect in the middle of the map
	function getBoundForRect() {
		const bounds = map.getBounds();
		return bounds;

		/*
		const width = map.distance(bounds.getNorthWest(), bounds.getNorthEast());
		const height = map.distance(bounds.getNorthWest(), bounds.getSouthWest());
		return map.getCenter().toBounds(Math.min(width, height) * 0.95);
		*/
	}

	// convert the rect into the format flatgeobuf expects
	function fgBoundingBox() {
		const bounds = getBoundForRect();
		return {
			minX: bounds.getWest(),
			maxX: bounds.getEast(),
			minY: bounds.getSouth(),
			maxY: bounds.getNorth(),
		};
	}

	// show a leaflet rect corresponding to our bounding box
	let rectangle = null;
	if(showRectangle) L.rectangle(getBoundForRect(), { interactive: false, color: "blue", fillOpacity: 0.0, opacity: 1.0 }).addTo(map);

	// track the previous results so we can remove them when adding new results
	let previousResults = L.layerGroup().addTo(map);
	
	
	
	async function updateResults() {
		// remove the old results




		previousResults.remove();
		const nextResults = L.layerGroup().addTo(map);
		previousResults = nextResults;

		// Use flatgeobuf JavaScript API to iterate features as geojson.
		// Because we specify a bounding box, flatgeobuf will only fetch the relevant subset of data,
		// rather than the entire file.
		//const fgb_file='https://flatgeobuf.septima.dk/population_areas.fgb';


		async function process_layer(capa){
			if((map.getZoom()>=capa.minimun_zoom) && (map.getZoom()<=capa.maximun_zoom)){
				
				let is_seekableZstd=false;
				
				if(capa.filename=='rustica') is_seekableZstd=true;
				if(capa.filename=='rustica_simplif') is_seekableZstd=true;
				if(capa.filename=='parcelas') is_seekableZstd=true;
				
				let fgb_file=folder+'/'+capa.filename+'.fgb';
				if(is_seekableZstd) fgb_file+='.zst';
				const iter = flatgeobuf.deserialize(fgb_file, {rect:fgBoundingBox(),seekableZstd:is_seekableZstd});

				const fillTemplate = function(templateString, templateVars){
					return new Function("return `"+templateString +"`;").call(templateVars);
				}

				for await (const feature of iter) {
					// Leaflet styling
					const defaultStyle = { 
						color: capa.colorScale(feature.properties[capa.colorScale_attribute]), 
						weight: 1, 
						fillOpacity: capa.opacity,
					};
					

				my_tooltip=fillTemplate(capa.tooltip, feature.properties);
				
				L.geoJSON(feature, {
						style: defaultStyle,
					}).on({
						'mouseover': function(e) {
							const layer = e.target;
							layer.setStyle({
								weight: 4,
								fillOpacity: 0.8,
							});
						},
						'mouseout': function(e) {
							const layer = e.target;
							layer.setStyle(defaultStyle);
						}
				   }).bindPopup(my_tooltip+'</h1>') //
				   .addTo(nextResults);
				}
			}

			
		}


		capas.map(process_layer);
		
		if(showRectangle) rectangle.bringToFront();
	}
	// if the user is panning around alot, only update once per second max
	updateResults = _.throttle(updateResults, 1000);

	// show results based on the initial map
	updateResults();
	// ...and update the results whenever the map moves
	map.on("moveend", function(s){
		if(showRectangle) rectangle.setBounds(getBoundForRect());
		updateResults();
	});
});