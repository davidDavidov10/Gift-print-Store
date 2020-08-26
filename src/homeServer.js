const client = require('./redisConnector');
const util = require('./utilServer');

async function home(request, response){
    await util.getUserFromSession(request).then( async(email) =>{
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email,((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(isAdmin) response.status(401).json({"response" : "Admin User" });
        else response.status(200).json({"response" : "User Authenticated" });
    }).catch((err)=>{
        if(err === "User is not logged in") response.status(401).json({"response" :"Not Authenticated"});
        else response.status(500).json(err);
    });
}

module.exports = home;