const client = require('./redisConnector');
const util = require('./utilServer');

// Save msg from user to admin in DB
async function storeMsg(request, response){
    try{
        let email = await util.getUserFromSession(request);
        let isAdmin = await client.hget("admins", email);
        if(isAdmin === null ){
            let prevMsg = await client.hget("messages", email);
            let msg = {};
            if (prevMsg === null){
                msg[0] = request.body
            }else{
                msg = JSON.parse(prevMsg);
                msg[Object.keys(msg).length] = request.body
            }
            client.hset("messages", email, JSON.stringify(msg))
            let user = await  client.hget("users", email)
            user = JSON.parse(user);
            client.hset("lastResponse", email, JSON.stringify({fullName:user.firstName + " " + user.lastName,
                email:user.email, lastResponse:"User"}))
            response.status(200).json();
        }else{
            response.status(401).json(); // User is admin, not allowed here
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
            response.status(401).json() // User is admin, not allowed here
        }
    }catch (err) {
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}

module.exports = {storeMsg, loadMsg};


