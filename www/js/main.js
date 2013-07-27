var app = {

	name: "Autocuidate",

	authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

	version: 1.0,

	count: 0,

	data: [],

	init: function() {
		console.log("init: Iniciando app!");
		document.addEventListener("deviceready", app.onDeviceReady, false);
	},

	onDeviceReady: function() {
		//window.localStorage.removeItem("updated");

		console.log("onDeviceReady: Dispositivo listo!");

		if (app.checkConnection()) {
			app.initGoogleLoader(app.startApp);
		} else {
			navigator.notification.alert('No hay una conexión a internet!', function() {
				navigator.app.exitApp();
			}, 'Atención', 'Aceptar');
		}
	},

	checkConnection: function() {
		console.log("checkConnection: Comprobando conectividad a internet!");
		var networkState = navigator.connection.type;
		if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
			console.log("checkConnection: No hay internet!");
			return false;
		} else {
			console.log("checkConnection: Si hay internet!");
			return true;
		}
	},

	initGoogleLoader: function(cb) {
		console.log("initGoogleLoader: Cargando activos google!");
		WebFontConfig = {
			google: {
				families: ['Cabin::latin', 'Josefin+Sans::latin', 'Oxygen::latin', 'Basic::latin', 'Rosario::latin', 'Shanti::latin']
			}
		};

		var wf = document.createElement('script');
		wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
		wf.type = 'text/javascript';
		wf.async = 'true';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(wf, s);

		cb();

		var script = document.createElement("script");
		script.src = "https://www.google.com/jsapi";
		script.type = "text/javascript";
		document.getElementsByTagName("head")[0].appendChild(script);

		script.addEventListener("error", function(e) {
			console.log("Error: " + e);
		}, false);
	},

	startApp: function() {
		console.log("startApp: Iniciando estructura de la applicación!");
		// navigator.splashscreen.hide();
		if (app.checkUpdatedData()) {
			setTimeout(function() {
				$.mobile.changePage("#home");
			}, 5000);
			//app.openDB(app.queryDB);
		} else {
			app.load();
		}
	},

	checkUpdatedData: function() {
		console.log("checkUpdatedData: Comprobando si los datos están actualizados!");
		var s = new Date();
		s.setMonth(s.getMonth() - 6);
		var updated = window.localStorage.getItem("updated");
		var u = new Date(updated);
		if (updated && u > s) {
			console.log("checkUpdatedData: Los datos están actualizados! " + updated);
			return true;
		} else {
			console.log("checkUpdatedData: Los datos no están actualizados!");
			return false;
		}
	},

	load: function() {
		console.log("load: Consultando open data!");
		var url = "http://servicedatosabiertoscolombia.cloudapp.net/v1/Ministerio_de_Salud/datosretoautocuidados?$format=json&$filter=id>" + app.count;
		var xhr = app.getJson(url);
		xhr.success(function(r) {
			$.each(r.d, function(k, v) {
				app.data.push(v);
			});
			if (r.d.length == 1000) {
				app.count = app.count + 1000;
				app.load();
			} else {
				var msg = "load: Se descargaron los datos completos de open data!";
				console.log(msg);
				app.createDB();
			}
		});
		$("#progressLabel").html("Cargando +" + app.count + " registros!");
		console.log("load: " + url);
	},

	getJson: function(url) {
		return $.ajax({
			type: "GET",
			url: url,
			dataType: 'json',
			error: function() {
				navigator.notification.alert('El repositorio de datos Open Data no está disponible, inténtalo más tarde!', function() {
					navigator.app.exitApp();
				}, 'Atención', 'Aceptar');
			},
			progress: function(evt) {
				if (evt.lengthComputable) {
					app.progressBar(parseInt((evt.loaded / evt.total * 100), 10), $("#progressBar"));
					// console.log("Loaded " + parseInt( (evt.loaded / evt.total * 100), 10) + "%");
				} else {
					console.log("Length not computable.");
				}
			}
		});
	},

	createDB: function() {
		var msg = "createDB: Creando base de datos!";
		console.log(msg);
		var db = window.openDatabase("autocuidate", "1.0", "Autocuidate", 3145728);
		db.transaction(app.populateDB, app.errorCB, app.successCB);
	},

	populateDB: function(tx) {
		var msg = "populateDB: Creando tabla!";
		console.log(msg);
		var fields = [];
		$.each(app.data[0], function(k, v) {
			fields.push(k);
		});
		var dbFields = fields.join();
		tx.executeSql('DROP TABLE IF EXISTS datos');
		tx.executeSql('CREATE TABLE IF NOT EXISTS datos (' + dbFields + ')');
		tx.executeSql('CREATE TABLE IF NOT EXISTS columnNames (columnName)');

		console.log("populateDB: Insertando registros en la tabla datos!");
		for (var j = 0; j < fields.length; j++) {
			tx.executeSql('INSERT INTO columnNames(columnName) VALUES ("' + fields[j] + '")');
		}

		$.each(app.data, function(k1, v1) {
			var values = [];
			$.each(v1, function(k2, v2) {
				values.push('"' + v2 + '"');
			});
			var dbValues = values.join();
			var sql = 'INSERT INTO datos (' + dbFields + ') VALUES (' + dbValues + ')';
			tx.executeSql(sql);
		});
	},

	successCB: function() {
		var msg = "successCB: Base de datos creada con éxito!";
		console.log(msg);
		console.log("successCB: Guardando fecha de actualización!");
		var updated = new Date();
		window.localStorage.setItem("updated", updated);
		$.mobile.changePage("#help_step1");
	},

	openDB: function(q) {
		console.log("openDB: Abriendo base de datos!");
		app.showLoadingBox("Abriendo base de datos!");
		var db = window.openDatabase("autocuidate", "1.0", "Autocuidate", 3145728);
		db.transaction(q, app.errorCB);
	},

	errorCB: function(tx, err) {
		console.log("errorCB: Opps!: " + err.code);
	},

	showLoadingBox: function(txt) {
		$.mobile.loading('show', {
			text: txt,
			textVisible: true,
			theme: 'a'
		});
	},

	hideLoadingBox: function() {
		$.mobile.loading('hide');
	},

	progressBar: function(percent, $element) {
		var progressBarWidth = percent * $element.width() / 100;
		$element.find('div').animate({
			width: progressBarWidth
		}, 20).html(percent + "%&nbsp;");
	}
};

(function addXhrProgressEvent($) {
	var originalXhr = $.ajaxSettings.xhr;
	$.ajaxSetup({
		progress: function() {
			console.log("standard progress callback");
		},
		xhr: function() {
			var req = originalXhr(),
				that = this;
			if (req) {
				if (typeof req.addEventListener == "function") {
					req.addEventListener("progress", function(evt) {
						that.progress(evt);
					}, false);
				}
			}
			return req;
		}
	});
})(jQuery);