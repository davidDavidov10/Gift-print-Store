const client = require('./redisConnector');
const util = require('./utilServer');


async function placeOrder(request,response){
    try{
        let email = await util.getUserFromSession(request)
        let reply = await client.hget("cart", email);
        if (reply !== null) {
            let cart = JSON.parse(reply);
            let cartKeys = Object.keys(cart);
            let info = request.body;
            let shippingInfo = `Full Name: ${info.fullname},\nAddress: ${info.address} ${info.city},\nZip: ${info.zip} `
            // Go over all items in cart and add shipping info and status
            for(let key in cartKeys){
                let item = cart[cartKeys[key]];
                item["status"] = "Waiting to be processed";
                item["shippingInfo"] = shippingInfo;
            }
            // Get existing purchases
            let purchases = await client.hget('purchases',email);
            // reply1 is the existing purchases
            if(purchases !== null){
                cart = {...cart,...JSON.parse(purchases)}
            }
            await client.hset('purchases',email ,JSON.stringify(cart));

            await client.hset('cart',email,"{}");
            let path = request.get('referer')
            response.status(200).redirect(path.replace("CheckoutPage.html","HomePage.html"));
        }else{
            response.status(410).json({err: "User doesn't have a cart to checkout"});
        }
    }catch(err){
        let path = request.get('referer')
        if(err === "User is not logged in") response.status(401).redirect(path.replace("CheckoutPage.html","LoginPage.html"));
        else response.status(500).redirect(path.replace("CheckoutPage.html","ErrorPage.html"));
    }

}

module.exports = placeOrder;