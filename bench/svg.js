function createSVG (results) {

	var resultsByTest = {encode: {max: 0}, decode: {max: 0}, decodeencode: {max: 0}};

	var colors = '9BC53D E55934 5BC0EB FDE74C FA7921 114B5F 028090 456990'.split (' ');

	var moduleColors = {};

	for (var moduleName in results) {
		var moduleData = results[moduleName];
		moduleColors[moduleName] = colors.shift();
		for (var testName in moduleData) {
			var countPerMs = moduleData[testName];
			resultsByTest[testName][moduleName] = countPerMs;
			resultsByTest[testName].max = Math.max (countPerMs, resultsByTest[testName].max);
		}
	}

	var svgText = [
		'<style type="text/css"><![CDATA[',
		'	g.testcase .header {font-weight: bold;}',
		'	g.testcase .value {opacity: 0;}',
		'	g.testcase:hover .value {opacity: 1;}',
		'	g.bar .value {font-family: monospace; text-anchor: end}',
		'	.level {stroke-dasharray: 1,2;}',
		']]></style>'
	];

	var rowNum = 1;
	var rowOffset = 20;
	var barWidthMult = 3;

	for (var testName in resultsByTest) {
		var testData = resultsByTest[testName];
		svgText.push ('<g class="testcase">');
		svgText.push ('<text class="header" x="10" y="'+rowNum*rowOffset+'">'+testName+"</text>");
		rowNum ++;
		for (var moduleName in testData) {
			if (moduleName === 'max') continue;
			var value = testData[moduleName];
			var valueToMax = (value / testData.max * 100).toFixed (0);
			var weight = value === testData.max ? 'bold' : 'normal';
			svgText.push ('<text class="label" font-weight="'+weight+'" x="10" y="'+rowNum*rowOffset+'">'+moduleName+"</text>");
			svgText.push ('<g class="bar">');
			svgText.push ('<rect fill="#ffffff" x="125" height="'+rowOffset+'" y="'+rowNum*rowOffset+'" width="'+100*barWidthMult+"\"/>");
			svgText.push ('<rect fill="#'+moduleColors[moduleName]+'" x="125" height="12" y="'+(rowNum*rowOffset - rowOffset/2)+'" width="'+valueToMax*barWidthMult+"\"/>");
			svgText.push ('<text class="value" x="425" font-family="monospace" text-anchor="end" y="'+rowNum*rowOffset+'">'+value+"</text>");
			svgText.push ("</g>");
			rowNum ++;
		}
		var moduleCount = Object.keys (testData).length - 1;

		var firstBar = false;
		var barCount = 5;
		var lastBar = true;
		for (var i = firstBar ? 0 : 1; i < barCount + (lastBar ? 1 : 0); i++) {
			// x = offset + (100% / bars) * bar * bar width multiplier
			var x = 125 + (100 / barCount) * i * barWidthMult;
			var y1 = (rowNum - moduleCount - 1)*rowOffset;
			var y2 = (rowNum - 0.5)*rowOffset;
			svgText.push ('<line class="level" x1="'+x+'" x2="'+x+'" y1="'+y1+'" y2="'+y2+'" stroke-width="1" stroke="silver"/>');
		}

		rowNum ++;
		svgText.push ("</g>");
	}


	svgText.unshift ('<svg xmlns="http://www.w3.org/2000/svg" width="450" height="'+((rowNum)*rowOffset)+'">');
	svgText.unshift ('<?xml version="1.0" encoding="utf-8"?>');


	svgText.push ("</svg>");

	return svgText.join ("\n");
}

module.exports = createSVG;
