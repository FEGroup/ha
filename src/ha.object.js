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