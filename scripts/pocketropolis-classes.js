
function Planet (options) {
	this.size = options.size;
	this.radius = options.radius;
	this.plots = [];
	this.people = [];
	Object.defineProperty(g, "population", {get: function(){ 
		return this.planet.people.length; 
	}});
	this.init();
	// TODO: Add random buildings just for testing

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
	for (var i = 0; i < this.size; i++) {
		this.plots.push( new Plot({}, this, i) );
	}
};



function Plot (options, planet, plotIndex, city) {
	this.building = null;
	// TODO: add natural features? like water or trees or mountains?
	this.planet = planet || null; // parent
	this.plotIndex = plotIndex;
	this.city = city || null;
};

function City (options, planet, startPlotIndex, endPlotIndex) {
	this.money = new RocketBoots.Currency();
	this.startPlotIndex = startPlotIndex;
	this.endPlotIndex = endPlotIndex;
	this.planet = planet; // parent
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
	}
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

function Building (options, plot, city) {
	this.floors = [];
	this.plot = plot || null; // parent
	this.city = city || null;
};
function Floor (typeKey, building) {
	this.building = building;
	this.level = 0;

	this.typeKey = typeKey;
	
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

