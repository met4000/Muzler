/*
 * Muzler: A basic Javascript physics engine designed for client-side javascript development.
 * 
 * muzler.js - The main Javscript file for Muzler.
 */

if (!!console) console.info("Loading Muzler engine...");



/*
 * The main object
 */
var canvas = {};
canvas.id = "muzlerDisplay";
canvas.injectId = "muzlerInject";
canvas.tickTemp = -1;
canvas.fpsTemp = (new Date()).getMilliseconds();
canvas.fpsTick = 0;
canvas.fps = 10;
canvas.getElementById = function (id) { return document.getElementById(canvas[id]); };
canvas.listObjects = {};
canvas.liveObjects = [];

canvas.r = {};
canvas.r.reflect = function () { alert("reflect"); };


canvas.init = function (e, w, h) {
	if (!!console) console.info("Loading Muzler canvas...");
	
	e.id = "muzlerCanvas";
	e.innerHTML = "<div id='" + canvas.id + "'></div><textarea id='" + canvas.injectId +"'>";
	canvas.width = w;
	canvas.height = h;
	var c = canvas.getElementById("id");
	var i = canvas.getElementById("injectId");
	c.style.width = w;
	c.style.height = h;
	c.style.border = "1px solid lightgrey";
	i.style.width = w;
	i.style.height = "100";
	
	document.title = document.title.substr(0, document.title.length) + ": " + (canvas.fps * 10) + "fps";
	canvas.fpsTemp = (new Date()).getMilliseconds();
	canvas.tickTemp = setInterval("canvas.tick()", 10);
	
	if (!!console) console.info("Sucessfuly loaded canvas! Tick port is " + canvas.tickTemp + ".");
};

canvas.tick = function () {
	canvas.fpsTick++;
	for (var x = 0; x < canvas.liveObjects.length; x++)
		if (!!canvas.liveObjects[x])
			if (!!canvas.liveObjects[x].response)
				if (typeof canvas.liveObjects[x].response.tick == "function") canvas.liveObjects[x].response.tick();
	
	if ((new Date()).getMilliseconds() > canvas.fpsTemp + 99) {
		document.title = document.title.substr(0, document.title.length - 5 - (canvas.fps * 10).toString().length) + ": " + (canvas.fpsTick * 10) + "fps";
		canvas.fps = canvas.fpsTick;
		canvas.fpsTick = 0;
		canvas.fpsTemp = (new Date()).getMilliseconds();
	}
};

canvas.objects = {};
canvas.objects.create = function (name, properties, func) {
	var obj = new Object();
	obj.name = name;
	obj.response = {};
	for (var x = 0; x < properties.length; x++)
		obj.response[properties[x]] = func[x];
	canvas.listObjects[name] = obj;
};



if (!!console) console.info("Sucessfuly loaded Muzler!");
