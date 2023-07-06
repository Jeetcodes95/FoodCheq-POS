// var show;

//product edit section code
// var editBtn = document.querySelector('.editBtn')
// var editForm = document.querySelector('#editForm')
// var productDisplay = document.querySelector('#productDisplay')
// editBtn.addEventListener('click', ()=>{
//     if(show === 0){
//         editForm.style.display = 'none'
//         productDisplay.style.display = 'initial'
//         show === 1
//     }else{
//         editForm.style.display = 'initial'
//         productDisplay.style.display = 'none'
//         show === 0
//     }
// })

//dropdown js
$( "#sel_val" ).change(function() {
  var option = $(this).find('option:selected').val();
  $('#sel_txt').text(option);
});


//setting section code
var formCard = document.querySelector(".profileCard");
var profileForm = document.querySelector(".profileForm");
var profileEdit = document.querySelector(".profileEdit");
var profileData = document.querySelector(".profileData");
var flag = 0;


profileEdit.addEventListener('click', ()=>{
    if(flag === 0){
        profileData.style.display = 'none';
        formCard.style.display = 'initial';
        profileForm.style.display = 'initial';
        flag = 1;
    }else{
        profileData.style.display = 'initial';
        formCard.style.display = 'none';
        profileForm.style.display = 'none';
        flag = 0;
    }
});


//LOGO Change form
document.querySelector(".upload-btn").addEventListener('click', function () {
    document.querySelector('#file').click();
  });
  
  document.querySelector('#file').addEventListener('change', function () {
    document.querySelector(".profileImgform").submit();
  });

//Product image upload  
  document.querySelector(".upload-product").addEventListener('click', function () {
    document.querySelector('#photo-upload').click();
  });
  
  document.querySelector('#file').addEventListener('change', function () {
    document.querySelector(".productImgform").submit();
  });



//to scroll and update location of scroll 
var cartContainer = document.querySelector(".Cart-Container");
cartContainer.scrollTop = cartContainer.scrollHeight

//to search users
function searchProduct() {
    let input = document.querySelector('#searchbar').value
    input=input.toLowerCase();
    let x = document.querySelectorAll('.product');
      
    for (i = 0; i < x.length; i++) { 
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display="none";
        }
        else {
            x[i].style.display="grid";                 
        }
    }
  }
  