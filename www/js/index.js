var app = {

	name: "Autocuidate",

	authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: pvanegas@cool4code.com, David Alméciga: walmeciga@cool4code.com",

	version: 1.0,

	count: 0,

	data: [],

	selection: {
		edad: [],
		category: [{
			id: "btn_pregnancy",
			column: "mi_embarazo",
			quoteColumn: "frase_mi_embarazo",
			value: false
		}, {
			id: "btn_mychildren",
			column: "mis_hijos",
			quoteColumn: "frasemis_hijos",
			value: false
		}, {
			id: "btn_mysexlife",
			column: "mi_vida_sexual_y_reproductiva",
			quoteColumn: "frase_mi_vida_sexual_y_reproductiva",
			value: false
		}, {
			id: "btn_mymouth",
			column: "mi_boca",
			quoteColumn: "frase_mi_boca",
			value: false
		}, {
			id: "btn_myeyes",
			column: "mis_ojos",
			quoteColumn: "frase_mis_ojos",
			value: false
		}],
		clasif: {
			femenino: {
				id: "femenino",
				value: ""
			},
			masculino: {
				id: "masculino",
				value: ""
			},
			en_condicion_embarazo: {
				id: "en_condicion_embarazo",
				value: ""
			},
			sin_condicion_embarazo: {
				id: "sin_condicion_embarazo",
				value: ""
			},
			no_aplica_condicion_de_embarazo: {
				id: "no_aplica_condicion_de_embarazo",
				value: ""
			},
			nins_10_anos: {
				id: "nins_10_anos",
				value: ""
			},
			mujer_joven_10_a_29_anios: {
				id: "joven_10_a_29_anios",
				value: ""
			},
			hombre_joven_10_a_29_anios: {
				id: "joven_10_a_29_anios",
				value: ""
			},
			hef_29_a_44_anios: {
				id: "29_a_44_anios",
				value: ""
			},
			mef_29_44_anios: {
				id: "29_a_44_anios",
				value: ""
			},
			hombre_adulto_45_anios: {
				id: "adulto_45_anios",
				value: ""
			},
			mujer_adulta_45_anios: {
				id: "adulto_45_anios",
				value: ""
			}
		}
	},


	init: function() {
		console.log("init: Iniciando app!");
		document.addEventListener("deviceready", app.onDeviceReady, false);
	},

	onDeviceReady: function() {
		//window.localStorage.removeItem("updated");
		app.buttonEvents();
		app.pageEvents();
		console.log("onDeviceReady: Dispositivo listo!");

		if (app.checkConnection()) {
			app.initGoogleLoader(app.startApp);
		} else {
			navigator.notification.alert('No hay una conexión a internet!', function() {
				navigator.app.exitApp();
			}, 'Atención', 'Aceptar');
		}
	},

	pageEvents: function() {
		$("#cat").on("pagebeforeshow", function() {
			app.selection.edad = [];
		});
	},

	buttonEvents: function() {
		console.log("buttonEvents: Eventos para botones de categorias y btn continuar!");

		$("#share").on("click", function(e) {
			app.showLoadingBox("Descargando!");
			//var page = $('#detail [data-role="content"]');
			var page = document.getElementById("detail");
			var title = $('#detail [data-role="content"] > h1').text();
			html2canvas(page, {
				onrendered: function(canvas) {
					if (device.platform === "iOS") {
						console.log("Compartiendo en iOS!");
						var social = window.plugins.social;
						social.share(title, 'http://www.minsalud.gov.co', canvas);
						app.hideLoadingBox();
					}
				}
			});
		});

		$.each(app.selection.clasif, function(k, v) {
			$("#" + v.id).prop("disabled", true);
		});

		$("#ageContinue").on("click", function(e) {
			if (app.selection.edad.length > 0) {
				app.openDB(queryActivities);
			} else {
				navigator.notification.alert('Debe seleccionar al menos una edad!', function() {
					return false;
				}, 'Atención', 'Aceptar');
			}
		});

		function queryActivities(tx) {
			var category = [];
			$.each(app.selection.category, function(k1, v1) {
				if (v1.value === true) {
					category.push(v1);
				}
			});
			var sql = "SELECT * FROM datos ";
			$.each(category, function(k1, v1) {
				if (k1 === 0) {
					sql += "WHERE " + v1.column + " = 'X' ";
				} else {
					sql += "OR " + v1.column + " = 'X' ";
				}
			});
			sql += "AND (";
			$.each(app.selection.edad, function(k2, v2) {
				if (k2 === 0) {
					sql += "edad = '" + v2 + "' ";
				} else {
					sql += "OR edad = '" + v2 + "' ";
				}
			});
			sql += ")";

			console.log(sql);
			tx.executeSql(sql, [], app.ent.activities, app.errorCB);
		}

		$("#startQuery").on("click", function(e) {
			var selection = [];
			$.each(app.selection.category, function(k, v) {
				if (v.value === true) {
					selection.push(v);
				}
			});

			if (selection.length > 0) {
				app.openDB(queryAges);
			} else {
				navigator.notification.alert('Debe seleccionar al menos una categoría!', function() {
					return false;
				}, 'Atención', 'Aceptar');
			}
		});

		function queryAges(tx) {
			console.log("queryAges: Consultando edades!");
			var selection = [];
			var sql = "SELECT RowKey, edad FROM datos ";
			$.each(app.selection.category, function(k1, v1) {
				if (v1.value === true) {
					selection.push(v1);
				}
			});

			$.each(selection, function(k1, v1) {
				if (k1 === 0) {
					sql += "WHERE " + v1.column + " = 'X' ";
				} else {
					sql += "OR " + v1.column + " = 'X' ";
				}
			});

			sql += "GROUP BY edad";
			console.log(sql);
			tx.executeSql(sql, [], app.ent.ages, app.errorCB);
		}

		var category = app.selection.category;
		$.each(category, function(k0, v0) {
			var btns = $("#" + v0.id).children();
			if (v0.value) {
				$(btns[0]).show();
			} else {
				$(btns[0]).hide();
			}

			$("#" + v0.id).on("click", function(e) {
				var activeLayer = $(this).children();
				$(activeLayer[0]).fadeToggle("fast", function() {
					var layer = this;
					$.each(category, function(k1, v1) {
						if (v1.id === activeLayer.context.id) {
							if ($(layer).css("display") === "none") {
								v1.value = false;
							} else {
								v1.value = true;
							}
						}
					});
				});
			});
		});
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
				$.mobile.changePage("#age-gender");
			}, 1000);

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
		tx.executeSql('CREATE TABLE IF NOT EXISTS datos (id INTEGER PRIMARY KEY AUTOINCREMENT,' + dbFields + ')');
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
		$.mobile.changePage("#age-gender");
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

	ent: {
		ages: function(tx, results) {
			console.log("ent.ages: Construyendo listado edades!");

			var list = "#ageList";
			var len = results.rows.length;
			var html = '<legend>Seleccione uno varias rangos de edades:</legend> \n';

			for (var i = 0; i < len; i++) {
				html += '<input type="checkbox" data-vista="edad" name="edad-' + results.rows.item(i).RowKey + '" id="edad-' + results.rows.item(i).RowKey + '" value="' + results.rows.item(i).edad + '"/>';
				html += '<label for="edad-' + results.rows.item(i).RowKey + '">' + results.rows.item(i).edad + '</label>';
			}

			$(list).html(html).trigger('create');
			$.mobile.changePage("#agePage");

			app.hideLoadingBox();
			app.registerInputs(list);
		},
		activities: function(tx, results) {
			console.log("ent.activities: Construyendo listado actividades!");

			var list = "#activityList";
			var len = results.rows.length;
			var html = "";

			$(list).empty();

			for (var i = 0; i < len; i++) {
				html += '<li><a href="#" data-row="' + results.rows.item(i).RowKey + '"><h1 style="white-space: normal; font-size: 1em;">' + results.rows.item(i).actividad_de_prevencion;
				html += '</h1><p>' + results.rows.item(i).titulo + '</p></a></li>';
			}
			$(list).append(html);
			$.mobile.changePage("#activities");
			app.hideLoadingBox();

			$(list).listview("refresh");
			app.registerLinks(list);
		},
		detail: function(tx, results) {
			var item = results.rows.item(0);
			var comp1 = $("#detailContent").children();
			var comp2 = $(comp1[2]).children();

			$(comp1[1]).html(item.titulo);
			$(comp2[0]).html(item.actividad_de_prevencion).trigger("create");
			$(comp2[1]).html(item.descripcion_de_la_actividad).trigger("create");
			$("#detailContent .ui-disabled").removeClass("ui-disabled");

			$.each(app.selection.clasif, function(k1, v1) {
				v1.value = item[k1];
				var $btn = $("#" + v1.id);
				if (v1.value === "SI") {
					$btn.prop("checked", true);
				}
			});

			$.mobile.changePage("#detail");
			app.hideLoadingBox();
		}
	},

	registerInputs: function(list) {
		console.log("registerInputs: Registrando checkboxes!");
		$(list + " :checkbox").on("click", app.eventCheckboxes);
	},

	eventCheckboxes: function(e) {
		console.log("eventCheckboxes: Graba selección para checkboxes!");
		var $checkbox = $(this);

		if ($checkbox.is(':checked')) {
			app.selection[$checkbox.data("vista")].push($checkbox.val());
		} else {
			app.selection[$checkbox.data("vista")].splice(app.selection[$checkbox.data("vista")].indexOf($checkbox.val()), 1);
		}
	},

	registerLinks: function(list) {
		$(list + " a").on("click", app.eventLinks);
	},

	eventLinks: function(e) {
		console.log("eventLinks: Evento del link!");
		var $link = $(this);
		app.openDB(queryDetail);

		function queryDetail(tx) {
			var sql = "SELECT * FROM datos WHERE RowKey = '" + $link.data("row") + "'";
			console.log(sql);
			tx.executeSql(sql, [], app.ent.detail, app.errorCB);
		}
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