var words = document.getElementById("words");

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented || $(document.activeElement).is('input')) {
	  return; // Do nothing if the event was already processed
	}

	try{
		document.querySelector(`#my-keyboard #${event.key.toUpperCase()}-KEY`).classList.add("down");
		//document.getElementById(`${event.key.toUpperCase()}-KEY`).classList.add("down");
	} catch{};

	if(event.key === "Tab"){
		event.preventDefault();
	}

	try{
		Game.onKeyDown(event.key);
		//onKeyDown(event.key);
	} catch{}
  
	// Cancel the default action to avoid it being handled twice
	//event.preventDefault();
}, true);


window.addEventListener("keyup", function (event) {
	if (event.defaultPrevented || $(document.activeElement).is('input')) {
	  return; // Do nothing if the event was already processed
	}
	try{
		document.querySelector(`#my-keyboard #${event.key.toUpperCase()}-KEY`).classList.remove("down");
	} catch{};
  
	// Cancel the default action to avoid it being handled twice
}, true);