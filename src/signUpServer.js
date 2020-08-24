const client = require('./redisConnector');
const bcrypt = require('bcrypt');
const bcryptRounds = 10;

async function signUp(request,response) {
    let body = request.body;
    let firstName = body.firstName;
    let lastName = body.lastName;
    let email = String(body.email);
    let password = body.password;

    // Hash password before saving to DB
    password = await bcrypt.hash(password, bcryptRounds).catch((err) => console.err(err));

    // Check user doesn't already exist for given email
    let exists = await new Promise((resolve, reject) => {
        client.hexists('users', email, (err, reply) => {
            resolve(reply)

        });
    });
    // Save user to DB if doesn't already exists
    if (!exists) {
        let userDetails = `{"firstName": "${firstName}", "lastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
        client.hset('users', email, userDetails);
        client.hset('loginActivity', email, JSON.stringify({"0": "Signed up: " + new Date().toLocaleString()}));
        client.hset('cart', email, "{}");
        response.status(200).json({"msg": "User signed in"})
    } else {
        // If user exists already send error
        response.status(401).json({"err": "User exists for this email please sign in"})
    }
}

module.exports = signUp;