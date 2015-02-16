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