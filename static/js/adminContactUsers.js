async function sendMsg(){
    let msg = document.getElementById("user-msg").value;
    let email = document.getElementById('current-email').innerText;
    if(msg !== "") {
        document.getElementById('send-msg').disabled = true;
        try {
            let res = await fetch(`http://localhost:8080/api/admin/contact/send`, {
                credentials: "include", method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"type": "Admin", "msg": msg, "recipient": email})
            });
            if (res.status === 401) window.location = "../html/LoginPage.html"; // Not authenticated user
            else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error
            else {
                // Send message to server for user
                socket.send(JSON.stringify({email:email,msg:msg}));
                // Create new msg
                let div = createMsgHtml(msg, true);
                // Add new msg
                document.getElementById('messages').appendChild(div)
                // Reset input
                document.getElementById("user-msg").value = "";
                // Change status
                document.getElementById(email).className = "green-status";
                // Scroll down
                let messages= document.getElementById('messages')
                messages.scrollTop = messages.scrollHeight;
                // Remove notification
                document.getElementById(`notifications-${email}`).innerText = "";

            }
        } catch (err) {
            // Send to error page
            window.location = "../html/ErrorPage.html";
        }
    }

}

window.onload = loadUsers;
let socket;
async function loadUsers(){
    try{
        let res = await fetch(`http://localhost:8080/api/admin/contact/users`, {credentials: "include", method:'GET'});
        if (res.status === 401) window.location = "../html/LoginPage.html"; // Not authenticated user
        else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error
        else{
            let body = await res.json();
            let userEmails = Object.keys(body);
            let numOfUsers = userEmails.length;
            let htmlString = "";
            for(let i = 0; i < numOfUsers; i++ ){
                let user = JSON.parse(body[userEmails[i]]);
                let notification = user.lastResponse === "User" ? "!" : "";
                htmlString += `<li  id="${user.email}">
                <a  onclick="loadUserMsg('${user.email}', '${user.fullName}')"><img src="../img/user-avatar.png">
                <div class="contact">
                <div class="name">${user.fullName}</div>
                <div class="email"> ${user.email}</div>
                </div><div class="notification" id="notifications-${user.email}">${notification}</div>
                </div></a></li>`
            }
            document.getElementById('users-list').innerHTML = htmlString;

            // Web socket
            socket = new WebSocket(`ws://localhost:8080/api/admin/contact/msg/ws`)
            socket.onmessage = handleMessage;
        }

    }catch(err){
        window.location = "../html/ErrorPage.html";
    }
}




window.onbeforeunload = function(){
    socket.close();
}

// Receive a msg from user to admin and add it to admin messages
function handleMessage(msg){
    let msgObj = JSON.parse(msg.data)
    let destinationEmail = msgObj.email;
    let currentEmail = document.getElementById('current-email').innerHTML;
    // Check the admin is viewing the right message board before injecting to it
    if( destinationEmail === currentEmail){
        // If admin is looking at msgs from the user that sent this msg add it
        let div = createMsgHtml(msgObj.msg, false);
        document.getElementById('messages').appendChild(div);
        let messages= document.getElementById('messages')
        messages.scrollTop = messages.scrollHeight;
    }else{
        //Check if the msg came from a new user
        let isExistingUser = document.getElementById(destinationEmail);
        if(!isExistingUser){
            // Add user to user list
            let htmlString = `<li id="${destinationEmail}">
                <a  onclick="loadUserMsg('${destinationEmail}', '${msgObj.fullName}')"><img src="../img/user-avatar.png">
                <div class="contact">
                <div class="name">${msgObj.fullName}</div>
                <div class="email"> ${destinationEmail}</div>
                </div><div class="notification" id="notifications-${destinationEmail}">"!"</div>
                </div></a></li>`
            document.getElementById('users-list').innerHTML += htmlString;

        }
    }
    // Notify msg from user
    document.getElementById(`notifications-${destinationEmail}`).innerText = "!";
}


async function loadUserMsg(email, name){
    try{
        document.getElementById('current-email').innerHTML = email;
        document.getElementById('current-name').innerHTML = name;
        document.getElementById('user-msg').disabled = false;
        let res = await fetch(`http://localhost:8080/api/admin/contact/msg/${email}`, {credentials: "include", method:'GET'});
        if (res.status === 401) window.location = "../html/LoginPage.html"; // Not authenticated user
        else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error
        else{
            let body = await res.json();
            let numOfMsg = Object.keys(body).length;
            let htmlString = "";
            for(let i = 0; i < numOfMsg; i++ ){
                let msgInfo = body[i];
                if(msgInfo.type === "User"){
                    htmlString += `<div class="container">
                     <img src="../img/user-avatar.png" alt="User" class="avatar">
              <p>${msgInfo.msg}</p>
          </div>`
                }else{
                    htmlString += `<div class="container viewer ">
                 <img src="../img/GiftPrintWBG.png" alt="Admin" class="avatar right">
              <p>${msgInfo.msg}</p>
          </div>`

                }
            }
            document.getElementById('messages').innerHTML = htmlString;
            let messages= document.getElementById('messages')
            messages.scrollTop = messages.scrollHeight;
        }
    }catch(err){
        // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}
function createMsgHtml(msg, isViewer){
    let div = document.createElement('div');
    div.className = isViewer ? "container viewer" :"container";
    let img = document.createElement('img');
    img.setAttribute('src', isViewer ? "../img/GiftPrintWBG.png" :"../img/user-avatar.png")
    img.setAttribute('alt', "User")
    img.className = isViewer ? "avatar right" :"avatar";
    let p = document.createElement('p');
    let txt = document.createTextNode(msg);
    p.appendChild(txt);
    div.appendChild(img)
    div.appendChild(p)
    return div;
}

function styleButton(textObj){
    let currentEmail = document.getElementById('current-email').innerHTML;
    let button = document.getElementById('send-msg');
    if(textObj.value === "" || currentEmail === "Email" ){
        button.disabled = true;
    }else{
        button.disabled = false;
    }
}


function searchUserContacts() {
    let input, filter, list, i, txtValue;
    list = document.getElementById("users-list").getElementsByTagName('li');
    let numberOfItems = list.length;
    input = document.getElementById("search-contacts");
    filter = input.value.toLowerCase();
    for (i = 0; i < numberOfItems; i++) {
        txtValue = list[i].innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            list[i].style.display = ""; // keep showing
        } else {
            list[i].style.display = "none"; // remove
        }
    }
}
