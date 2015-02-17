describe('When a property value set,', function() {
	it('it\'s result equals the value got from the entity.', function() {
		var entity = new Ha.Entity();

		entity.set('a.b', '1');

		expect(entity.get('a.b')).toEqual('1');
	});

	it('the entity must have the property.', function() {
		var entity = new Ha.Entity();

		entity.set('a.b', '1');

		expect(entity.has('a.b')).toEqual(true);
	});

	it('the set value\'s type equals entity\'s property value.', function() {
		var entity = new Ha.Entity();

		entity.set('test.a', '1');
		entity.set('test.b', 1);
		entity.set('test.c', true);
		entity.set('test.d', {});

		expect(entity.typeOf('test.a')).toEqual('string');
		expect(entity.typeOf('test.b')).toEqual('number');
		expect(entity.typeOf('test.c')).toEqual('boolean');
		expect(entity.typeOf('test.d')).toEqual('object');
	});

	it('the set value\'s instance equals the entity\'s property instance.', function() {
		var entity = new Ha.Entity();

		entity.set('test.a', {});
		entity.push('test.b', 1);

		expect(entity.instanceOf('test.a', Object)).toEqual(true);
		expect(entity.instanceOf('test.b', Array)).toEqual(true);
	});
});

describe('There is a property as an array. ', function() {
	it('We can push a value into the array property.', function() {
		var entity = new Ha.Entity();

		entity.push('a.b', 1);

		expect(entity.get('a.b.0')).toEqual(1);
	});

	it('We can find a position of some value in the array property.', function() {
		var entity = new Ha.Entity();

		entity.push('a.b', [1,2,3,4,5]);

		expect(entity.indexOf('a.b', 3)).toEqual(2);
	});

	it('If a value is pushed into the object property, return false.', function() {
		var entity = new Ha.Entity();

		entity.set('a.b', {});

		expect(entity.push('a.b', 1)).toEqual(false);
	});

	it('If the array property spliced for some value, that value removed.', function() {
		var entity = new Ha.Entity();

		entity.push('a.b', [1,2,3,4,5]);

		entity.splice('a.b', 3);

		expect(entity.indexOf('a.b', 3)).toEqual(-1);
	});
});