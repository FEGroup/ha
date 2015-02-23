/**
 * ha(刃, edge) - the tempered cutting edge of a blade. The side opposite the mune. Also called hasaki (刃先).
 */
(function (platform, entry) {
	platform.Ha = entry();
}(window, function () {
	"use strict";

	var Ha = {};

	Ha.Version = '0.1.0';
	Ha.Blacksmith = '崔悧峻';

	/**
	 * 객체를 확장합니다. 확장 프로퍼티는 arguments로 받습니다.
	 * @param source 확장시킬 객체
	 * @returns {*} 확장된 객체
	 */
	Ha.extend = function extend(source) {
		source = source || {};

		if (arguments.length <= 1) return source;

		for (var index = 1; index < arguments.length; index++) {
			var target = arguments[index];

			for (var prop in target) {
				if (!target.hasOwnProperty(prop)) continue;

				source[prop] = target[prop];
			}
		}

		return source;
	};

	/**
	 * 객체의 함수 부분을 확장합니다. 확장 함수는 arguments로 받습니다.
	 * @param source 확장시킬 객체
	 * @returns {*} 확장된 객체
	 */
	Ha.extendFunction = function extendFunction(source) {
		source = source || {};

		if (arguments.length <= 1) return source;

		for (var index = 1; index < arguments.length; index++) {
			var target = arguments[index];

			for (var prop in target) {
				if (!target.hasOwnProperty(prop) || typeof target[prop] !== 'function') continue;

				source[prop] = target[prop];
			}
		}

		return source;
	};

	/**
	 * 클래스를 상속합니다.
	 * @param p 상위 클래스
	 * @param c 하위 클래스
	 * @returns {*} 하위 클래스
	 */
	Ha.inherit = function inherit(p, c) {
		var Parent = p;
		var child = c;

		// 상위 클래스의 정의들을 하위 클래스에 부여하기 위해서, 하위 클래스의 프로토타입을 상위 클래스로 정의합니다.
		child.prototype = new Parent();
		child.prototype.constructor = Parent;

		/**
		 * 상위 클래스의 생성자를 실행합니다.
		 * 하위 클래스가 생성될 때 호출되어야 합니다.
		 */
		child.prototype.base = function () {
			// 상위 클래스의 생성자를 인자 목록과 함께 실행합니다. 이렇게 하는 이유는 상속 당시에 상위 클래스의 정의를 받지만, 정작 인스턴스를 생성할 때에는 인자를 넘기지 못하기 때문입니다.
			this.__super__ = new (Function.prototype.bind.apply(Parent, arguments))();

			this.__super__.constructor.apply(this.__super__, arguments);
		};

		return child;
	};

	/**
	 * 파라메터가 숫자인지 판단합니다.
	 * @param n 검사할 숫자 대상.
	 * @returns {boolean} true면 숫자.
	 */
	Ha.isNumber = function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

	Ha.unique = function unique(a) {
		var na = [],
			l = a.length;

		for (var i = 0; i < l; i++) {
			for (var j = i + 1; j < l; j++) {
				if (a[i] === a[j]) j = ++i;
			}

			na.push(a[i]);
		}

		return na;
	};

	return Ha;
}));

