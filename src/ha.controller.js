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