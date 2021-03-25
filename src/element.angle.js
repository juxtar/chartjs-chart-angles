import Chart, { helpers, defaults } from "chart.js";

const valueOrDefault = helpers.valueOrDefault;

function noRange() {
    return false;
}

export class Angle extends Chart.Element {
    _type = "angle";

    inRange(mouseX, mouseY) {
        const vm = this._view;
        const scale = this._chart.scale;
        const center = { x: scale.xCenter, y: scale.yCenter };
		const extraHit = vm.borderWidth / 2 + vm.hitRadius;
        
        // Check Y range
		const outOfYRange = Math.abs(vm.y - center.y) + extraHit < Math.abs(mouseY - center.y);
        if (
            outOfYRange || (outOfYRange &&
            Math.sign(vm.y - center.y) != Math.sign(mouseY - center.y))
        )
            return false;

		if (Number(vm.x.toFixed(2)) == center.x)
			return mouseX < (center.x + extraHit) && mouseX > (center.x - extraHit);
		if (Number(vm.y.toFixed(2)) == center.y)
			return Math.abs(vm.x - center.x) + extraHit > Math.abs(mouseX - center.x) &&
            	Math.sign(vm.x - center.x) == Math.sign(mouseX - center.x);
		
		// We calculate the X for the point of the mouseY in the angle
        // for this we use the slope of the resulting line between
        // the center and the end of the angle
		const slope = (vm.y - center.y) / (vm.x - center.x);
        const angleXForMouseY = (mouseY - center.y) / slope + center.x;
        const angleXLeft = angleXForMouseY - extraHit;
        const angleXRight = angleXForMouseY + extraHit;
        return mouseX < angleXRight && mouseX > angleXLeft;
    }

    // Interactions would need to be rewritten to polar coords for these to work
    inXRange = noRange;
    inYRange = noRange;
    inLabelRange = noRange;

    getCenterPoint() {
		var vm = this._view;
		const scale = this._chart.scale;
        const center = { x: scale.xCenter, y: scale.yCenter };
		return {
			x: center.x + (vm.x - center.x) / 2,
			y: center.y + (vm.y - center.y) / 2
		};
	}

    draw(chartArea) {
		const vm = this._view;
		const ctx = this._chart.ctx;
		const x = vm.x;
		const y = vm.y;
		const globalDefaults = defaults.global;
		const defaultColor = globalDefaults.defaultColor;
		const scale = this._chart.scale;
		const xCenter = scale.xCenter;
		const yCenter = scale.yCenter;

		if (vm.skip) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || helpers.canvas._isPointInArea(vm, chartArea)) {
			ctx.strokeStyle = vm.borderColor || defaultColor;
			ctx.lineWidth = valueOrDefault(vm.borderWidth, globalDefaults.elements.point.borderWidth);
			ctx.fillStyle = vm.backgroundColor || defaultColor;
			ctx.beginPath();
			ctx.moveTo(xCenter, yCenter);
			ctx.lineTo(x, y);
			ctx.stroke();
		}
	}
}
