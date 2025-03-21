let canvas = new fabric.Canvas('product-canvas');
// canvasResize();
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
document.getElementsByName("productColor").forEach((element) =>{
    element.addEventListener("change", function(){
        document.getElementById("product-div").style.backgroundColor = this.value;
    }, false);
})

// Update the Product color according to the selected color by the user
document.getElementById("product-design").addEventListener("change", function(){

    // Call the updateProductImage method providing as first argument the URL
    // of the image provided by the select
    canvas.remove(canvas.item(0));
    updateProductImage(this.value);
}, false);

// When the user clicks on upload a custom picture
document.getElementById('product-custompicture').addEventListener("change", function(e){
    // Validate file
    let file = this.files[0];
    let filename = file.name;
    if(file.size > 1000000 || !(filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png'))){
        alert(" Please upload an image of at most 1MB, of type jpg jpeg or png");
        this.value = "";
     // File validated
    }else{
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
    }
}, false);


async function doneEdit(){
    try {
        // Canvas
        let productDiv = await new Promise((resolve, reject) => {
            if (canvas.item(0) !== undefined) {
                canvas.item(0).lockScalingX = canvas.item(0).lockScalingY = true;// Can't resize item
                canvas.item(0).lockMovementX = canvas.item(0).lockMovementY = true;// Can't resize item
                canvas.item(0).selectable = false; // Can't reselect item
                canvas.item(0)['hasControls'] = false;
                canvas.item(0)['hasBorders'] = false;
                canvas.renderAll();
            }
            resolve(document.getElementById('product-div'));
            // Page
        });
        let dataUrl = await domtoimage.toPng(productDiv);
        document.getElementById('productWithImage').value = dataUrl
        document.getElementById('addToCart').disabled = false;
        document.getElementById('continueEdit').disabled = false;
        document.getElementById('doneEdit').disabled = true;
        document.getElementById('upload-img-div').className = "custom-file mb-3 disable";
        document.getElementById('product-amount').className = "disable";
        document.getElementById('product-design').disabled = true;
        let sizeSelect = document.getElementById('product-size');
        if (sizeSelect) sizeSelect.className = "disable";
        document.getElementsByName("productColor").forEach((element) => {
            if (!element.checked) element.disabled = true;
        })
    }catch(error) {
        console.error('oops, something went wrong!', error);
    }
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
    document.getElementById('upload-img-div').className = "custom-file mb-3";
    document.getElementById('product-amount').className = "";
    document.getElementById('product-design').disabled = false;
    let sizeSelect = document.getElementById('product-size');
    if(sizeSelect) sizeSelect.className = "";
    document.getElementsByName("productColor").forEach((element) =>{
        element.disabled = false;
    })

}

 window.onload = async()=>{
     try{
         canvasResize();
         let res = await fetch(`http://localhost:8080/api/design/validate`, {method:'GET', credentials: "include"});
         if(res.status === 401) window.location = "../../html/LoginPage.html"; // Not authenticated user
         else if(res.status === 500) throw Error("wrong response status: " + res.status) // Server error
     }catch(err){
         // Send to error page
         window.location = "../../html/ErrorPage.html";
     }
 }

 window.addEventListener('resize' , ()=>{
    canvasResize();
 });

function canvasResize(){

    let imgWidth = document.getElementById('product-backgroundpicture').width;
    let imgHeight = document.getElementById('product-backgroundpicture').height;
    let ratio = document.getElementById('ratio').value;
    ratio = JSON.parse(ratio);
    canvas.setHeight(imgHeight * ratio.height);
    canvas.setWidth(imgWidth * ratio.width);
}

sendProd= async ()=>{
    let productWithImage = document.getElementById('productWithImage').value;
    let productCustompicture = document.getElementById("product-custompicture").files[0];
    let productType = document.getElementById('productType').value;
    let price  = document.getElementById('price').value;
    let productSize = document.getElementById('product-size');
    let productColor = getColor();
    let productAmount = document.getElementById('product-amount').value;

    let formData= new FormData();
    formData.append("productWithImage", productWithImage)
    formData.append("uploadedImg",productCustompicture)
    formData.append("productType", productType)
    formData.append("price",price)
    if (productSize !== null){
        formData.append("productSize", productSize.value)
    }
    formData.append( "productColor", productColor)
    formData.append( "productAmount", productAmount)

    let response = await fetch("http://localhost:8080/api/design/save",{
        method: 'POST',
        credentials: "include",
        body:formData,
        referrer:  window.location.href
    });
    if (response.status === 200){
        //ok
        location.reload();
    }else if(response.status === 401){
        //
        window.location = "../../html/LoginPage.html"
    }
    else{
        //error
        window.location = "../../html/ErrorPage.html";
    }
}
function getColor() {
    let radioColors = document.getElementsByClassName('color-buttons');
    for (let i = 0; i < radioColors.length; i++){
        if (radioColors[i].checked){
            return radioColors[i].value;
        }
    }
}