var data = {
	"zoneTypes": {
		"R": {
			name: "Residential",
			color: ["#66ff66"]
		},
		"C": {
			name: "Commercial",
			color: ["#6666ff"]
		},
		"I": {
			name: "Industrial",
			color: ["#ffff66"]
		},
		"P": {
			name: "Public",
			color: ["#66ffff"]
		}
	},
	"resources": {
		"milk": {
			buy: 10
		}
	},
	"goods": {
		"yogurt": {
			source: "milk",
			buy: 20,
			sell: 30
		}
	},
	"buildings": {
		"R-low": {
			zoneType: "R",
			maxFloors: 2
		},
		"R-high": {
			zoneType: "R",
			maxFloors: 7
		},
		"C-low": {
			zoneType: "C",
			maxFloors: 3
		},
		"C-high": {
			zoneType: "C",
			maxFloors: 7
		},
		"I-low": {
			zoneType: "I",
			maxFloors: 2
		},
		"I-high": {
			zoneType: "I",
			maxFloors: 5
		}
	},
	"floors": {
		"R-1": {
			zoneType: "R",
			imageFileName: "R-1",
			buildings: ["R-low", "R-high"]
		},
		"C-1": {
			zoneType: "C",
			imageFileName: "C-1",
			buildings: ["C-low", "C-high"],
			jobs: 2,
			noise: 10
		},
		"I-1": {
			zoneType: "I",
			imageFileName: "I-1",
			buildings: ["I-low", "I-high"],
			jobs: 3,
			produces: "yogurt", // Might want to make this "ALL"?
			pollution: 10,
			noise: 10
		}
	}
};