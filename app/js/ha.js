"use strict";

/**
 * ha(刃, edge) - the tempered cutting edge of a blade. The side opposite the mune. Also called hasaki (刃先).
 */
(function (platform, entry) {
	platform.Ha = entry();
}(window, function () {
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
		source || (source = {});

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
		var parent = p;
		var child = c;

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

	Ha.Json = {};
	Ha.Json.toObject = function(str) {
		var dObj = {value: str};

		function toObject(del) {
			var obj = {};

			if (del.value.trim().indexOf(',') == 0) {
				del.value = del.value.slice(del.value.indexOf(','));
			}

			var index;

			while ((index = del.value.indexOf(':')) > -1) {
				var key = del.value.substr(0, index).trim();

				del.value = del.value.slice(index + 1).trim();

				if (del.value.indexOf('{') == 0) { // 내장 객체의 분석을 시작합니다.
					// '{'을 잘라냅니다.
					del.value = del.value.slice(1);

					// 내장 객체를 가져옵니다.
					obj[key] = toObject(del);

					// 내장 객체에 해당하는 문자열을 제거합니다.
					del.value = del.value.slice(del.value.length == del.value.indexOf('}') + 1 ? del.value.indexOf('}') : del.value.indexOf('}') + 1);

					// 내장 객체 뒤에 콤마가 있을 경우, 제거합니다.
					if (del.value.trim().indexOf(',') == 0) {
						del.value = del.value.slice(del.value.length == del.value.indexOf(',') + 1 ? del.value.indexOf(',') : del.value.indexOf(',') + 1);
					}
				} else {
					if (del.value.indexOf(',') == -1 &&
						del.value.indexOf('}') == -1) { // 최상위 객체의 마지막 프로퍼티인 경우
						obj[key] = del.value.substring(0, del.value.length);
					} else if (del.value.indexOf(',') > 0 &&
						del.value.indexOf(',') < del.value.indexOf('}')) { // 동일 객체 내 프로퍼티인 경우
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
	 * 미리 정의된 데이터 스키마를 토대로 만들어진 엔티티 개체를 말합니다.
	 * 서버 측과 주고 받는 데이터를 정의하며, 뷰와도 연동되어 사용자와의 데이터 인터렉션 역할을 합니다.
	 * @type {*} Ha.Entity
	 */
	Ha.Entity = Ha.inherit(Ha.Object, function () {
		this.base();

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

		/**
		 * 대상 객체의 변화를 감지합니다.
		 * @param target 대상 객체
		 * @param path 프로퍼티 경로
		 */
		function observing(target, path) {
			if (typeof target !== 'object') return;

			function observe(changes) {
				dispatchChangedEvent(thisArg, refineChanges(changes, path));
			}

			Object.unobserve(target, observe);

			Object.observe(target, observe);

			for (var prop in target) {
				if (!target.hasOwnProperty(prop)) continue;

				observing(target[prop], (path == undefined ? '' : path + '.') + prop);
			}
		}

		observing(properties);

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
				properties[arguments[0]] = arguments[1];

				if (arguments[1] instanceof Array) {
					observing(properties);
				}
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
		 * 엔티티 프로퍼티가 변경됐을 때 발생하는 이벤트를 정의합니다.
		 * @param func 엔티티 프로퍼티 변경 이벤트 함수
		 */
		this.changed = function (func) {
			this.addEventListener('changed', func);
		};

		this.toString = function () {
			return JSON.stringify(this.properties);
		};
	});

	/**
	 * 실제 HTML DOM과 연결되어 엘리먼트나 폼 필드의 컨트롤 혹은 렌더링 등을 담당합니다.
	 * @type {*} Ha.View
	 */
	Ha.View = Ha.inherit(Ha.Object, function View(viewName, ctrl) {
		this.base();

		var thisArg = this;

		this.name = viewName;

		// 뷰에 포함되는 최상위 HTML 엘리먼트입니다.
		var entryElement = document.querySelector('[data-view="' + this.name + '"]');

		if (!entryElement) {
			console.error('View \'' + this.name + '\' is not exist.\nPlease check the view name.');

			return false;
		}

		var controller = ctrl;

		function elementEventCallback(eventFuncName, element) {
			return function(e) {
				var parameters = [e, controller.entity, controller];

				controller[eventFuncName].apply(element, parameters);
			};
		}

		function watchEvents(element) {
			var eventElements = element.querySelectorAll('[data-event]');

			Array.prototype.forEach.call(eventElements, function(element) {
				var dataEventAttr = element.getAttribute('data-event').replace(/[a-z|A-Z|0-9|-]+/g, '"$&"');

				dataEventAttr = '{' + dataEventAttr + '}';

				var dataEventObject = JSON.parse(dataEventAttr);

				for (var eventType in dataEventObject) {
					if (!dataEventObject.hasOwnProperty(eventType)) continue;

					var eventFuncName = dataEventObject[eventType];

					var eventFunc = controller[eventFuncName];

					if (!eventFunc || typeof eventFunc !== 'function') return;

					element.addEventListener(eventType, elementEventCallback(eventFuncName, element), false);
				}
			});
		}

		watchEvents(entryElement);

		/**
		 * 폼 필드로부터 엔티티 프로퍼티를 연결합니다.
		 */
		(function watchFormFields() {
			var inputFields = entryElement.querySelectorAll('input');

			Array.prototype.forEach.call(inputFields, function(inputField) {
				switch (inputField.type) {
					case 'text':
						inputField.addEventListener('input', function() {
							controller.entity.set(inputField.name, inputField.value);
						});

						break;

					case 'radio':
						inputField.addEventListener('click', function() {
							controller.entity.set(inputField.name, inputField.value);
						});

						break;

					case 'checkbox':
						inputField.addEventListener('click', function() {
							var values = controller.entity.get(inputField.name);

							if (!(values instanceof Array)) {
								values = [];
								controller.entity.set(inputField.name, values);
							}

							if (inputField.checked) {
								values.push(inputField.value);
							} else {
								var index =  0;

								for (; index < values.length; index++) {
									if (values[index].toString() === inputField.value) {
										break;
									}
								}

								values.splice(index, 1);
							}
						});

						break;
				}
			});

			var selectFields = entryElement.querySelectorAll('select');

			Array.prototype.forEach.call(selectFields, function(selectField) {
				selectField.addEventListener('input', function () {
					controller.entity.set(selectField.name, selectField.value);
				});
			});

			var textAreaFields = entryElement.querySelectorAll('textarea');

			Array.prototype.forEach.call(textAreaFields, function(textareaField) {
				textareaField.addEventListener('input', function() {
					controller.entity.set(textareaField.name, textareaField.value);
				});
			});
		})();

		/**
		 * 텍스트 엘리먼트를 엔티티에 맞게 렌더링합니다.
		 * @param element 텍스트 렌더링의 대상이 되는 최상위 엘리먼트
		 * @param obj 엔티티 오브젝트
		 * @param key 엔티티 프로퍼티 키
		 */
		function renderTextElements(element, obj, key) {
			var textElements = element.querySelectorAll('[data-text*="{{' + key + '}}"]');

			Array.prototype.forEach.call(textElements, function (element) {
				var dataTextAttr = element.getAttribute('data-text');

				element.textContent = dataTextAttr.replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
					if (!obj.hasOwnProperty(substring)) return;

					return obj[substring];

					//if (!controller.entity.has(substring)) return;
					//
					//return controller.entity.get(substring);
				});
			});
		}

		/**
		 * 디렉티브 엘리먼트를 엔티티에 맞게 렌더링합니다.
		 * @param element 디렉티브 렌더링의 대상이 되는 최상위 엘리먼트
		 * @param key 엔티티 프로퍼티 키
		 */
		function renderDirectiveElements(element, key) {
			var directiveElements = element.querySelectorAll('[data-directive*="' + key + '"]');

			Array.prototype.forEach.call(directiveElements, function (element) {
				var directiveObject = Ha.Json.toObject(element.getAttribute('data-directive'));

				for (var directiveType in directiveObject) {
					if (!directiveObject.hasOwnProperty(directiveType)) continue;

					var directiveBody = directiveObject[directiveType];
					var propertyName;

					switch (directiveType) {
						case 'if':
							element.style.display = controller.entity.get(directiveBody) ? 'block' : 'none';

							break;

						case 'ifnot':
							element.style.display = controller.entity.get(directiveBody) ? 'none' : 'block';

							break;

						case 'style':
							for (var styleName in directiveBody) {
								if (!directiveBody.hasOwnProperty(styleName)) continue;

								propertyName = directiveBody[styleName];

								element.style[styleName] = controller.entity.get(propertyName);
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
								if (!directiveBody.hasOwnProperty(attributeName)) continue;

								propertyName = directiveBody[attributeName];

								element.setAttribute(attributeName, controller.entity.get(propertyName));
							}

							break;

						case 'html':
							element.innerHTML = controller.entity.get(directiveBody);

							break;

						case 'foreach':
							propertyName = directiveBody;
							var subName = '';

							if (propertyName.indexOf('->')) {
								subName = propertyName.slice(propertyName.indexOf('->') + 2);
								propertyName = propertyName.substring(0, propertyName.indexOf('->'));
							}

							var templateId = propertyName + '_template';
							var scriptElement = document.getElementById(templateId);

							if (!scriptElement) {
								scriptElement = document.createElement('script');

								scriptElement.setAttribute('id', templateId);
								scriptElement.setAttribute('type', 'text/html');

								scriptElement.innerHTML = element.innerHTML.trim();

								document.head.appendChild(scriptElement);
							}

							element.innerHTML = null;

							var property = controller.entity.get(propertyName);

							property = property instanceof Array ? property : [property];

							property.forEach(function(item) {
								element.innerHTML += renderForeachDirective(item, scriptElement.innerHTML, subName);

								watchEvents(element);
							});

							break;
					}
				}
			});
		}

		function renderForeachDirective(obj, html, subName) {
			var tmpEl = document.createElement('div');

			tmpEl.innerHTML = html;

			var elements = tmpEl.querySelectorAll('[data-text]');

			for (var index = 0; index < elements.length; index++) {
				var element = elements.item(index);

				var dataTextAttr = element.getAttribute('data-text');

				element.textContent = dataTextAttr.replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
					if (substring.indexOf(subName + '.') === 0) {
						var propertyName = substring.slice(subName.length + 1);

						if (obj.hasOwnProperty(propertyName)) {
							return obj[propertyName];
						}
					}
				});
			}

			return tmpEl.innerHTML;
		}

		/**
		 * 엔티티에서 변경된 값을 폼 필드에 반영합니다.
		 * @param key 엔티티 프로퍼티 키
		 */
		function changeFieldValue(key) {
			var formFields = entryElement.querySelectorAll('[name="' + key + '"]');

			Array.prototype.forEach.call(formFields, function(formField) {
				switch (formField.type) {
					case 'radio':
						if (formField.value === controller.entity.get(key)) {
							formField.checked = true;
						}

						break;

					case 'checkbox':
						var values = controller.entity.get(key);

						if (!(values instanceof Array)) return;

						var a = values.some(function(item, index, array) {
							return item.toString() === formField.value;
						});

						formField.checked = a;

						break;

					default :
						formField.value = controller.entity.get(key);

						break;
				}
			});
		}

		/**
		 * 엔티티의 속성 값이 변경됐을 때 발생합니다.
		 */
		controller.entity.changed(function(e) {
			for (var key in e.detail) {
				if (!e.detail.hasOwnProperty(key)) continue;

				renderTextElements(entryElement, controller.entity, key);
				renderDirectiveElements(entryElement, key);
				changeFieldValue(key);
			}
		});
	});

	/**
	 * HTML DOM에서 발생되는 이벤트들의 동작 정의를 위한 통로 개체입니다.
	 * @type {*} Ha.Controller
	 */
	Ha.Controller = Ha.inherit(Ha.Object, function Controller(name, settings) {
		this.base();

		settings = Ha.extend({'events': {}, 'requests': []}, settings);

		this.entity = new Ha.Entity();

		Ha.extend(this, settings.events);

		this.view = new Ha.View(name, this);

		function makeRequestFunc(method, url, properties, response) {
			var m = method,
				u = url,
				p = properties,
				r = response;

			return function() {
				var xhr = new Ha.Xhr();

				xhr.success(r);

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

	Ha.Xhr = Ha.inherit(Ha.Object, function Xhr() {
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
			)
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

	return Ha;
}));