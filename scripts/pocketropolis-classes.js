// ES2015

function Planet (options = {}) {
	var p = this;
	var TWO_PI = Math.PI * 2;
	this.size = options.size;
	this.radius = options.radius;
	this.world = options.world;
	this.data = options.data;
	this.plots = [];
	this.people = [];

	this.entity = new RocketBoots.Entity({
		isMovable: false,
		isPhysical: false,
		size: {x: (p.radius * 2), y: (p.radius * 2)},
		pos: {x: 0, y: 0},
		color: "#335533"
	});
	this.entity.draw.custom = function(ctx, stageXY, entStageXYOffset){
		ctx.beginPath();
		ctx.fillStyle = p.entity.color;
		//console.log(p.entity.pos.x, p.entity.pos.y, stageXY.x, stageXY.y, entStageXYOffset.x, entStageXYOffset.y);
		ctx.arc(stageXY.x, stageXY.y, p.radius, 0, TWO_PI);
		ctx.closePath();
		ctx.fill();
	};
	this.world.putIn(this.entity, "planet");

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
};
City.prototype = {
	get plots(){
		// TODO: Fix this so it gets plots from planet.plots based on city prop
		return this.planet.plots.slice(startPlotIndex, endPlotIndex);
	},
	get buildings(){
		// TODO: loop over plots, get all non-null buildings
		return [];
	},
	get size(){
		// TODO: Fix this to use this.plots
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
	var b = this;
	var angle; 
	var radius;
	var groundOffset = 10;
	var MAX_FLOORS = 7;
	var FLOOR_HEIGHT = 32;
	var FLOOR_WIDTH = 64;
	var fullSize = {x: FLOOR_WIDTH, y: (MAX_FLOORS * FLOOR_HEIGHT)};

	this.plot = options.plot || null; // parent
	this.city = options.city || null;

	angle = (this.plot.plotIndex / this.plot.planet.size) * (Math.PI * 2);
	angle = (Math.PI * 2) - angle;
	angle += (Math.PI/2);
	radius = this.plot.planet.radius + (fullSize.y/2) - groundOffset;
	position = new RocketBoots.Coords();
	position.setByPolarCoords(radius, angle);
	// Angle for the rotation
	angle -= (Math.PI/2);
	angle *= -1;

	this.floors = [];
	this.zoneType = options.zoneType || "?";

	// TODO: Remove this
	// var randomFloors = (Math.round(Math.random() * MAX_FLOORS));
	// while (randomFloors--) {
	// 	this.buildFloor();
	// }

	this.name = options.name || "Unnamed Building";
	this.entity = new RocketBoots.Entity({
		name: b.name,
		isMovable: false,
		size: fullSize,
		rotation: angle, 
		pos: position,
		color: "rgba(100,100,120,0.15)"
	});
	this.entity.draw.custom = function(ctx, stageXY, entStageXYOffset) {
		var f = b.floors.length;
		var y;
		//ctx.fillStyle = b.entity.color;
		//ctx.fillRect(entStageXYOffset.x, entStageXYOffset.y, b.entity.size.x, b.entity.size.y);
		while (f--) {
			y = entStageXYOffset.y + (FLOOR_HEIGHT * (MAX_FLOORS - (f + 1)));
			ctx.fillStyle = "rgba(0,0,0,0.4)"; // TODO: add windows color backgrounds
			ctx.fillRect(entStageXYOffset.x, y, FLOOR_WIDTH, FLOOR_HEIGHT);
			ctx.drawImage(b.floors[f].image, entStageXYOffset.x, y, FLOOR_WIDTH, FLOOR_HEIGHT);
		}
	};
	this.plot.planet.world.putIn(this.entity, "building");

	// TODO: add type, etc?
};

Building.prototype = {
	floors: [],
	get size () {
		return new RocketBoots.Coords(64, 32 * this.floors.length);
	},
	set size (val) {
		return this.size;
	}
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

	this.floorKey = options.floorKey;
	this.floorData = this.building.plot.planet.data.floors[this.floorKey];
	this.imageBank = options.imageBank;

	if (typeof this.floorData === "undefined") {
		console.warn("No floor data for floor. key: ", this.floorKey, " data: ", this.building.plot.planet.data.floors);
	}
	this.imageFileName = this.floorData.imageFileName;
	if (typeof this.imageFileName !== "string") {
		console.warn("No imageFileName for floor.", this.floorKey, this.floorData[this.floorKey]);
	}
	
	this.workers = [];
	this.residents = [];
	this.goods = 0;
	this.resources = 0;
};
Floor.prototype = {
	get zoneType () {
		return this.floorData[this.floorKey].zoneType;
	},
	set zoneType (val) {
		console.warn("Cannot set value.");
		return this.zoneType;
	},
	get image () {
		// TODO: Add ability to show vacant buildings differently
		return this.imageBank.get(this.imageFileName);
	},
	set image (val) {
		console.warn("Cannot set value.");
		return this.image;
	}
}


function Person (key) {
	this.key = key;
	this.name = this.key;
	this.homeFloor = false;
	this.workFloor = false;
}

