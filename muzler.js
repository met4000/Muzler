/*
 * Muzler: A basic Javascript physics engine designed for client-side javascript development.
 */

if (!!console) console.info("Loading Muzler...");


//The main object
var muzler = {};

//Stuff
muzler.globalTickPort = -1;
muzler.globalTickTime = 31; //Roughly 30hz

//Used to store info such as screen dimensions. Almost preferences
muzler.data = {};

if (!!console) console.log("%c[MUZLER][BUILD] Loading core and private functions...", "color: grey");

//Prototype Functions:

//Doesn't exist on non-document elements for some reason
Element.prototype.getElementById = function (id) {
	return this.children.namedItem(id);
};

//Converts 'seconds' to ticks (mostly used for converting psec to ptick)
Number.prototype.tps = function () {
	return this * muzler.globalTickTime / 1000;
};

//Degrees to Rads
Number.prototype.toRad = function () {
	return this / 180 * Math.PI;
};


//Muzler init object
muzler.Init = function (e) {
	//_PRIVATE_
	this._exists = true;

	//defaults
	this.element = e || "document.body";
	this.width = "window.innerWidth";
	this.height = "window.innerHeight";

	//physics
	this.engine = new muzler.classes.PhysicsInput();
};

//Includes all classes/objects
muzler.classes = {};

//Includes (most) helper functions
muzler.funcs = {};

//TODO
muzler.classes.PhysicsInput = function () {
	//_PRIVATE_
	this.objectList = [];
	
	//Stats
	this.gravity = 9.81 * 0.8; //DEFAULT
	this.scale = 5; //pixel to metre ratio

	//User callable functions
	this.add = {};
	this.add.p = this; //Passing parent... DEFINATELY NOT BAD PRACTICE
	this.add.object = function (obj) {
		if (!(obj instanceof muzler.Object)) {
			muzler.out.error("Passed object not of type 'muzler.Object'. Object: " + JSON.stringify(obj));
			return false;
		}
		this.p.objectList.push(obj);
		return obj.id;
	};
};

Array.prototype.idIndex = function (id) {
	return this.indexOf(this.find(new Function("e", "return e.id == " + id)));
};

//TODO
muzler.Object = function (id) {
	//_PRIVATE_
	this._del = false;
	
	this.id = id || Math.floor(Math.random() * 1000000);
	this.e = undefined;
	
	this.x = 50;
	this.y = 50;
	this.r = 0;

	this.dx = 25; //DEFAULT
	this.dy = 25; //DEFAULT
	this.imgSrc = "black"; //DEFAULT

	this.physics = new muzler.classes.PhysicsEngine();
	this.functions = new muzler.classes.FunctionHandler();
	
	//Functions
	this.destroy = function () { this._del = true; }
};


//For communicating with the user/developer
muzler.out = {};

//_PRIVATE_
//Console log type object: [type, disp. type, [fill colour, text colour]]
//Note, fill colour does not work for anything apart from log and info (e.g. warn, error)
muzler.out._rel = {
	load: ["log", "build", ["#F0F0F0", "grey"]],
	sub: ["log", "progress", ["", "grey"]],
	warn: ["warn", "warn", ["", "black"]],
	info: ["log", "info"],
	error: ["warn", "error", ["", "red"]],
	fatal: ["error", "fatal error", ["", "red"]]
};

//_PRIVATE_
//Base console logging function. m is the message to be displayed and t the type of message.
muzler.out._base = function (m, t) {
	if (!!console) {
		if (!muzler.out._rel[t][2])
			console[muzler.out._rel[t][0]]("[MUZLER][" + muzler.out._rel[t][1].toUpperCase() + "]: " + m);
		else
			console[muzler.out._rel[t][0]]("%c[MUZLER][" + muzler.out._rel[t][1].toUpperCase() + "]: " + m, "background: " + muzler.out._rel[t][2][0] + (!muzler.out._rel[t][2][1] ? "" : "; color: " + muzler.out._rel[t][2][1]));
	}
};

//Load console logging types from _rel{}, incorporating _base()
for (var i = 0; i < Object.keys(muzler.out._rel).length; i++)
	muzler.out[Object.keys(muzler.out._rel)[i]] = eval("(function (m) { muzler.out._base(m, '" + Object.keys(muzler.out._rel)[i] + "'); })");

