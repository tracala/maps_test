const with_pattern='siose_asturias,corine,recintos_sigpac,rustica,gadm2';


const patterns = ['dots', 'hatch-1x', 'hatch-2x', 'hatch-cross'];



function getRandomColorRGB() {
	
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	return `rgb(${r},${g},${b})`;

	}

function getRandomColor() {
	return (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
}


function getRandomNumber(max, seed) {
    seed = Number(seed) | 0;

    seed ^= seed >>> 16;
    seed = Math.imul(seed, 0x45d9f3b);
    seed ^= seed >>> 16;
    seed = Math.imul(seed, 0x45d9f3b);
    seed ^= seed >>> 16;

    return (seed >>> 0) % max;
}


function getRandomColorSeed(seed) {
    seed = Number(seed) | 0;

    seed ^= seed >>> 16;
    seed = Math.imul(seed, 0x45d9f3b);
    seed ^= seed >>> 16;
    seed = Math.imul(seed, 0x45d9f3b);
    seed ^= seed >>> 16;

    return (seed >>> 0).toString(16).padStart(8, '0').substring(2);
}

function hexToRgbaArray(hex, alpha = 1.0) {
        hex = hex.replace('#', '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b, alpha * 255];
}

function swap_color(s){
	return s.substring(2,4)+s.substring(0,2)+s.substring(4,6);
}





let symbology={};
symbology['corine']={};
symbology['corine'].data={};

symbology['corine'].data[111]='232323,e6004d,Tejido urbano continuo';
symbology['corine'].data[112]='232323,ff0000,Tejido urbano discontinuo';
symbology['corine'].data[121]='232323,b333e6,Zonas industriales o comerciales';
symbology['corine'].data[122]='232323,cc0000,Redes viarias, ferroviarias y terrenos asociados';
symbology['corine'].data[123]='232323,e6b3b3,Zonas portuarias';
symbology['corine'].data[124]='232323,d9bfd9,Aeropuertos';
symbology['corine'].data[131]='232323,a800cf,Zonas de extracción minera';
symbology['corine'].data[132]='232323,a84d00,Escombreras y vertederos';
symbology['corine'].data[133]='232323,ff4dff,Zonas en construcción';
symbology['corine'].data[141]='232323,ffa6ff,Zonas verdes urbanas';
symbology['corine'].data[142]='232323,ffe6ff,Instalaciones deportivas y recreativas';
symbology['corine'].data[211]='232323,ffffa8,Tierras de labor en secano';
symbology['corine'].data[212]='232323,ffe64d,Terrenos regados permanentemente';
symbology['corine'].data[213]='232323,e68080,Arrozales';
symbology['corine'].data[221]='232323,d96600,Viñedos';
symbology['corine'].data[222]='232323,f2a600,Frutales';
symbology['corine'].data[223]='232323,e4a100,Olivares';
symbology['corine'].data[231]='232323,f2f24d,Praderas';
symbology['corine'].data[241]='232323,ffe6a6,Cultivos anuales asociados con cultivos permanentes';
symbology['corine'].data[242]='232323,ffff00,Mosaico de cultivos';
symbology['corine'].data[243]='232323,ffcc4d,Terrenos principalmente agrícolas, pero con importantes espacios de vegetación natural';
symbology['corine'].data[244]='232323,f2cca5,Sistemas agroforestales';
symbology['corine'].data[311]='232323,80ff00,Bosques de frondosas';
symbology['corine'].data[312]='232323,00a600,Bosques de coniferas';
symbology['corine'].data[313]='232323,4de600,Bosque mixto';
symbology['corine'].data[321]='232323,cce64d,Pastizales naturales';
symbology['corine'].data[322]='232323,a5fe7f,Landas y matorrales';
symbology['corine'].data[323]='232323,a5e54c,Vegetación esclerofila';
symbology['corine'].data[324]='232323,a6e600,Matorral boscoso de transición';
symbology['corine'].data[331]='232323,e6e6e6,Playas, dunas y arenales';
symbology['corine'].data[332]='232323,cccccc,Roquedo';
symbology['corine'].data[333]='232323,bffeb2,Espacios con vegetación escasa';
symbology['corine'].data[334]='232323,000000,Zonas quemadas';
symbology['corine'].data[335]='232323,a5e5cc,Glaciares y nieves permanentes';
symbology['corine'].data[411]='232323,a5a6ff,Humedales y zonas pantanosas';
symbology['corine'].data[412]='232323,4d4dff,Turberas';
symbology['corine'].data[421]='232323,ccccfe,Marismas';
symbology['corine'].data[422]='232323,e5e5fe,Salinas';
symbology['corine'].data[423]='232323,a5a5e5,Zonas llanas intermareales';
symbology['corine'].data[511]='232323,00cce6,Cursos de agua';
symbology['corine'].data[512]='232323,a5e6e6,Láminas de agua';
symbology['corine'].data[521]='232323,00fea5,Lagunas costeras';
symbology['corine'].data[522]='232323,a5fee5,Estuarios';
symbology['corine'].data[523]='232323,e5f2fe,Mares y océanos';


symbology['siose']={};
symbology['siose'].data={};
symbology['siose'].data['111']='E65069,Casco';
symbology['siose'].data['112']='F06E82,Ensanche';
symbology['siose'].data['113']='CC3D6D,Discontinuo';
symbology['siose'].data['114']='E6CCCC,Zona verde urbana';
symbology['siose'].data['121']='E6CCE6,Instalación agrícola y/o ganadera';
symbology['siose'].data['122']='A3A3BF,Instalación forestal';
symbology['siose'].data['123']='70694C,Extracción minera';
symbology['siose'].data['130']='F2E8B6,Industrial';
symbology['siose'].data['140']='FFFFD2,Servicio Dotacional';
symbology['siose'].data['150']='E6AA5A,Asentamiento agrícola y huerta';
symbology['siose'].data['161']='E6AA5A,Red viaria o ferroviaria';
symbology['siose'].data['162']='C8A68C,Puerto';
symbology['siose'].data['163']='FF8296,Aeropuerto';
symbology['siose'].data['171']='F0E678,Infraestructura de suministro';
symbology['siose'].data['172']='C8AA50,Infraestructura de residuos';
symbology['siose'].data['210']='E6BD5F,Cultivo herbáceo';
symbology['siose'].data['220']='EDED5F,Invernadero';
symbology['siose'].data['231']='EDD377,Frutal cítrico';
symbology['siose'].data['232']='DDED8E,Frutal no cítrico';
symbology['siose'].data['233']='50B051,Viñedo';
symbology['siose'].data['234']='109C69,Olivar';
symbology['siose'].data['235']='38A65D,Otros cultivos leñosos';
symbology['siose'].data['236']='BEED5F,Combinación de cultivos leñosos';
symbology['siose'].data['240']='64B482,Prado';
symbology['siose'].data['250']='82D957,Combinación de cultivos';
symbology['siose'].data['260']='58BF43,Combinación de cultivos con vegetación';
symbology['siose'].data['311']='F0C864,Bosque de frondosas';
symbology['siose'].data['312']='D9D6C7,Bosque de coníferas';
symbology['siose'].data['313']='3C503C,Bosque mixto';
symbology['siose'].data['320']='D2F2C2,Pastizal o herbazal';
symbology['siose'].data['330']='A6A6FF,Matorral';
symbology['siose'].data['340']='6464FF,Combinación de vegetación';
symbology['siose'].data['351']='CCCCFF,Playa, duna o arenal';
symbology['siose'].data['352']='E6E6FF,Roquedo';
symbology['siose'].data['353']='F27961,Temporalmente desarbolado por incendios';
symbology['siose'].data['354']='61AAF2,Suelo desnudo';
symbology['siose'].data['411']='82BEF2,Zona húmeda y pantanosa';
symbology['siose'].data['412']='91D2F2,Turbera';
symbology['siose'].data['413']='4696FF,Marisma';
symbology['siose'].data['414']='E6F2FF,Salina';
symbology['siose'].data['511']='A6E6CC,Curso de agua';
symbology['siose'].data['512']='47CCB6,Lago o laguna';
symbology['siose'].data['513']='A07878,Embalse';
symbology['siose'].data['514']='B679F2,Lámina de agua artifiicial';
symbology['siose'].data['515']='F2AACE,Mar';
symbology['siose'].data['516']='F5A27A,Glaciar o nieve perpetua';


function intermediateColor(color1, color2, factor) {
	var result = "#";
	for (var i = 0; i < 3; i++) {
		var c1 = parseInt(color1.substring(i * 2 + 1, i * 2 + 3), 16);
		var c2 = parseInt(color2.substring(i * 2 + 1, i * 2 + 3), 16);
		var c = Math.round(c1 * (1 - factor) + c2 * factor);
		result += c.toString(16).padStart(2, '0');
	}
	return result;
}

//let min_dias=9999999999999999;;
//let max_dias=0;


function getSymbology(layer,properties,ii){
	if(layer=='corine'){
		var l=properties['CODE_18'];
		let ar=symbology['corine'].data[l];
		if(ar) return ar.split(',')[1];else return 'ff00ff';
	}else 	
    if(layer=='siose_asturias'){
		var l=properties['CODIIGE'];
		let ar=symbology['siose'].data[l];
		if(ar){ let mar=ar.split(',');properties['TEXTO']=mar[1];return mar[0];} else return 'ff00ff';
    }else
		if(layer=='edificios_madrid'){
			//console.log(properties.FECHA_ALTA)
			if(!properties.FECHA_ALTA) return 'eeeeee';
			if(properties.FECHA_ALTA.length<10) return 'eeeeee';

			let dias=(new Date(properties.FECHA_ALTA.substring(0,10)).getTime()-new Date('1970-01-01').getTime())/(60*60*24*1000)-17000;
			//if(dias>max_dias) {max_dias=dias;console.log('max_dias',max_dias);}
			//if(dias<min_dias) {min_dias=dias;console.log('min_dias',min_dias);}
			if(dias<0){dias=0;console.log('0',properties.FECHA_ALTA)}
			let coef=dias/3000;
			if(coef>1) {coef=1;console.log('1',properties.FECHA_ALTA)}
			let color=intermediateColor('#ff0000', '#00ff00', coef);
			//console.log(dias,coef,color);
			return color.substring(1);

		}
	
	else
    {
		return getRandomColorSeed(ii);
	}

}