async function signIn(request, response, client){
    let body =  await request.body;
    let email = String(body.email);
    let password = body.password;
    console.log("entered password = " + password);
    //Todo: password encryption

  var str = "empty"
    //TODO: handle each case
    await client.hget("users", email,   function (err, reply) {
        if (err)  throw err;
        let user =  JSON.parse(reply);
        if (user === null) str = "unknown  email address" //show unknown  email address
        else{
            if(password !== user.password){
                // show incorrect password
                str = "incorrect password"
            } else{
                //login
               str = "logged in :)";
                // goto homepage while logged in
            }
        }
    });

  await console.log(str)
}

module.exports.signIn = signIn;