Ha.Json = {};
Ha.Json.toObject = function(str) {
	var dObj = {value: str};

	function toObject(del) {
		var obj = {};

		if (del.value.trim().indexOf(',') === 0) {
			del.value = del.value.slice(del.value.indexOf(','));
		}

		var index;

		while ((index = del.value.indexOf(':')) > -1) {
			var key = del.value.substr(0, index).trim();

			del.value = del.value.slice(index + 1).trim();

			if (del.value.indexOf('{') === 0) { // 내장 객체의 분석을 시작합니다.
				// '{'을 잘라냅니다.
				del.value = del.value.slice(1);

				// 내장 객체를 가져옵니다.
				obj[key] = toObject(del);

				// 내장 객체에 해당하는 문자열을 제거합니다.
				del.value = del.value.slice(del.value.length == del.value.indexOf('}') + 1 ? del.value.indexOf('}') : del.value.indexOf('}') + 1);

				// 내장 객체 뒤에 콤마가 있을 경우, 제거합니다.
				if (del.value.trim().indexOf(',') === 0) {
					del.value = del.value.slice(del.value.length == del.value.indexOf(',') + 1 ? del.value.indexOf(',') : del.value.indexOf(',') + 1);
				}
			} else {
				if (del.value.indexOf(',') === -1 &&
					del.value.indexOf('}') === -1) { // 최상위 객체의 마지막 프로퍼티인 경우
					obj[key] = del.value.substring(0, del.value.length);
				} else if (del.value.indexOf(',') > 0 &&
					(del.value.indexOf('}') === -1 ||
					del.value.indexOf(',') < del.value.indexOf('}'))) { // 동일 객체 내 프로퍼티인 경우
					obj[key] = del.value.substring(0, del.value.indexOf(','));

					del.value = del.value.slice(del.value.indexOf(',') + 1);
				} else { // 내장 객체의 마지막 프로퍼티인 경우
					obj[key] = del.value.substring(0, del.value.indexOf('}'));

					return obj;
				}
			}
		}

		return obj;
	}

	return toObject(dObj);
};

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

/**
 * Ha에서 다른 클래스들의 기본 클래스 역할을 합니다.
 * @type {*} Ha.Object
 */
Ha.Object = Ha.inherit(Object, function () {this.base();
	var events = {};

	/**
	 * 이벤트를 핸들러를 등록합니다.
	 * @param name 이벤트 타입
	 * @param handler 이벤트 핸들러
	 */
	this.addEventListener = function (name, handler) {
		if (!events.hasOwnProperty(name)) {
			events[name] = [];
		}

		events[name].push(handler);
	};

	/**
	 * 이벤트 핸들러를 제거합니다.
	 * @param name 이벤트 타입
	 * @param handler 이벤트 핸들러
	 */
	this.removeEventListener = function (name, handler) {
		if (!events.hasOwnProperty(name)) return;

		events[name].splice(events[name].indexOf(handler), 1);
	};

	/**
	 * 이벤트를 발생시킵니다.
	 * @param name 이벤트 타입
	 * @param detail 핸들러로 전달되는 인자
	 */
	this.trigger = function (name, detail) {
		if (!events.hasOwnProperty(name)) return;

		var event;

		// IE에서 'new CustomEvent'를 지원하지 않습니다.
		// 그래서, 예외 처리하여 문제가 될 경우(즉, IE일 경우) document.createEvent를 사용합니다.
		try {
			event = new CustomEvent('changed', {'detail': detail});
		} catch (e) {
			event = document.createEvent('CustomEvent');

			event.initCustomEvent('changed', false, true, detail);
		}

		var eventHandlers = events[name];

		for (var index = 0; index < eventHandlers.length; index++) {
			eventHandlers[index].apply(null, [event]);
		}
	};
});

/**
 * 미리 정의된 데이터 스키마를 토대로 만들어진 엔티티 개체를 말합니다.
 * 서버 측과 주고 받는 데이터를 정의하며, 뷰와도 연동되어 사용자와의 데이터 인터렉션 역할을 합니다.
 * @type {*} Ha.Entity
 */
