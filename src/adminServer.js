const client = require('./redisConnector');
const util = require('./utilServer');

// Load details for admin table in admin page
async function admin(request,response) {
    try{
        // Check that the user is admin
        let email =   await util.getUserFromSession(request)
        // Check if user is an admin
        let admin = await client.hget("admins", email);
        if(admin !== null){
        // If user is admin send client users data to show in table
            let usersList = await client.hgetall("users");
            let users = []
            for(let user in usersList){
                let details = await JSON.parse(usersList[user]);
                delete details["password"];
                let prevCart = await  client.hget("cart",user);
                let pushItem ={...details,"cart": JSON.parse(prevCart)};
                let prevLoginActivity = await client.hget("loginActivity", user);
                pushItem = {...pushItem,"loginActivity": JSON.parse(prevLoginActivity)};
                let prevPurchases = await client.hget("purchases", user);
                pushItem ={...pushItem,"purchases": JSON.parse(prevPurchases !== null ? prevPurchases : "{}")};
                users.push(pushItem);
            }
            let data = {"data": users};
            response.status(200).json(data);
        }else {
        // If user is NOT admin but is signed in, redirect with error msg
            response.status(401).json("{User is logged in but is not an admin}");
        }
    }catch(err){
        // If user is not logged in, sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in admin.js
        if(err === "User is not logged in")  response.status(401).json(err);
        else  response.status(500).json(err);
    }
}

module.exports = admin;