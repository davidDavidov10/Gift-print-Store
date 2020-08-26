const client = require('./redisConnector');
const util = require('./utilServer');


async function placeorder(request,response){
    await util.getUserFromSession(request).then((email) =>{
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            if (reply !== null) {
                let cart = JSON.parse(reply);
                let cartKeys = Object.keys(cart);
                let info = request.body;
                let shippingInfo = `Full Name: ${info.fullname},\nAddress: ${info.address} ${info.city},\nZip: ${info.zip} `
                console.log("\nshipping info: " + shippingInfo)
                console.log("reply: " + reply)
                console.log("info: " + JSON.stringify(info))
                // console.log("request: " + JSON.stringify(request))
                // Go over all items in cart and add shipping info and status
                for(let key in cartKeys){
                    let item = cart[cartKeys[key]];
                    item["status"] = "Waiting to be processed";
                    item["shippingInfo"] = shippingInfo;
                }
                // Get existing purchases
                client.hget('purchases',email, (err1, reply1) =>{
                    // reply1 is the existing purchases
                    if(reply1 !== null){
                        cart = {...cart,...JSON.parse(reply1)}
                    }
                    client.hset('purchases',email ,JSON.stringify(cart));
                });
                client.hset('cart',email,"{}");
                let path = request.get('referer')
                response.status(200).redirect(path.replace("CheckoutPage.html","HomePage.html"));
            }else{
                response.status(410).json({err: "User doesn't have a cart to checkout"});
            }
        });
    });
}

module.exports = placeorder;