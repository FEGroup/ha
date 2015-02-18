(function(window) {
	var a = new Ha.Controller('root-view', {
			'constructor': function() {
				this.entity.set('name', 'alice');
				this.entity.set('enabled', false);
				this.entity.set('align', 'center');
				this.entity.set('id', 'real');
				this.entity.set('css', 'fake');
				this.entity.set('race', 0);
				this.entity.set('backgroundColor', 'red');
				this.entity.set('fontSize', '50px');
				this.entity.set('htmlString', '<h1>HTML String</h1>');
				this.entity.push('hobby', ['0', '1']);
				this.entity.push('items', [
					{'name': 'name1', 'type': 'type1'},
					{'name': 'name2', 'type': 'type2'},
					{'name': 'name3', 'type': 'type1'},
					{'name': 'name4', 'type': 'type2'}
				]);
				//this.entity.push('trees', [
				//	{
				//		'name': 'name1',
				//		'children': [
				//			{'name': 'name1-1'}
				//		]
				//	}
				//]);
			},
			'events': {
				'add': function(e, entity, controller) {

				}
			},
			'requests': [
				{
					'name': 'test',
					'url': 'http://localhost:3000/posts/1',
					'method': 'get',
					'properties': {},
					'response': function(res) {console.log(res);}
				}
			]
		});
}(window));