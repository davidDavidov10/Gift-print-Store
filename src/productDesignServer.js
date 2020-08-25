const client = require('./redisConnector');
const util = require('./utilServer');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');



async function save(request,response){
    await util.getUserFromSession(request).then((email) =>{
        let imgID = "No selected img"
        let prodImgID = uuid.v4();
        console.log("request " +request)
        console.log("body " + JSON.stringify(request.body))
        console.log("productWithImg " +request.body.productWithImage)
        let data = new Buffer.from(request.body.productWithImage.slice(22), 'base64');
        let productType = request.body.productType;
        let color = request.body.productColor;
        let size = request.body.productSize !== undefined ? request.body.productSize : "--";
        let amount = request.body.productAmount;
        let price = request.body.price;

        // Rename file to be a unique id
        let file =  request.file;
        if(file !== undefined){
            imgID = uuid.v4();
            fs.rename( file.path, `${file.destination}/${imgID}${path.extname(file.path)}`,  ()=>{});
        }
        fs.writeFile(`../static/productImg/${prodImgID}.png`, data,()=>{});

        // Check if user is in db key img
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            let item = { prodImg:prodImgID, imgToPrint:imgID , amount:amount, type:productType, price:price, color:color, size:size, }
            console.log("item: " +JSON.stringify(item))
            let cart = {};
            if (reply !== null) {
                // User is  in db, get existing cart
                cart = JSON.parse(reply);
            }
            // Add item to cart
            cart[prodImgID] = item;
            client.hset('cart',email ,JSON.stringify(cart));
        });
        response.status(200).redirect('back'); //Todo: decide if we need to redirect to somewhere else
    });
}


async function validate(request, response){
    await util.getUserFromSession(request).then( async(email) =>{
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email,((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(isAdmin) response.status(401).json({"response" : "Admin Authenticated" });
        else response.status(200).json({"response" : "User Authenticated" });
    }).catch((err)=>{
        if(err === "User is not logged in") response.status(401).json({"response" :"Not Authenticated"});
        else  response.status(500).json(err);
    });
}

module.exports = {save, validate}