/*
 * Muzler: A basic Javascript physics engine designed for client-side javascript development.
 */

if (!!console) console.info("Loading Muzler...");


// The main object
var muzler = {};
muzler.tickTemp = -1;
muzler.hzTemp = (new Date()).getMilliseconds();
muzler.hzTick = 0;

muzler.hzCap = 2;
muzler.hzUpdate = 2;

muzler.hz = muzler.hzCap;

if (!!console) console.log("%c[MUZLER][BUILD] Loading core and private functions...", "color: grey");


//For communicating with the user/developer
muzler.out = {};

//_PRIVATE_
//Console log type object: [type, disp. type, [fill colour, text colour]]
//Note, fill colour does not work for anything apart from log and info (e.g. warn, error)
muzler.out._rel = {
	load: ["log", "build", ["", "grey"]],
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
//e: element (e.g. document.body) that should be targeted by muzler
muzler.init = function (e) {
	if (!!console) console.info("Initialising Muzler...");
	
	muzler.out.load("Setting system variables...");
	try {
		muzler.width = screen.width;
		muzler.height = screen.height;
	} catch (err) { muzler.out.error("Failed to set system variables: '" + err + "'"); }
	
	muzler.out.load("Setting up designated element...");
	
	muzler.out.load("Starting up globalTick...");
	document.title = document.title.substr(0, document.title.length) + ": " + (muzler.hz * Math.floor(muzler.hzCap / 10)) + "Hz";
	muzler.hzTemp = (new Date()).getMilliseconds();
	if (muzler.hzCap >= muzler.hzUpdate / 2)
		muzler.out.warn("Hz values will be incorrect or 0 due to the update time (" + (1000 / muzler.hzUpdate) + " msec) being too close to the globalTick time (" + (1000 / muzler.hzCap) + " msec)! Recomended minimum  update : tick  time is  1 : 5.");
	else {
		muzler.out.info("globalTick capped at " + muzler.hzCap + "Hz.");
		muzler.out.info("Hz values updated every " + (1000 / muzler.hzUpdate) + "msec.");
	}
	muzler.tickTemp = setInterval("muzler.globalTick()", 1000 / muzler.hzCap);
	
	if (!!console) console.info("Muzler successfully initialised!");
};

//Global Tick event. Includes Hz calculations and displaying. Calls for all physics to be updated aor calculated
muzler.globalTick = function () {
	//Hz calc
	muzler.hzTick++;
	if ((new Date()).getMilliseconds() > muzler.hzTemp + 1000 / muzler.hzUpdate) {
		document.title = document.title.substr(0, document.title.length - 5 - (muzler.hz * muzler.hzUpdate).toString().length) + ": " + (muzler.hzTick * muzler.hzUpdate) + " Hz";
		muzler.hz = muzler.hzTick;
		muzler.hzTick = 0;
		muzler.hzTemp = (new Date()).getMilliseconds();
	}
	
	//Global Tick event
};


if (!!console) console.info("Muzler successfully loaded!");
