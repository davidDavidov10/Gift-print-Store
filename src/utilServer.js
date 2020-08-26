const client = require('./redisConnector');


function signOut(request,response) {
    let cookie = request.header('Cookie')
    if(cookie){
        let sid = cookie.replace(/.*sid=([^;]+).*/i, '$1');
        client.hdel("sessions", sid);
    }
    response.status(200).send("Signed out");
}

// Get user email from session id  in cookie
// Returns user email if user session is validated. Else throw error, user is not logged in
function getUserFromSession(request){
    return new Promise((resolve, reject) =>{
        let sid;
        try{
           sid = request.header('Cookie').match(/sid=([^;]+)/i);
        }catch(e){
            // No cookie header
            reject("User is not logged in");
        }
        if(sid === null) reject("User is not logged in") // There is a cookie header but no sid in it
        else sid = sid[1];
        client.hget("sessions", sid,  (err, reply)=>{
            if(reply !== null ) resolve(JSON.parse(reply).id);
            else reject("User is not logged in"); // Sid is not a valid session id
        });
        }
    );
}

async function validate(request, response){
    await getUserFromSession(request).then( async(email) =>{
        let isAdmin = await new Promise((resolve, reject) => {
            client.hget("admins", email,((err, reply) => {
                resolve(reply !== null);
            }));
        });
        if(isAdmin) response.status(200).json({"response" : "Admin Authenticated" });
        else response.status(200).json({"response" : "User Authenticated" });
    }).catch((err)=>{
        if(err === "User is not logged in") response.status(200).json({"response" :"Not Authenticated"});
        else  response.status(500).json(err);
    });
}


// CleanUp redis sessions. Once a day go over sessions and delete all expired sessions from DB
function cleanUpExpiredSessionsFromRedis(){
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
}

module.exports = {signOut, getUserFromSession, validate, cleanUpExpiredSessionsFromRedis};
