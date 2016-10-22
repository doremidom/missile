$(document).ready(function(e){
	
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 600;

var FPS = 30;


var canvas = document.getElementById('canvas'); 
var c = canvas.getContext('2d'); 

var game = {
    state: "playing",
    score: 0
};

var overlay = {
    score: game.score,
    title: "foo",
    subtitle: "bar",
};

var bases 
var cities
var missiles
var enemies
var targets
var explosions

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
		bases.push({
			id: i,
			state: "alive",
			missiles: 10,
			width: 30,
			height: 30,
			x: 10 + (i*100),
			y: 550
		})
	}
	//create cities
	cities = [];
	for (var i = 0; i < 6; i++){
		cities.push({
			id: i,
			state: "alive",
			width: 40,
			height: 40,
			y: 550
		})
	}
	//create missiles
	missiles = [];

	//create targets 
	targets = [];

	//create explosions
	explosions = [];

	//create enemies
	enemies = [];
	for (var i = 0; i < 8; i++){
		createEnemy(enemies);	
	}
	//console.log(enemies);
}

function createEnemy(array){
	if (game.score > 300) return;

	var origin_x = Math.floor(Math.random() * CANVAS_WIDTH)
	var speed = Math.random()
		if (origin_x > 300){
			var side = 'right';
		}else{
			var side = 'left';
		}

		array.push({
			x: origin_x,
			y: 0,
			side: side,
			speed: speed,
			state: "alive",
			width: 20,
			height: 20
		})
}

function createTarget(array, x, y){
	//console.log('pushing target')
	array.push({
		x: x,
		y: y,
		state: "alive",
		width: 33,
		height: 33
	});
}

//========update functions===========

function updateGame(){
	//console.log(enemies.length)
	if (bases.length == 0 || cities.length == 0){
		console.log("game over!")
	    game.state = "over"
	}
	if (enemies.length == 0){
		game.state = "won"
		console.log("game won!")
	}
	

}

function updateCollisions(){
	//collisions involving enemies
	enemies.forEach(function(enemy){
		cities.forEach(function(city){
			if (collides(enemy, city)){
				//console.log('city enemy collision!')
				explode(city);
				city.state = "hit"
				explode(enemy);
				enemy.state = "dead"
			}
		})

		bases.forEach(function(base){
			if (collides(enemy, base)){
				//console.log('base enemy collision')
				explode(base);
				base.state = "out";
				base.missiles = 0;
				//console.log(base)
				explode(enemy);
				enemy.state = "dead";
			}
		})

		explosions.forEach(function(explosion){
			if (collides(enemy, explosion)){
				//console.log('explosion enemy collision')
				explode(enemy);
				game.score += 25;
				enemy.state = "dead";
			}
		})
	})
	//chain reaction explosions


}

function updateExplosions(){
	explosions = explosions.filter(function(e) {
	        if(e && e.counter < 11) return true;
	        return false;
	});
}

function updateTargets(){
	targets = targets.filter(function(e) {
            if(e && e.state != "dead") return true;
            return false;
    });
}

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
    //console.log("before filter" + bases.length)
    bases = bases.filter(function(e) {
            if(e && e.state != "out") return true;
            return false;
    });
    //console.log("after filter" + bases.length)
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

function updateEnemies(){
	//create more enemies if need be
	var enemies_length = enemies.length
	if (enemies_length < 8) {
		for(var h = 0; h < (8 - enemies_length); h++){
			//console.log('creating new enemy')
			createEnemy(enemies);
		}
	}



	for(var i=0; i<8; i++) {
        var enemy = enemies[i];
        if(!enemy) continue;

        if (!(inBounds(enemy))){
        	enemy.state = "dead"
        }

        if(enemy && enemy.state == "alive") {
        	//enemies are always falling so y always increases
        	enemy.y += (0.25+enemy.speed);
        	//depending on the side it started on, fall in the opposite direction
        	if (enemy.side == 'left'){
        		enemy.x += .33;
        	}else{
        		enemy.x -= .33;
        	}
        }
    }

    //delete dead enemies
    enemies = enemies.filter(function(e) {
            if(e && e.state != "dead") return true;
            return false;
    });
}

