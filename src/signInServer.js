const client = require('./redisConnector');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

async function signIn (request,response) {
    let body =  request.body;
    let email = body.email;
    let password = body.password;
    let rememberMe = body.rememberMe;
    let isAdmin = false;

    // Check if given user is an existing user from DB
    let reply = await client.hget("users", email);
    let user =  JSON.parse(reply);
    if (user === null) {
        // Check if user is an admin
        let checkAdmin =  await client.hget("admins", email);
        if (checkAdmin === null) {
            // Show unknown  email address
           return response.status(401).send(JSON.parse('{"err": "Incorrect Email"}'));
        } else {
            isAdmin = true;
           user = JSON.parse(checkAdmin);
        }
    } else {
        //  User is not admin save login activity
        let loginActivity = await client.hget("loginActivity", email);
        loginActivity = JSON.parse(loginActivity);
        loginActivity[Object.keys(loginActivity).length] = new Date().toLocaleString();
        await client.hset("loginActivity", email, JSON.stringify(loginActivity));

    }
    // Check given password is the same as the encrypted password from DB
    try{
        let isPassword =  await bcrypt.compare(password, user.password)
        if (!isPassword) {
            // Show incorrect password
            return response.status(401).send(JSON.parse('{"err": "Incorrect Password"}'));
        } else {
            // Login
            let  sid = uuid.v4();
            let expiration;
            if(rememberMe){
                response.cookie('sid', sid ,{maxAge: 2592000000}); // 30 days until cookie expires
                expiration = Date.now() +  2592000000;
            }else{
                response.cookie('sid', sid ,{maxAge: 1800000}); // 30 min until cookie expires
                expiration = Date.now() + 1800000;
            }
            // Goto homepage while logged in
            // Save session info cookie
            await client.hset('sessions', sid, JSON.stringify({id: email, expire:expiration}));
            return response.status(200).send(JSON.parse(`{"isAdmin": ${isAdmin}}`));
        }
    }catch(err){
        console.error(err)
    }
}

module.exports = signIn;

