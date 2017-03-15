data = {
	"zoneTypes": {
		"R": {
			name: "Residential"
		},
		"C": {
			name: "Commercial"
		},
		"I": {
			name: "Industrial"
		},
		"P": {
			name: "Public"
		}
	}
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
			imageFileName: "R-1.png",
			buildings: ["R-low", "R-high"]
		},
		"C-1": {
			zoneType: "C",
			imageFileName: "C-1.png",
			buildings: ["C-low", "C-high"]
			jobs: 2,
			noise: 10
		},
		"I-1": {
			zoneType: "I",
			imageFileName: "I-1.png",
			buildings: ["I-low", "I-high"]
			jobs: 3,
			produces: "yogurt", // Might want to make this "ALL"?
			pollution: 10
			noise: 10
		}
	}
};