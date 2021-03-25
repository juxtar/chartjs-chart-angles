import Chart from "chart.js";
import { Controller } from "./controller";
import { AngleScale, defaults } from "./scale";

Chart.controllers.angles = Controller;
Chart.defaults.angles = {
	showLines: false,
    aspectRatio: 1,
	scale: {
		type: "angles"
	},
	tooltips: {
		callbacks: {
			title: () => null,
			label: (bodyItem, data) => {
				const dataset = data.datasets[bodyItem.datasetIndex];
				const d = dataset.data[bodyItem.index];
				return dataset.label + ": " + d.a + "\xb0, " + d.r;
			}
		}
	}
};
Chart.scaleService.registerScaleType("angles", AngleScale, defaults);
