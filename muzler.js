/*
 * Muzler: A basic Javascript physics engine designed for client-side javascript development.
 */

if (!!console) console.info("Loading Muzler...");


//The main object
var muzler = {};

//Used to store info such as screen dimensions. Almost preferences
muzler.data = {};

if (!!console) console.log("%c[MUZLER][BUILD] Loading core and private functions...", "color: grey");

//Muzler init object
muzler.Init = function () {
	//_PRIVATE_
	this._exists = true;

	//defaults
	this.element = "document.body";
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

	//User callable functions
	this.add = {};
	this.add.object = function (obj) { /* append to objectList */ };
};

//TODO
muzler.object = function () {
	this.dx = 50; //DEFAULT
	this.dy = 50; //DEFAULT
	this.imgSrc = "black"; //DEFAULT
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
		muzler.out.sub("Setting size");
	} catch (err) { muzler.out.error("Failed to set up designated element: '" + err + "'"); }
	
	if (!!console) console.info("Muzler successfully initialised!");
};

//Global Tick event. Calls for all physics to be updated aor calculated.
muzler.globalTick = function () {
	//Nothing yet
};


if (!!console) console.info("Muzler successfully loaded!");
