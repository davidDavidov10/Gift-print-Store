window.onload = () => {
    console.log("before fetch");
// .then((res)=> res.toString()).then(console.log);
     fetch(`http://localhost:6379/admin`, {method:'GET'})
        // .then((res)=> res.json()).then((body)=> console.log(body));
         .then((res)=> res.json()).then((body)=> {
             console.log(body)
         let usersData = []
         console.log("body.data : "+ body.data)
         for(let i = 0; i< body.data.length; i++){
             console.log("user" + body.data[i])
             console.log("Json user" + JSON.parse( body.data[i]))
             usersData.push(JSON.parse( body.data[i]));
         }
         loadTableData(usersData)
         console.log(usersData)
     });
         /*.then((res)=>{
            // console.log("in fetch");
             console.log("res = " + res);
             console.log("res.json = " + res.json);
            // parse reply to data
            let usersData = []
            for(let user in res.data){
                usersData.push(JSON.parse(user));
            }
            loadTableData(usersData)
             console.log(usersData)
        }).catch(console.log);*/
}


function loadTableData(userData) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';

    for(let user of userData)
    { dataHtml += `<tr><td>${user.firstName}</td><td>${user.lastName}</td><td>${user.email}</td></tr>`;
    }
    console.log(dataHtml)
    tableBody.innerHTML = dataHtml;
}