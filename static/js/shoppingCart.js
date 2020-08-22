var numOfItems =0;
window.onload = () => {
    fetch(`http://localhost:6379/api/cart/items`, {
        credentials: "include",
        method:'GET'
    })
        .then((res)=> res.json()).
    then((body)=> {
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
    }).catch((err)=>{
        console.log(err)
        window.location = "../html/LoginPage.html";
    });
}


window.onbeforeunload =   function(e) {
    let productsAmount = {};
    for (let index = 0; index < numOfItems; index++) {
        let key = document.getElementById(index).getAttribute('data-value');
             if(localStorage.getItem(`amount${index}`)){
            productsAmount[key] = localStorage.getItem(`amount${index}`);
            localStorage.removeItem(`amount${index}`);
        }
    }
    fetch(`http://localhost:6379/api/cart/items/update`, {
        credentials: "include",
        method: 'PUT',
        body: JSON.stringify(productsAmount),
        headers: {'Content-Type': 'application/json'}
    }).catch();
}

function removeProduct(index){
    let productSubtotal = document.getElementById(`sub-total${index}`).innerText.replace("Subtotal: $","");
    let productToRemove = document.getElementById(index);
    productToRemove.style.display = 'none';
  /*  let productAmount = document.getElementById(`amount${index}`);
    productAmount.value = 0;
    */
    localStorage[`amount${index}`] = 0;

    let basketTotal = document.getElementById('basket-total').innerText.slice(1);
    document.getElementById('basket-total').innerText = "$" +  (basketTotal - productSubtotal);

}

function loadItemsData(itemList) {
    const cart = document.getElementById('products');
    let dataHtml = '';
    let basketTotal = 0;
    for(let [index,item] of itemList.entries()) {
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
            <div class="price" id="price${index}" data-value="${item.price}">Price: $${item.price}</div>
                <div class="quantity">
                <input id="amount${index}" type="number" value="${item.amount}" min="1" class="quantity-field" onclick="updateSubtotal(${index})">
                </div>
                <div class="subtotal" id="sub-total${index}">Subtotal: $${item.amount * item.price}</div>
                <div class="remove">
                <button id ="remove${index}" onclick="removeProduct(${index})">Remove</button>
                </div>
             </div>`
        basketTotal += item.amount * item.price;
    }
    document.getElementById('basket-total').innerText = "$" + basketTotal;
    cart.innerHTML = dataHtml;
}

function searchCartItems() {
    let input, filter, list, i, txtValue;
    list = document.getElementsByClassName("basket-product");
    let numberOfItems = list.length;
    input = document.getElementById("search-bar");
    filter = input.value.toLowerCase();
    for (i = 0; i < numberOfItems; i++) {
        txtValue = list[i].getAttribute('data-id');
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            list[i].style.display = ""; // keep showing
        } else {
            list[i].style.display = "none"; // remove
        }
    }
}

//  Update each product subtotal on click  and save amount to local storage
function updateSubtotal(index){
    // Update subtotal
    let basketTotal = document.getElementById('basket-total').innerText.slice(1);
    let amount = document.getElementById(`amount${index}`).value;
    let price = document.getElementById(`price${index}`).getAttribute('data-value');
    let subTotal = document.getElementById(`sub-total${index}`);
    basketTotal = (basketTotal - subTotal.innerText.replace("Subtotal: $","")) + (amount * price);
    subTotal.innerHTML = `Subtotal: $${amount * price}`;
    document.getElementById('basket-total').innerText = "$" +  basketTotal;
    // Save amount to local storage
    localStorage[`amount${index}`] = amount;
}