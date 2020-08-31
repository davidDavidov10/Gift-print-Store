 async function logOut()  {
    await fetch(`http://localhost:8080/api/signOut`, {method:'DELETE', credentials: "include"});
     document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
     await navBar(false);
     location.reload();

 }


 async function navBar(inDesign) {
    // status = Logged In / Not Logged In / Admin
    let status = await fetch(`http://localhost:8080/api/validate`, {credentials: "include", method:'GET'})
     status =  await  status.json();
     let navBarStr = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Courgette&display=swap" rel="stylesheet">`;
     if(status.response === "Admin Authenticated"){
         navBarStr +=
             `<ul class="nav-bar-ul">
                 <li class="nav-bar-li"><a class="a" href="AdminPage.html"><i class="fa fa-fw fa-user-tie"></i> Admin</a></li>
                 <li class="nav-bar-li"><a class="a" href="PurchasesAdmin.html"><i class="fa fa-fw fa-shopping-cart"></i> Costumer Purchases</a></li>
                 <li class="nav-bar-li"><a class="a" href="AdminContactUsers.html"><i class="fas fa-comment-alt"></i> Contact Users</a></li>
                <li class="nav-bar-li" style="float:right"><a class="a" onclick="logOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</a></li>
            </ul>`
     } else if(status.response === "User Authenticated"){
         let prefix = inDesign ? "../" : "";
         navBarStr +=
             `<ul class="nav-bar-ul">
                 <li class="nav-bar-li"><a class="a" href="${prefix}HomePage.html"><i class="fa fa-fw fa-home"></i> Home</a></li>
                 <li class="nav-bar-li"><a class="a" href="${prefix}ShoppingCartPage.html"><i class="fa fa-shopping-cart faspace"></i> Cart</a></li>
                     <li class="nav-bar-li"><a class="a" href="ContactUs.html"><i class="fas fa-comment-alt"></i> Contact Us</a></li>
                 <li class="nav-bar-li" style="float:right"><a class="a" onclick="logOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</a></li>
            </ul>`
     }else if(status.response === "Not Authenticated") {
         navBarStr +=
             `<ul class="nav-bar-ul">
                 <li class="nav-bar-li" style="float:right"><a class="a" href="RegisterPage.html"><i class="fa fa-fw  fa-user-plus"></i> Sign up</a></li>
                 <li class="nav-bar-li" style="float:right"><a class="a" href="LoginPage.html"><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
             </ul>`
     }
     document.getElementById("navBar").innerHTML = navBarStr;
 }