Ha.Entity = Ha.inherit(Ha.Object, function Entity() {this.base();
	var thisArg = this;

	// Entity가 보유하는 스키마 정보에 대한 실제 데이터입니다.
	// Entity 객체의 다른 프로퍼티들과 섞이면 곤란하므로 따로 보관합니다.
	var properties = {};

	/**
	 * 변경된 프로퍼티 목록에서 중복되는 프로퍼티들을 걸러내어 최종 결과만을 얻습니다.
	 * @param changes observe에 의해 감지된 변경 사항 목록
	 * @param path 객체 프로퍼티의 경로
	 */
	var refineChanges = function refineChanges(changes, path) {
		var c = [];

		for (var index = 0; index < changes.length; index++) {
			var change = changes[index];

			// 변화가 일어난 객체가 배열이고 해당 변수의 배열의 길이를 나타내는 변수일 경우 무시합니다.
			if (change.object instanceof Array &&
				change.name === 'length') continue;

			c.push({'type': change.type, 'path': path, 'name': change.name, 'object': change.object});
		}

		return c;
	};

	var observed = [];

	/**
	 * 대상 객체의 변화를 감지합니다.
	 * @param target 대상 객체
	 * @param path 대상 객체의 경로
	 */
	function observing(target, path) {
		if (typeof target !== 'object') return false;

		function observe(changes) {
			changes.forEach(function(change) {
				switch (change.type) {
					case 'add':
						deeplyObserving(change.object[change.name],
							(path === undefined ? '' : path + '.') + change.name);

						break;

					case 'delete':
						if (!(change.object instanceof Array)) {
							Object.unobserve(change.object, observe);
						}

						break;
				}
			});

			thisArg.trigger('changed', refineChanges(changes, path));
		}

		if (observed.indexOf(path) === -1) {
			Object.observe(target, observe);

			observed.push(path);
		}
	}

	function deeplyObserving(obj, path) {
		if (typeof obj !== 'object') return;

		observing(obj, path);

		if (obj instanceof Array) return;

		for (var key in obj) {
			if (!obj.hasOwnProperty(key)) continue;

			var child = obj[key];

			deeplyObserving(child);
		}
	}

	observing(properties);

	this.get = function(path) {
		if (!path) return properties;

		var names = path.split('.'),
			obj = properties;

		for (var index = 0; index < names.length; index++) {
			var name = names[index];

			if (!obj.hasOwnProperty(name)) return undefined;

			obj = obj[name];
		}

		return obj;
	};

	this.set = function(path, value) {
		// 배열을 추가하는 동작은 push 메서드로만 지원합니다.
		if (value instanceof Array) return;

		var names = path.split('.'),
			obj = properties,
			pathPart = '';

		for (var index = 0; index < names.length - 1; index++) {
			var name = names[index];

			pathPart = pathPart === '' ? name : pathPart + '.' + name;

			if (!obj[name]) {
				obj[name] = {};

				observing(obj, pathPart);
			}

			obj = obj[name];
		}

		// string이나 number일 경우, 프로퍼티를 설정할 수 없으므로 Object로 만듭니다.(만약, 그렇게 되는 것이 싫을 경우 주석 처리해야 합니다.)
		if (typeof obj !== 'object') obj = {};

		obj[names[names.length - 1]] = value;
	};

	/**
	 * 이름에 해당하는 프로퍼티가 존재하는지 검사합니다.
	 * @param path 검사할 프로퍼티 경로
	 * @returns {boolean} 프로퍼티가 존재하면 true
	 */
	this.has = function(path) {
		var names = path.split('.'),
			obj = properties;

		for (var index = 0; index < names.length; index++) {
			var name = names[index];

			if (typeof obj !== 'object' || !obj.hasOwnProperty(name)) {
				return false;
			}

			obj = obj[name];
		}

		return true;
	};

	this.push = function(path, value) {
		var names = path.split('.'),
			obj = properties,
			pathPart = '';

		for (var index = 0; index < names.length - 1; index++) {
			var name = names[index];

			pathPart = pathPart === '' ? name : pathPart + '.' + name;

			if (obj[name]) {
				obj = obj[name];
			} else {
				obj = obj[name] = {};
				observing(obj, pathPart);
			}
		}

		if (obj[names[names.length - 1]]) {
			if (value instanceof Array) {
				obj[names[names.length - 1]] = Ha.unique(obj[names[names.length - 1]].concat(value));
			} else {
				obj[names[names.length - 1]].push(value);
			}
		} else {
			obj[names[names.length - 1]] = value instanceof Array ? value : [value];
		}
	};

	this.splice = function(path, value) {
		var arr = this.get(path);

		if (!(arr instanceof Array)) return;

		arr.splice(arr.indexOf(value), 1);
	};

	this.indexOf = function(path, value) {
		var arr = this.get(path);

		return arr instanceof Array ? arr.indexOf(value) : -1;
	};

	this.typeOf = function(path) {
		return typeof this.get(path);
	};

	this.isTypeOf = function(path, type) {
		return this.typeOf(path) === type;
	};

	this.instanceOf = function(path, instanceType) {
		return this.get(path) instanceof instanceType;
	};

	/**
	 * 엔티티 프로퍼티가 변경됐을 때 발생하는 이벤트를 정의합니다.
	 * @param func 엔티티 프로퍼티 변경 이벤트 함수
	 */
	this.changed = function (func) {
		this.addEventListener('changed', func);
	};

	this.toString = function () {
		return JSON.stringify(properties);
	};
});

