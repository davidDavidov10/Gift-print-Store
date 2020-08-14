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
    }).catch(()=>{
        window.location = "../html/LoginPage.html";
    });
}
// <p><a href="#">Product 1</a> <span class="price">$15</span></p>
/*
function loadItemsData(itemList) {
    const cart = document.getElementById('products');
    let dataHtml = '';

    for(let [index,item] of itemList.entries()) { //todo: !!
        dataHtml +=
            `<div class="basket-product" id=${index} data-value ="${item.prodImg}" data-id="${item.type}">
                <div class="item" >
                <div class="product-image">
                <img src="../productImg/${item.prodImg}.png" alt="../img/GiftPrint.png" class="product-frame">
                </div>
                <div class="product-details">

            <p id ="type"><strong>${item.type}</strong></p>
            <p><strong>Color: ${item.color}</strong></p>
             <p><strong>Size: ${item.size}</strong></p>
            </div>
            </div>
            <div class="price" id="price${index}" data-value="${item.price}">Price: ${item.price}$</div>
                <div class="quantity">
                <input id="amount${index}" type="number" value="${item.amount}" min="1" class="quantity-field" onclick="updateSubtotal(${index})">
                </div>
                <div class="subtotal" id="sub-total${index}">Subtotal: ${item.amount * item.price}$</div>
                <div class="remove">
                <button id ="remove${index}" onclick="removeProduct(${index})">Remove</button>
                </div>
             </div>`
    }
    cart.innerHTML = dataHtml;
}*/
