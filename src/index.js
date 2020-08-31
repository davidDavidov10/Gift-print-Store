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
const contactUs = require('./contactUsServer')
const adminContactUser = require('./adminContactUserServer')

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
// const pathName = );

// Todo: remove cors this is only for testing to open from webstorm, find better way?
app.use(cors({ origin: 'http://localhost:9090' , credentials :  true}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../static')));

const expressWs = require('express-ws')(app);




let clientList = [];
app.ws('/api/contactUs/ws', function(ws, req) {
    ws.on("connect", function (client){
        clientList.push(client)
       ws.on("message", function(msg){
            for(let c of clientList){
                c.send(msg)
                console.log("in message")
            }
        });

        ws.on("close", function(){
            let index = clientList.indexOf(this)
            if(index != -1){
                clientList.splice(index,1)
            }
        });

        client.send("Welcome!");
    });
});

// Express handle routes

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

// When a uses sends a msg to admin save it in db
app.post('/api/contactUs/send',((req, res) => contactUs.storeMsg(req,res)))

// Load users correspondence with admin
app.get('/api/contactUs',((req, res) => contactUs.loadMsg(req,res)))

// When a admin sends a msg to user save it in db
app.post('/api/admin/contact/send',((req, res) => adminContactUser.storeMsg(req,res)))

// Load users list to admin contact users page
app.get('/api/admin/contact/users',((req, res) => adminContactUser.loadUsers(req,res)))

// Load user msg to admin contact users page after user is chosen
app.get('/api/admin/contact/msg/:email',((req, res) => adminContactUser.loadMsg(req,res)))

// Make sure expired sessions are erased from server once a day
util.cleanUpExpiredSessionsFromRedis()


const port = 8080;
app.listen(port,()=>{
    console.log("server started on port: " + port);
});


// Todo:   Check that user cant get into admin contact us and vise versa
// Todo:   Check image upload (size)
// Todo:   Go over code:3. make sure server never crushes 4. check name conventions
// Todo:   Add readme files no need to add them to navbar
// Todo:   add test using redis
// Todo:   Check project package json for submit


