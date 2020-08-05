async function signIn(request, response, client){
    let body =  await request.body;
    let email = String(body.email);
    let password = body.password;
    console.log("entered password = " + password);
    //Todo: password encryption


    await client.hget("users", email,   function (err, reply) {
        if (err)  throw err;
        let user =  JSON.parse(reply);
        if (user === null) console.log("this is null") //show unknown  email address
        else{
            if(password !== user.password){
                // show incorrect password
            }
        }
    });
}

module.exports.signIn = signIn;


