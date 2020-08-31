const ws = require('websockets');
let wsServer = ws.createServer();
const port = 8081;


let clientList=[];

wsServer.on("connect", function(client){

    clientList.push(client)

    client.on("message", function(msg){
        for(let c of clientList){
            c.send(msg)
            console.log("in message")
        }
    });

    client.on("close", function(){
        let index = clientList.indexOf(this)
        if(index != -1){
            clientList.splice(index,1)
        }
    });

    client.send("Welcome!");
})

wsServer.listen(port,()=>{console.log("Started web sockets on port "+ port)});

module.exports = ws;