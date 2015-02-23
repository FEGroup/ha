describe('Setting field value on view', function() {
	var view;

	beforeEach(function() {
		jasmine.getFixtures().set('<div id="test-view">' +
		'<input type="text" name="text"/>' +
		'<input type="checkbox" name="checkbox" value="1"/>' +
		'<input type="checkbox" name="checkbox" value="2"/>' +
		'<input type="checkbox" name="checkbox" value="3"/>' +
		'<input type="radio" name="radio" value="1"/>' +
		'<input type="radio" name="radio" value="2"/>' +
		'<input type="radio" name="radio" value="3"/>' +
		'</div>');

		view = new Ha.View(document.getElementById('test-view'))
	});

	it('should result in text form value being equal.', function() {
		view.setFieldValue('text', 'alpha');

		expect($('input[name="text"]')).toHaveValue('alpha');
	});

	it('should result in checkbox form being checked.', function() {
		view.setFieldValue('checkbox', ['2', '3']);

		expect($('input[name="checkbox"][value="2"]')).toBeChecked();
		expect($('input[name="checkbox"][value="3"]')).toBeChecked();
	});

	it('should result in radio form being checked.', function() {
		view.setFieldValue('radio', '3');

		expect($('input[name="radio"][value="3"]')).toBeChecked();
	});
});