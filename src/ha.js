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