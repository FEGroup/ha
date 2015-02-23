Ha.Map = Ha.inherit(Object, function(isArrayValue) {this.base();
	var map_ = {};
	var isArrayValue_ = isArrayValue ? true : false;

	this.has = function(key) {
		return map_.hasOwnProperty(key);
	};

	this.set = function(key, value) {
		if (isArrayValue_) {
			var values;

			if (this.has(key)) {
				values = this.get(key);
			} else {
				values = [];

				map_[key] = values;
			}

			values.push(value);
		} else {
			map_[key] = value;
		}
	};

	this.get = function(key) {
		if (!this.has(key)) return null;

		return map_[key];
	};

	this.delete = function(key) {
		if (!this.has(key)) return;

		delete map_[key];
	};

	this.clear = function() {
		for (var key in map_) {
			if (!map_.hasOwnProperty(key)) continue;

			delete map_[key];
		}
	};

	this.size = function() {
		return this.keys().length;
	};

	this.keys = function() {
		var keys = [];

		for (var key in map_) {
			if (!map_.hasOwnProperty(key)) continue;
			keys.push(key);
		}

		return keys;
	};

	this.values = function() {
		var values = [];

		for (var key in map_) {
			if (!map_.hasOwnProperty(key)) continue;

			values.push(map_[key]);
		}

		return values;
	};
});