var numOfItems =0;
window.onload = () => {
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
           // console.log("key = " + key)
            let product = products[key];
           // console.log("product = " + JSON.stringify(product))
            userProductInfo.push(product);
        }
        loadItemsData(userProductInfo);
    });
}


window.onbeforeunload = function(e){
    let productsAmount = {}; //Todo: update only when amount has changed
       for(let index = 0; index < numOfItems; index++){
           let key = document.getElementById(index).getAttribute('data-value');
           productsAmount[key] = document.getElementById(`amount${index}`).value;
       }
   // console.log(JSON.stringify(productsAmount))
    fetch(`http://localhost:6379/api/cart/items/update`, {method:'PUT', body:JSON.stringify(productsAmount), headers: {'Content-Type': 'application/json'}});
}

function removeProduct(index){
    let productToRemove = document.getElementById(index);
    productToRemove.style.display = 'none';
    let productAmount = document.getElementById(`amount${index}`);
    console.log("before: " +productAmount.value);
    productAmount.value = 0;
    console.log("after: " +productAmount.value);
}

function loadItemsData(itemList) {
    const cart = document.getElementById('basket');
    let dataHtml = '';

    for(let [index,item] of itemList.entries()) { //todo: !!
        dataHtml +=
            `<div class="basket-product" id=${index} data-value ="${item.prodImg}">
                <div class="item">
                <div class="product-image">
                <img src="../productImg/${item.prodImg}.png" alt="../img/GiftPrint.png" class="product-frame">
                </div>
                <div class="product-details">
               
            <p><strong>${item.type}</strong></p>
            <p><strong>Color: ${item.type}</strong></p>
            </div>
            </div>
            <div class="price">Price: ${item.price}$</div>
                <div class="quantity">
                <input id="amount${index}" type="number" value="${item.amount}" min="1" class="quantity-field">
                </div>
                <div class="subtotal">Subtotal: ${item.amount * item.price}$</div>
                <div class="remove">
                <button id ="remove${index}" onclick="removeProduct(${index})">Remove</button>
                </div>
                </div>`
    }
    // Todo: add prices
    cart.innerHTML = dataHtml;
}



