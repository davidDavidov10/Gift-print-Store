 async function checkLogin(){
    // Check validity of inputs
    // document.getElementById('email').checkValidity();
    // document.getElementById('password').checkValidity();
     // Todo: make submit possible only on valid email and non empty password
     let email = document.getElementById('email').value;
     let pass = document.getElementById('password').value;
     let response =  await fetch(`http://localhost:6379/api/signIn`, {method:'POST' ,
        body:JSON.stringify({"email":email, "password":pass}), headers: {'Content-Type': 'application/json'}});
     response = await response.json();
     document.getElementById('err').innerHTML = await JSON.parse(response).err;
     console.log(JSON.parse(response))
     console.log(response.headers.get('Set-Cookie'));

}

