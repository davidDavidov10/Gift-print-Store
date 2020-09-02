const client = require('./redisConnector');
const util = require('./utilServer');
const serverResources = require('./serverResources');

// Save msg from user to admin in DB
async function storeMsg(request, response){
    try{
        let email = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", email);
        if(isAdmin === null ){
            let prevMsg = await client.hget("messages", email);
            let msg = {};
            if (prevMsg === null && request.body.msg){
                msg[0] = request.body
            }else{
                msg = JSON.parse(prevMsg);
                if(request.body.msg){
                    msg[Object.keys(msg).length] = request.body
                }
            }
            client.hset("messages", email, JSON.stringify(msg))
            let user = await  client.hget("users", email)
            user = JSON.parse(user);
            client.hset("lastResponse", email, JSON.stringify({fullName:user.firstName + " " + user.lastName,
                email:user.email, lastResponse:"User"}))
            response.status(200).json({msg: "msg stored"});
        }else{
            response.status(401).json({msg: "User is admin, cant send msg to admin"}); // User is admin, not allowed here
        }
    }catch(err){
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }

}


// Get msgs from DB to show user
async function loadMsg(request, response){
    try{
        let email = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", email);
        if(isAdmin === null) {
            let prevMsg = await client.hget("messages", email);
            if (prevMsg === null) {
                response.status(200).json({})
            } else {
                response.status(200).json(JSON.parse(prevMsg))
            }
        }else{
            response.status(401).json({msg: "User is admin"}) // User is admin, not allowed here
        }
    }catch (err) {
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}



// Send msg from user to admin
async function userWebSocket (ws, req) {
    try {
        let email = await util.getUserFromSession(req); // User email
        serverResources.userListWs[email] = ws;
        ws.on("message", async function(msg){
            if(serverResources.adminWs){
                let user = await client.hget("users", email);
                if(user !== null){
                    user = JSON.parse(user);
                    let fullName = user.firstName + " " + user.lastName;
                    serverResources.adminWs.send(JSON.stringify({email:email, msg:msg, fullName:fullName}))
                }
            }
        });
        ws.on("close", function(){
            delete serverResources.userListWs[email];
        });
    }catch (err) {
    }
}

module.exports = {storeMsg, loadMsg, userWebSocket};