const client = require('./redisConnector');
const util = require('./utilServer');
const fs = require('fs');

async function adminPurchases(request,response){
    // Check that the user is admin
    await util.getUserFromSession(request).then(async (email) => {
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email,((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(!isAdmin){
            response.status(401).json("User is not admin")
        }else{
            client.hgetall("purchases", function(err,reply){
                response.status(200).json(reply);
            });
        }
    }).catch((err)=> {
        // If user is not logged in sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in admin.js
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    });
}


async function updateStatus(request, response){
    await util.getUserFromSession(request).then(async (email) => {
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email, ((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(isAdmin){
            let purchases = await new Promise((resolve, reject) => {
                client.hget('purchases', request.body.email, (err, reply) => {
                    if (reply !== null) resolve(reply)
                    else reject(err)
                });
            });
            purchases = JSON.parse(purchases);
            let item = purchases[request.body.itemName];
            if (item === undefined) response.status(400).json({error: "No such item exists in purchases"});
            else {
                item.status = "Order Completed";
                client.hset('purchases', String(request.body.email), JSON.stringify(purchases))
                fs.unlink(`../static/productImg/${item.imgToPrint}.png`, () => {
                })
                fs.unlink(`../static/productImg/${item.prodImg}.png`, () => {
                })
                response.status(200).json({msg: "Order is completed"});
            }
        }else{
            response.status(401).json({error: "User is not admin"});
        }

    });
}

module.exports =  {adminPurchases, updateStatus };