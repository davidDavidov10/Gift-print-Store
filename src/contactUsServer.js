const client = require('./redisConnector');
const util = require('./utilServer');

async function storeMsg(request, response){
   let email = await util.getUserFromSession(request);
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
    response.status(200).json()
}

async function loadMsg(request, response){
    let email = await util.getUserFromSession(request);
    let prevMsg = await client.hget("messages", email);
    if (prevMsg === null){
        response.status(200).json({})
    }else {
        response.status(200).json(JSON.parse(prevMsg))
    }
}

module.exports = {storeMsg, loadMsg};


