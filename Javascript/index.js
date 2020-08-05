const redis = require('redis');
const express = require('express');
const bodyParser  = require('body-parser')
//const bcrypt = require('bcrypt');
const register = require('./register');
const login = require('./login');


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

app.post('/signUp', (request,response)=> {
    register.signUp(request, response, client).catch(console.log);
});
app.post('/signIn', (request,response)=> {
    login.signIn(request, response, client).catch(console.log);
});

