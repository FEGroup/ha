Ha.Xhr = Ha.inherit(Ha.Object, function Xhr() {this.base();
	var xhr = (function() {
		if (typeof XMLHttpRequest != 'undefined') {
			return new XMLHttpRequest();
		}

		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e) {}
		}

		return false;
	})();

	if (!xhr) {
		throw "Xhr can't use on your environment. :(";
	}

	xhr.onprogress = function(e) {

	};

	xhr.onerror = function(e) {

	};

	var successHandler = null;
	var failHandler = null;

	this.success = function(func) {
		successHandler = func;
	};
	this.fail = function(func) {
		failHandler = func;
	};

	this.request = function(method, url, data, requestHeaders) {
		xhr.open(method, url);

		for (var headerName in requestHeaders) {
			if (!requestHeaders.hasOwnProperty(headerName)) continue;

			xhr.setRequestHeader(headerName, requestHeaders[headerName]);
		}

		xhr.onreadystatechange = function(e) {
			if (xhr.readyState === 4) { // DONE
				if (xhr.status === 200 && successHandler) { // SUCCESS
					successHandler(xhr.response);
				} else if (failHandler) {
					failHandler();
				}
			}
		};

		if (typeof data === 'object') {
			xhr.send(JSON.stringify(data));
		} else {
			xhr.send();
		}
	};

	this.post = function(url, data) {
		this.request('POST',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.get = function(url, data) {
		this.request('GET',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.put = function(url, data) {
		this.request('PUT',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};

	this.delete = function(url, data) {
		this.request('DELETE',
			url,
			data,
			{
				"Content-Type": "application/json;charset=utf-8"
			}
		);
	};
});