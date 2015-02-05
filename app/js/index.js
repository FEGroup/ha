(function(window) {
	console.log(Ha.Json.toObject('attr:{align: align, id: id}, css:css, style:{background-color:backgroundColor, font-size:fontSize}'));

	var a = new Ha.Controller('root-view', {
			'constructor': function() {
				this.entity.set('name', 'alice');
				this.entity.set('enabled', false);
				this.entity.set('align', 'center');
				this.entity.set('id', 'real');
				this.entity.set('css', 'fake');
				this.entity.set('backgroundColor', 'red');
				this.entity.set('fontSize', '50px');
				this.entity.set('htmlString', '<h1>HTML String</h1>');
				this.entity.set('hobby', [0, 1]);
			},
			'events': {
				'add': function(e, entity, controller) {
					controller.test();
				}
			},
			'requests': [
				{'name': 'test', 'url': 'http://localhost:3000/posts/1', 'method': 'get', 'properties': {}}
			]
		});
}(window));