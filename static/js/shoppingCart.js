var numOfItems =0;
window.onload = () => {
    fetch(`http://localhost:6379/api/cart/items`, {method:'GET'})
        .then((res)=> res.json()).then((body)=> {
        let itemsData = []
        let data = JSON.parse( body.data);
        console.log("data :" + data)
        numOfItems = Object.keys(data).length;
        for(let i = 0; i< numOfItems; i++){
            itemsData.push(data[i]);
            console.log("data[i] :" + data[i])
        }
        /*for(let key in  Object.keys(data)){
            itemsData.push(data.key);
        }*/
        loadItemsData(itemsData);
    });
}

window.addEventListener("unload", ()=>{
    let data = [];
    for(let i = 0; i < numOfItems; i++){
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


    for(let [index,item] of itemList.entries()) {
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



