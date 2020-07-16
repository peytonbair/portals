var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var play_area = 5000;
var world_start2 = 6000;
var world_start3 = 12000;

var rocks = [];
var bushes = [];
var healpads = [];
var portals = [];
var portal_degrees = 0;
var time = 0;
var player_name = '';
var names = ["Liam","Noah","William","James","Oliver","Benjamin","Elijah","Lucas","Mason","Logan","Alexander","Ethan","Jacob","Michael","Daniel","Henry","Jackson","Sebastian","Aiden","Matthew","Samuel","David","Joseph","Carter","Owen","Wyatt","John","Jack","Luke","Jayden","Dylan","Grayson","Levi","Issac","Gabriel","Julian","Mateo","Anthony","Jaxon","Lincoln","Joshua","Christopher","Andrew","Theodore","Caleb","Ryan","Asher","Nathan","Thomas","Leo"];
var socket = io();
//starte
function start(){
	player_name = document.getElementById('player_name').value;
	console.log(player_name);
	if(player_name.length == 0 || player_name === ''){player_name = names[Math.floor(Math.random()*50)];}
	socket.emit('start', player_name);
	document.getElementById('gameDiv').style = "display: inline";
	document.getElementById('container').style = "display: none";

}
function restart(){

	document.getElementById('gameDiv').style = "display: none";
	document.getElementById('start').style = "display: inline";

}


//chat
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var chatOpened = false;
var world = document.getElementById('world');
var gold = document.getElementById('gold');
var kills = document.getElementById('kills');
var stone = document.getElementById('stone');
var wood = document.getElementById('wood');

var current_time = document.getElementById('time');
var map_location = document.getElementById('location');
socket.on('addToChat',function(data){
	chatText.innerHTML += '<div>' + data + '</div>';
});
socket.on('evalAnswer',function(data){
	console.log(data);
});

chatForm.onsubmit = function(e){
	e.preventDefault();
	if(chatInput.value[0] === '/')
		socket.emit('evalServer',chatInput.value.slice(1));
	else
		socket.emit('sendMsgToServer',chatInput.value);
	chatInput.value = '';
}

//game
var Img = {};
Img.player = new Image();
Img.player.src = '/client/img/player1.png';
Img.bullet = new Image();
Img.bullet.src = '/client/img/bullet.png';
Img.map = new Image();
Img.map.src = '/client/img/grid2.png';
Img.sword = new Image();
Img.sword.src = ' client/img/sword.png';
Img.portal = new Image();
Img.portal.src = ' client/img/bottom_portal.png';

Img.portal_top1 = new Image();
Img.portal_top1.src = ' client/img/top_portal1.png';
Img.portal_top2 = new Image();
Img.portal_top2.src = ' client/img/top_portal2.png';
Img.portal_top3 = new Image();
Img.portal_top3.src = ' client/img/top_portal3.png';

Img.rock = new Image();
Img.rock.src = ' client/img/Stone.png';
Img.bush = new Image();
Img.bush.src = ' client/img/Tree.png';
Img.healpad = new Image();
Img.healpad.src = ' client/img/healpad.png';

ctx.scale(1,1);
ctx.font = '30px Arial';

