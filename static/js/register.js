async function checkRegister(){
    let email = document.getElementById('email').value;
    let pass = document.getElementById('password').value;
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;

    let requestOptions = {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body:JSON.stringify({"email":email, "password":pass, "firstName":firstName, "lastName":lastName})
    };

    let response = await fetch("http://localhost:6379/api/signUp", requestOptions)
    let  responseErr = await response.json().err;
    if(responseErr !== undefined){
        document.getElementById('err').innerHTML = await responseErr;
    }else{
        window.location = "../html/LoginPage.html";
    }

}