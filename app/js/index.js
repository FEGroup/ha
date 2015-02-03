(function(window) {
	var a = new Ha.Controller('root-view', {
			'constructor': function() {
				console.log('1');
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