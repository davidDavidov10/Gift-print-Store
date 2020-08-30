const client = require('./redisConnector');
const bcrypt = require('bcrypt');
const bcryptRounds = 10;

async function signUp(request,response) {
    let body = request.body;
    let firstName = body.firstName;
    let lastName = body.lastName;
    let email = String(body.email);
    let password = body.password;

    try{
        // Hash password before saving to DB
        password = await bcrypt.hash(password, bcryptRounds);

        // Check user doesn't already exist for given email
        let exists = await client.hexists('users', email);

        // Save user to DB if doesn't already exists
        if (!exists) {
            let userDetails = `{"firstName": "${firstName}", "lastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
            await  client.hset('users', email, userDetails);
            await client.hset('loginActivity', email, JSON.stringify({"0": "Signed up: " + new Date().toLocaleString()}));
            await client.hset('cart', email, "{}");
            return response.status(200).json({"msg": "User signed in"})
        } else {
            // If user exists already send error
            return response.status(401).json({"err": "User exists for this email please sign in"})
        }
    }catch(err) {
     console.err(err);
    }

}

module.exports = signUp;