var Player = function(initPack){
	var self = {};
	self.id = initPack.id;
	self.number = initPack.number;
	self.x = initPack.x;
	self.y = initPack.y;
	self.radius = initPack.radius;
	self.hp = initPack.hp;
	self.hpMax = initPack.hpMax;
	self.score = initPack.score;
	self.name = initPack.name;
	self.mouseAngle = initPack.mouseAngle;
	self.gold = initPack.gold;
	self.stone = initPack.stone;
	self.wood = initPack.wood;
	self.weapon = initPack.weapon;
	self.world = initPack.world;
	self.pressingAttack = initPack.pressingAttack;
	self.displayAngle = 0;
	self.direction = .1;
	self.animate = false;
	self.lastAngle = 0;
	self.ticker = 0;
	self.died = initPack.died;




	self.draw = function(){
		var x = self.x - Player.list[selfId].x + WIDTH/2;
		var y = self.y - Player.list[selfId].y + HEIGHT/2;

		//update numbers
		kills.innerHTML = 'Kills: ' + Player.list[selfId].score;
		gold.innerHTML = 'Gold: ' + Player.list[selfId].gold;
		stone.innerHTML = 'Stone: ' + Player.list[selfId].stone;
		wood.innerHTML = 'Wood: ' + Player.list[selfId].wood;

		world.innerHTML = 'World ' + Player.list[selfId].world;
    if(time <= 5){
      current_time.style.setProperty('color', '#FF1919')
    }
    else{
      current_time.style.setProperty('color', '#fff')
    }
		current_time.innerHTML = 'Time: ' + time;
    if(Player.list[selfId].world == 1){
      map_location.style.setProperty('padding-left', (Math.floor(Player.list[selfId].x)/25)-5);
    }
    else if(Player.list[selfId].world == 2){
      map_location.style.setProperty('padding-left', (Math.floor(Player.list[selfId].x-world_start2)/25)-5);
    }
    else if(Player.list[selfId].world == 3){
			map_location.style.setProperty('padding-left', (Math.floor(Player.list[selfId].x-world_start3)/25)-5);
    }

		map_location.style.setProperty('padding-top', (Math.floor(Player.list[selfId].y)/25)-5);

		//draw sword
		var width = 50;
		var height = 50;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate((3.14 / 180)*self.mouseAngle + self.displayAngle + 1.57);
		ctx.translate(-x,-y);
		if(self.weapon == 'sword'){
			if(self.pressingAttack){
				if(self.animate == false)
					self.animate = true;
					self.lastAngle = self.mouseAngle;
			}
			if(self.animate){
				if(self.ticker <= 5){
					self.direction = -.7;
				}
				else if(self.ticker > 5 && self.ticker < 17){
					self.direction = .20;

				}
				else{
					self.displayAngle = -.2;
					self.ticker = 0;
					self.animate = false;
				}

				self.displayAngle += self.direction;
				self.ticker ++;

			}


			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(-1.57);
			ctx.translate(-x,-y);
			ctx.drawImage(Img.sword,0,0,Img.sword.width,Img.sword.height,x-width/2 ,y-height/2, width*1.5, height*2);
			ctx.restore();
		}
		ctx.drawImage(Img.player,0,0,Img.player.width,Img.player.height,x-width/2,y-height/2,width,height);
		ctx.restore();

    //draw players name
    ctx.textAlign = "center";
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;
    ctx.strokeText(self.name, x, y-50);
    ctx.fillStyle = 'white';
    ctx.fillText(self.name, x, y-50);

    //draw xp
    ctx.radius = 1;
    ctx.fillStyle =	ctx.fillStyle = 'rgba(0, 0, 0, .5)';
    ctx.fillRect(x-self.radius- 10,y+45,self.hpMax*.85,20);//bg overlay
    ctx.fillStyle = '#6bed4b';
    ctx.fillRect(x-self.radius-5,y + 50,self.hp*.75,10);//actual hp
    ctx.stroke();


	}

	Player.list[self.id] = self;


	return self;
}
Player.list = {};



var Bullet = function(initPack){
	var self = {};
	self.id = initPack.id;
	self.x = initPack.x;
	self.y = initPack.y;

	self.draw = function(){
		var width = Img.bullet.width/2;
		var height = Img.bullet.height/2;

		var x = self.x - Player.list[selfId].x + WIDTH/2;
		var y = self.y - Player.list[selfId].y + HEIGHT/2;

		ctx.drawImage(Img.bullet,
			0,0,Img.bullet.width,Img.bullet.height,
			x-width/2,y-height/2,width,height);
	}

	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};



var selfId = null;

socket.on('init',function(data){
	if(data.selfId)
		selfId = data.selfId;
	//{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
	for(var i = 0 ; i < data.player.length; i++){
		new Player(data.player[i]);
	}
	for(var i = 0 ; i < data.bullet.length; i++){
		new Bullet(data.bullet[i]);
	}

});

