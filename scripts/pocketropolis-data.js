data = {
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
			type: "R",
			maxFloors: 2
		},
		"R-high": {
			type: "R",
			maxFloors: 7
		},
		"C-low": {
			maxFloors: 3
		},
		"C-high": {
			maxFloors: 7
		},
		"I-low": {
			maxFloors: 2
		},
		"I-high": {
			maxFloors: 5
		}
	},
	"floors": {
		"R-1": {
			type: "R",
			imageFileName: "R-1.png",
			buildings: ["R-low", "R-high"]
		},
		"C-1": {
			type: "C",
			imageFileName: "C-1.png",
			buildings: ["C-low", "C-high"]
			jobs: 2,
			noise: 10
		},
		"I-1": {
			type: "I",
			imageFileName: "I-1.png",
			buildings: ["I-low", "I-high"]
			jobs: 3,
			produces: "yogurt", // Might want to make this "ALL"?
			pollution: 10
			noise: 10
		}
	}
};