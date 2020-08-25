const fetch = require('node-fetch');


async function testSignUp(email, pass, firstName, lastName){
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({"email":email, "password":pass, "firstName":firstName, "lastName":lastName})
    };

    let response = await fetch("http://localhost:8080/api/signUp", requestOptions)
    console.log("response: " +response)

    response = await response.json();
    console.log("response.json(): " +response)

    let  responseErr = await response.err;
    console.log("responseErr: " +response.err)
}

/*function testSignUp(email, pass, firstName, lastName){
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({"email":email, "password":pass, "firstName":firstName, "lastName":lastName})
    };

   return  fetch("http://localhost:6379/api/signUp", requestOptions)
}


testSignUp("1@2.com", "1234", "david","test");*/

//
// var request = require('request');
// var options = {
//     'method': 'POST',
//     'credentials':'include',
//     'url': 'http://localhost:6379/api/signUp',
//     'headers': {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({"email":"1@3.com","password":"pass","firstName":"firstName","lastName":"lastName"})
//
// };
// request(options, function (error, response) {
//     if (error) throw new Error(error);
//     console.log(response.body);
// });

/*
fetch(`http://localhost:6379/api/cart/items`, { credentials: "include",method:'GET'})
    .then(res => res.json())
    .then(json => console.log(json));*/



/*

var raw = JSON.stringify({"email":"1@233.com","password":"pass","firstName":"firstName","lastName":"lastName"});

var requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:6379/api/signUp", requestOptions)
    .then(res => res.json())
    .then(body =>{
        console.log(body);});
*/



var raw = JSON.stringify({"email":"1@2.com","password":"1234","rememberMe":true});

// var requestOptions = {
//     method: 'POST',
//     headers: {"Content-Type": "application/json"},
//     body: raw,
// };
//
// fetch("http://localhost:8080/api/signIn", requestOptions)
//     .then(response => response.text())
//     .then(result => console.log(result))
//     .catch(error => console.log('error', error))



//
// fetch("http://localhost:8080/test").then(res => res.json())
//     .then(console.log).catch(console.log)