socket.on('update',function(data){
	//{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], bullet: []}
	for(var i = 0 ; i < data.player.length; i++){
		var pack = data.player[i];
		var p = Player.list[pack.id];


		if(p){
			if(pack.x !== undefined)
				p.x = pack.x;
			if(pack.y !== undefined)
				p.y = pack.y;
			if(pack.radius !== undefined)
				p.radius = pack.radius;
			if(pack.hp !== undefined)
				p.hp = pack.hp;
			if(pack.score !== undefined)
				p.score = pack.score;
			if(pack.gold !== undefined)
				p.gold = pack.gold;
			if(pack.stone !== undefined)
				p.stone = pack.stone;
			if(pack.wood !== undefined)
				p.wood = pack.wood;
			if(pack.name != undefined)
				p.name = pack.name;
			if(pack.mouseAngle != undefined)
					p.mouseAngle = pack.mouseAngle;
			if(pack.weapon != undefined)
					p.weapon = pack.weapon;
			if(pack.pressingAttack != undefined)
					p.pressingAttack = pack.pressingAttack;
			if(pack.world != undefined)
					p.world = pack.world;
			if(pack.died != undefined)
					p.died = pack.died;



		}
	}
	for(var i = 0 ; i < data.bullet.length; i++){
		var pack = data.bullet[i];
		var b = Bullet.list[data.bullet[i].id];
		if(b){
			if(pack.x !== undefined)
				b.x = pack.x;
			if(pack.y !== undefined)
				b.y = pack.y;
		}
	}


});

socket.on('remove',function(data){
	//{player:[12323],bullet:[12323,123123]}
	for(var i = 0 ; i < data.player.length; i++){
		delete Player.list[data.player[i]];
	}
	for(var i = 0 ; i < data.bullet.length; i++){
		delete Bullet.list[data.bullet[i]];
	}

});
socket.on('rocks',function(data){

		rocks = data.slice(0);

});
socket.on('bushes',function(data){
	bushes = data.slice(0);
});
socket.on('healpads',function(data){
	healpads = data.slice(0);
});
socket.on('portals',function(data){
	portals = data.slice(0);
});
//console.log(rocks);

socket.on('time', function(data){
	time = parseInt(data);

});

setInterval(function(){
	//scrol chat

	if(!selfId)
		return;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawMap();


	drawObjects_top();
	for(var i in Player.list)
		Player.list[i].draw();
	drawObjects();
	for(var i in Bullet.list)
		Bullet.list[i].draw();

},40);
var drawObjects_top = function(){
	var x = WIDTH/2 - Player.list[selfId].x;
	var y = HEIGHT/2 - Player.list[selfId].y;
	var item_count = 30;
	for(var i=0; i < item_count; i ++){
		//console.log(rocks[i]);
			ctx.drawImage(Img.healpad, x + healpads[i].x -75, y+ healpads[i].y - 75, 150, 150);
	}
	for(var i=0; i < 3; i ++){
		//console.log(rocks[i]);

			ctx.drawImage(Img.portal, x + portals[i].x -150, y+ portals[i].y - 150, 300, 300);
			if(time <=5){
				ctx.save();
				ctx.translate(x + portals[i].x, y + portals[i].y);
				ctx.rotate(portal_degrees*Math.PI/180);
				ctx.translate(-(x + portals[i].x), -(y + portals[i].y));
				if( Player.list[selfId].world == 1){ctx.drawImage(Img.portal_top1, x + portals[i].x -100, y+ portals[i].y - 100, 200, 200);}
				else if( Player.list[selfId].world == 2){ctx.drawImage(Img.portal_top2, x + portals[i].x -100, y+ portals[i].y - 100, 200, 200);}
				else if( Player.list[selfId].world == 3){ctx.drawImage(Img.portal_top3, x + portals[i].x -100, y+ portals[i].y - 100, 200, 200);}


				ctx.restore();
				portal_degrees -= 3;

			}
	}


}
var drawObjects = function(){
	var x = WIDTH/2 - Player.list[selfId].x;
	var y = HEIGHT/2 - Player.list[selfId].y;
	var item_count = 30;
  var move_distance = 10;
	for(var i=0; i < item_count; i ++){
		//console.log(rocks[i]);
    if(rocks[i].hit){
      if(rocks[i].x > Player.list[selfId].x){
          rocks[i].displayX += move_distance;
      }
      else if(rocks[i].x < Player.list[selfId].x){
            rocks[i].displayX -= move_distance;
      }

      if(rocks[i].y > Player.list[selfId].y){
          rocks[i].displayY += move_distance;
      }
      else if(rocks[i].y < Player.list[selfId].y){
            rocks[i].displayY -= move_distance;
      }

      ctx.drawImage(Img.rock, x + rocks[i].displayX -75, y+ rocks[i].displayY - 75, 150, 150);
    }
    else{
			ctx.drawImage(Img.rock, x + rocks[i].displayX -75, y+ rocks[i].displayY - 75, 150, 150);
    }
  }
	for(var i=0; i < item_count; i ++){
    if(bushes[i].hit){
      if(bushes[i].x > Player.list[selfId].x){
          bushes[i].displayX += move_distance;
      }
      else if(bushes[i].x < Player.list[selfId].x){
            bushes[i].displayX -= move_distance;
      }

      if(bushes[i].y > Player.list[selfId].y){
          bushes[i].displayY += move_distance;
      }
      else if(bushes[i].y < Player.list[selfId].y){
            bushes[i].displayY -= move_distance;
      }

      ctx.drawImage(Img.bush, x + bushes[i].displayX -125, y+ bushes[i].displayY - 125, 250, 250);
    }
    else{
      ctx.drawImage(Img.bush, x + bushes[i].displayX -125, y+ bushes[i].displayY - 125, 250, 250);
    }

		//	ctx.drawImage(Img.bush, x + bushes[i].x -125, y+ bushes[i].y - 125, 250, 250);
	}

}

