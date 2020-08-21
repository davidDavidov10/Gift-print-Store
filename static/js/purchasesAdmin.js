
window.onload = () => {
    fetch(`http://localhost:6379/api/admin/purchases`, {method:'GET', credentials: "include"})
        .then((res)=> res.json()).then((body)=> {
            console.log("body = " +JSON.stringify(body));

        let purchasesData = []
        console.log("length = " + body.length)
        console.log("keys = " + Object.keys(body).length)
        console.log("body[0] = " + body[0])
        let userEmails = Object.keys(body);
        for(let userIndex in userEmails) {
            let userEmail = userEmails[userIndex];
            let userItems = JSON.parse(body[userEmail]);
            let itemKeys = Object.keys(userItems);

            for(let itemIndex in itemKeys ) {
                let itemKey = itemKeys[itemIndex];
                let item = userItems[itemKey];
                item.userEmail = userEmail;
                purchasesData.push(item);
            }
        }
        loadTableData(purchasesData)
    }).catch((err) =>{
        // User is not logged in as admin, redirect to sign in page
        window.location = "../html/LoginPage.html";
    });
}


function loadTableData(purchasesData) {
    const tableBody = document.getElementById('tableData');
    tableBody.innerHTML = `<button onclick="changeStatus('sd', "dasd", 2 )">Complete order</button>`
    let dataHtml = '';
    for(let [index,item] of purchasesData.entries()) {
        let imageToPrintHtml = item.imgToPrint === "No selected img" ? "No uploaded image" :`<a href="../productImg/${item.imgToPrint}.png" download>Image to print</a>`
        console.log("index = "+ index)
        console.log("item.status = " + item.status);

        dataHtml += `<tr class ="userTr"><td class ="userTd">${item.userEmail}</td><td class ="userTd">${item.shippingInfo}</td>`
            +`<td class ="userTd">${item.type}</td><td class ="userTd">${item.color}</td><td  class ="userTd">${item.size}</td>`
            +`<td  class ="userTd">${item.amount}</td>`
                if(item.status === "Order Completed"){
                    dataHtml +=`<td  class ="userTd">Completed order, no image to download</td>`+
                        `<td  class ="userTd">Completed order, no product image to show</td>`
                }else{
                    dataHtml +=`<td  class ="userTd">${imageToPrintHtml}</td>`+
                        `<td  class ="userTd"><img width="50" height="50" src="../productImg/${item.prodImg}.png"></td>`
                }
            dataHtml += `<td id="${index}" class ="userTd">${item.status}</td>`+
            `<td><button onclick="changeStatus('${item.userEmail}','${item.prodImg}','${index}')">Complete order</button></td>`+
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
    fetch(`http://localhost:6379/api/admin/updateStatus`, {method:'PUT', credentials: "include",
        body:JSON.stringify({"email":email, "itemName":itemName }),headers: {'Content-Type': 'application/json'}
    });
}