(function(cordova) {
	function Canvas2ImagePlugin() {}
	Canvas2ImagePlugin.prototype.saveImageDataToLibrary = function(successCallback, failureCallback, canvas) {
		if (typeof successCallback != "function") {
			console.log("Canvas2ImagePlugin Error: successCallback is not a function");
			return;
		}
		if (typeof failureCallback != "function") {
			console.log("Canvas2ImagePlugin Error: failureCallback is not a function");
			return;
		}
		var imageData = canvas.toDataURL().replace(/data:image\/png;base64,/,'');
		return cordova.exec(successCallback, failureCallback, "Canvas2ImagePlugin","saveImageDataToLibrary",[imageData]);
	};

	cordova.addConstructor(function() {
		window.plugins = window.plugins || {};
		window.plugins.canvas2ImagePlugin = new Canvas2ImagePlugin();
	});
	
})(window.cordova || window.Cordova);