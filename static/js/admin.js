
window.onload = () => {
     fetch(`http://localhost:6379/api/admin`, {method:'GET', credentials: "include"})
        .then((res)=> res.json()).then((body)=> {
         let usersData = []
         for(let i = 0; i< body.data.length; i++){

             usersData.push(body.data[i]);
         }
         loadTableData(usersData)
     }).catch((err) =>{
         //window.location = "../html/LoginPage.html";
         console.log(err)
     });
}


function loadTableData(userData) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';
    for(let user of userData) {
        let cart = "--";
       // dataHtml += `<tr><td>${user.firstName}</td><td>${user.lastName}</td><td>${user.email}</td><td>${cart}</td><td>${purchases}</td><td>${user.lastLogIn}</td></tr>`;
        if(user.cart !== null){
            let productKeys = Object.keys(user.cart)
            cart = "<table class='cartTable' style='border: black 1px solid'> " +
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
                let product = user.cart[productKey];
                cart += `<tr class="productTr"><td style='border: black 1px solid'>${product.type}</td>`+
                        `<td style='border: black 1px solid'>${product.color}</td>`+
                        `<td style='border: black 1px solid'>change size later</td>` +
                        `<td style='border: black 1px solid'>${product.amount}</td></tr>`
            }
            cart += "</tbody> </table>"
        }


       //dataHtml += `<tr><td>${user.firstName}</td><td>${user.lastName}</td><td>${user.email}</td></tr>`;
        dataHtml += `<tr class ="userTr"><td>${user.firstName}</td><td>${user.lastName}</td><td>${user.email}</td><td>${cart}</td></tr>`;
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
        td = tr[i].getElementsByTagName("td")[col]; //0 is for col
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