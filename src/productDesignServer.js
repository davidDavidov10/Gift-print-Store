const client = require('./redisConnector');
const util = require('./utilServer');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

async function save(request,response){
    try{
        let email = await util.getUserFromSession(request)
        let isAdmin = await client.hget("admins", email);
        if(isAdmin === null ) {
            let imgID = "No selected img"
            let prodImgID = uuid.v4();
            let data = new Buffer.from(request.body.productWithImage.slice(22), 'base64');
            let productType = request.body.productType;
            let color = request.body.productColor;
            let size = request.body.productSize !== undefined ? request.body.productSize : "--";
            let amount = request.body.productAmount;
            let price = request.body.price;

            // Rename file to be a unique id
            let file = request.file;
            if (file !== undefined) {
                imgID = uuid.v4();
                fs.rename(file.path, `${file.destination}/${imgID}${path.extname(file.path)}`, () => {
                });
            }
            fs.writeFile(`../static/productImg/${prodImgID}.png`, data, () => {
            });

            // Check if user is in db key img
            let reply = await client.hget("cart", email);
            let fileType = file ? path.extname(file.path) : "";
            let item = {
                prodImg: prodImgID,
                imgToPrint: imgID,
                amount: amount,
                type: productType,
                price: price,
                color: color,
                size: size,
                fileType: fileType
            }
            let cart = {};
            if (reply !== null) {
                // User is  in db, get existing cart
                cart = JSON.parse(reply);
            }
            // Add item to cart
            cart[prodImgID] = item;
            await client.hset('cart', email, JSON.stringify(cart));
            response.status(200).json({msg:"images saved"});
        }
        else{
            response.status(401).json({msg: "user unauthorized"}); // User is admin, not allowed here
        }

    }catch (err) {
        if(err === "User is not logged in")  response.status(401).json(err);
        else {
            response.status(500).json(err);
        }
    }
}


async function validate(request, response){
    try{
    let email = await util.getUserFromSession(request)
        let isAdmin = await client.hget("admins", email);
        if(isAdmin !== null) response.status(401).json({"response" : "Admin Authenticated" });
        else response.status(200).json({"response" : "User Authenticated" });
    }catch(err){
        if(err === "User is not logged in") response.status(401).json({"response" :"Not Authenticated"});
        else  response.status(500).json(err);
    }
}

module.exports = {save, validate}