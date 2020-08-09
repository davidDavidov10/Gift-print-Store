var numOfItems =0;
window.onload = () => {
    fetch(`http://localhost:6379/api/cart/items`, {method:'GET'})
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

window.addEventListener("unload", ()=>{
    let data = [];
    for(let i = 0; i < numOfItems; i++){ //todo: !!
        data[i] = document.getElementById(i).value;
    }
    //alert(data);
    console.log("unload : " + data)
    //setTimeout(()=>console.log("out"), 5000);
   // fetch(`http://localhost:6379/api/cart/items/update` ,{method:'put', body: data});

});




function loadItemsData(itemList) {
    const cart = document.getElementById('basket');
    let dataHtml = '';


    for(let [index,item] of itemList.entries()) { //todo: !!
        dataHtml += `<div class="basket-product">
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
        <input id=${index} type="number" value="${item.amount}" min="1" class="quantity-field">
        </div>
        <div class="subtotal">Subtotal: ${item.amount * item.price}$</div>
        <div class="remove">
        <button>Remove</button>
        </div>
        </div>`
    }
    // Todo: add prices
    cart.innerHTML = dataHtml;
}