/**
 * 실제 HTML DOM과 연결되어 엘리먼트나 폼 필드의 컨트롤 혹은 렌더링 등을 담당합니다.
 * @type {*} Ha.View
 */
Ha.View = Ha.inherit(Ha.Object, function View(element) {this.base();
	var this_ = this,
		el_ = element;

	/**
	 * 요소로부터 발생하는 이벤트를 뷰 이벤트로 발생시킵니다.
	 * @param eventType 이벤트 타입
	 * @param eventName 이벤트 이름
	 * @param element 이벤트 발생 요소
	 * @returns {Function} 이벤트 발생 시 실행될 핸들러
	 */
	function elementEventCallback(eventType, eventName, element) {
		return function(e) {
			this_.trigger('elementEvent', {'event': e, 'eventType': eventType, 'eventName': eventName, 'element': element});
		};
	}

	/**
	 * 요소들의 이벤트를 감시합니다.
	 */
	(function watchEvents() {
		Array.prototype.forEach.call(el_.querySelectorAll('[data-event]'), function(el) {
			var events = Ha.Json.toObject(el.getAttribute('data-event'));

			for (var eventType in events) {
				if (!events.hasOwnProperty(eventType)) continue;

				// 요소로부터 발생하는 이벤트를 감지합니다.
				el.addEventListener(eventType, elementEventCallback(eventType, events[eventType], el), false);
			}
		});
	})();

	/**
	 * 폼 필드들의 이벤트를 감시합니다.
	 */
	(function watchFormFields() {
		Array.prototype.forEach.call(el_.querySelectorAll('input'), function(input) { // Input
			switch (input.type) {
				case 'text':
					input.addEventListener('input', function() {
						this_.trigger('fieldValueChanged', {'name': input.name, 'value': input.value});
					});

					break;

				case 'radio':
					input.addEventListener('click', function() {
						this_.trigger('fieldValueChanged', {'name': input.name, 'value': input.value});
					});

					break;

				case 'checkbox':
					input.addEventListener('click', function() {
						if (input.checked) {
							this_.trigger('fieldValuePushed', {'name': input.name, 'value': input.value});
						} else {
							this_.trigger('fieldValueSpliced', {'name': input.name, 'value': input.value});
						}
					});

					break;
			}
		});

		Array.prototype.forEach.call(el_.querySelectorAll('select'), function(select) { // Select
			select.addEventListener('input', function () {
				this_.trigger('fieldValueChanged', {'name': select.name, 'value': select.value});
			});
		});

		Array.prototype.forEach.call(el_.querySelectorAll('textarea'), function(textarea) { // Textarea
			textarea.addEventListener('input', function() {
				this_.trigger('fieldValueChanged', {'name': textarea.name, 'value': textarea.value});
			});
		});
	})();

	/**
	 * 루프의 템플릿 맵입니다.
	 * @type {Map} Ha.Map
	 */
	var loopsMap_ = new Ha.Map();
	var LoopTemplateIdPrefix_ = 'loop_';
	var LoopTemplateIdSuffix_ = '_template';

	(function checkLoops() {
		var loops = el_.querySelectorAll('[data-loop]');

		for (var index = loops.length - 1; index >= 0; index--) {
			var el = loops.item(index);

			var tId = LoopTemplateIdPrefix_ + el.getAttribute('data-loop') + LoopTemplateIdSuffix_;
			var tEl = document.createElement('div');

			tEl.innerHTML = el.innerHTML;

			loopsMap_.set(tId, tEl);

			el.innerHTML = null;
		}
	})();

	/**
	 * 뷰의 지시자 맵입니다.
	 * @type {Map} Ha.Map
	 */
	var directivesMap_ = new Ha.Map(true);

	/**
	 * 뷰 내의 지시자들을 점검합니다. 유효한 지시자들은 맵에 담습니다.
	 */
	(function checkDirectives() {
		Array.prototype.forEach.call(el_.querySelectorAll('[data-directive]'), function(dEl) {
			var directives = Ha.Json.toObject(dEl.getAttribute('data-directive'));

			for (var directiveType in directives) {
				if (!directives.hasOwnProperty(directiveType)) continue;

				var directive = directives[directiveType];

				switch (directiveType) {
					case 'if':
					case 'ifnot':
					case 'css':
					case 'html': // Variable(Or Function)
						directivesMap_.set(directive, {'el': dEl, 'type': directiveType});

						break;

					case 'style':
					case 'attr': // Object(with Nested Function)
						for (var propName in directive) {
							if (!directive.hasOwnProperty(propName)) continue;

							directivesMap_.set(directive[propName], {'el': dEl, 'type': directiveType, 'prop': propName});
						}

						break;
				}
			}
		});
	})();

	/**
	 * 폼 필드에 값을 설정합니다.
	 * 이 메서드는 컨트롤러가 엔티티 프로퍼티 값의 변화를 감지했을 때 실행됩니다.
	 * @param name 프로퍼티명(동시에 폼 필드의 이름)
	 * @param value 폼 필드 값
	 */
	this.setFieldValue = function setFieldValue(name, value) {
		Array.prototype.forEach.call(el_.querySelectorAll('[name="' + name + '"]'), function(field) {
			switch (field.type) {
				case 'radio':
					field.checked = field.value === value;

					break;

				case 'checkbox':
					if (!(value instanceof Array)) {
						value = [value];
					}

					field.checked = value.some(function(item, index, array) {
						return item.toString() === field.value;
					});

					break;

				default :
					field.value = value;

					break;
			}
		});
	};

	/**
	 * 뷰 내의 텍스트 영역을 렌더링합니다.
	 * @param name 프로퍼티명
	 * @param value 렌더링할 텍스트
	 */
	this.renderText = function renderText(name, value) {
		Array.prototype.forEach.call(el_.querySelectorAll('[data-text*="{{' + name + '}}"]'), function (el) {
			el.textContent = el.getAttribute('data-text').replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
				if (name === substring) return value;
			});
		});
	};

	/**
	 * 지시자에 대해서 렌더링합니다.
	 * 지시자 별로 프로퍼티 값에 대한 사용법이 다릅니다.
	 * @param name 프로퍼티명.
	 * @param value 프로퍼티 값.
	 */
	this.renderForDirective = function renderForDirective(name, value) {
		if (!directivesMap_.has(name)) return;

		var directives = directivesMap_.get(name);

		directives.forEach(function(directive) {
			renderDirectiveItem(directive.type, directive.el, value, directive.prop);
		});
	};

	function renderDirectiveItem(type, el, value, name) {
		switch (type) {
			case 'if':
				el.style.display = value ? 'block' : 'none';

				break;

			case 'ifnot':
				el.style.display = value ? 'none' : 'block';

				break;

			case 'style':
				if (!el.style.hasOwnProperty(name)) return;

				el.style[name] = value;

				break;

			case 'css':
				// CSS 지시자에 대한 프로퍼티의 타입은 Array이며, 그렇지 않을 경우 Array로 캐스팅합니다.
				if (!(value instanceof Array)) {
					value = [value];
				}

				value.forEach(function(item) {
					if (!el.classList.contains(item)) {
						el.classList.add(item);
					}
				});

				break;

			case 'attr':
				el.setAttribute(name, value);

				break;

			case 'html':
				el.innerHTML = value;

				break;
		}
	}

	function renderLoopItem(item, name, templateEl) {
		var tempEl = document.createElement('div');

		tempEl.innerHTML = templateEl.innerHTML;

		for (var propName in item) {
			if (!item.hasOwnProperty(propName)) continue;

			var textEls = tempEl.querySelectorAll('[data-text*="{{' + propName + '}}"]');

			for (var index = 0; index < textEls.length; index++) {
				var textEl = textEls.item(index);

				textEl.textContent = textEl.getAttribute('data-text').replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
					if (propName === substring) return item[propName];
				});
			}
		}

		Array.prototype.forEach.call(tempEl.querySelectorAll('[data-directive]'), function(dEl) {
			var directives = Ha.Json.toObject(dEl.getAttribute('data-directive'));

			for (var type in directives) {
				if (!directives.hasOwnProperty(type)) continue;

				var directive = directives[type];

				switch (type) {
					case 'if':
					case 'ifnot':
					case 'css':
					case 'html': // Variable(Or Function)
						if (!item.hasOwnProperty(directive)) continue;

						renderDirectiveItem(type, dEl, item[directive]);

						break;

					case 'style':
					case 'attr': // Object(with Nested Function)
						for (var propName in directive) {
							if (!directive.hasOwnProperty(propName)) continue;

							if (!item.hasOwnProperty(directive[propName])) continue;

							renderDirectiveItem(type, dEl, item[directive[propName]], propName);
						}

						break;
				}
			}
		});

		return tempEl;
	}

	this.renderForLoop = function renderForLoop(name, value, lEl) {
		Array.prototype.forEach.call((lEl ? lEl : document).querySelectorAll('[data-loop="' + name + '"]'), function(el) {
			var tEl = loopsMap_.get(LoopTemplateIdPrefix_ + name + LoopTemplateIdSuffix_),
				renderedEl, propName;

			if (value instanceof Array) {
				value.forEach(function(item) {
					renderedEl = renderLoopItem.call(this_, item, name, tEl);

					for (propName in item) {
						if (!item.hasOwnProperty(propName)) continue;

						this_.renderForLoop(propName, item[propName], renderedEl);
					}

					el.innerHTML += renderedEl.innerHTML;
				});
			} else {
				renderedEl = renderLoopItem.call(this_, value, name, tEl);

				for (propName in value) {
					if (!value.hasOwnProperty(propName)) continue;

					this_.renderForLoop(propName, value[propName], renderedEl);
				}

				el.innerHTML += renderedEl.innerHTML;
			}
		});
	};

	/**
	 * Directive 목록과 처리 핸들러입니다.
	 */
	var directiveHandlers = {
		'template': function(element, template, obj) {
			//if (!template || !template.name || !template.foreach) return;
			//
			//var templateHtml = document.getElementById(template.name);
			//
			//if (templateHtml.children.length != 1) return;
			//
			//if (template.foreach.indexOf('->')) {
			//	subName = template.foreach.slice(template.foreach.indexOf('->') + 2);
			//	propName = template.foreach.substring(0, template.foreach.indexOf('->'));
			//}
			//
			//var property;
			//
			//if (!obj) property = controller.entity.get(propName);
			//else property = obj[propName];
			//
			//property.forEach(function(item) {
			//	var cloneElement = templateHtml[0].cloneNode(true);
			//
			//	for (var p in item) {
			//		renderText(cloneElement, subName + '.' + p);
			//	}
			//});
			//
			//element.appendChild();
			//
			//
			//
			//console.log(templateHtml);
		}
	};
});

