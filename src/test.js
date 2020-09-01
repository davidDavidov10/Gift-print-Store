const fetch = require('node-fetch');
const imageToBase64 = require('image-to-base64');
const  FormData = require('form-data');
const chalk = require('chalk');


async function testSignUp(email, pass, firstName, lastName) {
    console.log("\n #################### Test sign up #################");
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email, "password": pass, "firstName": firstName, "lastName": lastName})
    };
    let response = await fetch("http://localhost:8080/api/signUp", requestOptions)
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response : " + JSON.stringify(response))
}

async function testSignIn(email, pass, rememberMe) {
    console.log("\n #################### Test sign In #################");
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email, "password": pass, "rememberMe": rememberMe})
    };
    let response = await fetch("http://localhost:8080/api/signIn", requestOptions)
    console.log("response status: " + response.status)
    // let sid =  response.header('Cookie').match(/sid=([^;]+)/i,);
    let cookie = response.headers.raw()['set-cookie'][0]
    let sid = cookie.match(/sid=([^;]+)/i)[1];
    console.log("sid: " + sid)
    let maxAge = cookie.match(/Max-Age=([^;]+)/i)[1];
    console.log("Max-Age in minutes: " +   maxAge/60)
    console.log("Remember Me: " +   rememberMe)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
    return (sid)
}

