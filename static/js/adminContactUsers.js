

function sendMsg(){
    // Todo: change to different fetch because we need to knoe the email not from cookie
    let msg = document.getElementById("user-msg").value;
    let email = document.getElementById('current-email').innerText;
    if(msg !== ""){
        fetch(`http://localhost:8080/api/admin/contact/send`, {credentials: "include", method:'POST',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({"type": "Admin", "msg":msg, "recipient" : email})
        });
        // Create new msg
        let div = document.createElement('div');
        div.className = "container viewer";
        let img = document.createElement('img');
        img.setAttribute('src',"../img/GiftPrint.png")
        img.setAttribute('alt',"User")
        img.className = "avatar right";
        let p = document.createElement('p');
        let txt = document.createTextNode(msg);
        p.appendChild(txt);
        div.appendChild(img)
        div.appendChild(p)

        // Add new msg
        document.getElementById('messages').appendChild(div)

        // Reset input
        document.getElementById("user-msg").value = "";
    }
}

window.onload = loadUsers;

async function loadUsers(){
    try{
        let res = await fetch(`http://localhost:8080/api/admin/contact/users`, {credentials: "include", method:'GET'});
        let body = await res.json();
        let userEmails = Object.keys(body);
        let numOfUsers = userEmails.length;
        let htmlString = "";
        for(let i = 0; i < numOfUsers; i++ ){
            let user = JSON.parse(body[userEmails[i]]);
            if(user.lastResponse === "User"){
                htmlString += `<li class="red-status" style="color:red">${user.fullName} ${user.email}</li>`
            }else{
                htmlString += `<li class="green-status" style="color:green">${user.fullName} ${user.email}</li>`
            }
        }
        document.getElementById('users-list').innerHTML = htmlString;

    }catch(err){

        // window.location = "../html/ErrorPage.html";
    }
}