/**
 * HTML DOM에서 발생되는 이벤트들의 동작 정의를 위한 통로 개체입니다.
 * @type {*} Ha.Controller
 */
Ha.Controller = Ha.inherit(Ha.Object, function Controller(name, settings) {this.base();
	var this_ = this;

	settings = Ha.extend({'events': {}, 'requests': []}, settings);

	this.entity = new Ha.Entity();

	this.view = new Ha.View(document.querySelector('[data-view="' + name + '"]'));

	this.entity.changed(function(e) {
		e.detail.forEach(function(change) {
			var path = '',
				name,value;

			if (change.path !== undefined) path = change.path;

			path += path === '' ? change.name : '.' + change.name;
			name = Ha.isNumber(change.name) ? change.path : path;

			value = this_.entity.get(path);

			this_.view.renderText(name, this_.entity.get(name));
			this_.view.renderForDirective(name, value);
			this_.view.renderForLoop(name, value);
			this_.view.setFieldValue(name, this_.entity.get(name));
		});
	});

	this.view.addEventListener('fieldValueChanged', function(e) {
		this_.entity.set(e.detail.name, e.detail.value);
	});

	this.view.addEventListener('fieldValuePushed', function(e) {
		this_.entity.push(e.detail.name, e.detail.value);
	});

	this.view.addEventListener('fieldValueSpliced', function(e) {
		this_.entity.splice(e.detail.name, e.detail.value);
	});

	this.view.addEventListener('elementEvent', function(e) {
		if (!settings.events.hasOwnProperty(e.detail.eventName)) return;

		settings.events[e.detail.eventName].apply(this_, [e.detail.event, e.detail.element]);
	});

	function makeRequestFunc(method, url, properties, response) {
		var m = method,
			u = url,
			p = properties,
			r = response;

		return function() {
			var xhr = new Ha.Xhr();

			if (r) {
				xhr.success(r);
				xhr.fail(r);
			}

			if (!xhr.hasOwnProperty(m)) return false;

			xhr[m].call(xhr, u, p);
		};
	}

	for (var index = 0; index < settings.requests.length; index++) {
		var request = settings.requests[index];

		if (!request.name ||
			!request.url ||
			!request.method) continue;

		if (this[request.name]) {
			throw 'Duplicated request name. => "' + request.name + '"';
		}

		this[request.name] = makeRequestFunc(request.method, request.url, request.properties, request.response);
	}

	if (settings.constructor &&
		settings.constructor instanceof Function) {
		settings.constructor.call(this);
	}
});

