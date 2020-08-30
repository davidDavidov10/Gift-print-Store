const client = require('./redisConnector');
const util = require('./utilServer');

async function home(request, response){
    try{
        let email = await util.getUserFromSession(request)
        let isAdmin = await  client.hget("admins", email);
        if(isAdmin !== null) response.status(401).json({"response" : "Admin User" });
        else response.status(200).json({"response" : "User Authenticated" });
    }catch(err){
        if(err === "User is not logged in") response.status(401).json({"response" :"Not Authenticated"});
        else response.status(500).json(err);
    }
}

module.exports = home;