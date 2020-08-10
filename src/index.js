const redis = require('redis');
const express = require('express');
const bodyParser  = require('body-parser')
//const bcrypt = require('bcrypt');
const fs = require('fs');
const cors = require('cors');
const uuid = require('uuid');
const multer  = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');


// How to save images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../static/productImg')
    },
    filename: function (req, file, cb) {
        //Todo: check the file type? check file size? and name
        cb(null, file.fieldname + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });


const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
});

client.on('error', (error)=>{
    console.log('Error: '+ error)
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(cors());
app.use(cors({ origin: 'http://localhost:63342' , credentials :  true}));
app.use(cookieParser());



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
//app.post('/api/test', (request,response)=> {
    let body =  request.body;
    let email = body.email;
    let password = body.password;
    let  sid = uuid.v4();
    //Todo: password encryption
    //TODO: handle each case
    response.cookie('sid', sid ); //30 min time out {maxAge: 1800000}
    client.hget("users", email,function (err, reply) {
        if (err)  throw err;
        let user =  JSON.parse(reply);
        if (user === null) {
            console.log("unknown  email address" )
            response.json('{"err": "Incorrect Email"}');
        }//show unknown  email address
        else{
            if(password !== user.password){
                // show incorrect password
                console.log("incorrect password")
                response.json('{"err": "Incorrect Password"}');
            } else{
                //login
              console.log("logged in ");
                // goto homepage while logged in
                // hset "sessions" sid {id: email}
                client.hset('sessions', sid, JSON.stringify({id: email}));

                console.log(sid)

                response.json('{}');
            }
        }
    });
/*
    //Todo: choose redirect
  // response.redirect('back');
    /!*response.cookie('sid', sid, {maxAge: 3000});
    response.send('{}');*!/
*/


});

//delete later
app.post('/api/test', (request,response)=> {
    let sid = uuid.v4();
    console.log("in index /test")

    //response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);

    console.log("body = " + JSON.stringify(request.body))

    response.cookie('test sid', sid);
    response.json('{}');

});



// Admin
app.get('/api/admin', (request,response)=> {
    client.hvals("users", function (err, reply) {
        if (err) throw err;
        let data = {"data": reply };
        response.json(data);
    });
});



// Cart get items from db to show in cart
app.get('/api/cart/items',  async (request,response)=> {
   await getUserFromSession(request).then((email) =>{
       console.log("email = "+ email)
       client.hget("cart", email, function (err, reply) {
           if (err) throw err;
           let data = {"data": reply };

           response.json(data);
       });
   });
});



// Cart update db product amount and del from cart
app.put('/api/cart/items/update', async (request,response)=> {
    //Todo: update according to last change by user and not on last closed window
    //Todo: save and get the amount to change from local storage
    //Todo: when removing from db erase from server the imgs
    await getUserFromSession(request).then(async (email) => {
        let productsAmounts = request.body;
        let cart = await new Promise((resolve, reject) => {
            client.hget("cart", email, function (err, reply) {
                if (err) throw err;
                let cart = JSON.parse(reply);
                resolve(cart)//todo: if cart == null
                console.log("cart (index)= " + JSON.stringify(cart))
            });
        });
        Object.keys(productsAmounts).forEach(function (key) {
            let amount = productsAmounts[key];
            if (amount !== "0") {
                cart[key].amount = amount;
            } else { // Delete item
                delete cart[key]
            }
        });
        client.hset('cart', email, JSON.stringify(cart));

    });
});


// Shirt design and save in user cart, save imgs in server
app.post('/api/design/save', upload.single('uploadedImg'),  async(request,response) => {
    // Todo: email = get user email from cookies
    await getUserFromSession(request).then((email) =>{
       // let body =  request.body;
        let imgID = uuid.v4();
        let prodImgID = uuid.v4();
        let data = new Buffer.from(request.body.shirtWithImage.slice(22), 'base64');

        fs.writeFile(`../static/productImg/${prodImgID}.png`, data,()=>{});
        // Rename file to be a unique id
        let file =  request.file;
        fs.renameSync( file.path, `${file.destination}/${imgID}${path.extname(file.path)}`);

        // Check if user is in db key img
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            let item = { prodImg:prodImgID, imgToPrint:imgID , amount:2, type:"shirt", price:3, color:"blue"}
            let cart = {};
            if (reply !== null) {
                // User is  in db, get existing cart
                cart = JSON.parse(reply);
            }
            // Add item to cart
            cart[prodImgID] = item;
            client.hset('cart',email ,JSON.stringify(cart));
        });
        response.redirect('back');

    });
});

// Get user email from session id  in cookie
function getUserFromSession(request){
    return new Promise((resolve, reject) =>{
            // Todo: check if there is a better way to parse the sid from cookie
            let sid = request.header('Cookie').split(";")[1].slice(5);
            client.hget("sessions", sid,  (err, reply)=>{
                console.log("in getUsesFromSession")
                resolve(JSON.parse(reply).id)
            });
        }
    );
}