Ha.Json = {};
Ha.Json.toObject = function(str) {
	var dObj = {value: str};

	function toObject(del) {
		var obj = {};

		if (del.value.trim().indexOf(',') === 0) {
			del.value = del.value.slice(del.value.indexOf(','));
		}

		var index;

		while ((index = del.value.indexOf(':')) > -1) {
			var key = del.value.substr(0, index).trim();

			del.value = del.value.slice(index + 1).trim();

			if (del.value.indexOf('{') === 0) { // 내장 객체의 분석을 시작합니다.
				// '{'을 잘라냅니다.
				del.value = del.value.slice(1);

				// 내장 객체를 가져옵니다.
				obj[key] = toObject(del);

				// 내장 객체에 해당하는 문자열을 제거합니다.
				del.value = del.value.slice(del.value.length == del.value.indexOf('}') + 1 ? del.value.indexOf('}') : del.value.indexOf('}') + 1);

				// 내장 객체 뒤에 콤마가 있을 경우, 제거합니다.
				if (del.value.trim().indexOf(',') === 0) {
					del.value = del.value.slice(del.value.length == del.value.indexOf(',') + 1 ? del.value.indexOf(',') : del.value.indexOf(',') + 1);
				}
			} else {
				if (del.value.indexOf(',') === -1 &&
					del.value.indexOf('}') === -1) { // 최상위 객체의 마지막 프로퍼티인 경우
					obj[key] = del.value.substring(0, del.value.length);
				} else if (del.value.indexOf(',') > 0 &&
					(del.value.indexOf('}') === -1 ||
					del.value.indexOf(',') < del.value.indexOf('}'))) { // 동일 객체 내 프로퍼티인 경우
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