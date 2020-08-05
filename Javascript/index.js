const redis = require('redis');
const express = require('express');
const bodyParser  = require('body-parser')
//const bcrypt = require('bcrypt');
const register = require('./register');
const login = require('./login');
const cross = require('cross');


const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
});

client.on('error', (error)=>{
    console.log('Error: '+ error)
});

app.use(bodyParser.urlencoded({extended: true}));


const port = 6379;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});

// sign up
app.post('/signUp', (request,response)=> {
    let body =  request.body;
    let firstName = body.FirstName;
    let lastName = body.LastName;
    let email = String(body.email);
    let password = body.password;
    //Todo: password encryption
    let userDetails = `{"firstName": "${firstName}", "LastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
    client.hset('users',email ,userDetails);
    //Todo: choose redirect
    response.redirect('back');
});

/*
app.post('/signUp', (request,response)=> {
    register.signUp(request, response, client).catch(console.log);
});
*/


/*app.post('/signIn', (request,response)=> {
    login.signIn(request, response, client).catch(console.log);
});*/


// sign in
app.post('/signIn', (request,response)=> {
    let body =  request.body;
    let email = String(body.email);
    let password = body.password;
    console.log("entered password = " + password);
    //Todo: password encryption


    //TODO: handle each case
    client.hget("users", email,function (err, reply) {
        if (err)  throw err;
        let user =  JSON.parse(reply);
        if (user === null) console.log("unknown  email address" )//show unknown  email address
        else{
            if(password !== user.password){
                // show incorrect password
                console.log("incorrect password")
            } else{
                //login
              console.log("logged in ");
                // goto homepage while logged in
            }
        }
    });
    //Todo: choose redirect
    response.redirect('back');

});



// admin
app.get('/admin', cross(), (request,response)=> {
    client.hvals("users", function (err, reply) {
        if (err) throw err;
        console.log("express")
        response.send(reply);
    });
});


// function foo(){
//     let ans = null;
//     client.hget("users", email,function (err, reply) {
//         if (err)  throw err;
//         ans =  JSON.parse(reply);
//     });
//     return ans;
//
// }