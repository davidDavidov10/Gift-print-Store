let redis = require('redis');
let express = require('express');
let bodyParser  = require('body-parser')




const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
});


app.use(bodyParser.urlencoded({extended: true}));

app.post('/signUp',(request,response)=>{
    let body = request.body;
    let firstName = body.FirstName;
    let lastName = body.LastName;
    client.set(firstName, lastName, redis.print);
    console.log(body);
});

const port = 6379;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});



// signUp = (testing) =>{
//     // client.set(testing.FirstName.value,testing.LastName.value, redis.print);
//     alert("added ");
// }

