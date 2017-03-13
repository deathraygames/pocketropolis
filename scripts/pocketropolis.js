RocketBoots.loadComponents([
	"Game",
	"Coords",
	"ImageBank",
	"StateMachine",
	//"data_delivery",
	"Dice",
	"Loop",
	//"entity",
	//"world",
	"Incrementer",
	"Stage",
	"Storage",
	"SoundBank",
	"Notifier",
	"Walkthrough"
]);



RocketBoots.ready(function(){

	//==== GAME

	var g = window.g = new RocketBoots.Game({
		name: "Pocketropolis",
		instantiateComponents: [
			{"state": "StateMachine"},
			{"loop": "Loop"},
			{"incrementer": "Incrementer"},
			{"dice": "Dice"},
			{"sounds": "SoundBank"},
			{"notifier": "Notifier"},
			{"storage": "Storage"},
			{"walkthrough": "Walkthrough"}
		],
		version: "v0.1"
	});
	var curr = g.currencies = g.incrementer.currencies;
	var planet = g.planet = new Planet({size: 1000, radius: 1000});
	var city = g.city2 = new City({}, 0, 4);
	


	g.incrementer.addCurrencies([
		// DEMAND
		{
			name: "resDemand",
			displayName: "Residential Demand",
			selectors: {
				val: [".R .val"],
				rate: [".R .rate"]
			}, 
			max: 1000,
			calcRate: function(c){
				return 1;
			}
		},{
			name: "comDemand",
			displayName: "Commercial Demand",
			selectors: {
				val: [".C .val"],
				rate: [".C .rate"]
			}, 
			max: 1000,
			calcRate: function(c){
				return 1;
			}
		},{
			name: "indDemand",
			displayName: "Industrial Demand",
			selectors: {
				val: [".I .val"],
				rate: [".I .rate"]
			}, 
			max: 1000,
			calcRate: function(c){
				return 1;
			}
		}
	]);





//==================================================================== OLD GAME

	//======================================== Tools

	function cloneObject (obj) { 
		return $.extend(true, {}, obj); 
	}

	//===================================== Constants

	var MAX_TREES_PER_PLOT = 5;
	var MAX_FLOORS = 5;

	//===================================== Game setup

	g.state.transition("preload");

	function Plot (isNatural) {
		this.trees = (isNatural) ? MAX_TREES_PER_PLOT : 0;
		this.chop = 0;
		this.regrow = (isNatural) ? 100 : 0;
		this.floors = [];
		this.rates = {};
		this.capacity = {};
		this.counts = {};
	};
	function Floor (typeKey) {
		this.typeKey = typeKey;
		this.level = 0;
		this.workers = [];
		this.residents = [];
	};
	function Person (key) {
		this.key = key;
		this.name = this.key;
		this.homeFloor = false;
		this.workFloor = false;
	}


	g.maxWorldDimX = 36;

	g.floorType = {
		R: {
			text: "Residential",
			canBuildUp: true,
			groundOnly: false,
			costOne: { value: 50, currency: "material" },
			costMultiplier: { value: 50, currency: "goods"},
			capacity: {
				residents: 3,
				workers: 0,
				material: 10,
				trees: 0,
				goods: 10,
				research: 10
			},
			rates: {
				population: 0.01,
				material: 0,
				trees: 0,
				goods: 0,
				research: 0
			}			
		},
		A: {
			text: "Academic",
			canBuildUp: true,
			groundOnly: false,
			costOne: { value: 100, currency: "goods" },
			costMultiplier: { value: 100, currency: "goods"},
			capacity: {
				residents: 0,
				workers: 2,
				material: 0,
				trees: 0,
				goods: 0,
				research: 100
			},
			rates: {
				population: 0,
				material: 0,
				trees: 0,
				goods: 0,
				research: 1
			}		
		},
		I: {
			text: "Industrial",
			canBuildUp: true,
			groundOnly: false,
			costOne: { value: 100, currency: "material" },
			costMultiplier: { value: 100, currency: "goods"},
			capacity: {
				residents: 0,
				workers: 2,
				material: 100,
				trees: 0,
				goods: 200,
				research: 10
			},
			rates: {
				population: 0,
				material: -0.5,
				trees: 0,
				goods: 0.5,
				research: 0
			}			
		},
		L: {
			text: "Logging",
			canBuildUp: false,
			groundOnly: true,
			costOne: { value: 0, currency: "material" },
			costMultiplier: { value: 999999, currency: "goods"},
			capacity: {
				residents: 0,
				workers: 2,
				material: 200,
				trees: 0,
				goods: 0,
				research: 10
			},
			rates: {
				population: 0,
				material: 3.4,
				trees: -0.1,
				goods: 0,
				research: 0
			}		
		},
		T: {
			text: "Tree Farm",
			canBuildUp: false,
			groundOnly: true,
			costOne: { value: 200, currency: "goods" },
			costMultiplier: { value: 999999, currency: "goods"},
			capacity: {
				residents: 0,
				workers: 2,
				material: 10,
				trees: MAX_TREES_PER_PLOT,
				goods: 0,
				research: 10
			},
			rates: {
				population: 0,
				material: 0,
				trees: 0.05,
				goods: 0,
				research: 0
			}		
		}		
	};

	var _startingCity = {
		plots: [
			new Plot(true)
		],
		plotZeroOffset: 0,
		focusedPlotIndex: 0,

		people: {},
		peopleCounter: 0,

		currencies: {
			population: 2,
			material: 0,
			goods: 0,
			research: 0
		}
	};

	g.city = cloneObject(_startingCity);
	console.log(g.city, g.city.currencies);


	//==================== Tick, Tock
	// From Cyclopean Clicker
	// TODO: Make this a RocketBoots component or put in looper
	g.timing = {
		lastTime: 0
		,setNew: function(){
			this.lastTime = Date.now()
		}
		,getElapsedSeconds: function(andSet){
			var now = Date.now();
			var esec = (now - this.lastTime)/1000;
			if (typeof andSet == 'boolean') {
				this.lastTime = now;
			}
			//console.log(esec);
			return esec;
		}
	};	


	//=============================== Actions
	g.selectedActionKey = "stats";
	g.actions = {
		"stats": {
			"text": 	"Stats",
			"action": function(){
				g.state.transition("stats");
			}
		},
		/*
		"view": {
			"text": 	"View",
			"action": 	function() {
				g.changeFocus(1);
			}
		},
		*/
		"left": {
			"text": 	"Left",
			"action": 	function () {
				g.nextFocusPlot(-1);
			}
		},
		"right": {
			"text": 	"Right",
			"action": 	function () {
				g.nextFocusPlot(1);
			}
		},
		"build": {
			"text": 	"Build",
			"action": 	function() {
				g.state.transition("build");
			}
		},
		"demolish": {
			"text": 	"Demolish",
			"action": 	function() {
				g.state.transition("demolish");
			}
		},		
		/*
		"configure": {
			"text": 	"Configure",
			"action": 	function() {
				g.state.transition("configure");
			}
		},
		*/
		"science": {
			"text": 	"Science",
			"action": 	function() {
				g.state.transition("science");
			}
		}	
	};


	//================================================ Buttons & Menu

	function _selectAction (a, performAction) {
		g.selectedActionKey = a;
		_renderButtonTips();
		if (performAction) {
			g.actions[g.selectedActionKey].action();
		}
		console.log("Select Action: ", g.selectedActionKey);
	}

	var _buttonAction = {
		A: {text: "A", action: function(){}},
		B: {text: "B", action: function(){}}
	};

	function _renderButtonTips () {
		$('.A .buttonTip').html(_buttonAction["A"].text)
		$('.B .buttonTip').html(_buttonAction["B"].text);		
	}

	function _setAndRenderMenuButtons () {
		_buttonAction["A"].text = "Select";
		_buttonAction["A"].action = _activateFocusedMenuItem;
		_buttonAction["B"].text = "Cycle";
		_buttonAction["B"].action = _cycleMenu;
		_renderButtonTips();
	};

	function _setAndRenderGameButtons () {
		var action = g.actions[g.selectedActionKey];
		_buttonAction["A"].text = action.text;
		_buttonAction["A"].action = action.action;
		_buttonAction["B"].text = "Menu";
		_buttonAction["B"].action = function(){ g.state.transition("actions") };
		_renderButtonTips();
	};

	function _activateButton (button) {
		if (typeof _buttonAction[button].action === 'function') {
			_buttonAction[button].action();
		}
	};	

	function _getCurrentStateMenuList () {
		return g.state.get().$view.filter('.menu').find('ul');
	}

	function _activateFocusedMenuItem () {
		_getCurrentStateMenuList().find('li.focused').click();		
	}

	function _resetMenuFocus () {
		var $menuList = _getCurrentStateMenuList();
		var $firstLi = $menuList.find('li').first();
		_cycleMenu(undefined, $firstLi);
	}

	function _cycleMenu ($menuList, $li) {
		if (typeof $menuList === 'undefined') {
			$menuList = _getCurrentStateMenuList();
		}
		var $allLi = $menuList.find('li');
		if (typeof $li === 'undefined') {
			var index = $allLi.filter('.focused').index() + 1;
			if (index >= $allLi.length) {
				index = 0;
			}
			$li = $allLi.eq(index);
		}
 		$allLi.removeClass('focused');
 		$li.addClass('focused');
	}

//======= CALCULATE VALUES

	g.getCurrentPlot = function () {
		var plot = g.city.plots[g.city.focusedPlotIndex];
		plot.canBuildUp = true;

		if (plot.floors.length > 0) {
			var topFloorTypeKey = plot.floors[(plot.floors.length - 1)].typeKey;
			plot.canBuildUp = g.floorType[topFloorTypeKey].canBuildUp;
		}
		return plot;
	}

	g.getCurrentPlotName = function () {
		return g.city.focusedPlotIndex - g.city.plotZeroOffset;
	}

	g.getBuildingCost = function (floorTypeKey) {
		//console.log(floorTypeKey);
		var plot = g.getCurrentPlot();
		var numOfFloors = plot.floors.length;
		var floorType = g.floorType[floorTypeKey];
		var cost;

		if (numOfFloors == 0 || !plot.canBuildUp) {
			cost = cloneObject(floorType.costOne);
		} else {
			cost = cloneObject(floorType.costMultiplier);
			cost.value = (cost.value * numOfFloors);
		}
		return cost;
	}

	g.canAfford = function (cost) {
		return (g.city.currencies[cost.currency] >= cost.value) ? true : false;
	}

	g.rates = {
		population: null,
		material: null,
		//materialCreation: null,
		//materialDestruction: null,
		//treesCreation: null,
		//treesDestruction: null,
		trees: null,
		goods: null,
		research: null
	};
	g.max = {
		population: null,
		material: null,
		trees: null,
		goods: null,
		research: null
	};
	g.counts = { 
		unemployed: null,
		unfilledJobs: null
	};

	g.setCalculatedValues = function () {
		g.max.population 	= 0;
		g.max.material 		= 0;
		g.max.goods 		= 0;
		g.max.research  	= 0;
		g.rates.population 		= 0;
		g.rates.material 		= 0.1;
		//g.rates.materialCreation 	= 0;
		//g.rates.materialDestruction = 0;
		g.rates.trees 				= 0;
		//g.rates.treesCreation		= 0;
		//g.rates.treesDestruction	= 0;
		g.rates.goods 				= 0;
		g.rates.research 			= 0;
		$.each(g.city.plots, function(i, plot){
			var hasLogging = false;
			var hasTrees = (plot.trees > 0) ? true : false;
			plot.rates.population = 0;
			plot.rates.material = 0;
			plot.rates.trees = 0;
			plot.rates.goods = 0;
			plot.rates.research = 0;
			plot.capacity.population = 0;
			plot.capacity.workers = 0;
			plot.capacity.residents = 0;
			plot.capacity.material = 0;
			plot.capacity.goods = 0;
			plot.capacity.research = 0;
			plot.counts.residents = 0;
			plot.counts.workers = 0;

			$.each(plot.floors, function(x, floor){
				var floorType = g.floorType[floor.typeKey];
				var floorBonus = floor.level + floor.workers.length;
				var breedBonus = floor.level + floor.residents.length;
				// Add to maxes
				plot.capacity.population 	+= floorType.capacity.residents;
				plot.capacity.residents 	+= floorType.capacity.residents;
				plot.capacity.workers 		+= floorType.capacity.workers;
				plot.capacity.material 		+= floorType.capacity.material;
				plot.capacity.goods 		+= floorType.capacity.goods;
				plot.capacity.research 		+= floorType.capacity.research;
				// Count some things
				plot.counts.residents 	+= floor.residents.length;
				plot.counts.workers 	+= floor.workers.length;				
				// Add to rates
				if (floor.residents.length >= 2) {
					plot.rates.population 	+= floorType.rates.population * breedBonus;
				}
				if (hasTrees && floor.typeKey == 'L') {
					plot.rates.material 	+= floorType.rates.material * floorBonus;
					plot.rates.trees 		+= floorType.rates.trees * floorBonus;
				}
				if (g.city.currencies.material > 0 && floor.typeKey == 'I') {
					plot.rates.material 	+= floorType.rates.material * floorBonus;
					plot.rates.goods 		+= floorType.rates.goods * floorBonus;
				}
				if (floor.typeKey == 'T') {
					plot.rates.trees 		+= floorType.rates.trees * floorBonus;
				}

				plot.rates.research 	+= floorType.rates.research * floorBonus;

			});

			g.rates.population 	+= plot.rates.population;
			g.rates.material 	+= plot.rates.material;
			g.rates.trees 		+= plot.rates.trees;
			g.rates.goods 		+= plot.rates.goods;
			g.rates.research 	+= plot.rates.research;
			//console.log(plot.rates.material);

			g.max.population 	+= plot.capacity.population;
			g.max.material 		+= plot.capacity.material;
			g.max.goods 		+= plot.capacity.goods;
			g.max.research 		+= plot.capacity.research;
		});
		// bonus capacity for population
		g.max.material += Math.floor(g.city.currencies.population) * 5;
	}

	g.calcIncrementedValue = function (val, delta, min, max) {
		var minSubtract = min - val;
		var maxAdd = max - val;
		if (delta > 0) {
			if (val >= max) {
				delta = 0;
			} else {
				delta = Math.min(maxAdd, delta);
			}
		} else if (delta < 0) {
			delta = Math.max(minSubtract, delta);
		}
		return (val + delta);	
	}
	function _incrementCurrency (curr, seconds) {
		g.city.currencies[curr] = g.calcIncrementedValue(
			g.city.currencies[curr],
			(g.rates[curr] * seconds),
			0,
			g.max[curr]
		);
	}	

	g.increment = function (seconds) {
		var previousPop = Math.floor(g.city.currencies.population);
		_incrementCurrency("population", seconds);
		if (Math.floor(g.city.currencies.population) > previousPop) {
			g.birth();
		}

		_incrementCurrency("material", seconds);
		_incrementCurrency("goods", seconds);
		_incrementCurrency("research", seconds);

		$.each(g.city.plots, function(i, plot){
			plot.trees = g.calcIncrementedValue(
				plot.trees,
				plot.rates.trees,
				0,
				MAX_TREES_PER_PLOT
			);
		});	
	}


//========= Do things to the city

	g.nextFocusPlot = function (x) {
		g.city.focusedPlotIndex += x;
		if (g.city.focusedPlotIndex < 0) {
			g.city.focusedPlotIndex = g.city.plots.length - 1;
		} else if (g.city.focusedPlotIndex >= g.city.plots.length) {
			g.city.focusedPlotIndex = 0;
		}
		console.log("Plot Index", g.city.focusedPlotIndex);
		_renderInfo();
		_renderWorld(true);

	}

	g.buyFloor = function (floorTypeKey) {
		console.log("buyFloor" , floorTypeKey);
		var cost = g.getBuildingCost(floorTypeKey);
		var plot = g.getCurrentPlot();
		var newFloor;

		if (floorTypeKey != "L" && plot.trees > 0) {
			alert("You need to clear the trees first.");
			return false;
		}
		if (!g.canAfford(cost)) {
			alert("You cannot afford this floor.");
			return false;
		}
		if (!plot.canBuildUp) {
			alert("Cannot build up.\nYou have to demolish first.");
			return false;
		}
		if (g.floorType[floorTypeKey].groundOnly && plot.floors.length > 0) {
			alert("This must be placed on the ground level.\nDemolish or choose a new plot of land.");
			return false;
		}

		// OK, let's build a new floor
		g.city.currencies[cost.currency] -= cost.value;
		newFloor = new Floor(floorTypeKey);
		if (plot.canBuildUp) {
			plot.floors.push(newFloor);
		} else {
			g.destroyAllFloors(plot);
			plot.floors = [newFloor]
		}
		g.explore();
		g.employ();
		return true;
	}

	g.destroyAllFloors = function (plot) {
		$.each(plot.floors, function(i, floor){
			g.destroyFloor(floor);
		});
		plot.floors = [];
		g.employ();
	}

	g.destroyFloor = function (floor) {
		$.each(floor.workers, function(i, worker){
			worker.workFloor = false;
		});
		$.each(floor.residents, function(i, resident){
			resident.homeFloor = false;
		});
		floor.typeKey = "X";
	}

	function _doesFloorHaveSpace (floor, type) {
		return (floor[type].length < g.floorType[floor.typeKey].capacity[type]) ? true : false;
	}

	g.employ = function () {
		var openFloors = [];
		$.each(g.city.plots, function(i, plot){
			$.each(plot.floors, function(x, floor){	
				if (_doesFloorHaveSpace(floor, "workers")) {
					_loopOverPeople(function(p, person){
						if (!person.workFloor && _doesFloorHaveSpace(floor, "workers")) {
							person.workFloor = floor;
							console.log('adding worker');
							floor.workers.push(person);
						}
					});
				}
				if (_doesFloorHaveSpace(floor, "residents")) {
					_loopOverPeople(function(p, person){
						if (!person.homeFloor && _doesFloorHaveSpace(floor, "residents")) {
							person.homeFloor = floor;
							floor.residents.push(person);
						}
					});
				}
			});
		});
	}

	g.birth = function () {
		var key = "" + (++g.city.peopleCounter);
		g.city.people[key] = new Person(key)
		g.employ();
	}

	g.explore = function () {	// Expand boundaries
		if (g.city.plots.length >= g.maxWorldDimX) {
			return false;
		} else {
			if (g.city.plots[0].floors.length > 0) {
				var leftPlot = new Plot(true);
				g.city.plots = [leftPlot].concat(g.city.plots);
				g.city.plotZeroOffset += 1;
				g.city.focusedPlotIndex += 1;
			}
			if (g.city.plots[(g.city.plots.length - 1)].floors.length > 0) {
				var rightPlot = new Plot(true);
				g.city.plots.push(rightPlot);
			}
			return true;
		}		
	}

//================== HELPER LOOPS

	function _loopOverPeople (callback) {
		for (person in g.city.people) {
			callback(person, g.city.people[person]);
		}
	}
	function _loopOverFloorsBackwards (plot, callback) {
		for (var i = (plot.floors.length - 1); i >= 0; i--) {
			callback(i, plot.floors[i]);
		}
	}
	function _loopOverTrees (plot, callback) {
		var treeCeiling = Math.ceil(plot.trees);
		var treeFloor = Math.floor(plot.trees);
		var size;
		for (var i = 1; i <= treeCeiling; i++) {
			if (i > treeFloor) {
				size = (plot.trees % 1) * 100;
			} else {
				size = 100;
			}
			callback(i, size);
		}		
	}


//================== RENDERS

	function _renderBuildingCosts () {
		$('.buildFloor').each(function(i, elt){
			var $li = $(elt);
			var $cost = $li.find('.cost');
			var key = $li.data("floortypekey");
			var cost = g.getBuildingCost(key);
			$cost.html(cost.value + " " + cost.currency);
			if (g.canAfford(cost)) {
				$cost.removeClass('tooExpensive');
			} else {
				$cost.addClass('tooExpensive');
			}
		});
	}

	var _$statAmounts = $('.statList').find('.amounts');
	function _formatNumber (x, digits) {
		return (Math.floor(x * digits) / digits).toLocaleString();

	}

	function _renderStats () {

		_$statAmounts.find('.population').html(
			_formatNumber(g.city.currencies.population, 1000) + " / " + g.max.population
		);
		_$statAmounts.find('.material').html(
			_formatNumber(g.city.currencies.material, 10) + " / " + g.max.material
		);
		_$statAmounts.find('.goods').html(
			_formatNumber(g.city.currencies.goods, 10) + " / " + g.max.goods
		);
		_$statAmounts.find('.research').html(
			_formatNumber(g.city.currencies.research, 10) + " / " + g.max.research
		);

		
	}

	function _renderInfo () {
		var plot = g.getCurrentPlot();
		var h = '';
		$('.statsInfo').html(
			Math.floor(g.city.currencies.population) + ' POP ... '
			+ Math.floor(g.city.currencies.material) + ' MAT ... '
			+ Math.floor(g.city.currencies.goods) + ' GDS '
			//+ Math.floor(g.city.currencies.research) + ' RES'
		);
		
		h += (
			'X: ' + g.getCurrentPlotName()
			+ ', Trees: ' + _formatNumber(plot.trees, 10)
			//+ '<br />Floors: ' + plot.floors.length + '<br />'
		);

		if (plot.counts.residents > 0) {
			h += '<br />Residents: ' + plot.counts.residents + ' / ' + plot.capacity.residents;
		} else if (plot.capacity.residents > 0) {
			h += '<br />Unoccupied';
		}
		if (plot.counts.workers > 0) {
			h += '<br />Workers: ' + plot.counts.workers + ' / ' + plot.capacity.workers;
		} else if (plot.capacity.workers > 0) {
			h += '<br />No workers';
		}
		$('.basicPlotInfo').html(h);
		h = '';

		_loopOverFloorsBackwards(plot, function(i, floor){
			var type = g.floorType[floor.typeKey];
			h += (
				'<li>' + (i+1)
				+ ': ' + type.text 
				//+ '<br />Level: ' + floor.level
			);
			h += '</li>';
		});

		$('.floorInfo').html(h);
	}

	function _renderWorld (useTransition) {
		var planetSize = { x: 720, y: 720 };
		var planetLoc = { x: 50, y: 160 };
		var plotSize = { x: 32, y: planetSize.y };
		var h = '';
		for (var p = 0; p < g.maxWorldDimX; p++) {
			(function(p, plot){
				var buildingHTML = '';
				var treeHTML = '';
				h += '<div class="plot" style="transform: rotate(' + ((p/g.maxWorldDimX) * 360) + 'deg);'
					+ ' top: ' + 0 + 'px;'
					+ 'height:' + (planetSize.y ) + 'px;'
					+ ' left: ' + ((planetSize.x/2) - (plotSize.x/2)) + 'px;'
					+ '">';

				if (typeof plot === 'undefined') {
					h += '<span class="unknown">?</span>';
				} else {
					_loopOverFloorsBackwards(plot, function(i, floor){
						buildingHTML += '<div class="floor ' + floor.typeKey + '">'
							+ floor.typeKey
							+ '</div>';
					});
					_loopOverTrees(plot, function(i, size){
						// TODO: fix tree height
						treeHTML += '<div style="height: ' + size + '%;"></div>';
					});
					if (treeHTML.length > 0) {
						h += '<div class="trees">' + treeHTML + '</div>';
					}
					if (buildingHTML.length > 0) {
						for (var b = 0; b < (MAX_FLOORS - plot.floors.length); b++) {
							buildingHTML = '<div class="placeholder"></div>' + buildingHTML;
						}
						h += '<div class="building">' + buildingHTML + '</div>';
					}					
				}

				h += '</div>';
			})(p, g.city.plots[p])
		}

		$('.planet').css({
			transition: ((useTransition) ? "transform 1s" : "none")
		}).css({
			width: 	planetSize.x + 'px',
			height: planetSize.y + 'px',
			top: 	planetLoc.y + 'px',
			left: 	planetLoc.x + 'px,',
			transform: 'rotate(' + ((g.city.focusedPlotIndex/g.maxWorldDimX) * -360) + 'deg)'
		}).html(h);
	}

//================== EVENTS

	g.setupEvents = function () {
		// A, B buttons
		$('.controls').click('button', function(e){
			var button = $(e.target).data("button");
			if (typeof button !== 'undefined') {
				_activateButton(button);
			}
 		});
 		// Menu items
 		$('.menu').mouseover('li', function(e){
 			var $li = $(e.target);
 			var $menuList = $li.closest('ul');
 			_cycleMenu($menuList, $li);
 		}).click('li', function(e){
 			var $li = $(e.target);
 			if ($li.hasClass("selectAction")) {
 				_selectAction( $li.data("action"), true );
 			}
 		});
 		// Build Menu
 		$('.buildFloor').click(function(e){
 			var $target = $(this);
 			var floorTypeKey = $target.data("floortypekey");
 			console.log($target, floorTypeKey);
 			g.buyFloor(floorTypeKey);
 			g.state.transition("game");
 		});
 		$('.demolishAll').click(function(e){
 			g.destroyAllFloors( g.getCurrentPlot() );
 		});
	}

//================================================ Loops

	g.gameLoop = new rb.Loop(function(){
		var seconds = g.timing.getElapsedSeconds(true);
		g.increment(seconds);
		_renderInfo();
		_renderWorld(true);
	}, 500);

	g.gameLoop.addModulusAction(1, function(){
		//var seconds = g.timing.getElapsedSeconds(true);
		g.setCalculatedValues();
		// TODO: Fix this hack to get buttons to display correct
		if (g.state.get().name == "game") {
			_setAndRenderGameButtons();
		}
	});

	g.statsLoop = new rb.Loop(function(){
		_renderStats();
	}, 100);

//================================================ States

	g.state.get("game").setStart(function(){
		g.setCalculatedValues();
		_setAndRenderGameButtons();
		_renderInfo();
		_renderWorld(false);
	});

	g.state.add("actions", {
		start: function(){

			this.$view.show();
			_setAndRenderMenuButtons();
			//_resetMenuFocus();
		},
		end: function(){
			this.$view.hide();
		}		
	}).add("stats", {
		start: function(){
			this.$view.show();
			_setAndRenderMenuButtons();
			_resetMenuFocus();
			g.statsLoop.start();
		},
		end: function(){
			this.$view.hide();
			g.statsLoop.stop();
		}
	}).add("configure", {
		start: function(){
			this.$view.show();
			_setAndRenderMenuButtons();
			_resetMenuFocus();
		},
		end: function(){
			this.$view.hide();
		}
	}).add("build", {
		start: function(){
			this.$view.show();
			_setAndRenderMenuButtons();
			_resetMenuFocus();
			_renderBuildingCosts();
		},
		end: function(){
			this.$view.hide();
		}
	}).add("demolish", {
		start: function(){
			this.$view.show();
			_setAndRenderMenuButtons();
			_resetMenuFocus();
		},
		end: function(){
			this.$view.hide();
		}
	}).add("science", {
		start: function(){
			this.$view.show();
			_setAndRenderMenuButtons();
			_resetMenuFocus();
		},
		end: function(){
			this.$view.hide();
		}
	});
	


	
	g.birth();
	g.birth();
	_selectAction("build", false);

	g.setupEvents();

	g.state.transition("game");

	g.gameLoop.start();

	$('body > footer').fadeIn();

});