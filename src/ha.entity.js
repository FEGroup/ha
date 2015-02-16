/**
 * 미리 정의된 데이터 스키마를 토대로 만들어진 엔티티 개체를 말합니다.
 * 서버 측과 주고 받는 데이터를 정의하며, 뷰와도 연동되어 사용자와의 데이터 인터렉션 역할을 합니다.
 * @type {*} Ha.Entity
 */
Ha.Entity = Ha.inherit(Ha.Object, function Entity() {
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
		var c = [];

		for (var index = 0; index < changes.length; index++) {
			var change = changes[index];

			var propPath = (path === undefined ? '' : path + '.') + change.name;

			c.push(propPath);

			//c[propPath] = thisArg.get(propPath);

			//setByPath(c, propPath, getByPath(properties, propPath));
		}

		return c;
	};

	var observed = [];

	/**
	 * 대상 객체의 변화를 감지합니다.
	 * @param target 대상 객체
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

					case 'update':
						console.log('update observed', change);

						break;

					case 'delete':
						Object.unobserve(change.object, observe);

						break;
				}
			});

			thisArg.trigger('changed', refineChanges(changes, path));
		}

		//Object.unobserve(target, observe);

		if (observed.indexOf(path) === -1) {
			Object.observe(target, observe);

			observed.push(path);
		}
	}

	function deeplyObserving(obj, path) {
		if (typeof obj !== 'object') return;

		observing(obj, path);

		for (var key in obj) {
			if (!obj.hasOwnProperty(key)) continue;

			var child = obj[key];

			deeplyObserving(child);
		}
	}

	observing(properties);

	this.get = function(path) {
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
		var names = path.split('.'),
			obj = properties,
			pathPart = '';

		for (var index = 0; index < names.length - 1; index++) {
			var name = names[index];

			pathPart = pathPart === '' ? name : pathPart + '.' + name;

			if (obj[name]) {
				obj = obj[name];
			} else {
				obj[name] = {};
				observing(obj, pathPart);
			}
			//obj = obj[name] ?
			//	obj[name] : obj[name] = {}, observing(obj, pp);
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
	this.has = function (path) {
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