Ha.Xhr = Ha.inherit(Ha.Object, function Xhr() {this.base();
	var xhr = (function() {
		if (typeof XMLHttpRequest != 'undefined') {
			return new XMLHttpRequest();
		}

		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e) {}
		}

		return false;
	})();

	if (!xhr) {
		throw "Xhr can't use on your environment. :(";
	}

	xhr.onprogress = function(e) {

	};

	xhr.onerror = function(e) {

	};

	var successHandler = null;
	var failHandler = null;

	this.success = function(func) {
		successHandler = func;
	};
	this.fail = function(func) {
		failHandler = func;
	};

	this.request = function(method, url, data, requestHeaders) {
		xhr.open(method, url);

		for (var headerName in requestHeaders) {
			if (!requestHeaders.hasOwnProperty(headerName)) continue;

			xhr.setRequestHeader(headerName, requestHeaders[headerName]);
		}

		xhr.onreadystatechange = function(e) {
			if (xhr.readyState === 4) { // DONE
				if (xhr.status === 200 && successHandler) { // SUCCESS
					successHandler(xhr.response);
				} else if (failHandler) {
					failHandler();
				}
			}
		};

		if (typeof data === 'object') {
			xhr.send(JSON.stringify(data));
		} else {
			xhr.send();
		}
	};

	this.post = function(url, data) {
		this.request('POST',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.get = function(url, data) {
		this.request('GET',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.put = function(url, data) {
		this.request('PUT',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.delete = function(url, data) {
		this.request('DELETE',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};
});