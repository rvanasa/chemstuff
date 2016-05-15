void function()
{
	var mapFn = Array.prototype.map;
	Array.prototype.map = function(arg) {return mapFn.call(this, typeof arg == 'string' ? (e) => e[arg] : arg)};
	
	Array.prototype.toObject = function(keyMap, valueMap)
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
	
	Array.prototype.sum = function() {return this.reduce((a, b) => a + b, 0)};
	
	Array.prototype.max = function() {return this.reduce(Math.max, this[0])};
	Array.prototype.min = function() {return this.reduce(Math.min, this[0])};
}();