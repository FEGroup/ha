(function(window) {
	var a = new Ha.Controller('root-view', {
			'constructor': function() {
				this.entity.set('name', 'alice');
				this.entity.set('enabled', false);
				this.entity.set('algn', 'center');
				this.entity.set('iddd', 'real');
				this.entity.set('cssss', 'fake');
				this.entity.set('race', 0);
				this.entity.set('bgColor', 'red');
				this.entity.set('fontSz', '50px');
				this.entity.set('htmlString', '<h1>HTML String</h1>');
				this.entity.push('hobby', ['0', '1']);
				this.entity.push('items', [
					{'name': 'name1', 'type': 'type1', 'enabled': true, 'color': 'red', children: [{'test': '!!!'},{'test': '???'}]},
					{'name': 'name2', 'type': 'type2', 'enabled': false, 'color': 'blue'},
					{'name': 'name3', 'type': 'type1', 'enabled': true, 'color': 'yellow'},
					{'name': 'name4', 'type': 'type2', 'enabled': false, 'color': 'orange'}
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
				'add': function(e, el) {
					//this.entity.push('items', {'name': 'name5', 'type': 'type2', 'color': 'pink', 'children': [{'test': '!@#!@$'}, {'test': 'acbdfe'}]});

					this.entity.set('items.0', {'name': 'name1111'});
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