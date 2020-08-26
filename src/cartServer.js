const client = require('./redisConnector');
const util = require('./utilServer');
const fs = require('fs');


async function getItems (request,response){
    await util.getUserFromSession(request).then(async(email) =>{
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email,((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(isAdmin){
            response.status(401).json("User admin and doesnt have a cart")
        }
        else{
            client.hget("cart", email, function (err, reply) {
                if (err) throw err;
                let data = {"data": (reply !== null ? reply :"{}") };
                response.status(200).json(data);
            });
        }
    }).catch((err)=> {
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);

    });
}


async function update(request,response) {
    await util.getUserFromSession(request)
        .then(async (email) => {
            let productsAmounts = request.body;
            let cart = await new Promise((resolve, reject) => {
                client.hget("cart", email, function (err, reply) {
                    if (err) throw err;
                    let cart = JSON.parse(reply);
                    resolve(cart)
                });
            });
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
            client.hset('cart', email, JSON.stringify(cart));
            response.status(200).send()
        })
        .catch((err)=>{
            response.status(401).send()});
}


module.exports = {getItems, update}