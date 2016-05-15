void function()
{
	var mapFn = this.map;
	this.map = function(arg) {return mapFn.call(this, typeof arg == 'string' ? (e) => e[arg] : arg)};
	
	this.toObject = function(keyMap, valueMap)
	{
		if(!valueMap) valueMap = (e) => e;
		
		var result = {};
		for(var i = 0; i < this.length; i++)
		{
			var e = result[i];
			result[keyMap(e, i)] = valueMap(e, i);
		}
		return result;
	}
	
	this.sum = function() {return this.reduce((a, b) => +a + b, 0)};
	
	this.max = function() {return this.reduce(Math.max, this[0])};
	this.min = function() {return this.reduce(Math.min, this[0])};
	
	this.first = function() {return this[0]};
	this.last = function() {return this[this.length - 1]};
	
}.call(Array.prototype);