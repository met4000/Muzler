window.onload = function () {
	//Init muzler
	var m = new muzler.Init('document.getElementById(\'content\')');
	m.height = 400;
	m.width = 400;
	muzler.init(m);
	muzler.element.style.border = "1px solid black";
	
	muzler.Object.prototype.drag = false;
};

window.onkeydown = function (e) {
	if (e.key == "n") {
		var o = new muzler.Object();
		o.x = mx - 20;
		o.y = my - 20;
		muzler.data.engine.add.object(o);
		muzler.globalTick();
		o.e.onclick = function (e) {
			var o = muzler.data.engine.objectList.find(new Function("e", "return e.id==" + this.id));
			if (!window.d) {
				window.dt = o.physics.gravity.direction, o.physics.gravity.direction = -1;
				window.d = o;
			} else {
				o.physics.gravity.direction = window.dt;
				window.d = false;
			}
		};
	}
};

window.addEventListener("mousemove", function (e) {
	window.mx = e.pageX;
	window.my = e.pageY;
	
	if (window.d) {
		if (0 < e.pageX - 20 && e.pageX + 5 < muzler.data.width)
			d.x = e.pageX - 20;
		if (0 < e.pageY - 20 && e.pageY + 5 < muzler.data.height)
			d.y = e.pageY - 20;
	}
});
