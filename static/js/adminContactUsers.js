async function sendMsg(){
    let msg = document.getElementById("user-msg").value;
    let email = document.getElementById('current-email').innerText;
    if(msg !== "") {
        try {
            let res = await fetch(`http://localhost:8080/api/admin/contact/send`, {
                credentials: "include", method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"type": "Admin", "msg": msg, "recipient": email})
            });
            if (res.status === 401) window.location = "../html/LoginPage.html"; // Not authenticated user
            else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error
            else {
                // Create new msg
                let div = document.createElement('div');
                div.className = "container viewer";
                let img = document.createElement('img');
                img.setAttribute('src', "../img/GiftPrint.png")
                img.setAttribute('alt', "User")
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

                // Change status
                document.getElementById(email).className = "green-status";

            }
        } catch (err) {
            // Send to error page
            window.location = "../html/ErrorPage.html";
        }
    }

}

window.onload = loadUsers;

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
                if(user.lastResponse === "User"){
                    // Todo: make this a button, on click fetch get msgs with user
                    htmlString += `<li class="red-status"  id="${user.email}">
                <button onclick="loadUserMsg('${user.email}', '${user.fullName}')">${user.fullName} ${user.email}</button></li>`
                }else{
                    htmlString += `<li class="green-status"  id="${user.email}">
                <button onclick="loadUserMsg('${user.email}', '${user.fullName}')">${user.fullName} ${user.email}</button></li>`
                }
            }
            document.getElementById('users-list').innerHTML = htmlString;
        }

    }catch(err){
        window.location = "../html/ErrorPage.html";
    }
}



async function loadUserMsg(email, name){
    try{
        document.getElementById('current-email').innerHTML = email;
        document.getElementById('current-name').innerHTML = name;

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
                 <img src="../img/GiftPrint.png" alt="Admin" class="avatar right">
              <p>${msgInfo.msg}</p>
          </div>`

                }
            }
            document.getElementById('messages').innerHTML = htmlString;
        }
    }catch(err){
        // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}