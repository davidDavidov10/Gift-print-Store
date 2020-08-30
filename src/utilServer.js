const client = require('./redisConnector');


async function signOut(request,response) {
    let cookie = request.header('Cookie')
    if(cookie){
        let sid = cookie.replace(/.*sid=([^;]+).*/i, '$1');
        await client.hdel("sessions", sid);
    }
    response.status(200).send("Signed out");
}

// Get user email from session id  in cookie
// Returns user email if user session is validated. Else throw error, user is not logged in
 function getUserFromSession(request){
    return new Promise(async (resolve, reject) => {
        let sid;
        try {
            sid = request.header('Cookie').match(/sid=([^;]+)/i);
            if (sid === null) reject("User is not logged in") // There is a cookie header but no sid in it
            else {
                sid = sid[1];
                let reply = await client.hget("sessions", sid)
                if (reply !== null) resolve(JSON.parse(reply).id);
                else reject("User is not logged in"); // Sid is not a valid session id
            }
        } catch (e) {
            // No cookie header
            reject("User is not logged in");
        }
    });
}

async function validate(request, response){
    try{
        let email = await getUserFromSession(request);

        let isAdmin = await client.hget("admins", email);

        if(isAdmin !== null) response.status(200).json({"response" : "Admin Authenticated" });
        else response.status(200).json({"response" : "User Authenticated" });

    }catch(err){
        if(err === "User is not logged in") response.status(200).json({"response" :"Not Authenticated"});
        else  response.status(500).json(err);
    }
}


// CleanUp redis sessions. Once a day go over sessions and delete all expired sessions from DB
function cleanUpExpiredSessionsFromRedis(){
    setInterval(async()=>{
        console.log("/n cleaning up redis sessions " + Date.now().toLocaleString());
        let sessions = await client.hgetall("sessions");
        let keys = Object.keys(sessions);
        for(let keyIndex in keys){
            let key = keys[keyIndex];
            let expiration = JSON.parse(sessions[key]).expire;
            if(expiration !== "session" && Date.now() > expiration ){
                client.hdel("sessions", key);
            }
        }
    }, 86400000); //24 hours = 86400000
}

module.exports = {signOut, getUserFromSession, validate, cleanUpExpiredSessionsFromRedis};
