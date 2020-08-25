async function checkRegister(){
    // Check validity of inputs
    if (! /^[a-zA-z -]+$/.test(document.getElementById('first_name').value)){
     document.getElementById('err').innerText = "Please enter your first name \n(use only A-Z a-z space or -)"
    }else if(! /^[a-zA-z -]+$/.test(document.getElementById('last_name').value)){
        document.getElementById('err').innerText = "Please enter your last name \n(use only A-Z a-z space or -)"
    } else if(!document.getElementById('email').checkValidity() || document.getElementById('email').value === ""){
    document.getElementById('err').innerText = "Not a valid email please try again"
    }else if(document.getElementById('password').value === ""){
    document.getElementById('err').innerText = "Please enter a password"
    }else{
        // Input is valid
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

        let response = await fetch("http://localhost:8080/api/signUp", requestOptions)

        response = await response.json();
        let  responseErr = await response.err;
        if(responseErr !== undefined){
            document.getElementById('err').innerText = await responseErr;
        }else{
            window.location = "../html/LoginPage.html";
        }
    }
}