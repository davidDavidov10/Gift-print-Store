const redis = require('redis');
const express = require('express');
const bodyParser  = require('body-parser')
const bcrypt = require('bcrypt');
const fs = require('fs');
const cors = require('cors');
const uuid = require('uuid');
const multer  = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

const bcryptRounds = 10;
const adminEmail = "admin@admin.com";
const adminPassword = "1234";

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
    // Check if admin exists
    // todo: check if admin password needs to be not hardcoded
    client.hlen("admins", async function (err, reply) {
        let password =  await bcrypt.hash(adminPassword, bcryptRounds).catch((err) => console.err(err));
        if (reply-0 === 0 ){
            client.hset("admins", adminEmail , JSON.stringify({"firstName":"admin", "lastName":"admin","password": password}));
        }
    })
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

    // Hash password before saving to DB
    password =  await bcrypt.hash(password, bcryptRounds).catch((err) => console.err(err));

    // Check user doesn't already exist for given email
    let exists  = await new Promise( (resolve, reject) =>{
        client.hexists('users', email, (err, reply)=>{
            resolve(reply)

        });
    });

    // Save user to DB if doesn't already exists
    if(!exists){
        let userDetails = `{"firstName": "${firstName}", "lastName": "${lastName}", "email": "${email}", "password": "${password}"}`;
        client.hset('users',email ,userDetails);
        client.hset('loginActivity', email, JSON.stringify({"lastLogin": "Hasn't logged in yet"}));
        client.hset('cart', email, "{}");
        response.json({"msg" : "User signed in"})
    }else{
        response.json({"err" : "User exists for this email please sign in"})
    }
});


// Sign in
app.post('/api/signIn', (request,response)=> {
    let body =  request.body;
    let email = body.email;
    let password = body.password;
    let rememberMe = body.rememberMe;
    let isAdmin = false;
    //TODO: handle each case

    // Check if given user is an existing user from DB
    client.hget("users", email,async function (err, reply) {
        if (err)  throw err;
        await new Promise((resolve, reject) => {
        let user =  JSON.parse(reply);

        if (user === null) {
            // Check if user is an admin
            client.hget("admins", email, function (err, reply) {
                if (reply === null) {
                    // Show unknown  email address
                    console.log("unknown  email address")
                    response.send(JSON.parse('{"err": "Incorrect Email"}'));
                } else {
                    isAdmin = true;
                    resolve(JSON.parse(reply));
                }
            });
        } else resolve(user);
        }).then(async(user)=>{
            // Check given password is the same as the encrypted password from DB
            let isPassword =  await bcrypt.compare(password, user.password).catch((err) => console.error(err)); ;
            if (!isPassword) {
                // Show incorrect password
                console.log("incorrect password")
                response.send(JSON.parse('{"err": "Incorrect Password"}'));
            } else {
                // Login
                let  sid = uuid.v4();
                let expiration = "session"
                if(rememberMe){
                    response.cookie('sid', sid ); // todo: check how log this should be connected
                }else{
                    response.cookie('sid', sid ,{maxAge: 1800000}); // 30 min until cookie expires
                    expiration = Date.now() + 1800000;
                }
                console.log("logged in ");
                // Goto homepage while logged in
                // Save session info adn login Activity to DB
                client.hset('sessions', sid, JSON.stringify({id: email, expire:expiration}));
                client.hset("loginActivity", email, JSON.stringify({lastLogin: new Date().toLocaleString()}));

                response.send(JSON.parse(`{"isAdmin": ${isAdmin}}`));
            }
        });
    });

    //Todo: choose redirect

});


// Sign Out
app.delete('/api/signOut', (request,response)=> {
    // Todo: check if there is a better way to parse the sid from cookie  regex?
    let sid = request.header('Cookie').split(";")[1].slice(5);
    client.hdel("sessions", sid);
    response.send("Signed out");
});

// Admin
app.get('/api/admin', async(request,response)=> {
    // Check that the user is admin
    await getUserFromSession(request).then(async (email) => {
        // Check if user is an admin //todo: if we dont have more admins we can just check the mail
        client.hget("admins", email,async function (err, reply) {
            if(reply !== null){
                // If user is admin send client users data to show in table
                let userData =  await new Promise((resolve, reject) => {
                    client.hgetall("users", async function(err,reply){
                        let users = []
                        for(let user in reply){
                            let details= await JSON.parse(reply[user]);
                            await new Promise((resolve1, reject1) => {
                                client.hget("cart",user,async function(err, reply){
                                    resolve1({...details,"cart": JSON.parse(reply)});
                                });

                            }).then((pushItem) =>{
                                 return  new Promise((resolve2, reject2) => {
                                    client.hget("loginActivity", user,function(err,reply){
                                        resolve2({...pushItem,"lastLogin": JSON.parse(reply).lastLogin});
                                    } );
                                });
                                }).then((pushItem) =>{
                                return  new Promise((resolve3, reject3) => {
                                    client.hget("purchases", user,function(err,reply){
                                        resolve3({...pushItem,"purchases": JSON.parse(reply !== null ? reply : "{}")});
                                    });
                                });
                            }).then((pushItem)=>{
                                users.push(pushItem);
                            });
                        }
                        resolve(users);
                    });
                });

                let data = {"data": userData};
                response.json(data);

            }else {
                // If user is NOT admin redirect with error msg
                console.log("user is not an admin")
                response.json("{}");
            }
        });
    }).catch((err)=> {
        // If user is not logged in sid doesnt exist we get an error from getUserFromSession
        // catch it and send so we can redirect in admin.js
        response.send();
    });
});



