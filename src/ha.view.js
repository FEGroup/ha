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