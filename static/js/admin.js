
window.onload = () => {
     fetch(`http://localhost:6379/api/admin`, {method:'GET', credentials: "include"})
        .then((res)=> res.json()).then((body)=> {
         let usersData = []
         for(let i = 0; i< body.data.length; i++){

             usersData.push(body.data[i]);
         }
         loadTableData(usersData)
     }).catch((err) =>{
         // User is not logged in as admin, redirect to sign in page
         window.location = "../html/LoginPage.html";
     });
}


function loadTableData(userData) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';
    for(let user of userData) {
        let cart = getItemsHtml("cart", user);
        let purchases= getItemsHtml("purchases", user);
        let loginColor = user.lastLogin === "Hasn't logged in yet" ? 'style="color:red"': ""
        dataHtml += `<tr class ="userTr"><td class ="userTd">${user.firstName}</td><td class ="userTd">${user.lastName}</td>`
            +`<td class ="userTd"><a href="mailto:${user.email}">${user.email}</a></td><td class ="userTd">${cart}</td><td  class ="userTd">${purchases}</td>`
                +`<td  class ="userTd" ${loginColor}>${user.lastLogin}</td></tr>`;
    }
    tableBody.innerHTML = dataHtml;
}

// Todo: for individual col design add span with class

function searchAdminTable() {
    let input, filter, table, tr, td, i, txtValue, col;
    input = document.getElementById("adminSearchBar");
    filter = input.value.toUpperCase();
    table = document.getElementById("adminTable");
    col = document.getElementById("searchTypes").value;
    //tr = table.getElementsByTagName("tr");
    tr = table.getElementsByClassName("userTr");
    for (i = 0; i < tr.length; i++) {
       // td = tr[i].getElementsByTagName("td")[col]; //0 is for col
        td = tr[i].getElementsByClassName("userTd")[col]; //0 is for col
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = ""; // keep showing
            } else {
                tr[i].style.display = "none"; // remove
            }
        }
    }
}

function getItemsHtml(name, user) {
    let items = "--"
    if(user[name] !== null ){
        let productKeys = Object.keys(user[name])
        if( productKeys.length > 0){
            items = "<table class='cartTable'> " +
                "    <thead>\n" +
                "        <tr>\n" +
                "        <th>Type</th>\n" +
                "        <th>Color</th>\n" +
                "        <th>Size</th>\n" +
                "        <th>Amount</th>\n" +
                "        </tr>\n" +
                "    </thead>\n"

                + "    <tbody>";

            for(let key in productKeys){
                let productKey = productKeys[key];
                let product = user[name][productKey];
                items += `<tr><td >${product.type}</td>`+
                    `<td>${product.color}</td>`+
                    `<td>${product.size}</td>` +
                    `<td>${product.amount}</td></tr>`
            }
            items += "</tbody> </table>"
        }
    }
 return items;
}