// Cart get items from db to show in cart
app.get('/api/cart/items',  async (request,response)=> {
   await getUserFromSession(request).then((email) =>{
       client.hget("cart", email, function (err, reply) {
           if (err) throw err;
           let data = {"data": (reply !== null ? reply :"{}") };
           response.json(data);
       });
   }).catch((err)=> {
       response.json({"error":"Please log in to see cart items"})
   });
});



// Cart update db product amount and del from cart
app.put('/api/cart/items/update', async (request,response)=> {
    //Todo: update according to last change by user and not on last closed window
    //Todo: save and get the amount to change from local storage
    //Todo: when removing from db erase from server the imgs
    await getUserFromSession(request)
        .then(async (email) => {
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
                if (amount !== "0") {
                    cart[key].amount = amount;

                } else { // Delete item
                    fs.unlink(`../static/productImg/${key}.png`,()=>{})
                    //todo: check not null
                    fs.unlink(`../static/productImg/${cart[key].imgToPrint}.png`,()=>{})
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
        let size = request.body.productSize !== undefined ? request.body.productSize : "--";
        let amount = request.body.productAmount;
        let price = request.body.price;
        // Rename file to be a unique id
        let file =  request.file;
        if(file !== undefined){
            imgID = uuid.v4();
            fs.rename( file.path, `${file.destination}/${imgID}${path.extname(file.path)}`,  ()=>{});
        }

        fs.writeFile(`../static/productImg/${prodImgID}.png`, data,()=>{});

        // Check if user is in db key img
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            let item = { prodImg:prodImgID, imgToPrint:imgID , amount:amount, type:productType, price:price, color:color, size:size, }
            let cart = {};
            console.log(reply)
            console.log(typeof reply)
            console.log(reply !== "null")
            if (reply !== null) {
                // User is  in db, get existing cart
                cart = JSON.parse(reply);
            }
            // Add item to cart
            cart[prodImgID] = item;
            // Todo: check calendar without img
            client.hset('cart',email ,JSON.stringify(cart));
        });
        response.redirect('back');

    });
});


// Save users order to DB purchases and empty cart
app.post('/api/placeOrder', async (request,response) => {
    await getUserFromSession(request).then((email) =>{
        client.hget("cart", email,function (err, reply) {
            if (err)  throw err;
            // Todo: if user cart is null- dont get here
            if (reply !== null) {
                client.hget('purchases',email, (err1, reply1) =>{
                    if(reply1 !== null){
                        reply = {...JSON.parse(reply),...JSON.parse(reply1)}
                    }
                    client.hset('purchases',email ,JSON.stringify(reply));
                });
                client.hdel('cart',email);
                let path = request.get('referer')
                // todo: choose redirect to something else ?
                response.redirect(path.replace("CheckoutPage.html","HomePage.html"));
            }
        });
    });
});

// When designing a product check that user is logged in if not we send user to login page
app.get('/api/validate',  async(request, response) =>{
    await getUserFromSession(request).then( async(email) =>{
      let isAdmin = await new Promise((resolve, reject) => {
          client.hget("admins", email,((err, reply) => {
              resolve(reply !== null);
          }));
      });
      if(isAdmin) response.json({"response" : "Admin Authenticated" });
      else response.json({"response" : "User Authenticated" });
    }).catch((err)=>{
        response.json({"response" :"Not Authenticated"});
    });
})

// Get user email from session id  in cookie
function getUserFromSession(request){
    return new Promise((resolve, reject) =>{
            // Todo: check if there is a better way to parse the sid from cookie  regex?
            let sid = request.header('Cookie').split(";")[1].slice(5);
            client.hget("sessions", sid,  (err, reply)=>{
                if(reply !== null ) resolve(JSON.parse(reply).id);
                else reject(err);
            });
        }
    );
}


// CleanUp redis sessions. Once a day go over sessions and delete all expired sessions from DB
setInterval(()=>{
    console.log("/n cleaning up redis sessions " + Date.now().toLocaleString() );
    client.hgetall("sessions", ((err, reply) => {
        let keys = Object.keys(reply);
        for(let keyIndex in keys){
            let key = keys[keyIndex];
           // console.log(reply[key]);
            let expiration = JSON.parse(reply[key]).expire;
            if(expiration !== "session" && Date.now() > expiration ){
               // console.log("above session was deleted from DB");
                client.hdel("sessions", key);
            }
        }
    }))
}, 86400000);
//24 hours = 86400000

// Todo: V add individual product details like shirt size
// Todo: V checkout screen
// Todo: V admin table add users -  V login activity, V  purchases, V cart
// Todo: V remember me, else session  expiration in 30 min
// Todo: V create homepage with products
// Todo: V home page : search, items.
// Todo: V admin vs. user
// Todo: V can only enter pages if logged in - do this in product design pages also checkout page
// Todo: V cart screen activate search
// Todo: V add logout button
// Todo: V product prices
// Todo: V encrypt  password
// Todo: V cleanup redis sessions once every ? 10? hours except for remember me set interval
// Todo: V  V  sign out clears from sessions DB , X you cant sign in again while logged in , V and sign up redirect to sign In
// Todo: V navbar
// Todo:   defend against Dos attacks
// Todo:   make sure there are at least 2-4 additional pages as required
// Todo:   css - design design design
// Todo:   check all http methods are as they should be (get post and such)? change to https? check http status are as they should be

// Ask ohad
// Todo:   login activity -( in admin table)  is this last login or a log of all logins ??
// Todo:   can a user see the homepage without log in ??
// todo:   is there a better way to redirect when access is denied ??
// Todo:   navbar can we reuse the code here?  use script to inject code for navbar? (remember admin vs user)   ??
// Todo:   what do we need to do with the information from the checkout page like credit card   ??
// Todo:   encrypt password in client side ? we use bcrypt in server side how? without require bcrypt


// Todo: if there's time
// send confirmation email or reset password
// previous purchases
// purchases page for admin to handel existing orders status