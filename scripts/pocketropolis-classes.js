// ES2015

function Planet (options = {}) {
	this.size = options.size;
	this.radius = options.radius;
	this.plots = [];
	this.people = [];
	Object.defineProperty(g, "population", {get: function(){ 
		return this.planet.people.length; 
	}});
	this.init();
};
Planet.prototype = {
	people: [],
	get population() {
		return this.people.length;
	},
	get production() {
		// TODO: loop over all buildings, regardless of city
		return 0;
	},
	get happiness() {
		// TODO: loop over all buildings, regardless of city
		return 0;
	}
};
Planet.prototype.init = function(){
	// Make empty plots
	var planet = this;
	for (var i = 0; i < this.size; i++) {
		this.plots.push( new Plot({planet: planet, plotIndex: i }) );
	}
};



function Plot (options = {}) {
	this.building = null;
	// TODO: add natural features? like water or trees or mountains?
	this.planet = options.planet || null; // parent
	this.plotIndex = options.plotIndex;
	this.city = options.city || null;
};
Plot.prototype.buildBuilding = function (options = {}) {
	if (this.building !== null) {
		return false;
	}
	options.plot = this;
	options.city = this.city;
	this.building = new Building(options);
	return this.building;
};
Plot.prototype.buildFloor = function (options = {}) {
	if (this.building === null) {
		return false;
	}
	return this.building.buildFloor(options);
};

function City (options = {}) {
	this.planet = options.planet; // parent
	this.money = new RocketBoots.Currency();
	this.startPlotIndex = options.startPlotIndex;
	this.endPlotIndex = options.endPlotIndex;
};
City.prototype = {
	get plots(){
		return this.planet.plots.slice(startPlotIndex, endPlotIndex);
	},
	get buildings(){
		// TODO: loop over plots, get all non-null buildings
		return [];
	},
	get size(){
		return this.endPlotIndex - this.startPlotIndex + 1;
	},
	get population() {
		// TODO: Filter the people based on where they live
		return this.planet.people.length;
	},
	get commercialJobs(){
		// TODO: loop over this.buildings, count jobs
		return 0;
	},
	get industrialJobs(){
		// TODO: loop over this.buildings, count jobs
		return 0;
	},
	get production() {
		// TODO: loop over all buildings
		return 0;
	},
	get happiness() {
		// TODO: loop over all buildings
		return 0;
	},
	get funds() {
		return this.money.val;
	}
};

function Building (options = {}) {
	this.plot = options.plot || null; // parent
	this.city = options.city || null;

	this.floors = [];
	this.name = options.name || "Unnamed Building";	
	// TODO: add type, etc?
};
Building.prototype.buildFloor = function (options = {}) {
	var floor;
	options.building = this;
	floor = new Floor(options);
	this.floors.push(floor);
	return floor;
};

function Floor (options = {}) {
	this.building = options.building; // parent
	this.level = 0;

	this.typeKey = options.typeKey;
	
	this.workers = [];
	this.residents = [];
	this.goods = 0;
	this.resources = 0;
};

function Person (key) {
	this.key = key;
	this.name = this.key;
	this.homeFloor = false;
	this.workFloor = false;
}

