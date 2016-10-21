$(document).ready(function(e){
	
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 600;

var FPS = 30;


var canvas = document.getElementById('canvas'); 
var c = canvas.getContext('2d'); 

var bases 
var cities
var missiles

var mountains_image
var missile_image
var city_image



function loadResources(){
	mountains_image = new Image();
	mountains_image.src = "mountains.png";
	
	missile_image = new Image();
	missile_image.src = "missile.png";

	city_image = new Image();
	city_image.src = "city.png"
}

function setup(){
	//create three bases with 10 missiles
	bases = [];
	for (var i = 0; i < 3; i++){
		console.log('pushing base')
		bases.push({
			id: i,
			state: "alive",
			missiles: 10
		})
	}
	//create cities
	cities = [];
	for (var i = 0; i < 6; i++){
		cities.push({
			id: i,
			state: "alive",
		})
	}
	//create missiles
	missiles = [];
}

//========update functions===========
function updateBases(){
	//for each base
	for (var i = 0; i <3; i++){
		var base = bases[i]
		if(!base) continue;

		if(base && base.state == "hit") {   
                base.state = "out";
        }
    }

    //remove out bases
    bases = bases.filter(function(e) {
            if(e && e.state != "out") return true;
            return false;
    });
}

function updateBackground() {
}

function updateCities(){
	//for each city
	for (var i = 0; i <6; i++){
		var city = cities[i]
		if(!city) continue;

		if(city && city.state == "hit") {   
                city.state = "destroyed";
        }
    }

    //remove destroyed cities
    cities = cities.filter(function(e) {
            if(e && e.state != "destroyed") return true;
            return false;
    });
}

function updateMissiles(){
	missiles = missiles.filter(function(e) {
            if(e && e.active) return true;
            return false;
    });

    //change position of missiles
    for (var i = 0; i <missiles.length; i++){
    	var missile = missiles[i]
    	missile.update();
    }

}



//=======draw functions=============

function drawBackground(c){
	c.fillStyle = "black";
	c.fillRect(0,0,600,600);
	c.drawImage(mountains_image, 0, 10);
}

function drawCities(c){
	var step = 0
	city_image.onload = function(){
		//console.log(cities.length)
		for (var i in cities){
			var city = cities[i]
			if (city.state == "alive"){
				city.id < 3 ? step = 90 : step = 120
				c.drawImage(city_image,
							0,0,256,256,
							(step+(city.id*65)), 550, 40,40
							)
			}
		}
	}
}

function drawBases(c){
	for (var i in bases){
		var base = bases[i]
		if (base.state == "alive"){
			drawMissiles(c, base)
		}
	}

}

function drawMissiles(c, base){	
	//console.log('drawing missile' + base.id)
	var x = 50 + (220 * (base.id));	
	var y = 550;
	var line_space = 0;	
	var shift = 0;
	//only do this the amount of time there are missiles
	for (var b = 0; b < base.missiles; b++){	
		c.drawImage(missile_image,
					0,0, 20,20,
					x,y, 19,19)
		if (b%4){
			line_space = 10
			shift = -10
		}
		else if (b%2==0){
			//console.log('adding a shift')
			line_space += 10
			shift += 10
		}
		x = (50) + (220 * (base.id)) - shift
		y = (550)+line_space
	}
}


function drawMissilePath() { 
	//console.log('trying to draw m path')
    for (var i = 0; i < missiles.length; i++){
    	var missile = missiles[i]
    	if((missile.target[0] == missile.x)){
    		//alert('explode!')
    		Sound.play("explode");
    		explosion(missile)
    		missile.active = false;
    	}else{
    		//console.log(missile.target[0] + " " + missile.x + " " + missile.target[1]  + missile.y)
    	missile.draw();}
    }
}; 

var particles = []; 

function explosion(missile){
	particles = []; //clear any old values 
        for(var i = 0; i<50; i++) { 
            particles.push({ 
                    x: missile.x ,
                    y: missile.y,
                    xv: (Math.random()-0.5)*2.0*5.0,  // x velocity 
                    yv: (Math.random()-0.5)*2.0*5.0,  // y velocity 
                    age: 0, 
            }); 
        }

        for(var i=0; i<particles.length; i++) { 
            var p = particles[i]; 
            p.x += p.xv; 
            p.y += p.yv; 
            var v = 255-p.age*3; 
            c.fillStyle = "rgb("+v+","+v+","+v+")"; 
            c.fillRect(p.x,p.y,3,3); 
            p.age++; 
        }  
}
 

//actions
function launchMissile(x,y){
	if (x > 400){
		var base = bases[2]
		var base_cord = [544, 553]
	}
	else if (x > 200){
		var base = bases[1]
		var base_cord = [254, 541]
	}
	else{
		var base = bases[0]
		var base_cord = [68,537]
	}

	if (base.missiles == 0){
		return;
	}else{
		base.missiles --;
	}

	var missilePosition = base_cord

	//console.log('adding a missile')
	missiles.push(Missile({
		speed: 5,
		x: missilePosition[0],
		y: missilePosition[1],
		target: [x,y],
		origin: [missilePosition[0],missilePosition[1]],
		slope: slope(missilePosition[0], missilePosition[1], x, y),
		line: lineEq(missilePosition[0], missilePosition[1], slope(missilePosition[0], missilePosition[1], x, y) )
	}));
};

//==objects

function Missile(I, x, y){
	I.active = true;
	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 3;
	I.height = 3;
	I.color = "blue"


	I.inBounds = function(){
		return I.x >= 0 && I.x <= CANVAS_WIDTH &&
      I.y >= 0 && I.y <= CANVAS_HEIGHT;
  	};

  	I.draw = function() {
	    c.fillStyle = this.color;
	    c.fillRect(this.x, this.y, this.width, this.height);
	};

	I.update = function() {
		if (I.slope > 0){
	    	I.x --;}
	    else if (I.slope < 0){
	    	I.x ++;
	    }
	    I.y = (I.slope * I.x + I.line);

    	I.active = I.active && I.inBounds();
    	console.log(I.slope + " <--slope  line--->"+ I.line);
  	};

  return I;

}

function slope(x1, y1, x2, y2){
	var slope = (y1-y2) / (x1- x2)
	return slope
}

function lineEq(x1, y1, slope){
	var lineEq = y1 - slope * x1;
	return lineEq
}


//document setup
// shim layer with setTimeout fallback 
window.requestAnimFrame = (function(){ 
  return  window.requestAnimationFrame       ||  
          window.webkitRequestAnimationFrame ||  
          window.mozRequestAnimationFrame    ||  
          window.oRequestAnimationFrame      ||  
          window.msRequestAnimationFrame     ||  
          function( callback ){ 
            window.setTimeout(callback, 1000 / 60); 
          }; 
})();

//click functions

	$(canvas).click(function(e){
		var x = e.pageX;
		var y = e.pageY

		//console.log(x + " " + y)
		launchMissile(x, y);
			
	});




setup();

function gameLoop(){
	loadResources();

	updateBases();
	updateCities();
	updateMissiles();

	drawBackground(c);
	drawBases(c);
	drawCities(c);
	drawMissilePath();
	return;
}

setInterval(gameLoop, 1000/FPS);

});

//=============game loop================



