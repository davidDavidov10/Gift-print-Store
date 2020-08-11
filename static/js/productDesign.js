let canvas = new fabric.Canvas('product-canvas');

function updateProductImage(imageURL){
    fabric.Image.fromURL(imageURL, function(img) {
        img.scaleToHeight(150);
        img.scaleToWidth(150);
        canvas.centerObject(img);
        canvas.add(img);
        canvas.renderAll();
    });
}

// Update the Product color according to the selected color by the user
document.getElementById("product-color").addEventListener("change", function(){
    document.getElementById("product-div").style.backgroundColor = this.value;
}, false);

// Update the Product color according to the selected color by the user
document.getElementById("product-design").addEventListener("change", function(){

    // Call the updateProductImage method providing as first argument the URL
    // of the image provided by the select
    updateProductImage(this.value);
}, false);

// When the user clicks on upload a custom picture
document.getElementById('product-custompicture').addEventListener("change", function(e){
    var reader = new FileReader();

    reader.onload = function (event){
        var imgObj = new Image();
        imgObj.src = event.target.result;

        // When the picture loads, create the image in Fabric.js
        imgObj.onload = function () {
            var img = new fabric.Image(imgObj);

            img.scaleToHeight(100);
            img.scaleToWidth(100);
            canvas.centerObject(img);
            canvas.add(img);
            canvas.renderAll();
        };
    };

    // If the user selected a picture, load it
    if(e.target.files[0]){
        reader.readAsDataURL(e.target.files[0]);
    }
}, false);

// When the user selects a picture that has been added and press the DEL key
// The object will be removed !
document.addEventListener("keydown", function(e) {
    var keyCode = e.keyCode;

    if(keyCode == 46){
        console.log("Removing selected element on Fabric.js on DELETE key !");
        canvas.remove(canvas.getActiveObject());
    }
}, false);


//Todo: make the add to cart open only after done editing and make done editing replace the shirt editor with a photo
function doneEdit(){
    // Define as node the T-Shirt Div
    let node = document.getElementById('product-div');
    domtoimage.toPng(node).then(function (dataUrl) {
        // Print the data URL of the picture in the Console
        document.getElementById('productWithImage').value = dataUrl
        document.getElementById('addToCart').disabled = false;
        document.getElementById('continueEdit').disabled = false;
        document.getElementById('doneEdit').disabled = true;
        document.getElementsByClassName('upper-canvas').removeEventListener("mousedown","_onMouseDown");
        //console.log("value = :" + document.getElementById('shirtWithImage').value)
    }).catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
}

function continueEdit(){
    // Define as node the T-Shirt Div
    let node = document.getElementById('product-div');
    domtoimage.toPng(node).then(function (dataUrl) {
        // Print the data URL of the picture in the Console
        document.getElementById('productWithImage').value = dataUrl
        document.getElementById('addToCart').disabled = false;
        document.getElementById('continueEdit').disabled = false;
        document.getElementById('doneEdit').disabled = true;

        //console.log("value = :" + document.getElementById('shirtWithImage').value)
    }).catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
}
/*document.addEventListener("mousedown", function(t) {
    fabric.__onMouseDown(t), fabric._resetTransformEventData();
    var e = fabric.upperCanvasEl, i = fabric._getEventPrefix();
    fabric.n(e, i + "move", this._onMouseMove, fabric.s), fabric.r(fabric.document, i + "up", fabric._onMouseUp), fabric.r(fabric.document, i + "move", fabric._onMouseMove, fabric.s)
});*/
/* _onMouseDown: function (t) {
    /*todo: this.__onMouseDown(t), this._resetTransformEventData();
    var e = this.upperCanvasEl, i = this._getEventPrefix();
    n(e, i + "move", this._onMouseMove, s), r(fabric.document, i + "up", this._onMouseUp), r(fabric.document, i + "move", this._onMouseMove, s)
}*/
canvas.on('mouse:over', function(e) {
    e.target.set('fill', 'red');
    canvas.renderAll();
});

