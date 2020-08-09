
window.onload = () => {
     fetch(`http://localhost:6379/api/admin`, {method:'GET'})
         .then((res)=> res.json()).then((body)=> {
         let usersData = []
         for(let i = 0; i< body.data.length; i++){
             usersData.push(JSON.parse( body.data[i]));
         }
         loadTableData(usersData)
     });
}


function loadTableData(userData) {
    const tableBody = document.getElementById('tableData');
    let dataHtml = '';

    for(let user of userData) {
        dataHtml += `<tr><td>${user.firstName}</td><td>${user.lastName}</td><td>${user.email}</td></tr>`;
    }
    tableBody.innerHTML = dataHtml;
}

function searchAdminTable() {
    let input, filter, table, tr, td, i, txtValue, col;
    input = document.getElementById("adminSearchBar");
    filter = input.value.toUpperCase();
    table = document.getElementById("adminTable");
    col = document.getElementById("searchTypes").value;
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[col]; //0 is for col
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = ""; // keep showing
            } else {
                tr[i].style.display = "none"; // remove
            }
        }
    }
}