//Contains physics functions and attributes used by objects when ticking
muzler.classes.PhysicsEngine = function () {
	//Physics relaed stats. All are in SI
	this.stats = {};
	this.stats.mass = 100; //DEFAULT
	this.stats.type = ""; //DEFAULT - similar to 'class'. Used to apply group reaction rules. To set multiple types, leave a space in between them

	//Multipliers to manualy adjust certain physics
	this.multipliers = {};
	this.multipliers.gravity = 1; //DEFAULT

	//What do you think?
	this.gravity = {};

	this.gravity.direction = 0; //DEFAULT
	
	
	//Used to make it move
	this.forces = [];
	this.force = function (s, d, n) { this.forces.push(typeof s == "function" ? new muzler.classes.VForce(s, d, n) : new muzler.classes.Force(s, d, n)); };
};

//Used to define a force enacting upon an object
muzler.classes.Force = function (s, d, n) {
	this.name = n || Math.floor(Math.random() * 1000000);
	this.direction = Math.round(d) || 0; //DEFAULT
	this.strength = (Math.round(s * 1000) / 1000) || 1; //DEFAULT
};

//Used to define a force enacting upon an object that changes relative to the object's velocity
muzler.classes.VForce = function (f, d, n) {
	this.name = n || Math.floor(Math.random() * 1000000);
	this.direction = Math.round(d) || 0; //DEFAULT
	this.func = f || function (m, d) { return 1; }; //DEFAULT - SHOULD BE CHANGED ON DECLARATION
};

//Functions triggered at certain calculation times
muzler.classes.FunctionHandler = function () {
	//Creation
	this.preSpawn = [];
	this.postSpawn = [];
	
	//Death
	this.preDestroy = [];
	this.postDestroy = [];
	
	//Tick
	this.preTick = [];
	this.postTick = []; //Not in place yet
};

//Used to trigger objects' event functions
muzler.Object.prototype.funcTriggerEvent = function (t) {
	for (var n = 0; n < this.functions[t].length; n++)
		this.functions[t][n](this);
};

//Function called at or after window.load
//mio: a muzler init object
muzler.init = function (mio) {
	if (!!console) console.info("Initialising Muzler...");
	
	var fail = false;
	if (!mio) fail = true;
	else if (!mio._exists) fail = true;
	if (fail) {
		muzler.out.fatal("Invalid MIO. Passed MIO is: " + mio);
		return false;
	}

	muzler.out.load("Setting system variables...");
	try {
		muzler.out.sub("Copying properties over from MIO...");
		for (var i = 0, miok = Object.keys(new muzler.Init()); i < miok.length; i++)
			if (miok[i].charAt(0) != "_")
				muzler.data[miok[i]] = typeof mio[miok[i]] == "string" ? eval(mio[miok[i]]) : mio[miok[i]];
	} catch (err) { muzler.out.error("Failed to set system variables: '" + err + "'"); }
	
	muzler.out.load("Setting up designated element...");
	try {
		muzler.out.sub("Accessing element");
		muzler.element = eval(muzler.data.element);
		muzler.out.sub("Setting style");
		muzler.element.style.width = muzler.width;
		muzler.element.style.height = muzler.height;
		muzler.element.style.position = "relative";
	} catch (err) { muzler.out.error("Failed to set up designated element: '" + err + "'"); }
	
	muzler.out.load("Starting global tick...")
	try {
		muzler.globalTickPort = setInterval("muzler.globalTick()", muzler.globalTickTime);
		
		if (muzler.globalTickPort != -1) {
			muzler.out.sub("Global tick successfully iniialised on port " + muzler.globalTickPort + ".");
			muzler.out.sub("Global tick operating at " + Math.floor(10000 / muzler.globalTickTime) / 10 + "Hz - " + muzler.globalTickTime + "msec.");
		} else
			muzler.out.fatal("Failed to initialise global tick. Reason Unknown.");
	} catch (err) { muzler.out.fatal("Failed to initialise global tick: '" + err + "'"); }
	
	if (!!console) console.info("Muzler successfully initialised!");
};

