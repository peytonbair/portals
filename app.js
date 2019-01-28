
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started...");

var SOCKET_LIST = {};

//game area
var play_area = 3000;
var player_name = "unknown";
var portal_open = false;
var main_ticker = 0;
var p1x = 1500;
var p1y = 1500;
var p2x = 3000;
var p2y = 1500;
var p3x = 6000;
var p3y = 1500;

var portal_size = 300;
var time = 0;

var rocks = [];
var trees = [];

function Rock(x, y){
	this.x  = x;
	this.y  = y;
	this.radius = 50;
}
function Tree(x, y){

}
function Bush(x, y){

}
function init_game(){
	//world 1
	for(var i =0; i< 25;i++){
		var rx =  Math.floor(Math.random() * play_area);
		var ry =  Math.floor(Math.random() * play_area);

		rocks.push(new Rock(rx ,ry));
	}

	//world 2

	//world 3

}


init_game();


var Entity = function(){
	var self = {
		x: Math.floor(Math.random() * play_area),
		y: Math.floor(Math.random() * play_area),
		spdX:0,
		spdY:0,
		id:"",

	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

var Player = function(id){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.radius = 35;
	self.mouseAngle = 0;
	self.maxSpd = 7;
	self.hp = 10;
	self.hpMax = 100;
	self.score = 0;
	self.gold = 0;
	self.wood = 0;
	self.stone = 0;
	self.food = 0;
	self.age = 0;
	self.name = player_name;
	self.died = false;
	self.world = 1;

	self.attackSpd = 17;
	self.attackTimer = 0;
	self.weapon = 'sword';
	self.hitRock = false;


	var super_update = self.update;
	self.update = function(){
		self.updateSpd();

		super_update();
		self.attackTimer ++;
		if(self.attackSpd < self.attackTimer){
			if(self.pressingAttack){
				if(self.weapon == 'gun'){
					self.shootBullet(self.mouseAngle);
					self.attackTimer = 0;
				}
				else if(self.weapon == 'sword'){
					self.swingSword();
					self.attackTimer = 0;

				}
			}
		}
	}
	self.swingSword = function(){
		for(var i in Player.list){
			var p = Player.list[i];
			//hit player

			if(self.getDistance(p) < 140 && self.id !== p.id){
				if(self.mouseAngle + 90 )
				p.hp -= 25;

				if(p.hp <= 0){
					p.hp = p.hpMax;
					p.died = true;
					p.x = Math.floor(Math.random() * play_area);
					p.y = Math.floor(Math.random() * play_area);
					self.score = 1;
					self.gold = 100;
				}
			}

		}
		//hit rocks
		for(var i = 0; i < rocks.length; i ++){
			if(self.getDistance(rocks[i])<130){
				self.stone ++;
			}
		}
	}

	self.shootBullet = function(angle){

			var b = Bullet(self.id,angle);
			b.x = self.x;
			b.y = self.y;

	}

	self.updateSpd = function(){

		if(self.hitRock == true){
			this.x = 0;
		}
		else{
			if(self.pressingRight)
				self.spdX = self.maxSpd;
			else if(self.pressingLeft)
				self.spdX = -self.maxSpd;
			else
				self.spdX = 0;

			if(self.pressingUp)
				self.spdY = -self.maxSpd;
			else if(self.pressingDown)
				self.spdY = self.maxSpd;
			else
				self.spdY = 0;
		}
//hit side
		if(self.x <= 0){
			self.x = 0;
		}
		else if(self.x >= play_area && self.x <= play_area + 100){
			self.x = play_area;
		}
		if(self.y <= 0){
			self.y = 0;
		}
		else if(self.y >= play_area ){
			self.y = play_area ;
		}
		//world 2
		if(self.x <= 4000 && self.x > 3900){
			self.x = 4000;
		}
		else if(self.x >= 4000 + play_area && self.x <= 4000+ play_area + 100){
			self.x = 4000+play_area;
		}
		//wordl 3
		if(self.x <= 8000 && self.x > 7900){
			self.x = 8000;
		}
		else if(self.x >= 8000 + play_area && self.x <= 8000+ play_area + 100){
			self.x = 8000+play_area;
		}


		//hit another player
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.getDistance(p) < 70 && self.id !== p.id){
				var distance_x = p.x -self.x;
				var distance_y = p.y - self.y;
				var radii_sum  = self.radius + p.radius;
				var length = Math.sqrt(distance_x * distance_x + distance_y * distance_y) || 1;
				var unit_x = distance_x / length;
				var unit_y = distance_y / length;
				self.x = p.x - (radii_sum + 1) * unit_x;
				self.y = p.y - (radii_sum + 1) * unit_y;
			}
		}
	//Portals



		//hit rocks
		for(var i = 0; i < rocks.length; i ++){

			if(self.getDistance(rocks[i]) < rocks[i].radius + self.radius){
				var distance_x = rocks[i].x -self.x;
				var distance_y = rocks[i].y - self.y;
				var radii_sum  = self.radius + rocks[i].radius;
				var length = Math.sqrt(distance_x * distance_x + distance_y * distance_y) || 1;
				var unit_x = distance_x / length;
				var unit_y = distance_y / length;
				self.x = rocks[i].x - (radii_sum + 1) * unit_x;
				self.y = rocks[i].y - (radii_sum + 1) * unit_y;
			}
		}
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			radius:self.radius,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			name: self.name,
			mouseAngle: self.mouseAngle,
			gold: self.gold,
			stone: self.stone,
			wood: self.wood,
			food: self.food,
			age: self.age,
			weapon: self.weapon,
			pressingAttack: self.pressingAttack,


		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			radius:self.radius,
			score:self.score,
			name: self.name,
			died: self.died,
			mouseAngle: self.mouseAngle,
			gold: self.gold,
			stone: self.stone,
			wood: self.wood,
			food: self.food,
			age: self.age,
			weapon: self.weapon,
			pressingAttack: self.pressingAttack,
			world: self.world,



		}
	}

	Player.list[id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var player = Player(socket.id);


	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
		else if(data.inputId === 'q')
			if(player.weapon == 'sword')
				player.weapon = 'gun';
			else if(player.weapon == 'gun')
				player.weapon = 'sword';
	});

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),

	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}



var Bullet = function(parent,angle){
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 20;
	self.spdY = Math.sin(angle/180*Math.PI) * 20;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 20)
			self.toRemove = true;

		super_update();

		for(var i in Player.list){
			var p = Player.list[i];
			if(self.getDistance(p) < 32 && self.parent !== p.id){
				p.hp -= 20;


				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score = 1;
						shooter.gold = 100;

					p.hp = p.hpMax;
					p.died = true;
					p.x = Math.floor(Math.random() * play_area);
					p.y = Math.floor(Math.random() * play_area);


				}
				self.toRemove = true;
			}


		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,

		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		};
	}

	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}


var DEBUG = true;


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;


socket.on('start', function(data){
	var player = Player(socket.id);

  player_name = data;
	Player.onConnect(socket);

});


	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = ("" + socket.id).slice(2,7);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
			console.log(data);
		}
	});

	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});

		socket.emit('died', true);
	//	delete SOCKET_LIST[socket.id];
	//	Player.onDisconnect(socket);

});

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};


setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),

	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
		socket.emit('rocks', rocks);
		socket.emit('time', time);
	//	console.log(rocks);
	}
	initPack.player = [];
	initPack.bullet = [];

	removePack.player = [];
	removePack.bullet = [];

	time ++;



},1000/25);
