
function Creation() {
	var localContainer = {};

	localContainer.getType = function(one) {
		return Object.prototype.toString.call(one);
	};

	localContainer.ARRAYTYPE = localContainer.getType([]);
	localContainer.OBJECTTYPE = localContainer.getType({});
	localContainer.FUNCTIONTYPE = localContainer.getType(Function);

	localContainer.isObject = function(one) {
		return localContainer.getType(one) === localContainer.OBJECTTYPE;
	}

	localContainer.isType = function(one, two) {
		return localContainer.getType(one) === localContainer.getType(two);
	};

	localContainer.flattenList = function(list) {
		return list.reduce(function(a, b) { return a.concat(b); }, []);
	}

	localContainer.groupList = function(list, groupSize) {
		var i=0, len = list.length, result = [];
		if (groupSize >= len) return [list];
		if (groupSize <= 0) return undefined;
		for (; i<len; i+=groupSize) {
			result.push(list.slice(i, i+groupSize));
		}
		return result
	}

	// This is wrong. We need to get the MAX ABS value for both X and Y.
	localContainer.sizeOfShape = function(shape) {
		var ratio = [0, 0], lst = this.flattenList(shape);
		for (var i=0, len=lst.length; i<len; i+=2) {
			ratio[0] += lst[i];
			ratio[1] += lst[i+1];
		}
		return ratio;
	}

	localContainer.invert = function(object) {
		var newObject = {};
		for (var key in object) { newObject[object[key]] = key; }
		return newObject;
	}

	localContainer.clone = function(target) {
		var getItem = function(child) { return _clone(child); },
			array = this.ARRAYTYPE,
			object = this.OBJECTTYPE;
		function _clone(item) {
			var proto = localContainer.getType(item),
				newItem = proto === object ? {} : proto === array ? [] : item;
			if (proto === array) for (var idx=0, len=item.length; idx<len; idx++) newItem.push(getItem(item[idx]));
			else if (proto === object) for (var idx in item) newItem[idx] = getItem(item[idx]);
			return newItem;
		}
		return _clone(target);
	}

	localContainer.extend = function(taker, giver) {
		if (taker != undefined && giver != undefined) {
			for (var key in giver) {
				if (this.isObject(taker[key]) && this.isObject(giver[key])) {
					this.extend(taker[key], giver[key]);
				} else {
					taker[key] = giver[key];
				}
			}
		}
		return taker;
	}

	localContainer.compose = function() {
		var args = Array.prototype.slice.call(arguments);
		if (args.length < 2) throw TypeError("two or more arguments are required when calling function ", arguments.callee.name);

		var base = args.shift();
		args.map(function(item) {
			if (localContainer.getType(item) == localContainer.FUNCTIONTYPE) item(base); 
			else localContainer.extend(base, item);
		});
		return base;
	}

	localContainer.genArray = function(total, func) {
		return Array.apply(null, Array(total)).map(func);
	}

	// Phasing out
	localContainer.orderedDictionary = function(config) {
		return this.extend({
			objects: {},
			objectNames: [],
			validate: function(object) {
				return true;
			},
			add: function(objectName, object) {
				if (this.validate && this.validate(object)) {
					this.objects[objectName] = object;
					this.objectNames.push(objectName);
					return true;
				}
			},
			get: function(objectName) {
				if (objectName in this.objects) {
					return this.objects[objectName];
				}
			},
			remove: function(objectName) {
				if (objectName in this.objects) {
					var object = this.objects[objectName];
					delete this.objects[objectName];
					this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
					return object;
				}
			},
			changePosition: function(objectName, newIndex) {
				if (objectName in this.objects) {
					this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) this.objectNames.splice(newIndex, 0, objectName);
					else this.objectNames.push(objectName);
					return true;
				}
			},
			iterateOverObjects: function(func) {
				for (var nameIndex=0, len=this.objectNames.length; nameIndex < len; nameIndex++) {
					var name = this.objectNames[nameIndex];
					if (func(this.objects[name], name)) break;
				}
			},
			list: function() { // Not super safe IMO..
				var self = this;
				return objectNames.map(function(name) { return self.objects[name]; })
			}
			},
			config
		);
	};

	// Size?
	// ChangePosition?
	localContainer.simpleContainer = function(config) {
		return this.extend(
			{
				contents: [],
				validateNewContent: function(item) {
					return true;
				},
				_add: function(item) {
					this.contents.push(item);
				},
				add: function(item) {
					var args = Array.from(arguments);
					if (this.validateNewContent.apply(this, args)) {
						this._add.apply(this, args);
					}
					return this;
				},
				remove: function(item) {
					if (this.contents.includes(item)) {
						return this.contents.splice(this.contents.indexOf(item), 1);
					}
					// Return something otherwise?
				}
			},
			config
		);
	}

	localContainer.namedContainer = function(config) {
		return this.compose(
			this.simpleContainer(),
			{
				contentNames: [],
				_add: function(item, name) {
					if (!this.contents.includes(item)) {
						this.contents.push(item);
						this.contentNames.push(name);
					}
				},
				get: function(name) {
					var idx = this.contentNames.indexOf(name);
					if (idx != -1) return this.contents[idx];
				},
				removeByName: function(name) {
					var idx = this.contentNames.indexOf(name);
					if (idx != -1) {
						this.contentNames.splice(idx, 1);
						return this.contents.splice(idx, 1);
					}
					// Return something otherwise?
				},
				remove: function(item) {
					return this.removeByName(this.contentNames[this.content.indexOf(item)]);
				}
			},
			config
		);
	}

	return localContainer;
}
