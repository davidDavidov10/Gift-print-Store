

function sendMsg(){
    let msg = document.getElementById("user-msg").value;
    if(msg !== ""){
        fetch(`http://localhost:8080/api/contactUs/send`, {credentials: "include", method:'POST',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({"type": "User", "msg":msg})
        });
        // Create new msg
        let div = document.createElement('div');
        div.className = "container viewer";
        let img = document.createElement('img');
        img.setAttribute('src',"../img/user-avatar.png")
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

window.onload = loadMsg;

async function loadMsg(){
    try{
      let res = await fetch(`http://localhost:8080/api/contactUs`, {credentials: "include", method:'GET'});
      let body = await res.json();
      let numOfMsg = Object.keys(body).length;
      console.log("body: " +JSON.stringify(body))
        console.log("keys: " +Object.keys(body))
        console.log(numOfMsg)
      let htmlString = "";
      for(let i = 0; i < numOfMsg; i++ ){
          let msgInfo = body[i];
          if(msgInfo.type === "User"){
          htmlString += `<div class="container viewer">
                         <img src="../img/user-avatar.png" alt="User" class="avatar  right">
                  <p>${msgInfo.msg}</p>
              </div>`
          }else{
              htmlString += `<div class="container ">
                     <img src="../img/GiftPrint.png" alt="Admin" class="avatar">
                  <p>${msgInfo.msg}</p>
              </div>`

          }
      }
      document.getElementById('messages').innerHTML = htmlString;

    }catch(err){
        // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}

