import Chart, { helpers } from "chart.js";

export const defaults = {
	position: "chartArea",
	display: true,
	ticks: {
		padding: 5,
		callback: (tick) => tick.toString() + "\xb0"
	}
};

export class AngleScale extends Chart.Scale {
    setDimensions() {
		this.height = this.maxHeight;
		this.width = this.maxWidth;
		this.xCenter = this.left + Math.round(this.width / 2);
		this.yCenter = this.top + Math.round(this.height / 2);

		this.paddingLeft = 0;
		this.paddingTop = 0;
		this.paddingRight = 0;
		this.paddingBottom = 0;
	}
	
	buildTicks() {
		this.rTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
		this.aTicks = [0, 90, 180, 270];

		// Needed for core scale work
		return [];
	}

	convertTicksToLabels() {
		this.aLabels = this.aTicks.map(function(tick, index, ticks) {
			return this.options.ticks.callback.apply(this, [tick, index, ticks]);
		}, this);

		// Needed for core scale work
		return [];
	}

    // There is no tick rotation to calculate, so this needs to be overridden
	calculateTickRotation() {}

	fit() {
		const me = this;
		me.xCenter = (me.left + me.right) / 2;
		me.yCenter = (me.top + me.bottom) / 2;
		const fontSize = helpers.getValueOrDefault(me.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);

		if (me.options.ticks.display) {
			const fontStyle = helpers.getValueOrDefault(me.options.ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
			const fontFamily = helpers.getValueOrDefault(me.options.ticks.fontFamily, Chart.defaults.global.defaultFontFamily);
			const labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);
			me.ctx.font = labelFont;

			const aLabelLengths = me.aLabels.map((tick) => me.ctx.measureText(tick).width);

			// Figure out where these points will go, and assuming they are drawn there, how much will it go outside of the chart area.
			// We use that to determine how much padding we need on each side
			me.minDimension = Math.min(me.right - me.left, me.bottom - me.top);

			helpers.each(me.aTicks, (aTick, index) => {
				if (aTick !== 0) {
					const radius = me.minDimension / 2;
					const labelStart = me.getPointPosition(1, aTick);
					const cosPhi = (labelStart.x - me.xCenter) / radius;
					const sinPhi = (labelStart.y - me.yCenter) / radius;
					const labelWidth = aLabelLengths[index] + me.options.ticks.padding;
					const pts = [{
						x: labelStart.x + (cosPhi * labelWidth) + (sinPhi * fontSize),
						y: labelStart.y + (sinPhi * labelWidth) - (cosPhi * fontSize)
					}, {
						x: labelStart.x + (cosPhi * labelWidth) - (sinPhi * fontSize),
						y: labelStart.y + (sinPhi * labelWidth) + (cosPhi * fontSize)
					}];

					helpers.each(pts, pt => {
						me.paddingLeft = Math.max(me.paddingLeft, me.left - pt.x);
						me.paddingTop = Math.max(me.paddingTop, me.top - pt.y);
						me.paddingRight = Math.max(me.paddingRight, pt.x - me.right);
						me.paddingBottom = Math.max(me.paddingBottom, pt.y - me.bottom);
					});
				}
			});
		}

		me.minDimension = Math.min(me.right - me.left - me.paddingLeft - me.paddingRight, me.bottom - me.top - me.paddingBottom - me.paddingTop);

		// Store data about the arcs that we will draw
		me.arcs = [];
		helpers.each(me.rTicks, r => {
			const radius = r * (me.minDimension / 2);

			me.arcs.push({
				x: me.xCenter,
				y: me.yCenter,
				radius: radius,
				startAngle: 0,
				endAngle: 2 * Math.PI,
				counterClockwise: false
			});
		});
	}

	draw() {
		const me = this;

		if (me.options.display) {
			if (me.options.gridLines.display) {
				me.ctx.strokeStyle = me.options.gridLines.color;
				me.ctx.lineWidth = me.options.gridLines.lineWidth;

				// Draw each of the arcs
				helpers.each(me.arcs, arc => {
					if (arc.radius == 0) {
						// To draw the center dot, it's more efficient to draw a rectangle
						me.ctx.fillRect(arc.x, arc.y, 1, 1);
						return;
					}
					me.ctx.beginPath();
					me.ctx.arc(arc.x, arc.y, arc.radius, arc.startAngle, arc.endAngle, arc.counterClockwise);
					me.ctx.stroke();
				});
			} else {
				// Simply draw a border line
				me.ctx.strokeStyle = me.options.gridLines.color;
				me.ctx.lineWidth = me.options.gridLines.lineWidth;
				me.ctx.beginPath();
				me.ctx.arc(me.xCenter, me.yCenter, me.minDimension / 2, 0, 2 * Math.PI, false);
				me.ctx.stroke();
			}

			if (me.options.ticks.display) {
				const fontSize = helpers.getValueOrDefault(me.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);
				const fontStyle = helpers.getValueOrDefault(me.options.ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
				const fontFamily = helpers.getValueOrDefault(me.options.ticks.fontFamily, Chart.defaults.global.defaultFontFamily);

				const labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);
				me.ctx.font = labelFont;

				me.ctx.fillStyle = helpers.getValueOrDefault(me.options.ticks.fontColor, Chart.defaults.global.defaultFontColor);

				helpers.each(me.aLabels, (aLabel, index) => {
					const pt = me.getPointPosition(1, me.aTicks[index]);
					const padding = me.options.ticks.padding;

					if (pt) {
						let align = 'left';
						let angle = Math.atan2(pt.y - me.yCenter, pt.x - me.xCenter);

						if (pt.x < me.xCenter)
							align = 'right';

						// Align center for labels on the center
						if (Number(pt.x.toFixed(2)) == me.xCenter)
							align = 'center';

						me.ctx.save();
						me.ctx.translate(pt.x, pt.y);
						me.ctx.textBaseline = 'middle';
						me.ctx.textAlign = align;
						me.ctx.fillText(aLabel, Math.cos(angle) * padding, 2 * Math.sin(angle) * padding);
						me.ctx.restore();
					}
				});
			}
		}
	}

    getPointPosition(amplitude, angle) {
		const radius = this.minDimension / 2;

		return {
			x: this.xCenter - amplitude * radius * Math.sin(2 * Math.PI * angle / 360),
			y: this.yCenter - amplitude * radius * Math.cos(2 * Math.PI * angle / 360)
		}
	}

    getLabelForIndex(index, datasetIndex) {
        const d = this.chart.data.datasets[datasetIndex].data[index];
		return d.a + "\xb0, " + d.r;
    }
}
