/*
const redis = require('redis');
const { asyncRedis } = require('@toomee/async-redis');
const bcrypt = require('bcrypt');
const bcryptRounds = 10;

const client = redis.createClient();

const adminEmail = "admin@admin.com";
const adminPassword = "1234";

//Todo: make redis async
/!*const redisClient = redis.createClient();
const client = asyncRedis(redisClient);*!/

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

module.exports = client



*/







const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();
const bcrypt = require('bcrypt');
const bcryptRounds = 10;


const adminEmail = "admin@admin.com";
const adminPassword = "1234";

client.on('connect', async() => {
    console.log("redis client connected")
    // Check if admin exists
    let reply = await client.hlen("admins")
    try{
        let password = await bcrypt.hash(adminPassword, bcryptRounds);
        if (reply - 0 === 0) {
            client.hset("admins", adminEmail, JSON.stringify({
                "firstName": "admin",
                "lastName": "admin",
                "password": password
            }));
        }
    }catch(err){
        console.err(err);
    }
});


client.on('error', (error)=>{
    console.log('Error: '+ error)
});

module.exports = client