let redis = require('redis');
//redis
let client = redis.createClient();

client.on('connect', ()=>{
   console.log("redis client connected")
});

client.on('error', (error)=>{
    console.log('Error: '+ error)
});

// set
// client.set('david','davidov',redis.print);


client.hset('users','david','{lastName:"davidov", age:25}',redis.print )
client.hget('users','david',redis.print )


// get handling
// client.get('david',redis.print);

// get handling with error
// client.get('my test key', function (error, result) {
//     if (error) {
//         console.log(error);
//         throw error;
//     }
//     console.log('GET result ->' + result);
// });


