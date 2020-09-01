const client = require('./redisConnector');
const util = require('./utilServer');
const serverResources = require('./serverResources');

async function storeMsg(request, response) {
    try {
        let adminEmail = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", adminEmail);
        if (isAdmin !== null) {
            let email = request.body.recipient;
            let prevMsg = await client.hget("messages", email);
            let msg = {};
            delete request.body.recipient;
            if (prevMsg === null) {
                msg[0] = request.body
            } else {
                msg = JSON.parse(prevMsg);
                msg[Object.keys(msg).length] = request.body
            }
            client.hset("messages", email, JSON.stringify(msg))
            let user = await client.hget("users", email)
            user = JSON.parse(user);
            client.hset("lastResponse", email, JSON.stringify({
                fullName: user.firstName + " " + user.lastName,
                email: user.email, lastResponse: "Admin"
            }));
            response.status(200).json({msg:"msg stored"})
        } else {
            response.status(401).json({msg: "User is not admin"})
        }
    } catch (err) {
        if (err === "User is not logged in") response.status(401).json(err);
        else response.status(500).json(err);
    }
}


async function loadUsers(request, response){
    try {
        let adminEmail = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", adminEmail);
        if (isAdmin !== null) {
            let users = await client.hgetall("lastResponse");
            if (users === null) {
                response.status(200).json({})
            } else {
                response.status(200).json(users)
            }

        } else {
        response.status(401).json({msg: "User is not admin"})
        }
    }catch(err) {
        if (err === "User is not logged in") response.status(401).json(err);
        else response.status(500).json(err);
    }
}



async function loadMsg(request, response){
    try {
        let adminEmail = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", adminEmail);
        if (isAdmin !== null) {
            let email = request.params.email;
            let prevMsg = await client.hget("messages", email);
            if (prevMsg === null) {
                response.status(200).json({})
            } else {
                response.status(200).json(JSON.parse(prevMsg))
            }
        }else {
            response.status(401).json({msg:"User is not admin"})
        }
    }catch(err) {
        if (err === "User is not logged in") response.status(401).json(err);
        else response.status(500).json(err);
    }
}



async function adminWebSockets(ws, req) {
    console.log("Admin Connected to web socket")
    let adminEmail = await util.getUserFromSession(req);
    serverResources.adminWs = ws;
    ws.on("message", function(msg){
        let msgObj = JSON.parse(msg)
        let userClient = serverResources.userListWs[msgObj.email];
        if(userClient) userClient.send(msgObj.msg);
    });

    ws.on("close", function(){
        serverResources.adminWs = null;
    });
}

module.exports = {storeMsg, loadUsers,loadMsg, adminWebSockets};