async function testHome(sid) {
    console.log("\n #################### Test Home #################");
    let response = await fetch(`http://localhost:8080/api/home`, {
        method: 'GET', credentials: "include",
        headers: {'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testValidate(sid) {
    console.log("\n #################### Test Validate #################");
    let response = await fetch(`http://localhost:8080/api/validate`, {
        method: 'GET', credentials: "include",
        headers: {'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testDesignValidate(sid) {
    console.log("\n #################### Test Design Validate #################");
    let response = await fetch(`http://localhost:8080/api/design/validate`, {
        method: 'GET', credentials: "include",
        headers: {'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}



async function testDesignSave(sid, productImg, type, color, size, amount, price) {
    console.log("\n #################### Test Design Save #################");
    let formData= new FormData();
    formData.append("productWithImage", productImg)
    formData.append("productType", type)
    formData.append("productColor", color)
    formData.append("productSize",size)
    formData.append("productAmount", amount)
    formData.append( "price", price)

    let response = await fetch("http://localhost:8080/api/design/save",{
        method: 'POST', credentials: "include",
        // Note: we used google as referrer because using localhost created an unsigned request and the redirection fails
        // if we don't specifically allow them in the editor
        headers: {'Cookie': 'sid=' + sid,  referrer: "https://www.google.com"},
        body: formData
    });
    console.log("response status: " + response.status)
}


async function testCartItems(sid) {
    console.log("\n #################### Test Cart Items #################");
    let response = await fetch(`http://localhost:8080/api/cart/items`, {
        credentials: "include", method:'GET',
        headers: {'Cookie': 'sid=' + sid}
    })
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
    let item = response.data !== undefined ? Object.keys(JSON.parse(response.data))[0] : null;
    return item ;
}

async function testCartItemsUpdate(sid, productId) {
    console.log("\n #################### Test Cart Items Update #################");
    let productAmount ={};
    productAmount[productId] = 15;
    let response = await    fetch(`http://localhost:8080/api/cart/items/update`, {
        credentials: "include",
        method: 'PUT',
        body: JSON.stringify(productAmount),
        headers: {'Content-Type': 'application/json', 'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status);
}


async function testCheckout(sid, fullname, address, city, zip) {
    console.log("\n #################### Test Checkout #################");
    let urlencoded = new URLSearchParams();
    urlencoded.append("fullname", fullname);
    urlencoded.append("address", address);
    urlencoded.append("city", city);
    urlencoded.append("zip", zip);


    let response = await fetch("http://localhost:8080/api/placeOrder", {
        method: 'POST', credentials: "include",
        headers: {'Cookie': 'sid=' + sid, referrer: "https://www.google.com", 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlencoded
    });
    console.log("response status: " + response.status);
}

async function testSignOut(sid) {
    console.log("\n #################### Test Sign Out #################");
    let response = await fetch(`http://localhost:8080/api/signOut`, {
        credentials: "include", method: 'DELETE',
        headers: {'Cookie': 'sid=' + sid}
    })
    console.log("response status: " + response.status);
}

async function testAdmin(sid) {
    console.log("\n #################### Test Admin #################");
    let response = await fetch(`http://localhost:8080/api/admin`, {
        credentials: "include", method: 'GET',
        headers: {'Cookie': 'sid=' + sid}
    })
    console.log("response status: " + response.status);
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))

}

async function testAdminPurchases(sid) {
    console.log("\n #################### Test Admin Purchases #################");
    let response = await fetch(`http://localhost:8080/api/admin/purchases`, {
        credentials: "include", method: 'GET',
        headers: {'Cookie': 'sid=' + sid}
    })
    console.log("response status: " + response.status);
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))

}

async function testAdminPurchasesUpdateStatus(sid, email, itemName) {
    console.log("\n #################### Test Admin Purchases Update Status #################");
    let response = await fetch(`http://localhost:8080/api/admin/updateStatus`, {method:'PUT', credentials: "include",
        body:JSON.stringify({"email":email, "itemName":itemName }),
        headers: {'Content-Type': 'application/json','Cookie': 'sid=' + sid}

    })
    console.log("response status: " + response.status);
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}


async function testContactUsSendMsg(sid, msg){
    console.log("\n #################### Test User Contact Us Send Msg #################");
     let response = await fetch(`http://localhost:8080/api/contactUs/send`, {
        credentials: "include", method: 'POST',
        headers: {'Content-Type': 'application/json', 'Cookie': 'sid=' + sid},
        body: JSON.stringify({"type": "User", "msg": msg})
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testContactUsLoadMsg(sid){
    console.log("\n #################### Test User Contact Us Load Msg #################");
    let response =  await fetch(`http://localhost:8080/api/contactUs`, {credentials: "include", headers: { 'Cookie': 'sid=' + sid} ,method:'GET'});
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testAdminContactUserSendMsg(sid, msg, email){
    console.log("\n #################### Test Admin Contact User Send Msg #################");
    let response = await fetch(`http://localhost:8080/api/admin/contact/send`, {
        credentials: "include", method: 'POST',
        headers: {'Content-Type': 'application/json','Cookie': 'sid=' + sid},
        body: JSON.stringify({"type": "Admin", "msg": msg, "recipient": email})
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}


async function testAdminContactUserLoadMsg(sid, email){
    console.log("\n #################### Test Admin Contact User Load Msg #################");
    let response =  await fetch(`http://localhost:8080/api/admin/contact/msg/${email}`, {credentials: "include", method:'GET', headers: { 'Cookie': 'sid=' + sid}});
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testAdminContactUserLoadUsers(sid, email){
    console.log("\n #################### Test Admin Contact User Load Users #################");
    let response =  await fetch(`http://localhost:8080/api/admin/contact/users`, {credentials: "include", method:'GET', headers: { 'Cookie': 'sid=' + sid}});
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}


async function testHomeWithoutCookies() {
    console.log("\n #################### Test Home Without Cookies #################");
    let response = await fetch(`http://localhost:8080/api/home`, {
        method: 'GET', credentials: "include",
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}


// All requests with body test with no body, invalid input

async function testDesignSaveInvalidInput(sid) {
    console.log("\n #################### Test Design Save Invalid Input #################");
    let formData= new FormData();
    let response = await fetch("http://localhost:8080/api/design/save",{
        method: 'POST', credentials: "include",
        // Note: we used google as referrer because using localhost created an unsigned request and the redirection fails
        // if we don't specifically allow them in the editor
        headers: {'Cookie': 'sid=' + sid,  referrer: "https://www.google.com"},
        body: formData
    });
    console.log("response status: " + response.status)
}

async function testCheckoutInvalidInput(sid) {
    console.log("\n #################### Test Checkout invalid Input #################");
    let urlencoded = new URLSearchParams();
    let response = await fetch("http://localhost:8080/api/placeOrder", {
        method: 'POST', credentials: "include",
        headers: {'Cookie': 'sid=' + sid, referrer: "https://www.google.com", 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlencoded
    });
    console.log("response status: " + response.status);
}


async function testSignUpInvalidInput() {
    console.log("\n #################### Test sign up Invalid Input#################");
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'}
    };
    let response = await fetch("http://localhost:8080/api/signUp", requestOptions)
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response : " + JSON.stringify(response))
}

async function testSignInInvalidInput() {
    console.log("\n #################### Test sign In Invalid Input #################");
    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'}
    };
    let response = await fetch("http://localhost:8080/api/signIn", requestOptions)
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testCartItemsUpdateInvalidInput(sid) {
    console.log("\n #################### Test Cart Items Update Invalid Input #################");
    let response = await  fetch(`http://localhost:8080/api/cart/items/update`, {
        credentials: "include",
        method: 'PUT',
        headers: {'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status);
}
async function testAdminPurchasesUpdateStatusInvalidInput(sid) {
    console.log("\n #################### Test Admin Purchases Update Status Invalid Input #################");
    let response = await fetch(`http://localhost:8080/api/admin/updateStatus`, {method:'PUT', credentials: "include",
        headers: {'Content-Type': 'application/json','Cookie': 'sid=' + sid} })
    console.log("response status: " + response.status);
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}


async function testContactUsSendMsgInvalidInput(sid){
    console.log("\n #################### Test User Contact Us Send Msg Invalid Input #################");
    let response = await fetch(`http://localhost:8080/api/contactUs/send`, {
        credentials: "include", method: 'POST',
        headers: {'Content-Type': 'application/json', 'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}

async function testAdminContactUserSendMsgIbvalidInput(sid){
    console.log("\n #################### Test Admin Contact User Send Msg Invalid Input#################");
    let response = await fetch(`http://localhost:8080/api/admin/contact/send`, {
        credentials: "include", method: 'POST',
        headers: {'Content-Type': 'application/json','Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
}






async function testAll() {

   // User login and sign up
    console.log(chalk.blue('\nUser login and sign up'));
    await testSignUp("a@b.com", "1234", "Test", "Testenson");
  let userSid = await testSignIn("a@b.com", "1234", false);
   await testHome(userSid);
   await testValidate(userSid);

   // Create product and add to cart
   console.log(chalk.blue('\nCreate product and add to cart'));
   await testDesignValidate(userSid);
   let image = await imageToBase64("../static/img/testImg.png");
   await testDesignSave(userSid,"data:image/png;base64,"+image , "shirt","black","S","3","9.00");


   // Check cart content
   console.log(chalk.blue('\nCheck cart content'));
   let productId = await testCartItems(userSid);
   await testCartItemsUpdate(userSid, productId);
   await testCartItems(userSid);
   await testCheckout(userSid,"Big Bird","1st Sesame street","Tel Aviv", "1234567");

   // Check user contact us and sign out from user
   console.log(chalk.blue('\nCheck user contact us and sign out from user'));
   await testContactUsLoadMsg(userSid)
   await testContactUsSendMsg(userSid, "hello world!")
   await testContactUsLoadMsg(userSid)
   await testSignOut(userSid);


   // Admin login and check admin page
   console.log(chalk.blue('\nAdmin login and check admin page'));
   let adminSid = await testSignIn("admin@admin.com", "1234", true);
   await testAdmin(adminSid);

   // Check admin contact users
   console.log(chalk.blue('\nCheck admin contact users'));
   await testAdminContactUserLoadUsers(adminSid);
   await testAdminContactUserLoadMsg(adminSid, "a@b.com");
   await testAdminContactUserSendMsg(adminSid,"It was the best of times", "a@b.com")
   await testAdminContactUserLoadMsg(adminSid, "a@b.com");


   // Admin costumer purchases and check complete order and sign out
   console.log(chalk.blue('\nAdmin costumer purchases and check complete order and sign out'));
   await testAdminPurchases(adminSid);
   await testAdminPurchasesUpdateStatus(adminSid,"a@b.com", productId);
   await testAdminPurchases(adminSid);
   await testSignOut(userSid);

   // Try entering home without signing in
   console.log(chalk.blue('\nTry entering home without signing in'));
   await testHome("");
   await testHomeWithoutCookies()

   // Try entering User pages as Admin
   console.log(chalk.blue('\nTry entering User pages as Admin'));
   adminSid = await testSignIn("admin@admin.com", "1234", false);
   await testHome(adminSid);
   await testDesignSave(adminSid,"data:image/png;base64,"+image , "shirt","black","M","1","9.00");
   productId = await testCartItems(adminSid);
   await testCartItemsUpdate(adminSid, productId);
   await testCheckout(adminSid,"Big Bird","1st Sesame street","Tel Aviv", "1234567");
   await testContactUsLoadMsg(adminSid)
   await testContactUsSendMsg(adminSid, "I can't do this !!1")
   await testSignOut(adminSid);

   // Try entering admin pages as non-admin user
   console.log(chalk.blue('\nTry entering admin pages as non-admin user'));
   userSid = await testSignIn("a@b.com", "1234", false);
   await testAdmin(userSid);
   await testAdminPurchases(userSid);
   await testAdminPurchasesUpdateStatus(userSid,"a@b.com", productId);
   await testAdminContactUserLoadUsers(userSid);
   await testAdminContactUserLoadMsg(userSid, "a@b.com");
   await testAdminContactUserSendMsg(userSid,"It was the worst of times", "a@b.com")
   await testSignOut(userSid);

   // Try  updating a non existing product's status in admin purchases
   console.log(chalk.blue('\nTry  updating a non existing product\'s status in admin purchases'));
   adminSid = await testSignIn("admin@admin.com", "1234", false);
   await testAdminPurchasesUpdateStatus(adminSid,"a@b.com", "non existing item name");


    // Test invalid inputs
    console.log(chalk.blue('\n------------Test invalid inputs ------------'));
    userSid = await testSignIn("a@b.com", "1234", false);
    await testDesignSaveInvalidInput(userSid);
    await testCheckoutInvalidInput(userSid)
    await testSignUpInvalidInput();
    await testSignInInvalidInput();
    await testCartItemsUpdateInvalidInput(userSid);
    await testContactUsSendMsgInvalidInput(userSid)

    await testSignOut(userSid);
    adminSid = await testSignIn("admin@admin.com", "1234", false);
    await testAdminPurchasesUpdateStatusInvalidInput(adminSid);
    await testAdminContactUserSendMsgIbvalidInput(adminSid);


}

testAll()