//Global Tick event. Calls for all physics to be updated aor calculated.
muzler.globalTick = function () {
	if (!!muzler.data.engine) {
		var objs = muzler.data.engine.objectList;
		var delArr = [];
		
		for (var i = 0; i < objs.length; i++) {
			if (!objs[i].e) {
				objs[i].funcTriggerEvent("preSpawn");
				
				//Spawn
				o = document.createElement("span");
				o.id = objs[i].id;
				o.style.position = "absolute";
				o.style.width = objs[i].dx;
				o.style.height = objs[i].dy;
				o.style.top = objs[i].y;
				o.style.left = objs[i].x;
				o.style.background = objs[i].imgSrc;
				muzler.element.appendChild(o);
				objs[i].e = o;
				
				objs[i].funcTriggerEvent("postSpawn");
			} else if (objs[i]._del) {
				//PreDestroy trigger
				objs[i].funcTriggerEvent("preDestroy");
				
				//Destroy
				muzler.element.removeChild(objs[i].e);
				delArr.push(objs[i].id);
				
				//PostDestroy trigger
				objs[i].funcTriggerEvent("postDestroy");
			} else {
				objs[i].funcTriggerEvent("preTick");
				
				//Gravity
				if (objs[i].physics.gravity.direction != -1)
					objs[i].physics.force(muzler.data.engine.gravity.tps() * objs[i].physics.multipliers.gravity, objs[i].physics.gravity.direction, "gravity");
				
				//Calc
				var dx = 0;
				var dy = 0;
				for (var n = 0; n < objs[i].physics.forces.length; n++) {
					if (objs[i].physics.forces[n] instanceof muzler.classes.Force) {
						var nm = objs[i].physics.forces[n].strength;
						var nd = objs[i].physics.forces[n].direction.toRad();
						dx += Math.floor(nm * Math.sin(nd) * 1000) / 1000;
						dy += Math.floor(nm * Math.cos(nd) * 1000) / 1000;
					}
				}
				
				var d = Math.atan2(dx, dy);
				var m = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				for (var n = 0; n < objs[i].physics.forces.length; n++) {
					if (objs[i].physics.forces[n] instanceof muzler.classes.VForce) {
						var nm = Math.round(objs[i].physics.forces[n].func(m, d) * 1000) / 1000;
						var nd = objs[i].physics.forces[n].direction.toRad();
						dx += Math.floor(nm * Math.sin(nd) * 1000) / 1000;
						dy += Math.floor(nm * Math.cos(nd) * 1000) / 1000;
					}
				}
				
				//Collisions
				var cx = parseInt(objs[i].e.style.left.substr(0, objs[i].e.style.left.length - 2));
				var cy = parseInt(objs[i].e.style.top.substr(0, objs[i].e.style.top.length - 2));
				for (var x = cx; Math.abs(cx - x) <= Math.ceil(Math.abs(dx)); x += Math.abs(dx) / dx) {
					for (var y = cy; Math.abs(cy - y) <= Math.ceil(Math.abs(dy)); y += Math.abs(dy) / dy) {
						for (var n = 0; n < objs.length; n++) {
							if (i != n) {
								if (objs[n].x < x && x < objs[n].x + objs[n].dx) {
									if (objs[n].y < y && y < objs[n].y + objs[n].dy) {
										//COLLISION
									}
								}
							}
						}
						if (0 > x || x > parseInt(muzler.data.width)) {
							//COLLISION WITH WALL
						} else if (0 > y) {
							//COLLISION WITH ROOF
						} else if (y > parseInt(muzler.data.height)) {
							//COLLISION WITH FLOOR
							dy = y - Math.abs(dy) / dy;
							objs[i].physics.forces = objs[i].physics.forces.filter(function (f) { return f.name != "gravity"; });
						}
					}
				}
				objs[i].e.style.top = cy + Math.round(dy * muzler.data.engine.scale) + "px";
				objs[i].e.style.left = cx + Math.round(dx * muzler.data.engine.scale) + "px";
			}
		}
		
		//Remove destroyed objects from the object list
		muzler.data.engine.objectList = objs.filter(new Function ("e", "return ![" + delArr + "].includes(e.id);"));
	}
};


if (!!console) console.info("Muzler successfully loaded!");
