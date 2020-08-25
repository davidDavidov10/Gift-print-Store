const fetch = require('node-fetch');
const imageToBase64 = require('image-to-base64');
const fetch64 = require('fetch-base64');

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
    let formData = JSON.stringify({
        "productWithImage": productImg,
        "productType": type,
        "productColor": color,
        "productSize": size,
        "productAmount": amount,
        "price": price
    });
    /*formData.append("productType": type,)
    formData.append("productColor": color,)
    formData.append("productSize": size,)
    formData.append("productAmount": amount,)
    formData.append( "price": price,)*/

    let response = await fetch("http://localhost:8080/api/design/save",{
        method: 'POST', credentials: "include",
        // headers: {'Cookie': 'sid=' + sid, 'enctype': "multipart/form-data", 'enctype': "multipart/form-data"},
        // headers: {'Cookie': 'sid=' + sid,'Content-Type': 'multipart/form-data'},
        headers: {'Cookie': 'sid=' + sid,
            // "contentType": "multipart/form-data; boundary=----WebKitFormBoundary4vJdFXDqqivZ8tvx"},
            "contentType": "multipart/form-data"},
        body: formData
    });
    console.log("response status: " + response.status)
    // response = await response.j;
    // console.log("response.json(): " + JSON.stringify(response))
}




async function testAll() {
    await testSignUp("a@b.com", "1234", "Test", "Testenson")
    let userSid = await testSignIn("a@b.com", "1234", false)
    await testHome(userSid);
    await testDesignValidate(userSid);
    let image = await imageToBase64("../static/img/testImg.png");
    await testDesignSave(userSid,image , "shirt","black","S","3")
}

testAll()

// note when there is no cookie header we get status 500
