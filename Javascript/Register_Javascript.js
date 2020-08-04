let redis = require('redis');
let express = require('express');





const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
});


app.post('/signUp',(request,response)=>{
    // client.set('h','i', redis.print);
    let firstName = document.getElementsByClassName("First name").value;
    let lastName = document.getElementsByClassName("Last name").value;
    client.set(firstName, lastName, redis.print);
    console.log(request);

});

const port = 6379;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});



// signUp = (testing) =>{
//     // client.set(testing.FirstName.value,testing.LastName.value, redis.print);
//     alert("added ");
// }

