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
    canvas.remove(canvas.item(0));
    updateProductImage(this.value);
}, false);

// When the user clicks on upload a custom picture
document.getElementById('product-custompicture').addEventListener("change", function(e){
    var reader = new FileReader();

    reader.onload = function (event){
        canvas.remove(canvas.item(0));
        var imgObj = new Image();
        imgObj.src = event.target.result;

        // When the picture loads, create the image in Fabric.js
        imgObj.onload = function () {
            var img = new fabric.Image(imgObj);
            document.getElementById('product-design').value = ""
            img.scaleToHeight(100);
            img.scaleToWidth(100);
            canvas.centerObject(img)
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
    // Canvas
    new Promise((resolve,reject)=>{
        if(canvas.item(0) !== undefined ){
            console.log("exists")
            canvas.item(0).lockScalingX = canvas.item(0).lockScalingY = true;// Can't resize item
            canvas.item(0).lockMovementX = canvas.item(0).lockMovementY = true;// Can't resize item
            canvas.item(0).selectable = false; // Can't reselect item
            canvas.item(0)['hasControls'] = false;
            canvas.item(0)['hasBorders'] = false;
            canvas.renderAll();
        }
        resolve(document.getElementById('product-div'));
        // Page
    }).then(domtoimage.toPng) // todo: find better way to send img this takes a lot of time for large imgs
        .then(function (dataUrl) {
            document.getElementById('productWithImage').value = dataUrl
            document.getElementById('addToCart').disabled = false;
            document.getElementById('continueEdit').disabled = false;
            document.getElementById('doneEdit').disabled = true;
            document.getElementById('product-color').className = "disable";
            document.getElementById('product-custompicture').className = "disable";
            document.getElementById('product-amount').className = "disable";
            document.getElementById('product-design').disabled = true;
            let sizeSelect = document.getElementById('product-size');
            if(sizeSelect !== undefined) sizeSelect.className = "disable";
        }).

catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
}

function continueEdit(){
    if(canvas.item(0) !== undefined ) {
        canvas.item(0).lockScalingX = canvas.item(0).lockScalingY = false;// Can resize item
        canvas.item(0).lockMovementX = canvas.item(0).lockMovementY = false;// Can resize item
        canvas.item(0).selectable = true; // Can't reselect item
        canvas.item(0)['hasControls'] = true;
        canvas.item(0)['hasBorders'] = true;
        canvas.renderAll();
    }
    document.getElementById('addToCart').disabled = true;
    document.getElementById('continueEdit').disabled = true;
    document.getElementById('doneEdit').disabled = false;
    document.getElementById('product-color').className = "";
    document.getElementById('product-custompicture').className = "";
    document.getElementById('product-amount').className = "";
    document.getElementById('product-design').disabled = false;
    let sizeSelect = document.getElementById('product-size');
    if(sizeSelect !== undefined) sizeSelect.className = "";

}
