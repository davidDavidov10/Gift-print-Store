
function searchHomeProducts() {
    let input, filter, list, i, txtValue;
    list = document.getElementsByClassName("roll");
    let numberOfItems = list.length;
    input = document.getElementById("homeSearchBar");
    filter = input.value.toLowerCase();
    for (i = 0; i < numberOfItems; i++) {
        txtValue = list[i].id;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            list[i].style.display = ""; // keep showing
        } else {
            list[i].style.display = "none"; // remove
        }
    }
}


window.onload = async()=> {
    try{
        let res = await fetch(`http://localhost:8080/api/home`, {credentials: "include", method:'GET'});
        if(res.status === 401) window.location = "../html/LoginPage.html"; //User not authenticated
        else if(res.status === 500) throw Error("wrong response status: " + res.status) // Server error
    }catch (e) {
        // Send to error page
        window.location = "../html/ErrorPage.html";
    }
}