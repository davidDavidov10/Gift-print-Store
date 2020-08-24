// General imports
const express = require('express');
const bodyParser  = require('body-parser')
const cors = require('cors');
const multer  = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

// Route functions imports
const signUp = require('./signUpServer')
const signIn = require('./signInServer')
const util = require('./utilServer')
const admin = require('./adminServer.js')
const adminPurchases = require('./adminPurchasesServer')
const cart = require('./cartServer')
const design = require('./productDesignServer')
const checkout = require('./checkoutServer')
const home = require('./homeServer')

// Project Constants

// Multer how to save images
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


// Set up express
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:63342' , credentials :  true}));
app.use(cookieParser());

const port = 6379;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});



// Express handle routs

// Sign up
app.post('/api/signUp',((req, res) => signUp(req,res)));

// Sign in
app.post('/api/signIn',((req, res) => signIn(req,res)) );

// Sign Out
app.delete('/api/signOut',(req, res) => util.signOut(req,res));

// Admin get admin table info
app.get('/api/admin', (req, res) => admin(req,res));

// Admin get info for purchases table
app.get('/api/admin/purchases', (req, res) => adminPurchases.adminPurchases(req,res));

// Cart get items from db to show in cart
app.get('/api/cart/items', (req, res) => cart.getItems(req,res) );

// Cart update db product amount and delete from cart if needed
app.put('/api/cart/items/update', (req, res) => cart.update(req,res));

// Product design and save in user cart, save imgs in server
app.post('/api/design/save',upload.single('uploadedImg'),(req, res) => design.save(req,res));

// When designing a product check that user is logged in if not we send user to login page - for nav-bar
app.get('/api/design/validate', (req, res) => design.validate(req,res));

// Save users order to DB purchases and empty cart
app.post('/api/placeOrder',(req,res) => checkout(req, res) );

// When calling nav-bar check that user is logged and if the user is admin
app.get('/api/validate', (req,res) => util.validate(req, res));

// When entering homepage check if user is logged in if not we send user to login page
app.get('/api/home', (req,res) => home(req, res));

// Admin -  update the status of a purchase from purchase table
app.put('/api/admin/updateStatus', (req, res) => adminPurchases.updateStatus(req,res));


// Make sure expired sessions are erased from server once a day
util.cleanUpExpiredSessionsFromRedis()


// Todo:   Change redis client to async client
// Todo:   Go over code: 1. async await where possible 2.try catch (check errors)
// Todo:   defend against Dos attacks
// Todo:   Write tests with fetch
// Todo:   Add readme files
// Todo:   Check project package json for submit





// Ask Ohad
// Todo:   defend against Dos attacks. What does this mean -
// Answer: mostly stuff that will make your server crash e.g. invalid input + few requests in the same time attack (let's say 5 requests)

// Todo:   How should we test ?
//  "Build test.js that test intelligently all the meaningful routes that your server
//   supports. You only need to test the server-side routes."
//   does it mean we dont need to test the actions in the client side like create shirt design?

// Todo:   Set the url ?
// Todo:   make sure there are at least 2-4 additional pages as required. are our pages enough
// Todo:   Is it ok to use then, or do we always need async await
// Todo:   Does readme need to be accessible from the website or just an html in the project

// Todo: if there's time
// send confirmation email or reset password
// previous purchases
