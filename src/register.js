async function signUp(request,response, client){
    let body = await request.body;
    let firstName = body.FirstName;
    let lastName = body.LastName;
    let email = String(body.email);
    let password = body.password;
    //Todo: password encryption
    client.hset('users',email ,
        `{"firstName": "${firstName}", "LastName": "${lastName}", "email": "${email}", "password": "${password}"}`);
}

module.exports.signUp = signUp;


