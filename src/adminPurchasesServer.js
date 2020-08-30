const client = require('./redisConnector');
const util = require('./utilServer');
const fs = require('fs');

async function adminPurchases(request,response){
    try{
        // Check that the user is admin
        let email = await util.getUserFromSession(request)
        let isAdmin = await client.hget("admins", email);
        if(isAdmin === null){
            response.status(401).json("User is not admin")
        }else{
            let reply = await client.hgetall("purchases");
            response.status(200).json(reply);
        }
    }catch(err){
        // If user is not logged in sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in purchasesAdmin.js
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}


async function updateStatus(request, response){
    try{
        // Check that the user is admin
        let email = await util.getUserFromSession(request)

        let isAdmin = await client.hget("admins", email);
        if(isAdmin !== null){
            let purchases = await client.hget('purchases', request.body.email);
             if(purchases !== null){
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
             }
        }else{
            response.status(401).json({error: "User is not admin"});
        }

    }catch (err) {
        // If user is not logged in sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in purchasesAdmin.js
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}

module.exports =  {adminPurchases, updateStatus };