function inBounds(object){
	if((object.x < CANVAS_WIDTH)&&(object.y < CANVAS_HEIGHT)){
		return true
	}
	return false
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

function drawOverlay(c) {
	console.log(game.state)
    if(game.state == "over") {
        c.fillStyle = "white";
        c.font = "Bold 40pt Arial";
        c.fillText("GAME OVER",140,200);
        c.font = "14pt Arial";
        c.fillText("refresh to play again", 190,250);
    }
    if(game.state == "won") {
    	console.log("tryna draw this")
        c.fillStyle = "white";
        c.font = "Bold 40pt Courier";
        c.fillText("YOU DID IT",50,200);
        c.font = "14pt Courier";
        c.fillText("refresh to play again", 190,250);
    }
    if(game.state == "playing"){
    	c.fillStyle = "red";
        c.font = "Bold 20pt Courier";
        c.fillText(game.score,25,25);
    }
}

function drawBackground(c){
	c.fillStyle = "#0A121F";
	c.fillRect(0,0,600,600);
	c.drawImage(mountains_image, 0, 10);
}

function drawEnemies(c){
	for (var i in enemies){
		var enemy = enemies[i];
		if (enemy.state == "alive"){
			c.fillStyle = "white";
	    	c.fillRect(enemy.x, enemy.y, 3, 3);
		}
	}
}

function drawTargets(c){
	for (var i in targets){
		var target = targets[i];
		if (target.state == "alive"){
			//var color = randomColor();
			var x1 = target.x - 5
			var y1 = target.y
			var x2 = target.x
			var y2 = target.y - 5
			c.fillStyle = randomColor();
			c.fillRect(x1, y1, 13, 3);
			c.fillRect(x2, y2, 3, 13);
		}
	}
}

function randomColor() {
	var options = [ 'a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
	var color = ['#']
	var count = 0
	while (count < 6) {
		color.push(options[randomNumber(0, 15)]);
		count++;
	}
	var string = color.join('')
	return string
}
function randomNumber(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
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
				city.x = city.x || step+(city.id*65)
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
    	if((missile.target.x == missile.x)){
    		missile.target.state = "dead"
    		explode(missile);
    		explode(missile.target);
    		missile.active = false;
    	}else{
    		//console.log(missile.target[0] + " " + missile.x + " " + missile.target[1]  + missile.y)
    	missile.draw();}
    }
}; 

var particles = []; 

function drawExplosions(c){
	//start 
	for (var i in explosions){
		var explosion = explosions[i];

	    if(explosion.counter == 0) { 
	        particles = []; //clear any old values 
	        for(var i = 0; i<50; i++) { 
	            particles.push({ 
	                    x: explosion.x + explosion.width/2, 
	                    y: explosion.y + explosion.height/2, 
	                    xv: (Math.random()-0.5)*2.0*5.0,  // x velocity 
	                    yv: (Math.random()-0.5)*2.0*5.0,  // y velocity 
	                    age: 0, 
	            }); 
	        } 
	    } 
	        //update and draw 
	    if(explosion.counter > 0) { 
	        for(var i=0; i<particles.length; i++) { 
	            var p = particles[i]; 
	            p.x += p.xv; 
	            p.y += p.yv; 
	            //var v = 255-p.age*3; 
	            c.fillStyle = randomColor(); 
	            c.fillRect(p.x,p.y,3,3); 
	            p.age++; 
	        } 
	    }

	    explosion.counter ++;
	    explosion.width ++;
	    explosion.height ++; 
	}
}



//actions

function explode(object){
	Sound.play("explode");
	//console.log('exploding' + object.x + " " + object.y)
	explosions.push({
		x: object.x,
		y: object.y,
		width: object.width,
		height: object.height,
		counter: 0
	})
	//console.log(explosions)
}

function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

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
	//if(!base) return;

	if ((!base) || base.missiles == 0){
		return;
	}else{
		base.missiles --;
	}
	createTarget(targets, x,y);

	var missilePosition = base_cord

	//console.log('adding a missile')
	missiles.push(Missile({
		speed: 5,
		x: missilePosition[0],
		y: missilePosition[1],
		target: targets[targets.length-1],
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
	    I.y = (I.slope * I.x + I.line)+6;

    	I.active = I.active && I.inBounds();
    	//console.log(I.slope + " <--slope  line--->"+ I.line);
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
	if (game.state == "over"|| game.state=="won") return;
	loadResources();

	updateCollisions();
	updateBases();
	updateCities();
	updateMissiles();
	updateEnemies();
	updateTargets();
	updateExplosions();
	updateGame();

	

	drawBackground(c);
	drawBases(c);
	drawCities(c);
	drawMissilePath();
	drawEnemies(c);
	drawTargets(c);
	drawExplosions(c);
	drawOverlay(c);
	return;
}

var gameLoop = setInterval(gameLoop, 1000/FPS);

});

//=============game loop================



