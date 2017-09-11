//  Window onload event handler
window.onload = function () {
	//  Init muzler
	
	//  Create new Muzler Initiation object
	var m = new muzler.Init('document.getElementById(\'content\')');
	
	//  Set width and height
	m.height = 400;
	m.width = 400;
	
	//  Initialise muzler
	muzler.init(m);
	
	//  Give the 'room' a border
	muzler.element.style.border = "1px solid black";
};

//  Creating a new muzler object when 'n' is pressed
//  KeyDown event handler
window.onkeydown = function (e) {
	//  If the key is 'n'
	if (e.key == "n") {
		//  Create a new Muzler object
		var o = new muzler.Object();
		
		//  Set it to spawn at the cursor
		o.x = mx - 20;
		o.y = my - 20;
		
		//  Add it to muzler
		muzler.data.engine.add.object(o);
		
		//  Force a global tick (not absolutely necessary)
		muzler.globalTick();
		
		//  Add an onclick handler to the new object
		o.e.onclick = function (e) {
			//  Get the respective object in from Muzler's object list
			var o = muzler.data.engine.objectList.find(new Function("e", "return e.id==" + this.id));
			
			if (!window.d) { // If not dragging
				// Set dragging variables and disable gravity
				o.functions.gravityDefault = false;
				window.d = o;
			} else { // If dragging
				// Clear dragging variables and restart gravity
				o.functions.gravityDefault = true;
				window.d = false;
			}
		};
	}
};

// Mouse Movement event handler
window.addEventListener("mousemove", function (e) {
	// Populate global variables with the cursor's current location
	window.mx = e.pageX;
	window.my = e.pageY;
	
	// If dragging...
	if (window.d) {
		// Set the object's x and y to the cursor's x and y, so long as it is within the main muzler element ('room')
		if (0 < e.pageX - 20 && e.pageX + 5 < muzler.data.width)
			d.x = e.pageX - 20;
		if (0 < e.pageY - 20 && e.pageY + 5 < muzler.data.height)
			d.y = e.pageY - 20;
	}
});
