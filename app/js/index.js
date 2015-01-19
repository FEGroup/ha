(function(window) {
	var a = new Ha.Entity({'name': 'string'});
	var b = new Ha.Entity({'name': 'string'});
	var c = new Ha.Entity({'name': 'string'});
	var d = new Ha.Entity({'name': 'string'});

	a.changed = function(e) {
		console.log(e);
	};

	a.set('testName1', 'testValue1');
	a.set('testName2', 'testValue2');

	a.set({
		'testName1': 'testValue1_',
		'testName2': 'testValue2_'
	});

	console.log(a.get('testName1'));
}(window));