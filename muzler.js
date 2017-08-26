/*
 * Muzler: A basic Javascript physics engine designed for client-side javascript development.
 */

if (!!console) console.info("Loading Muzler...");


//The main object
var muzler = {};

//Stuff
muzler.globalTickPort = -1;
muzler.globalTickTime = 40;

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

//TODO
muzler.classes.PhysicsInput = function () {
	//_PRIVATE_
	this.objectList = [];
	
	//Stats
	this.gravity = 9.81; //DEFAULT

	//User callable functions
	this.add = {};
	this.add.p = this; //Passing parent... DEFINATELY NOT BAD PRACTICE
	this.add.object = function (obj) {
		if (!(obj instanceof muzler.object)) {
			muzler.out.error("Passed object not of type 'muzler.object'. Object: " + JSON.stringify(obj));
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
muzler.object = function (id) {
	//_PRIVATE_
	this._del = false;
	
	this.id = id || Math.floor(Math.random() * 1000000);
	
	this.x = 50;
	this.y = 50;
	this.r = 0;

	this.dx = 50; //DEFAULT
	this.dy = 50; //DEFAULT
	this.imgSrc = "black"; //DEFAULT

	this.physics = new muzler.PhysicsEngine();
	this.functions = new muzler.FunctionHandler();
	
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
muzler.PhysicsEngine = function () {
	//Physics relaed stats. All are in SI
	this.stats = {};
	this.stats.mass = 100; //DEFAULT

	//Multipliers to manualy adjust certain physics
	this.multipliers = {};
	this.multipliers.gravity = 1; //DEFAULT
	this.multipliers.aero = 1; //DEFAULT

	//What do you think?
	this.gravity = {};

	this.gravity.direction = 0; //DEFAULT
	
	
	//Used to make it move
	this.forces = [];
	this.force = function (s, d, m) { this.forces.push(f == undefined ? new muzler.Force(s, d) : new muzler.VForce(s, d, m)); };
};

//Used to define a force enacting upon an object
muzler.Force = function (s, d, id) {
	this.id = id || Math.floor(Math.random() * 1000000);
	this.direction = d || 0; //DEFAULT
	this.strength = s || 1; //DEFAULT
};

//Used to define a force enacting upon an object that changes relative to the object's velocity
muzler.VForce = function (s, d, m, id) {
	this.id = id || Math.floor(Math.random() * 1000000);
	this.direction = d || 0; //DEFAULT
	this.strength = s || 1; //DEFAULT
	this.multiplier = m || 0; //DEFAULT - SHOULD BE CHANGED ON DECLARATION
};

//Functions triggered at certain calculation times
//g defines the scope for the function to operate at. Defaults to false. True means global, false means local (the parent muzler.Object())
muzler.FunctionHandler = function () {
	//Creation
	this.preSpawn = [];
	this.postSpawn = [];
	
	//Death
	this.preDestroy = [];
	this.postDestroy = [];
	
	//Tick
	this.preTick = [];
	this.postTick = [];
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
			muzler.out.sub("Global tick operating at " + (1000 / muzler.globalTickTime) + "Hz - " + muzler.globalTickTime + "msec.");
		} else
			muzler.out.fatal("Failed to initialise global tick. Reason Unknown.");
	} catch (err) { muzler.out.fatal("Failed to initialise global tick: '" + err + "'"); }
	
	if (!!console) console.info("Muzler successfully initialised!");
};

//Global Tick event. Calls for all physics to be updated aor calculated.
muzler.globalTick = function () {
	if (!!muzler.data.engine) {
		objs = muzler.data.engine.objectList;
		
		for (var i = 0; i < objs.length; i++) {
			if (!muzler.element.getElementById(objs[i].id)) {
				o = document.createElement("span");
				o.id = objs[i].id;
				o.style.position = "absolute";
				o.style.width = objs[i].dx;
				o.style.height = objs[i].dy;
				o.style.top = objs[i].y;
				o.style.left = objs[i].x;
				o.style.background = objs[i].imgSrc;
				muzler.element.appendChild(o);
			} else {
				e = muzler.element.getElementById(objs[i].id);
				
				//Gravity
				if (objs[i].physics.gravity.direction != -1)
					objs[i].physics.force(muzler.data.engine.gravity.tps() * objs[i].physics.multipliers.gravity, objs[i].physics.gravity.direction); //PROBLEM WITH .force
				
				//Calc
				var dx = 0;
				var dy = 0;
				for (var n = 0; n < objs[i].physics.forces.length; n++) {
					dx += objs[i].physics.forces[n].strength * Math.sin(objs[i].physics.forces[n].direction);
					dy += objs[i].physics.forces[n].strength * Math.cos(objs[i].physics.forces[n].direction);
				}
				e.style.top = parseInt(e.style.top.substr(0, e.style.top.length - 2)) + dy + "px"
				e.style.left = parseInt(e.style.left.substr(0, e.style.left.length - 2)) + dx + "px";
			}
		}
	}
};


if (!!console) console.info("Muzler successfully loaded!");
