const client = require('./redisConnector');
const util = require('./utilServer');
const fs = require('fs');


async function getItems (request,response){
    try{
        let email = await util.getUserFromSession(request)
        let isAdmin = await client.hget("admins", email);
        if(isAdmin !== null){
            response.status(401).json("User admin and doesnt have a cart")
        }else{
            let cart = await client.hget("cart", email);
            let data = {"data": (cart !== null ? cart :"{}") };
            response.status(200).json(data);
        }
    }catch(err){
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}


async function update(request,response) {
    try{
        let email = await util.getUserFromSession(request)
        let productsAmounts = request.body;
        let cart = await client.hget("cart", email);
        cart = JSON.parse(cart);
        Object.keys(productsAmounts).forEach(function (key) {
            let amount = productsAmounts[key];
            if (amount !== "0") {
                cart[key].amount = amount;

            } else { // Delete item and remove the item imaged from server
                fs.unlink(`../static/productImg/${key}.png`,()=>{})
                fs.unlink(`../static/productImg/${cart[key].imgToPrint}.png`,()=>{})
                delete cart[key]
            }
        });
        await client.hset('cart', email, JSON.stringify(cart));
        response.status(200).send()
    }catch(err){
        response.status(401).send()
    }
}


module.exports = {getItems, update}