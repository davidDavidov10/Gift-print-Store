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
            let product = products[key];
            userProductInfo.push(product);
        }
        loadItemsData(userProductInfo);
    }).catch(()=>{
        window.location = "../html/LoginPage.html";
    });
}


window.onbeforeunload = function(e){
    let productsAmount = {}; //Todo: update only when amount has changed
       for(let index = 0; index < numOfItems; index++){
           let key = document.getElementById(index).getAttribute('data-value');
           productsAmount[key] = document.getElementById(`amount${index}`).value;
       }
   // console.log(JSON.stringify(productsAmount))
    fetch(`http://localhost:6379/api/cart/items/update`, {
        credentials: "include",
        method:'PUT',
        body:JSON.stringify(productsAmount),
        headers: {'Content-Type': 'application/json'}
    }).catch();
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
}

function searchCartItems() {
    let input, filter, list, i, txtValue;
    list = document.getElementsByClassName("basket-product");
    let numberOfItems = list.length;
    input = document.getElementById("promo-code");
    filter = input.value.toLowerCase();
    for (i = 0; i < numberOfItems; i++) {
        txtValue = list[i].getAttribute('data-id');
        console.log(txtValue)
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            list[i].style.display = ""; // keep showing
        } else {
            list[i].style.display = "none"; // remove
        }
    }
}

// Todo: update each product subtotal on click and not on window.onbefore unload

function updateSubtotal(index){
    let amount = document.getElementById(`amount${index}`).value;
    let price = document.getElementById(`price${index}`).getAttribute('data-value');
    document.getElementById(`sub-total${index}`).innerHTML = `Subtotal: ${amount * price}$`;
}