

function sendMsg(){
    let msg = document.getElementById("user-msg").value;
    if(msg !== ""){
        fetch(`http://localhost:8080/api/contactUs/send`, {credentials: "include", method:'POST',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({"type": "User", "msg":msg})
        });
        // Create new msg
        let div = document.createElement('div');
        div.className = "container";
        let img = document.createElement('img');
        img.setAttribute('src',"../img/user-avatar.png")
        img.setAttribute('alt',"User")
        img.className = "avatar";
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
          htmlString += `<div class="container">
                         <img src="../img/user-avatar.png" alt="User" class="avatar">
                  <p>${msgInfo.msg}</p>
              </div>`
          }else{
              htmlString += `<div class="container darker">
                     <img src="../img/GiftPrint.png" alt="Admin" class="avatar right">
                  <p>${msgInfo.msg}</p>
              </div>`

          }
      }
      document.getElementById('messages').innerHTML = htmlString;


        // loadTableData(messages);
        // collapsible();

}catch(err){
    // Send to error page
        console.log("err")
        console.error((err))
    // window.location = "../html/ErrorPage.html";
}
}


/*function loadTableData(userData) {

    const tableBody = document.getElementById('tableData');
    let dataHtml = '';
    for(let user of userData) {
        let cart = getItemsHtml("cart", user);
        let purchases= getItemsHtml("purchases", user);
        let loginActivity = createLoginActivity(user.loginActivity)
        // let loginColor = user.loginActivity === "Hasn't logged in yet" ? 'style="color:red"': ""
        dataHtml += `<tr class ="userTr"><td class ="userTd">${user.firstName}</td><td class ="userTd">${user.lastName}</td>`
            +`<td class ="userTd"><a href="mailto:${user.email}">${user.email}</a></td><td class ="userTd">${cart}</td><td  class ="userTd">${purchases}</td>`
            +`<td  class ="userTd" >${loginActivity}</td></tr>`;
    }
    tableBody.innerHTML = dataHtml;
}*/

