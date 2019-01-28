//setup
var socket = io();
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
canvas.width = innerWidth-20;
canvas.height = innerHeight-20;
c.font = "30px arial";
//define text

var socket = io();

    socket.on('newPositions',function(data){
        c.clearRect(0,0,innerWidth,innerHeight);
        for(var i = 0 ; i < data.length; i++)
            c.fillText(data[i].number,data[i].x,data[i].y);
    });

    document.onkeydown = function(event){
        if(event.keyCode === 68)    //d
            socket.emit('keyPress',{inputId:'right',state:true});
        else if(event.keyCode === 83)   //s
            socket.emit('keyPress',{inputId:'down',state:true});
        else if(event.keyCode === 65) //a
            socket.emit('keyPress',{inputId:'left',state:true});
        else if(event.keyCode === 87) // w
            socket.emit('keyPress',{inputId:'up',state:true});

    }
    document.onkeyup = function(event){
        if(event.keyCode === 68)    //d
            socket.emit('keyPress',{inputId:'right',state:false});
        else if(event.keyCode === 83)   //s
            socket.emit('keyPress',{inputId:'down',state:false});
        else if(event.keyCode === 65) //a
            socket.emit('keyPress',{inputId:'left',state:false});
        else if(event.keyCode === 87) // w
            socket.emit('keyPress',{inputId:'up',state:false});
    }
