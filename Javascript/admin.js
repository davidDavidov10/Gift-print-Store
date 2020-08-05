window.onload = () => {
    console.log("before fetch");
     fetch(`http://localhost:6379/admin`, {method:'GET'})
         .then((res)=>{
             res.json()}).then(body => {console.log(body)});
            /*console.log("in fetch")
            console.log("res = " + res);
            // parse reply to data
            let usersData = []
            for(let user in res){
                usersData.push(JSON.parse(user));
            }
            loadTableData(usersData)
        }).catch(console.log);*/
}


function loadTableData(userData) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';

    for(let user of userData)
    { dataHtml += `<tr><td>${user.firstName}</td><td>${user.lastName}</td></tr><tr><td>${user.email}</td></tr>`;
    }
    console.log(dataHtml)
    tableBody.innerHTML = dataHtml;
}