const redis = require('redis');
const express = require('express');
const bodyParser  = require('body-parser')
//const bcrypt = require('bcrypt');
const fs = require('fs');
const cors = require('cors');
const uuid = require('uuid');
const multer  = require('multer')
var path = require('path')

// How to save images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../static/productImg')
    },
    filename: function (req, file, cb) {
        console.log(file.mimeType)
        cb(null, file.fieldname + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })


const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
});

client.on('error', (error)=>{
    console.log('Error: '+ error)
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
// Todo: put limit on file size?


const port = 6379;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});

// Sign up
app.post('/api/signUp', (request,response)=> {
    let body =  request.body;
    let firstName = body.FirstName;
    let lastName = body.LastName;
    let email = String(body.email);
    let password = body.password;
    //Todo: password encryption
    let userDetails = `{"firstName": "${firstName}", "lastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
    client.hset('users',email ,userDetails);
    //Todo: choose redirect
    response.redirect('back');
});


// Sign in
app.post('/api/signIn', (request,response)=> {
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



// Admin
app.get('/api/admin', (request,response)=> {
    client.hvals("users", function (err, reply) {
        if (err) throw err;
       // let data = {"data": reply};
        let data = {"data": reply };
        console.log(data)
        // console.log(JSON.parse(""+ reply + ""));
        // console.log(typeof  reply);
         console.log( reply[0]);
        response.json(data);
    });
});




// Shirt design
app.post('/api/design/save', upload.single('uploadedImg'), function (request,response) {
    // email = get user email from cookie
    let email = "1@2";
    //fs.writeFileSync('./test/test.png', request.file);
    let body =  request.body;
    console.log(request.file);
    let imgID = uuid.v4();
    fs.renameSync( request.file.path, `${request.file.destination}/${imgID}.${path.extname(request.file.path)}`);

    // Check if user is in db key img
 /*   client.hget("cart", email,function (err, reply) {
        if (err)  throw err;
        let value =  reply; // check if needs parsing
        if (value === null) {
            console.log("user is not in db" );
          //  client.hset('cart',email ,imgID);
        }//show unknown  email address
        else{
            //client.hset('cart',email ,reply + "," +imgID);
        }
    });*/
    // Save image as imdIDe
  // fs.writeFileSync(`../static/productImg/${imgID}.png`,request.files.uploadedImg);

   // response.download("../static/productImg/${imgID}.png");

});
