 async function checkLogin(){
    let email = document.getElementById('email').value;
    console.log("login  email= "+ email)
    let pass = document.getElementById('password').value;
    let response =  await fetch(`http://localhost:6379/api/signIn`, {method:'POST' ,
        body:JSON.stringify({"email":email, "password":pass}), headers: {'Content-Type': 'application/json'}});
    response = await response.json();
    document.getElementById('err').innerHTML = await JSON.parse(response).err;

}