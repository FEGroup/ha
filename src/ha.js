/**
* ha(刃, edge) - the tempered cutting edge of a blade. The side opposite the mune. Also called hasaki (刃先).
*/

(function(platform, entry) {
	platform.Ha = entry();

	document.addEventListener('DOMContentLoaded', function () {

	});
}(this, function() {
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
			// 상속 당시에 설정된 상위 클래스의 정의들을 잠시 복사해둡니다.
			var temp = this.__proto__;

			// 상위 클래스의 생성자를 인자 목록과 함께 실행합니다. 이렇게 하는 이유는 상속 당시에 상위 클래스의 정의를 받지만, 정작 인스턴스를 생성할 때에는 인자를 넘기지 못하기 때문입니다.
			this.__proto__ = new (parent.bind.apply(parent, arguments))();

			// 상위 클래스의 인스턴스를 인자와 함께 만든 뒤에는 상속 당시에 부여된 상위 클래스들의 정의를 복사해줍니다.
			extendFunction(this.__proto__, temp);

			this.__proto__.constructor.apply(this.__proto__, arguments);
		};

		return child;
	};

	Ha.Event = Ha.inherit(Object, function (type) {

	});

	/**
	 * Ha에서 말하는 Entity란 데이터 스키마를 말합니다.
	 * 서버 측과 주고 받는 데이터 낱개 단위의 정의를 하며, 뷰와도 연동되어 사용자와의 데이터 인터렉션의 개체 역할을 합니다.
	 * @type {*} Ha.Entity
	 */
	Ha.Entity = Ha.inherit(Object, function (schemes, properties) {
		// Entity의 데이터 스키마 정보로 필수 인자입니다.
		if (!schemes) {
			throw '/Ha/ The entity should need owns schemes. Please define schemes for your entity.';
		}

		var thisArg = this;

		// 스키마는 프로퍼티 이름과 타입의 쌍으로 이루어져야 합니다.
		// 타입은 number, string, boolean, object를 지원합니다.
		// 기본값(빈값)은 각각 0, '', false로 설정됩니다.
		var schemes = schemes;

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
		var refineChanges = function refineChanges(changes) {
			var c = {};

			for (var index = 0; index < changes.length; index++) {
				var change = changes[index];

				c[change.name] = properties[change.name];
			}

			return c;
		};

		/**
		 * 프로퍼티 데이터가 변경되면 이벤트를 발생시킵니다.
		 * @param thisArg Entity 인스턴스
		 * @param changes 변경 사항 목록
		 */
		var dispatchChangedEvent = function(thisArg, changes) {
			var event = new CustomEvent('changed', changes);

			thisArg.changed(event);
		};

		// 프로퍼티에 대해서 observer를 등록합니다.
		Object.observe(properties, function(changes) {
			dispatchChangedEvent(thisArg, refineChanges(changes));
		});

		/**
		 * 프로퍼티 이름에 해당하는 데이터 값을 가져옵니다.
		 * @param name 프로퍼티 이름
		 * @returns {*} 데이터 값 혹은 객체, 없으면 undefined
		 */
		this.get = function (name) {
			return properties[name];
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

				if (properties.hasOwnProperty(name)) return;

				properties[name] = value;
			}
		};

		this.toString = function () {
			return JSON.stringify(this.properties);
		};
	});

	Ha.EntitySet = Ha.inherit(Array, function (entity) {
		var entity = entity;


	});

	Ha.View = Ha.inherit(Object, function (selector, entity) {
		// 뷰의 상위 뷰입니다.
		var parent;

		// 뷰의 하위 뷰들입니다.
		var children;

		var entity = entity;
		var entityInstance = new entity();

		var viewName = '';

		// 뷰에 포함되는 최상위 HTML 엘리먼트입니다.
		var entryElement = document.querySelector(selector);

		var components = [];
	});

	return Ha;
}));