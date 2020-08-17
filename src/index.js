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
        cb(null, file.fieldname + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg'  && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
});


const app = express();
let client = redis.createClient();

client.on('connect', ()=>{
    console.log("redis client connected")
    // Check if admin exists
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
        // If user exists already send error
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
                    response.cookie('sid', sid );
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
});


// Sign Out
app.delete('/api/signOut', (request,response)=> {
    let sid = request.header('Cookie').replace(/.*sid=([^;]+).*/i,'$1');
    client.hdel("sessions", sid);
    response.send("Signed out");
});


// Admin
app.get('/api/admin', async(request,response)=> {
    // Check that the user is admin
    await getUserFromSession(request).then(async (email) => {
        // Check if user is an admin
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



app.get('/api/admin/purchases', async(request,response)=> {
    // Check that the user is admin
    await getUserFromSession(request).then(async (email) => {
        client.hgetall("purchases", function(err,reply){
          response.json(reply);
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
    await getUserFromSession(request)
        .then(async (email) => {
            let productsAmounts = request.body;
            let cart = await new Promise((resolve, reject) => {
                client.hget("cart", email, function (err, reply) {
                    if (err) throw err;
                    let cart = JSON.parse(reply);
                    resolve(cart)
                });
            });
            Object.keys(productsAmounts).forEach(function (key) {
                let amount = productsAmounts[key];
                if (amount !== "0") {
                    cart[key].amount = amount;

                } else { // Delete item and remove the item imaged from server
                    fs.unlink(`../static/productImg/${key}.png`,()=>{})
                    fs.unlink(`../static/productImg/${cart[key].imgToPrint}.png`,()=>{})
                    delete cart[key]
                }
            });
            client.hset('cart', email, JSON.stringify(cart));
            response.send()
        })
        .catch((err)=>{
            response.send()});
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
            if (reply !== null) {
                let cart = JSON.parse(reply);
                let cartKeys = Object.keys(cart);
                let info = request.body;
                let shippingInfo = `Full Name: ${info.fullname}, Address: ${info.address} ${info.city}, Zip: ${info.zip} `
                // Go over all items in cart and add shipping info and status
                for(let key in cartKeys){
                    let item = cart[cartKeys[key]];
                    item["status"] = "In Process";
                    item["shippingInfo"] = shippingInfo;
                }
                // Get existing purchases
                client.hget('purchases',email, (err1, reply1) =>{
                    // reply1 is the existing purchases
                    if(reply1 !== null){
                       cart = {...cart,...JSON.parse(reply1)}
                    }
                    client.hset('purchases',email ,JSON.stringify(cart));
                });
                client.hdel('cart',email);
                let path = request.get('referer')
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
});

app.put('/api/admin/updateStatus', async(request, response) => {
    let purchases = await new Promise( (resolve, reject) => {
        client.hget('purchases', request.body.email, (err, reply) => {
            if(reply !== null) resolve(reply)
            else reject(err)
        });
    });
    purchases= JSON.parse(purchases);
    purchases[request.body.itemName].status = "Order Completed";
    console.log("purchases: "+ JSON.stringify(purchases))
    console.log("purchases: "+ typeof purchases)
    client.hset('purchases',request.body.email,JSON.stringify(purchases))
    }
);

// Get user email from session id  in cookie
function getUserFromSession(request){
    return new Promise((resolve, reject) =>{
        let sid = request.header('Cookie').replace(/.*sid=([^;]+).*/i,'$1');
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
// Todo: V purchases page for admin to handel existing orders status
// Todo:   check all http methods are as they should be (get post and such)? change to https? check http status are as they should be
// Todo:   defend against Dos attacks
// Todo:   make sure there are at least 2-4 additional pages as required
// Todo:   css - design design design
// Todo:   Write tests with fetch



// Ask Ohad
// Todo:   login activity - (in admin table)  is this last login or a log of all logins ??
// Todo:   can a user see the homepage without log in ??
// todo:   is there a better way to redirect when access is denied ??
// Todo:   navbar can we reuse the code here?  use script to inject code for navbar? (remember admin vs user)   ??
// Todo:   what do we need to do with the information from the checkout page like credit card   ??
// Todo:   encrypt password in client side ? we use bcrypt in server side how? without require bcrypt
// Todo:   defend against Dos attacks. What does this mean?
// Todo:   can we assume the browser supports web local storage? (shopping cart updating amount)
// Todo:   When saving admin@adimin do the email and password need to be hardcoded? can admin add more admins?
// Todo:   How long should a remember me be connected ? should it just be a session cookie?


// Todo: if there's time
// send confirmation email or reset password
// previous purchases
