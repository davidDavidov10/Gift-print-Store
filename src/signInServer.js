const client = require('./redisConnector');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

function signIn (request,response) {
    let body =  request.body;
    let email = body.email;
    let password = body.password;
    let rememberMe = body.rememberMe;
    let isAdmin = false;

    // Check if given user is an existing user from DB
    client.hget("users", email,async function (err, reply) {
        if (err)  throw err;
        await new Promise(async(resolve, reject) => {
            let user =  JSON.parse(reply);
            if (user === null) {
                // Check if user is an admin
                client.hget("admins", email, function (err, reply) {
                    if (reply === null) {
                        // Show unknown  email address
                        response.status(401).send(JSON.parse('{"err": "Incorrect Email"}'));
                    } else {
                        isAdmin = true;
                        resolve(JSON.parse(reply));
                    }
                });
            } else {
                //  User is not admin save login activity
                let loginActivity = await new Promise((resolve, reject) => {
                    client.hget("loginActivity", email, (err1, reply1) => {
                        resolve(reply1);
                    });
                });
                loginActivity = JSON.parse(loginActivity);
                loginActivity[Object.keys(loginActivity).length] = new Date().toLocaleString();
                client.hset("loginActivity", email, JSON.stringify(loginActivity));

                resolve(user)
            }

        }).then(async(user)=>{
            // Check given password is the same as the encrypted password from DB
            let isPassword =  await bcrypt.compare(password, user.password).catch((err) => console.error(err)); ;
            if (!isPassword) {
                // Show incorrect password
                response.status(401).send(JSON.parse('{"err": "Incorrect Password"}'));
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
                client.hset('sessions', sid, JSON.stringify({id: email, expire:expiration}));

                response.status(200).send(JSON.parse(`{"isAdmin": ${isAdmin}}`));
            }
        });
    });
}

module.exports = signIn;

