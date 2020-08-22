 async function checkLogin(){
    // Check validity of inputs
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
      let error = await  response.err ;
      if(error !== undefined){
          document.getElementById('err').innerHTML = error;
      }else{
          let isAdmin = await  response.isAdmin;
          if(isAdmin) window.location = "../html/AdminPage.html";
          else  window.location = "../html/HomePage.html";
      }



}

