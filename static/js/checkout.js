window.onload = () =>{
    fetch(`http://localhost:6379/api/cart/items`, {
        credentials: "include",
        method:'GET'
    })
        .then((res)=> res.json()).then((body)=> {
        let userProductInfo = [];
        let products = JSON.parse(body.data);
        let productKeys = Object.keys(products); // Array of prodImg number
        numOfItems = productKeys.length;
        for(let i = 0; i < numOfItems; i++){
            let key = productKeys[i];
            let product = products[key];
            userProductInfo.push(product);
        }
        loadItemsData(userProductInfo);
    }).catch((e)=>{
        window.location = "../html/LoginPage.html";
    });
}
// <p><a href="#">Product 1</a> <span class="price">$15</span></p>

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
