 function logOut()  {
     fetch(`http://localhost:6379/api/signOut`, {method:'DELETE', credentials: "include"})
         .then(() =>{
             document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
             navBar(false);
             location.reload();

         });
 }

 async function navBar(inDesign) {
    // status = Logged In / Not Logged In / Admin
    let status = await fetch(`http://localhost:6379/api/validate`, {credentials: "include", method:'GET'})
        .then((res)=> res.json());
     let navBarStr;
     if(status.response === "Admin Authenticated"){
         navBarStr =
             `<ul>
                 <li><a href="AdminPage.html">Admin</a></li>
                 <li><a href="PurchasesAdmin.html">Costumer Purchases</a></li>
                <li style="float:right"><button class="active" onclick="logOut()">Sign Out</button></li>
            </ul>`
     } else if(status.response === "User Authenticated"){
         let prefix = inDesign ? "../" : "";
         navBarStr =
             `<ul>
                 <li><a href="${prefix}HomePage.html">Home</a></li>
                 <li><a href="${prefix}ShoppingCartPage.html">Cart</a></li>
                 <li style="float:right"><button class="active" onclick="logOut()">Sign Out</button></li>
            </ul>`
     }else if(status.response === "Not Authenticated") {
         navBarStr =
             `<ul>
                 <li><a href="HomePage.html">Home</a></li>
                 <li style="float:right"><a  lass="active" href="LoginPage.html">Sign In</a></li>
                 <li style="float:right"><a class="active" href="RegisterPage.html">sign up</a></li>
             </ul>`

     }
     document.getElementById("navBar").innerHTML = navBarStr;
 }