const fetch = require('node-fetch');
const imageToBase64 = require('image-to-base64');
const  FormData = require('form-data');

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
    let sid = response.headers.raw()['set-cookie'][0].match(/sid=([^;]+)/i)[1];
    console.log("sid: " + sid)
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
    // Todo: how to send images
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
        // headers: {'Cookie': 'sid=' + sid,  referrer: "http://localhost:63342/final%20proj/static/html/products/ShirtDesign.html"},
        // Note: we used google as referrer because using localhost created an unsigned request and the redirection fails
        // if we don't specifically allow them in the editor
        headers: {'Cookie': 'sid=' + sid,  referrer: "https://www.google.com"},
        body: formData
    });
    console.log("response status: " + response.status)
}


async function testCartItems(sid) {
    console.log("\n #################### Test Cat Items #################");
    let response = await fetch(`http://localhost:8080/api/cart/items`, {
        credentials: "include", method:'GET',
        headers: {'Cookie': 'sid=' + sid}
    })
    console.log("response status: " + response.status)
    response = await response.json();
    console.log("response.json(): " + JSON.stringify(response))
    return Object.keys(JSON.parse(response.data))[0]
}

async function testCartItemsUpdate(sid, productId) {
    console.log("\n #################### Test Cat Items Update #################");
    let productAmount ={};
    productAmount[productId] = 15;
    let response = await    fetch(`http://localhost:8080/api/cart/items/update`, {
        credentials: "include",
        method: 'PUT',
        body: JSON.stringify(productAmount),
        headers: {'Content-Type': 'application/json', 'Cookie': 'sid=' + sid}
    });
    console.log("response status: " + response.status)
}


async function testCheckout(sid, fullname, address, city, zip) {
    console.log("\n #################### Test Checkout #################");
    let formData= new FormData();
    formData.append("fullname", fullname)
    formData.append("address", address)
    formData.append("city", city)
    formData.append("zip", zip)
    let response = await fetch("http://localhost:8080/api/placeOrder", {
        credentials: "include", method: 'POST',
        headers: {'Cookie': 'sid=' + sid, referrer: "https://www.google.com"},
        body: formData
    })
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
}

async function testAll() {
    // User login and sign up
    await testSignUp("a@b.com", "1234", "Test", "Testenson");
    let userSid = await testSignIn("a@b.com", "1234", false);
    await testHome(userSid);
    await testValidate(userSid);

    // Create product and add to cart
    await testDesignValidate(userSid);
    let image = await imageToBase64("../static/img/testImg.png");
    await testDesignSave(userSid,"data:image/png;base64,"+image , "shirt","black","S","3","9.00");
    let productId = await testCartItems(userSid);

    // Check cart content and sign out from user
    await testCartItemsUpdate(userSid, productId);
    await testCartItems(userSid);
    await testCheckout(userSid,"Big Bird","1st Sesame  street","Tel Aviv", "1234567");
    await testSignOut(userSid);

    // Admin login and check admin page
    let adminSid = await testSignIn("admin@admin.com", "1234", true);
    await testAdmin(adminSid);
    // Admin costumer purchases check and check complete order
    await testAdminPurchases(adminSid);
    await testAdminPurchasesUpdateStatus(adminSid,"a@b.com", productId);
    await testAdminPurchases(adminSid);
}

testAll()

// note when there is no cookie header we get status 500
