const client = require('./redisConnector');
const util = require('./utilServer');

// Load details for admin table in admin page
async function admin(request,response) {
    // Check that the user is admin
    await util.getUserFromSession(request).then(async (email) => {
        // Check if user is an admin
        client.hget("admins", email,async function (err, reply) {
            if(reply !== null){
                // If user is admin send client users data to show in table
                let userData =  await new Promise((resolve, reject) => {
                    client.hgetall("users", async function(err,reply){
                        let users = []
                        for(let user in reply){
                            let details= await JSON.parse(reply[user]);
                            await new Promise((resolve1, reject1) => {
                                client.hget("cart",user,async function(err, reply){
                                    resolve1({...details,"cart": JSON.parse(reply)});
                                });

                            }).then((pushItem) =>{
                                return  new Promise((resolve2, reject2) => {
                                    client.hget("loginActivity", user,function(err,reply){
                                        resolve2({...pushItem,"loginActivity": JSON.parse(reply)});
                                    } );
                                });
                            }).then((pushItem) =>{
                                return  new Promise((resolve3, reject3) => {
                                    client.hget("purchases", user,function(err,reply){
                                        resolve3({...pushItem,"purchases": JSON.parse(reply !== null ? reply : "{}")});
                                    });
                                });
                            }).then((pushItem)=>{
                                users.push(pushItem);
                            });
                        }
                        resolve(users);
                    });
                });
                let data = {"data": userData};
                response.status(200).json(data);
            }else {
                // If user is NOT admin but is signed in, redirect with error msg
                response.status(401).json("{User is logged in but is not an admin}");
            }
        });
    }).catch((err)=> {
        // If user is not logged in, sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in admin.js
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    });
}

module.exports = admin;