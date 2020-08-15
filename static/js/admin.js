
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
        console.log(JSON.stringify(user.lastLogin));
        dataHtml += `<tr class ="userTr"><td class ="userTd">${user.firstName}</td><td class ="userTd">${user.lastName}</td>`
            +`<td class ="userTd">${user.email}</td><td class ="userTd">${cart}</td><td  class ="userTd">${purchases}</td>`
                +`<td  class ="userTd">${user.lastLogin}</td></tr>`;
    }
    tableBody.innerHTML = dataHtml;
}

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
            console.log("textvalue "+ txtValue)
            console.log("if = " + (txtValue.toUpperCase().indexOf(filter) > -1))
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
    console.log(name)
    if(user[name] !== null){
        console.log("user name: " + user[name])

        let productKeys = Object.keys(user[name])
        items = "<table class='cartTable' style='border: black 1px solid'> " +
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
            items += `<tr><td style='border: black 1px solid'>${product.type}</td>`+
                `<td style='border: black 1px solid'>${product.color}</td>`+
                `<td style='border: black 1px solid'>${product.size}</td>` +
                `<td style='border: black 1px solid'>${product.amount}</td></tr>`
        }
       items += "</tbody> </table>"
    }
 return items;
}