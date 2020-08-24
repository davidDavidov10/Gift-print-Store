
window.onload = async() => {
    try {
        let res = await fetch(`http://localhost:6379/api/admin/purchases`, {method: 'GET', credentials: "include"})
        if (res.status === 401) window.location = "../html/LoginPage.html"; //User not authenticated
        else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error
        else {
            let body = await res.json();
            let purchasesData = []
            if(body !== null){
                let userEmails = Object.keys(body);
                for (let userIndex in userEmails) {
                    let userEmail = userEmails[userIndex];
                    let userItems = JSON.parse(body[userEmail]);
                    let itemKeys = Object.keys(userItems);
                    for (let itemIndex in itemKeys) {
                        let itemKey = itemKeys[itemIndex];
                        let item = userItems[itemKey];
                        item.userEmail = userEmail;
                        purchasesData.push(item);
                    }
                }
            }
           loadTableData(purchasesData)
        }
     }catch(e){
    // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}


function loadTableData(purchasesData) {
    const tableBody = document.getElementById('tableData');
    tableBody.innerHTML = `<button onclick="changeStatus('sd', "dasd", 2 )">Complete order</button>`
    let dataHtml = '';
    for(let [index,item] of purchasesData.entries()) {
        let imageToPrintHtml = item.imgToPrint === "No selected img" ? "No uploaded image" :`<a href="../productImg/${item.imgToPrint}.png" download>Image to print</a>`
        dataHtml += `<tr class ="userTr"><td class ="userTd"><a href="mailto:${item.email}">${item.userEmail}</a></td>`+
            `<td class ="userTd" style="white-space:pre-wrap">${item.shippingInfo.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`+
            `<td class ="userTd">${item.type}</td><td class ="userTd">${item.color}</td>`+
            `<td class ="userTd">${item.size}</td>`+
            `<td class ="userTd">${item.amount}</td>`

                if(item.status === "Order Completed"){
                    dataHtml +=`<td  class ="userTd">Completed order, no image to download</td>`+
                        `<td  class ="userTd">Completed order, no product image to show</td>`+
                        `<td id="${index}" class ="userTd" style="color:green">${item.status}</td>`
                }else{
                    dataHtml +=`<td  class ="userTd">${imageToPrintHtml}</td>`+
                        `<td class ="userTd"><a href="../productImg/${item.prodImg}.png" download ><img class="product-img" width="50" height="50" src="../productImg/${item.prodImg}.png"></a></td>`+
                        `<td id="${index}" class ="userTd" style="color:red">${item.status}</td>`
                }
            dataHtml += `<td><button onclick="changeStatus('${item.userEmail}','${item.prodImg}','${index}')">Complete order</button></td>`+
            `</tr>`;
    }
    tableBody.innerHTML = dataHtml;
}

function searchAdminTable() {
    let input, filter, table, tr, td, i, txtValue, col;
    input = document.getElementById("purchasesSearchBar");
    filter = input.value.toUpperCase();
    table = document.getElementById("purchasesTable");
    col = document.getElementById("searchTypes").value;
    tr = table.getElementsByClassName("userTr");
    for (i = 0; i < tr.length; i++) {
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

function changeStatus(email, itemName, index){
    document.getElementById(`${index}`).innerText = "Order Completed";
    document.getElementById(`${index}`).style.color = "green";
    fetch(`http://localhost:6379/api/admin/updateStatus`, {method:'PUT', credentials: "include",
        body:JSON.stringify({"email":email, "itemName":itemName }),headers: {'Content-Type': 'application/json'}
    });
}