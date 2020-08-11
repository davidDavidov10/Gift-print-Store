 async function checkLogin(){
    // Check validity of inputs
    // document.getElementById('email').checkValidity();
    // document.getElementById('password').checkValidity();
     // Todo: make submit possible only on valid email and non empty password
     let email = document.getElementById('email').value;
     let pass = document.getElementById('password').value;
     let rememberMe  = document.getElementById('rememberMe').checked;

      let requestOptions = {
           method: 'POST',
           credentials: "include",
           headers: {'Content-Type': 'application/json'},
           body:JSON.stringify({"email":email, "password":pass, "rememberMe":rememberMe})
      };

      let response = await fetch("http://localhost:6379/api/signIn", requestOptions)

     response = await response.json();
     document.getElementById('err').innerHTML = await response.err;

}

