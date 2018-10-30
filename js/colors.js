let availableColors = ["#8F3D61","#B94B5D", "#DD7E5F", "#EB9762", "#EDBD77", "#DDDDDD"];
// "grid"

// availableColors = [
// "#D3C663",
// "#AEB160",
// "#97904A",
// "#5AA99D",
// "#38797A",
// "#0C5878",
// "#BBBBBB"
// ]

let colorWrapper = dQ(".colors");
let selectedColor = availableColors[0];

availableColors.map(color => {
  let colorEl = document.createElement("div");
  colorEl.classList.add("swatch");
  colorEl.style.background = color;
  colorEl.setAttribute("color", color);
  colorWrapper.appendChild(colorEl);
  colorEl.addEventListener("click", function(el){
    selectColor(el.target.getAttribute("color"));
  });
});

const selectColor = color => {
  selectedColor = color;
  document.querySelectorAll(".colors .swatch").forEach(el => {
    el.classList.remove("selected");
    if(selectedColor === el.getAttribute("color")) {
      el.classList.add("selected");
    }
  });
}

selectColor(selectedColor);