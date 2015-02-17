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
						if (!controller.entity.instanceOf(inputField.name, Array)) {
							controller.entity.push(inputField.name, []);
						}

						if (inputField.checked) {
							controller.entity.push(inputField.name, inputField.value);
						} else {
							controller.entity.splice(inputField.name, inputField.value);
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
	 * @param key 엔티티 프로퍼티 키
	 */
	function renderTextElements(element, key) {
		var textElements = element.querySelectorAll('[data-text*="{{' + key + '}}"]');

		Array.prototype.forEach.call(textElements, function (element) {
			var dataTextAttr = element.getAttribute('data-text');

			element.textContent = dataTextAttr.replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
				if (!controller.entity.has(substring)) return;

				return controller.entity.get(substring);
			});
		});
	}

	/**
	 * Directive 목록과 처리 핸들러입니다.
	 */
	var directives = {
		'if': function(element, key) {
			element.style.display = controller.entity.get(key) ? 'block' : 'none';
		},
		'ifnot': function(element, key) {
			element.style.display = controller.entity.get(key) ? 'none' : 'block';
		},
		'style': function(element, style) {
			for (var styleName in style) {
				if (!style.hasOwnProperty(styleName)) continue;

				var propName = style[styleName];

				element.style[styleName] = controller.entity.get(propName);
			}
		},
		'css': function(element, css) {
			if (!(css instanceof Array)) {
				css = [css];
			}

			css.forEach(function(item) {
				if (!element.classList.contains(item)) {
					element.classList.add(item);
				}
			});
		},
		'attr': function(element, attrs) {
			for (var name in attrs) {
				if (!attrs.hasOwnProperty(name)) continue;

				var propName = attrs[name];

				element.setAttribute(name, controller.entity.get(propName));
			}
		},
		'html': function(element, name) {
			element.innerHTML = controller.entity.get(name);
		},
		'foreach': function(element, key) {
			var propName = key;
			var subName = '';

			if (propName.indexOf('->')) {
				subName = propName.slice(propName.indexOf('->') + 2);
				propName = propName.substring(0, propName.indexOf('->'));
			}

			var templateId = propName + '_template';
			var scriptElement = document.getElementById(templateId);

			if (!scriptElement) {
				scriptElement = document.createElement('script');

				scriptElement.setAttribute('id', templateId);
				scriptElement.setAttribute('type', 'text/html');

				scriptElement.innerHTML = element.innerHTML.trim();

				document.head.appendChild(scriptElement);
			}

			element.innerHTML = null;

			var property = controller.entity.get(propName);

			property = property instanceof Array ? property : [property];

			property.forEach(function(item) {
				element.innerHTML += renderForeachDirective(item, scriptElement.innerHTML, subName);

				watchEvents(element);

				for (var index = 0; index < element.children.length; index++) {
					var child = element.children[index];

					for (var prop in item) {
						renderDirectiveElements(child, item, prop);
					}
				}
			});
		}
	};

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

				if (!directives.hasOwnProperty(directiveType)) continue;

				directives[directiveType].call(thisArg, element, directiveBody);
			}
		});
	}

	function renderForeachDirective(obj, html, subName) {
		var tmpEl = document.createElement('div');

		tmpEl.innerHTML = html;

		//var elements = tmpEl.querySelectorAll('[data-text]');
		//
		//for (var index = 0; index < elements.length; index++) {
		//	var element = elements.item(index);
		//
		//	var dataTextAttr = element.getAttribute('data-text');
		//
		//	element.textContent = dataTextAttr.replace(/\{\{([\s\S]+?)}}/g, function (matched, substring) {
		//		if (substring.indexOf(subName + '.') === 0) {
		//			var propertyName = substring.slice(subName.length + 1);
		//
		//			if (obj.hasOwnProperty(propertyName)) {
		//				return obj[propertyName];
		//			}
		//		}
		//	});
		//}

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

					formField.checked = values.some(function(item, index, array) {
						return item.toString() === formField.value;
					});

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
		e.detail.forEach(function(path) {
			renderTextElements(entryElement, path);
			renderDirectiveElements(entryElement, path);
			changeFieldValue(path);
		});
	});
});