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
app.post('/api/signUp', async (request,response)=> {
    let body =  request.body;
    let firstName = body.firstName;
    let lastName = body.lastName;
    let email = String(body.email);
    let password = body.password;
    // Check user doesn't already exist for given email
    let exists  = await new Promise( (resolve, reject) =>{
        client.hexists('users', email, (err, reply)=>{
            resolve(reply)

        });
    });
    //Todo: password encryption
    if(!exists){
        let userDetails = `{"firstName": "${firstName}", "lastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
        client.hset('users',email ,userDetails);
    }else{
        response.json({"err" : "User exists for this email please log in"})
    }

    //Todo: choose redirect
  //  response.redirect('back');
});


// Sign in
app.post('/api/signIn', (request,response)=> {
    let body =  request.body;
    let email = body.email;
    let password = body.password;
    let rememberMe = body.rememberMe;

    //Todo: password encryption
    //TODO: handle each case

    client.hget("users", email,async function (err, reply) {
        if (err)  throw err;
        await new Promise((resolve, reject) => {
        let user =  JSON.parse(reply);
        if (user === null) {
            // Check if user is an admin
            client.hget("admins", email, function (err, reply) {
                if (reply === null) {
                    // Show unknown  email address
                    console.log("unknown  email addressfdsfds")
                    response.send(JSON.parse('{"err": "Incorrect Email"}'));
                } else {
                    resolve(JSON.parse(reply));
                }
            });
        } else resolve(user);
        }).then((user)=>{
            if (password !== user.password) {
                // Show incorrect password
                console.log("incorrect password")
                response.send(JSON.parse('{"err": "Incorrect Password"}'));
            } else {
                // Login
                let  sid = uuid.v4();
                if(rememberMe){
                    response.cookie('sid', sid ); // todo: check how log this should be connected
                }else{
                    response.cookie('sid', sid ,{maxAge: 1800000}); // 30 min until cookie expires

                }
                console.log("logged in ");
                // Goto homepage while logged in
                client.hset('sessions', sid, JSON.stringify({id: email}));
                response.send("{}");
            }
        });




    });

    //Todo: choose redirect

});


// Admin
app.get('/api/admin', async(request,response)=> {
    // Check that the user is admin
    await getUserFromSession(request).then(async (email) => {
        // Check if admin exists todo: check if the creation of "admin/"admin" needs to be when creating the redis
        // todo: check if admin password needs to be not hardcoded
        client.hlen("admins", function (err, reply) {
            if (reply-0 === 0 ){
                client.hset("admins", "admin@admin.com" , JSON.stringify({"firstName":"admin", "lastName":"admin","password":"1234" }));
            }
        })
        // Check if user is an admin //todo: if we dont have more admins we can just check the mail
        client.hget("admins", email,async function (err, reply) {

            if(reply !== null){
                // If user is admin send users data to show in table
                let userData =  await new Promise((resolve, reject) => {
                    client.hgetall("users", async function(err,reply){
                        let users = []
                        for(let user in reply){
                            let details= await JSON.parse(reply[user]);
                            let pushItem = await new Promise((resolve1, reject1) => {
                                client.hget("cart",user,async function(err, reply){
                                    resolve1({...details,"cart": JSON.parse(reply)});
                                });
                            }).then((pushItem) =>{
                                users.push(pushItem);
                            });

                        }
                        resolve(users);
                    });
                });

                let data = {"data": userData};
                response.json(data);


             /*   client.hvals("users", function (err, reply) {
                    if (err) throw err;
                    let data = {"data": reply};
                    response.json(data);
                });*/
            }else {
                // If user is NOT admin redirect with error msg
               // response.redirect("https://www.google.com/");
                console.log("user is not an admin")
                response.json("{}");
            }
        });


    }).catch((err)=> {
        console.log(err)
        response.send();
    });
});



// Cart get items from db to show in cart
app.get('/api/cart/items',  async (request,response)=> {
   await getUserFromSession(request).then((email) =>{
       client.hget("cart", email, function (err, reply) {
           if (err) throw err;
           let data = {"data": reply };
           response.json(data);
       });
   }).catch((err)=>response.send("Please log in to see cart items"));
});



// Cart update db product amount and del from cart
app.put('/api/cart/items/update', async (request,response)=> {
    //Todo: update according to last change by user and not on last closed window
    //Todo: save and get the amount to change from local storage
    //Todo: when removing from db erase from server the imgs
    await getUserFromSession(request)
        .then(async (email) => {
            console.log("in in items update");
            let productsAmounts = request.body;
            let cart = await new Promise((resolve, reject) => {
                client.hget("cart", email, function (err, reply) {
                    if (err) throw err;
                    let cart = JSON.parse(reply);
                    resolve(cart)//todo: if cart == null
                });
            });
            Object.keys(productsAmounts).forEach(function (key) {
                let amount = productsAmounts[key];
                console.log("amount = "+ amount)
                if (amount !== "0") {
                    cart[key].amount = amount;

                } else { // Delete item
                    console.log("key = " +key)
                    console.log("imgToPrint = " +cart[key].imgToPrint)
                    fs.unlink(`../static/productImg/${key}.png`,()=>console.log("deleted1"))
                    //todo: check not null
                    fs.unlink(`../static/productImg/${cart[key].imgToPrint}.png`,()=>console.log("deleted2"))
                    delete cart[key]
                }
            });
            client.hset('cart', email, JSON.stringify(cart));

        })
        .catch((err)=>response.send());
});


// Product design and save in user cart, save imgs in server
app.post('/api/design/save', upload.single('uploadedImg'),  async(request,response) => {
    await getUserFromSession(request).then((email) =>{
       // let body =  request.body;
        let imgID = "No selected img"
        let prodImgID = uuid.v4();
        let data = new Buffer.from(request.body.productWithImage.slice(22), 'base64');
        let productType = request.body.productType;
        let color = request.body.productColor;
        // Rename file to be a unique id
        let file =  request.file;
        console.log(file + " "+(file !== undefined) )
        if(file !== undefined){
            imgID = uuid.v4();
            fs.rename( file.path, `${file.destination}/${imgID}${path.extname(file.path)}`,  ()=>{});
        }

        fs.writeFile(`../static/productImg/${prodImgID}.png`, data,()=>{});

        // Check if user is in db key img
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            let item = { prodImg:prodImgID, imgToPrint:imgID , amount:2, type:productType, price:3, color:color}
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
            console.log("sid = "+ sid);
            client.hget("sessions", sid,  (err, reply)=>{
                resolve(JSON.parse(reply).id)
            });
        }
    );
}
// Todo:   cleanup redis sessions once every ? 10? hours except for remember me set interval
// Todo: V remember me, else session  expiration in 30 min
// Todo: V create homepage with products
// Todo: V home page : search, items.
// Todo: V admin vs. user
// Todo:   admin table add users login activity, purchases, cart
// Todo:   css - design design design
// Todo:   can only enter pages if logged in
// Todo:   checkout screen
// Todo: V cart screen activate search
// Todo:   navbar can we reuse the code here?  use script to inject code for navbar? (remember admin vs user)
// Todo:   defend against Dos attacks
// Todo:   make sure there are at least 2-4 additional pages as required
// Todo:   encrypt  password
// Todo:   add individual product details like shirt size
// Todo:   login activity - is this last login or a log of all logins ??
// Todo:   can a user see the homepage without log in ??
// todo:   is there a better way to redirect when access is denied ??


// Todo: if there's time
// send confirmation email or reset password
// previous purchases