var drawMap = function(){
	var x = WIDTH/2 - Player.list[selfId].x;
	var y = HEIGHT/2 - Player.list[selfId].y;
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,WIDTH,HEIGHT);
	ctx.fill();
	//world 1
	ctx.fillStyle = "#48893E";
	ctx.fillRect(x,y,play_area,play_area);
	//world 2
	ctx.fillStyle = "rgba(65, 152, 10, .5)";
	ctx.fillRect(x + play_area + 1000,y, play_area,play_area);
	//world 3
  ctx.drawImage(Img.map,x+play_area*2 + 2000,y,play_area,play_area);
	ctx.fillStyle = "#48893E";
	ctx.fillRect(x + play_area*2 + 2000,y, play_area,play_area);
//draw grid
	ctx.globalAlpha = 0.25;
  var gridsize = 200;
	for(var k =-10; k < 45; k++){

		var l = k*gridsize;
		for(var i = -10; i < 90; i ++){
			 var j = i*gridsize;
			 ctx.drawImage(Img.map,x+j,y+l,gridsize,gridsize);
		}
	}
	ctx.globalAlpha = 1;



}

document.onkeydown = function(event){
	if(event.keyCode === 68)	//d
		socket.emit('keyPress',{inputId:'right',state:true});
	else if(event.keyCode === 83)	//s
		socket.emit('keyPress',{inputId:'down',state:true});
	else if(event.keyCode === 65) //a
		socket.emit('keyPress',{inputId:'left',state:true});
	else if(event.keyCode === 87) // w
		socket.emit('keyPress',{inputId:'up',state:true});
	//else if(event.keyCode === 13) // ENTER



}
document.onkeyup = function(event){
	if(event.keyCode === 68)	//d
		socket.emit('keyPress',{inputId:'right',state:false});
	else if(event.keyCode === 83)	//s
		socket.emit('keyPress',{inputId:'down',state:false});
	else if(event.keyCode === 65) //a
		socket.emit('keyPress',{inputId:'left',state:false});
	else if(event.keyCode === 87) // w
		socket.emit('keyPress',{inputId:'up',state:false});
	else if(event.keyCode === 81) // q
		socket.emit('keyPress',{inputId:'q',state:false});
	else if(event.keyCode === 13) // ENTER

		if(chatOpened == true){
			chatInput.style = 'display: none';
			chatOpened = false;
		}
		else{
			chatInput.style = 'display: absolute';
			chatInput.focus();
			chatOpened = true;
		}


}

document.onmousedown = function(event){
	socket.emit('keyPress',{inputId:'attack',state:true});
}
document.onmouseup = function(event){
	socket.emit('keyPress',{inputId:'attack',state:false});
}
document.onmousemove = function(event){
	var x = -(WIDTH/2) + event.clientX - 8;
	var y = -(HEIGHT/2) + event.clientY - 8;
	var angle = Math.atan2(y,x) / Math.PI * 180;
	socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
}
//block right click
document.addEventListener("contextmenu", function(e){
  e.preventDefault();
}, false)
function resizeGame() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	if(WIDTH < 900){

		ctx.font = '20px Arial';
	}
	else{
		ctx.scale(1,1);
		ctx.font = '30px Arial';
	}

}

window.addEventListener('resize', resizeGame, false);
window.addEventListener('orientationchange', resizeGame, false);
