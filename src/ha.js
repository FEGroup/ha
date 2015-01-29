/**
 * ha(刃, edge) - the tempered cutting edge of a blade. The side opposite the mune. Also called hasaki (刃先).
 */

(function (platform, entry) {
	platform.Ha = entry();

	document.addEventListener('DOMContentLoaded', function () {
		var a = document.querySelectorAll('[data-view]');

		console.log(a);
	});
}(this, function () {
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
		source || (source = {});

		if (arguments.length <= 1) return source;

		for (var index = 1; index < arguments.length; index++) {
			var target = arguments[index];

			for (var prop in target) {
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
		source || (source = {});

		if (arguments.length <= 1) return source;

		for (var index = 1; index < arguments.length; index++) {
			var target = arguments[index];

			for (var prop in target) {
				if (typeof target[prop] == 'function') {

					source[prop] = target[prop];
				}
			}
		}

		return source;
	};

	/**
	 * 클래스를 상속합니다.
	 * @param parent 상위 클래스
	 * @param child 하위 클래스
	 * @returns {*} 하위 클래스
	 */
	Ha.inherit = function inherit(parent, child) {
		var parent = parent;
		var child = child;

		// 상위 클래스의 정의들을 하위 클래스에 부여하기 위해서, 하위 클래스의 프로토타입을 상위 클래스로 정의합니다.
		child.prototype = new parent();
		child.prototype.constructor = parent;

		/**
		 * 상위 클래스의 생성자를 실행합니다.
		 * 하위 클래스가 생성될 때 호출되어야 합니다.
		 */
		child.prototype.base = function () {
			// 상위 클래스의 생성자를 인자 목록과 함께 실행합니다. 이렇게 하는 이유는 상속 당시에 상위 클래스의 정의를 받지만, 정작 인스턴스를 생성할 때에는 인자를 넘기지 못하기 때문입니다.
			this.__super__ = new (Function.prototype.bind.apply(parent, arguments))();

			this.__super__.constructor.apply(this.__super__, arguments);
		};

		return child;
	};

	/**
	 * Ha에서 다른 클래스들의 기본 클래스 역할을 합니다.
	 * @type {*} Ha.Object
	 */
	Ha.Object = Ha.inherit(Object, function () {
		this.base();

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
		 * @param args 핸들러로 전달되는 인자
		 */
		this.fireEvent = function (name, args) {
			if (!events.hasOwnProperty(name)) return;

			if (!args || !args.length) {
				args = [];
			}

			var eventHandlers = events[name];

			for (var index = 0; index < eventHandlers.length; index++) {
				eventHandlers[index].apply(null, args);
			}
		}
	});

	/**
	 * Ha에서 말하는 Entity란 데이터 스키마를 말합니다.
	 * 서버 측과 주고 받는 데이터 낱개 단위의 정의를 하며, 뷰와도 연동되어 사용자와의 데이터 인터렉션의 개체 역할을 합니다.
	 * @type {*} Ha.Entity
	 */
	Ha.Entity = Ha.inherit(Ha.Object, function (schemes, properties) {
		this.base();

		var thisArg = this;

		// 스키마는 프로퍼티 이름과 타입의 쌍으로 이루어져야 합니다.
		// 타입은 number, string, boolean, object를 지원합니다.
		// 기본값(빈값)은 각각 0, '', false로 설정됩니다.
		var schemes = Ha.extend({}, schemes);

		// Entity가 보유하는 스키마 정보에 대한 실제 데이터입니다.
		// Entity 객체의 다른 프로퍼티들과 섞이면 곤란하므로 따로 보관합니다.
		var properties = {};

		/**
		 * 프로퍼티를 초기화합니다.
		 */
		var initProperties = function initProperties() {
			for (var schemeName in schemes) {
				var schemeType = schemes[schemeName];

				switch (schemeType) {
					case 'array':
						properties[schemeName] = [];

						break;
					case 'number':
						properties[schemeName] = 0;

						break;
					case 'boolean':
						properties[schemeName] = false;

						break;
					case 'string':
					default:
						properties[schemeName] = '';

						break;
				}
			}
		}();

		/**
		 * 변경된 프로퍼티 목록에서 중복되는 프로퍼티들을 걸러내어 최종 결과만을 얻습니다.
		 * @param changes observe에 의해 감지된 변경 사항 목록
		 */
		var refineChanges = function refineChanges(changes, path) {
			var c = {};

			for (var index = 0; index < changes.length; index++) {
				var change = changes[index];

				var propPath = (path == undefined ? '' : path + '.') + change.name;

				setByPath(c, propPath, getByPath(properties, propPath));
			}

			return c;
		};

		/**
		 * 프로퍼티 데이터가 변경되면 이벤트를 발생시킵니다.
		 * @param thisArg Entity 인스턴스
		 * @param changes 변경 사항 목록
		 */
		var dispatchChangedEvent = function (thisArg, changes) {
			var event;

			// IE에서 'new CustomEvent'를 지원하지 않습니다.
			// 그래서, 예외 처리하여 문제가 될 경우(즉, IE일 경우) document.createEvent를 사용합니다.
			try {
				event = new CustomEvent('changed', {'detail': changes});
			} catch (e) {
				event = document.createEvent('CustomEvent');

				event.initCustomEvent('changed', false, true, changes);
			}

			thisArg.fireEvent('changed', [event]);
		};

		(function observing(target, path) {
			if (typeof target !== 'object') return;

			Object.observe(target, function (changes) {
				dispatchChangedEvent(thisArg, refineChanges(changes, path));
			});

			for (var prop in target) {
				observing(target[prop], (path == undefined ? '' : path + '.') + prop);
			}
		})(properties);

		this.getSchemeNames = function getSchemeNames() {
			var schemeNames = [];

			for (var key in schemes) {
				schemeNames.push(key);
			}

			return schemeNames;
		};

		var getByPath = function getByPath(target, path) {
			var pathParts = path.split('.');
			var current = target;

			for (var index = 0; index < pathParts.length; index++) {
				var part = pathParts[index];

				if (current[part] == undefined) return undefined;
				else current = current[part];
			}

			return current;
		};

		/**
		 * 프로퍼티 이름에 해당하는 데이터 값을 가져옵니다.
		 * @param name 프로퍼티 이름(혹은 경로)
		 * @returns {*} 데이터 값 혹은 객체, 없으면 undefined
		 */
		this.get = function (name) {
			return getByPath(properties, name);
		};

		var setByPath = function setByPath(target, path, value) {
			var pathParts = path.split('.');
			var current = target;

			for (var index = 0; index < pathParts.length; index++) {
				var part = pathParts[index];

				if (pathParts.length == index + 1) {
					current[part] = value;
				} else {
					current[part] = {};

					current = current[part];
				}
			}
		};

		/**
		 * 프로퍼티 값을 목록에 추가합니다.
		 * 인자가 1개일 경우, 프로퍼티 전체를 대상으로 추가 혹은 수정하고
		 * 인자가 2개일 경우, 이름에 해당되는 값을 설정합니다.
		 * 그 외에는 모두 무시됩니다.
		 */
		this.set = function () {
			if (arguments.length == 1 && typeof arguments[0] == 'object') {
				Ha.extend(properties, arguments[0]);
			} else if (arguments.length == 2) {
				var name = arguments[0];
				var value = arguments[1];

				properties[name] = value;
			}
		};

		/**
		 * 이름에 해당하는 프로퍼티가 존재하는지 검사합니다.
		 * @param name 검사할 프로퍼티 이름
		 * @returns {boolean} 프로퍼티가 존재하면 true
		 */
		this.has = function (name) {
			return properties.hasOwnProperty(name);
		};

		/**
		 * 이름에 해당하는 프로퍼티의 스키마 타입을 가져옵니다.
		 * @param name 프로퍼티 이름
		 * @returns {*} 프로퍼티 스키마 타입
		 */
		this.getSchemaType = function (name) {
			return schemes[name];
		};

		this.changed = function (func) {
			this.addEventListener('changed', func);
		}

		this.toString = function () {
			return JSON.stringify(this.properties);
		};
	});

	Ha.EntitySet = Ha.inherit(Array, function EntitySet(entity) {
		var entity = entity;


	});

	Ha.View = Ha.inherit(Ha.Object, function View(element) {
		this.base();

		var thisArg = this;

		// 뷰의 상위 뷰입니다.
		var parent;

		// 뷰의 하위 뷰들입니다.
		var children;

		// 뷰에 포함되는 최상위 HTML 엘리먼트입니다.
		var entryElement = element;

		this.viewName = entryElement.getAttribute('data-view');

		// 뷰와 관계되는 entity 객체입니다.
		var entity = function buildEntity() {
			var entityName = entryElement.hasAttribute('data-entity');

			if (!entityName) return;

			var script = document.querySelector('#' + entryElement.getAttribute('data-entity'));

			// TODO Entity JSON을 위한 script를 찾지 못할 경우 어떻게 해야 할까요?
			if (script) {

			}

			return new Ha.Entity(JSON.parse(script.innerHTML));
		}();

		(function watchFormFields() {
			var inputFields = entryElement.querySelectorAll('input');

			Array.prototype.forEach.call(inputFields, function(inputField) {
				inputField.addEventListener('input', function(e) {
					if (!entity.has(inputField.name)) return;

					entity.set(inputField.name, inputField.value);
				});
			});

			var selectFields = entryElement.querySelectorAll('select');

			Array.prototype.forEach.call(selectFields, function(selectField) {
				selectField.addEventListener('input', function (e) {
					if (!entity.has(selectField.name)) return;

					entity.set(selectField.name, selectField.value);
				});
			});

			var textAreaFields = entryElement.querySelectorAll('textarea');

			Array.prototype.forEach.call(textAreaFields, function(textareaField) {
				textareaField.addEventListener('input', function(e) {
					if (!entity.has(textareaField.name)) return;

					entity.set(textareaField.name, textareaField.value);
				});
			});
		})();

		/**
		 * 텍스트 엘리먼트를 엔티티에 맞게 렌더링합니다.
		 * @param key 엔티티 프로퍼티 키
		 */
		function renderTextElements(key) {
			var textElements = entryElement.querySelectorAll('[data-text$="{{' + key + '}}"]');

			Array.prototype.forEach.call(textElements, function (element) {
				var dataTextAttr = element.getAttribute('data-text');

				element.textContent = dataTextAttr.replace(/\{\{([\s\S]+?)\}\}/g, function (matched, substring) {
					if (!entity.has(substring)) return;

					return entity.get(substring);
				});
			});
		}

		/**
		 * 디렉티브 엘리먼트를 엔티티에 맞게 렌더링합니다.
		 * @param key 엔티티 프로퍼티 키
		 */
		function renderDirectiveElements(key) {
			var directiveElements = entryElement.querySelectorAll('[data-directive*="' + key + '"]');

			Array.prototype.forEach.call(directiveElements, function (element) {
				var dataDirectiveAttr = element.getAttribute('data-directive').replace(/[a-z|A-Z|0-9|-]+/g, '"$&"');

				dataDirectiveAttr = '{' + dataDirectiveAttr + '}';

				var directiveObject = JSON.parse(dataDirectiveAttr);

				for (var directiveType in directiveObject) {
					var directiveBody = directiveObject[directiveType];
					var propertyName;

					switch (directiveType) {
						case 'if':
							if (!entity.has(directiveBody)) return;

							element.style.display = entity.get(directiveBody) ? 'block' : 'none';

							break;

						case 'ifnot':
							if (!entity.has(directiveBody)) return;

							element.style.display = entity.get(directiveBody) ? 'none' : 'block';

							break;

						case 'style':
							for (var styleName in directiveBody) {
								propertyName = directiveBody[styleName];

								if (!entity.has(propertyName)) continue;

								element.style[styleName] = entity.get(propertyName);
							}

							break;

						case 'css':
							if (!(directiveBody instanceof Array)) {
								directiveBody = [directiveBody];
							}

							directiveBody.forEach(function(item) {
								if (!element.classList.contains(item)) {
									element.classList.add(item);
								}
							});

							break;

						case 'attr':
							for (var attributeName in directiveBody) {
								propertyName = directiveBody[attributeName];

								if (!entity.has(propertyName)) continue;

								element.setAttribute(attributeName, entity.get(propertyName));
							}

							break;

						case 'html':
							if (!entity.has(directiveBody)) return;

							element.innerHTML = entity.get(directiveBody);

							break;
					}
				}
			});
		}

		function changeFieldValue(key) {
			var formFields = entryElement.querySelectorAll('[name="' + key + '"]');

			Array.prototype.forEach.call(formFields, function(formField) {
				formField.value = entity.get(key);
			});
		}

		entity.changed(function (e) {
			var schemeNames = entity.getSchemeNames();

			schemeNames.forEach(function (key) {
				renderTextElements(key);
				renderDirectiveElements(key);
				changeFieldValue(key);
			});
		});

		entity.set('name', 'alice');
		entity.set('enabled', false);
		entity.set('align', 'center');
		entity.set('id', 'real');
		entity.set('css', 'fake');
		entity.set('backgroundColor', 'red');
		entity.set('fontSize', '50px');
		entity.set('htmlString', '<h1>HTML String</h1>');
	});

	var haViews = {};

	(function searchView() {
		var viewElements = document.querySelectorAll('[data-view]');

		for (var index = 0; index < viewElements.length; index++) {
			var viewElement = viewElements.item(index);

			var view = new Ha.View(viewElement);

			haViews[view.viewName] = view;
		}
	})();

	Ha.getView = function (name) {
		return haViews[name];
	};

	return Ha;
}));