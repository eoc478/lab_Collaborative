var splashScreen = document.querySelector('.splashContainer');
splashScreen.addEventListener('click',()=>{
  splashScreen.style.opacity = 0;
  setTimeout(()=>{
    splashScreen.classList.add('hidden')
  },610)
})

let p1Text = document.getElementById("p1");
