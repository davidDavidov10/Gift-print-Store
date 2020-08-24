window.onload = async() =>{
    try {
        let res = await fetch(`http://localhost:6379/api/cart/items`, {credentials: "include", method: 'GET'})
        if (res.status === 401) window.location = "../html/LoginPage.html"; //User not authenticated
        else if (res.status === 500) throw Error("wrong response status: " + res.status) // Server error

        else {
            let body = await res.json();
            let userProductInfo = [];
            let products = JSON.parse(body.data);
            let productKeys = Object.keys(products); // Array of prodImg number
            numOfItems = productKeys.length;
            for (let i = 0; i < numOfItems; i++) {
                let key = productKeys[i];
                let product = products[key];
                userProductInfo.push(product);
            }
            loadItemsData(userProductInfo);
        }
    }catch(e){
        // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}

function loadItemsData(itemList) {
    const cartList = document.getElementById('productsList');
    let totalPrice = 0;
    document.getElementById('numberOfItems').innerText = itemList.length;
    let dataHtml = '';
    for(let [index,item] of itemList.entries()) {
        dataHtml +=
            `<li> <p>${item.type} X ${item.amount} <span class="price">$${item.amount * item.price}</span></p></li>`
        totalPrice += item.amount * item.price;
    }
    document.getElementById('totalPrice').innerText =  "$"+totalPrice;
    cartList.innerHTML = dataHtml;
}
