var app = {

	name: "Autocuidate",

	authors: "Alejandro Zarate: azarate@cool4code.com, Marcos Aguilera: maguilera@cool4code.com, Paola Vanegas: filterAgeGender, David Alméciga: walmeciga@cool4code.com",

	version: 1.0,

	count: 0,

	data: [],

	selection: {
		edad: "",
		age: "",
		gender: "",
		pregnant: "",
		//edad: [],
		category: [{
			title: "MI EMBARAZO",
			quote: "Por tu salud, <br>por la salud de tu hijo",
			img: "pregnant.png",
			id: "btn_pregnancy",
			column: "mi_embarazo",
			quoteColumn: "frase_mi_embarazo",
			value: false,
			sel: false
		}, {
			title: "MIS HIJOS MENORES DE 10 AÑOS",
			quote: "Tus hijos son tu pasión,<br>por eso cuidalos",
			img: "children.png",
			id: "btn_mychildren",
			column: "mis_hijos",
			quoteColumn: "frasemis_hijos",
			value: false,
			sel: false
		}, {
			title: "MI VIDA SEXUAL Y REPRODUCTIVA",
			quote: "Disfruta tu vida sexual <br>con libertad y responsabilidad",
			img: "sexlife.png",
			id: "btn_mysexlife",
			column: "mi_vida_sexual_y_reproductiva",
			quoteColumn: "frase_mi_vida_sexual_y_reproductiva",
			value: false,
			sel: false
		}, {
			title: "MI BOCA",
			quote: "Por tu sonrisa cuida <br>tu salud bucal",
			img: "mouth.png",
			id: "btn_mymouth",
			column: "mi_boca",
			quoteColumn: "frase_mi_boca",
			value: false,
			sel: false
		}, {
			title: "MIS OJOS",
			quote: "¡OJO! Con tus ojos; <br>Cuida tu salud visual",
			img: "eyes.png",
			id: "btn_myeyes",
			column: "mis_ojos",
			quoteColumn: "frase_mis_ojos",
			value: false,
			sel: false
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
		app.data = [];
		app.selectEvents();
		app.buttonEvents();
		app.pageEvents();
		$("#ageGenderForm").on("submit", function(e) {
			console.log("preventDefault form!");
			e.preventDefault();
			return false;
		});
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
		console.log("buttonEvents: Eventos para botones!");

		$("#update").on("click", function() {
			app.data = [];
			app.count = 0;
			if (app.checkConnection()) {
				app.load();
			} else {
				navigator.notification.alert('No hay una conexión a internet!', function() {
					app.onDeviceReady();
				}, 'Atención', 'Reintentar');
			}
		});

		$("#filterAgeGender").on("click", function(e) {
			var data = JSON.stringify($("#ageGenderForm").serializeArray());
			var dataObj = $.parseJSON(data);
			if (dataObj[0]["value"] === "") {
				navigator.notification.alert('Debe digitar la edad!', function() {
					return false;
				}, 'Atención', 'Aceptar');
			} else {
				app.selection.edad = dataObj[0]["value"];
				app.selection.age = dataObj[0]["value"] + dataObj[1]["value"];
				app.selection.gender = dataObj[2]["value"];
				app.selection.pregnant = dataObj[3]["value"];
				app.openDB(queryCategories);
			}
		});

		function queryCategories(tx) {
			tx.executeSql(app.buildSql(), [], app.ent.categories, app.errorCB);
		}

		function queryActivities2(tx) {
			var sql = "SELECT * FROM datos";
			sql += " WHERE edad = '" + app.selection.age + "'";
			switch (app.selection.gender) {
				case "m":
					sql += " AND masculino = 'SI'";
					break;
				case "f":
					sql += " AND femenino = 'SI'";
					break;
			}
			console.log(sql);
			tx.executeSql(sql, [], app.ent.activities2, app.errorCB);
		}

		$("#share").on("click", function(e) {
			app.showLoadingBox("Descargando!");
			//var page = $('#detail [data-role="content"]');
			var page = document.getElementById("detailContent");
			var title = $('#detail [data-role="content"] > h1').text();
			html2canvas(page, {
				onrendered: function(canvas) {
					if (device.platform === "iOS") {
						console.log("Compartiendo en iOS!");
						var social = window.plugins.social;
						social.share("Este servicio médico no tiene ningún costo!", 'http://www.minsalud.gov.co', canvas);
						app.hideLoadingBox();
					}
				}
			});
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

	selectEvents: function() {
		$("#genderSel").on("change", function() {
			switch ($(this).val()) {
				case "m":
				$("#pregnancyField").fadeOut();
				break;
				case "f":
				$("#pregnancyField").fadeIn();
				break;
			}
		});
	},

	buildSql: function(category) {
		var sql = "SELECT * FROM datos";
		sql += " WHERE edad = '" + app.selection.age + "'";
		switch (app.selection.gender) {
			case "m":
				if (app.selection.edad <= 10) {
					sql += " AND nins_10_anos = 'SI'";
					sql += " AND no_aplica_condicion_de_embarazo = 'SI'";
				} else if (app.selection.edad > 10 && app.selection.edad <= 29) {
					sql += " AND hombre_joven_10_29_anos = 'SI'";
					sql += " AND (masculino = 'SI' OR femenino = '')";
					sql += " AND no_aplica_condicion_de_embarazo = 'SI'";
				} else if (app.selection.edad > 29 && app.selection.edad <= 44) {
					sql += " AND hef_29_44_anos = 'SI'";
					sql += " AND (masculino = 'SI' OR femenino = '')";
					sql += " AND no_aplica_condicion_de_embarazo = 'SI'";
				} else if (app.selection.edad > 44) {
					sql += " AND hombre_adulto_45_anos = 'SI'";
					sql += " AND (masculino = 'SI' OR femenino = '')";
					sql += " AND no_aplica_condicion_de_embarazo = 'SI'";
				}
				// sql += " AND mi_embarazo = ''";
				break;
			case "f":
				if (app.selection.edad <= 10) {
					sql += " AND nins_10_anos = 'SI'";
					sql += " AND no_aplica_condicion_de_embarazo = 'SI'";
				} else if (app.selection.edad > 10 && app.selection.edad <= 29) {
					sql += " AND mujer_joven_10_29_anos = 'SI'";
					sql += " AND (masculino = '' OR femenino = 'SI')";
				} else if (app.selection.edad > 29 && app.selection.edad <= 44) {
					sql += " AND mef_29_44_anos = 'SI'";
					sql += " AND (masculino = '' OR femenino = 'SI')";
				} else if (app.selection.edad > 44) {
					sql += " AND mujer_adulta_45_anos = 'SI'";
					sql += " AND (masculino = '' OR femenino = 'SI')";
				}

				switch (app.selection.pregnant) {
					case "si":
					sql += " AND en_condicion_embarazo = 'SI'";
					break;
					case "no":
					sql += " AND sin_condicion_embarazo = 'SI'";
					break;
				}
				break;
		}
		if (typeof category === "boolean" && category === true) {
			$.each(app.selection.category, function(k, v) {
				if (v.sel) {
					sql += " AND " + v.column + " = 'X'";
				}
			});
		}
		console.log(sql);
		return sql;
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
		navigator.splashscreen.hide();
		if (app.checkUpdatedData()) {
			setTimeout(function() {
				$.mobile.changePage("#age-gender");
			}, 3000);
		} else {
			app.load();
			//app.localJson();
		}
	},

	checkUpdatedData: function() {
		console.log("checkUpdatedData: Comprobando si los datos están actualizados!");
		var s = new Date();
		s.setMonth(s.getMonth() - 3);
		var updated = window.localStorage.getItem("updated");
		var u = new Date(updated);
		if (updated && u > s) {
			console.log("checkUpdatedData: Los datos están actualizados! " + updated);
			$("#date").html("<strong>" + updated + "</strong>");
			return true;
		} else {
			console.log("checkUpdatedData: Los datos no están actualizados!");
			return false;
		}
	},

	localJson: function() {
		var msg = "localJson: Se descargaron los datos completos de open data!";
		console.log(msg);
		app.createDB();
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
		//$("#progressLabel").html("Cargando +" + app.count + " registros!");
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
		var db = window.openDatabase("autocuidate", "1.0", "Autocuidate", 4000000);
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
		// tx.executeSql('CREATE TABLE IF NOT EXISTS columnNames (columnName)');

		console.log("populateDB: Insertando registros en la tabla datos!");
		// for (var j = 0; j < fields.length; j++) {
		// 	tx.executeSql('INSERT INTO columnNames(columnName) VALUES ("' + fields[j] + '")');
		// }

		app["data1"] = [];
		$.each(app.data, function(k1, v1) {
			var item = {};
			$.each(v1, function(k2, v2) {
				item[k2] = v2;
				if (k2 === "edad") {
					if (item[k2].search(";") !== -1) {
						item[k2] = v2.split(";");
						$.each(item[k2], function(k3, v3) {
							if (v3.search("-") !== -1) {
								item[k2][k3] = create(v3);
							}
						});
					} else if (item[k2].search("-") !== -1) {
						item[k2] = create(item[k2]);
					} else {
						item[k2] = v2;
					}
				}
			});
			app.data1.push(item);
		});

		function create(element) {
			var result = [];
			var ran = element.split("-");
			var lett1 = ran[0].substring(ran[0].length - 1, ran[0].length);
			var val1 = ran[0].match(/\d/g);
			val1 = val1.join("");
			var val2 = ran[1].match(/\d/g);
			val2 = val2.join("");
			for (var i = parseInt(val1); i <= parseInt(val2); i++) {
				result.push(i + lett1);
			}
			return result;
		}

		var sql = "";
		$.each(app.data1, function(k4, v4) {

			var values = [];
			var rows = [];

			$.each(v4, function(k5, v5) {
				if (v5 instanceof Array) {
					values.push(v5);
				} else {
					values.push('"' + v5 + '"');
				}
			});

			$.each(values, function(k6, v6) {
				if (v6 instanceof Array) {
					var val = [];
					$.each(v6, function(k7, v7) {
						rows.push(values);
						val.push(v7);
					});

					$.each(rows, function(k8, v8) {
						rows[k8][k6] = '"' + val[k8] + '"';
						sql = 'INSERT INTO datos (' + dbFields + ') VALUES (' + rows[k8].join() + '); \n';
						console.log(sql);
						tx.executeSql(sql);
					});
				}
			});
		});
	},

	successCB: function() {
		var msg = "successCB: Base de datos creada con éxito!";
		console.log(msg);
		console.log("successCB: Guardando fecha de actualización!");
		var updated = new Date();
		window.localStorage.setItem("updated", updated);
		$("#date").html("<strong>" + updated + "</strong>");
		$.mobile.changePage("#age-gender");
	},

	openDB: function(q) {
		console.log("openDB: Abriendo base de datos!");
		app.showLoadingBox("Abriendo base de datos!");
		var db = window.openDatabase("autocuidate", "1.0", "Autocuidate", 4000000);
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
		categories: function(tx, results) {
			console.log("ent.categories: Valida si hay resultados!");
			var len = results.rows.length;
			if (len === 0) {
				navigator.notification.alert('No se encuentran resultados con tu búsqueda!', function() {
					app.hideLoadingBox();
				}, 'Atención', 'Aceptar');
				return false;
			}

			$.each(app.selection.category, function(k, v) {
				v.value = false;
			});

			var list = "#catList";
			var html = "";

			$(list).empty();

			for (var i = 0; i < len; i++) {
				if (results.rows.item(i).mi_embarazo === "X") {
					app.selection.category[0].value = true;
				}
				if (results.rows.item(i).mis_hijos === "X") {
					app.selection.category[1].value = true;
				}
				if (results.rows.item(i).mi_vida_sexual_y_reproductiva === "X") {
					app.selection.category[2].value = true;
				}
				if (results.rows.item(i).mi_boca === "X") {
					app.selection.category[3].value = true;
				}
				if (results.rows.item(i).mis_ojos === "X") {
					app.selection.category[4].value = true;
				}
			}

			$.each(app.selection.category, function(k, v) {
				if (v.value) {
					html += '<li>';
					html += '<a href="#" data-column="' + v.column + '" class="' + v.id + '">';
					html += '<img src="img/' + v.img + '" alt=""/>';
					html += '<h1>' + v.title + '</h1>';
					html += '<p>' + v.quote + '</p></a>';
					html += '</li>';
				}
			});

			$(list).append(html);
			$.mobile.changePage("#categories");
			app.hideLoadingBox();

			$(list).listview("refresh");

			var column;
			$(list + " a").on("click", function() {
				console.log("eventLinks: Evento del link!");
				$.each(app.selection.category, function(k, v) {
					v.sel = false;
				});
				column = $(this).data("column");
				switch (column) {
					case "mi_embarazo":
						app.selection.category[0].sel = true;
						break;
					case "mis_hijos":
						app.selection.category[1].sel = true;
						break;
					case "mi_vida_sexual_y_reproductiva":
						app.selection.category[2].sel = true;
						break;
					case "mi_boca":
						app.selection.category[3].sel = true;
						break;
					case "mis_ojos":
						app.selection.category[4].sel = true;
						break;
				}
				app.openDB(queryActivities2);
			});

			function queryActivities2(tx) {
				tx.executeSql(app.buildSql(true), [], app.ent.activities2, app.errorCB);
			}

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

		activities2: function(tx, results) {
			console.log("ent.activities: Valida si hay resultados!");
			var len = results.rows.length;
			if (len === 0) {
				navigator.notification.alert('No se encuentran resultados con tu búsqueda!', function() {
					app.hideLoadingBox();
				}, 'Atención', 'Aceptar');
				return false;
			}

			console.log("ent.activities: Construyendo listado actividades!");

			var list = "#activityList";
			var html = "";

			$(list).empty();

			for (var i = 0; i < len; i++) {
				html += '<li><a style="padding-bottom: 0.4em;" href="#" data-row="' + results.rows.item(i).id + '"><h1 style="white-space: normal; font-size: 1em;">' + results.rows.item(i).actividad_de_prevencion;
				html += '</h1>\n';
				//html += '</h1><p>' + results.rows.item(i).titulo + '</p>\n';
				// html += '<div data-role="controlgroup" data-type="horizontal" style="margin-left: 0.7em; margin-bottom: 0.4em; margin-top: 0.4em;">\n';
				// if (results.rows.item(i).mi_embarazo === "X") {
				// 	html += '<a href="#" data-row="' + results.rows.item(i).id + '" data-role="button" data-mini="true" class="ui-icon-nodisc" data-icon="autoc-pregnancy" data-iconpos="notext"></a>\n';
				// }
				// if (results.rows.item(i).mis_hijos === "X") {
				// 	html += '<a href="#" data-row="' + results.rows.item(i).id + '" data-role="button" data-mini="true" class="ui-icon-nodisc" data-icon="autoc-children" data-iconpos="notext"></a>\n';
				// }
				// if (results.rows.item(i).mi_vida_sexual_y_reproductiva === "X") {
				// 	html += '<a href="#" data-row="' + results.rows.item(i).id + '" data-role="button" data-mini="true" class="ui-icon-nodisc" data-icon="autoc-sexlife" data-iconpos="notext"></a>\n';
				// }
				// if (results.rows.item(i).mi_boca === "X") {
				// 	html += '<a href="#" data-row="' + results.rows.item(i).id + '" data-role="button" data-mini="true" class="ui-icon-nodisc" data-icon="autoc-mouth" data-iconpos="notext"></a>\n';
				// }
				// if (results.rows.item(i).mis_ojos === "X") {
				// 	html += '<a href="#" data-row="' + results.rows.item(i).id + '" data-role="button" data-mini="true" class="ui-icon-nodisc" data-icon="autoc-eyes" data-iconpos="notext"></a>\n';
				// }
				// html += '</div></a></li>';
				html += '</a></li>';
			}
			$(list).html(html).trigger("create");
			$.mobile.changePage("#activities");
			app.hideLoadingBox();

			$(list).listview("refresh");

			app.registerLinks(list);
		},
		detail: function(tx, results) {
			var item = results.rows.item(0);

			var html = "";

			html += '<h1>' + item.titulo + '</h1>\n';
			html += '<div data-role="collapsible" data-collapsed="false" data-theme="b">\n';
			html += '<h4>' + item.actividad_de_prevencion + '</h4>\n';
			html += '<p style="text-align: justify;">' + item.descripcion_de_la_actividad + '</p>\n';
			html += '</div>\n';

			html += '<div data-role="collapsible" data-collapsed="false" data-theme="b" class="aplica">\n';
			html += '<h4>Aplica para:</h4>\n';

			html += '<div data-role="controlgroup" data-type="vertical" class="gender">\n';
			html += '<p>Sexo:</p>\n';
			if (item['femenino'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">Femenino</a>\n';
			}
			if (item['masculino'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">Masculino</a>\n';
			}
			html += '</div>\n';

			html += '<div data-role="controlgroup" data-type="vertical" class="pregnancy">\n';
			html += '<p>Condición de embarazo:</p>\n';

			if (item['en_condicion_embarazo'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">Si</a>\n';
			}
			if (item['sin_condicion_embarazo'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">No</a>\n';
			}
			if (item['no_aplica_condicion_de_embarazo'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">No aplica</a>\n';
			}
			html += '</div>\n';

			html += '<div data-role="controlgroup" data-type="vertical" class="ages">\n';
			html += '<p>Rango de edad:</p>\n';

			if (item['nins_10_anos'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">0-10 Años</a>\n';
			}
			if (item['mujer_joven_10_29_anos'] === "SI" || item['hombre_joven_10_29_anos'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">10-29 Años</a>\n';
			}
			if (item['mef_29_44_anos'] === "SI" || item['hef_29_44_anos'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">29-44 Años</a>\n';
			}
			if (item['hombre_adulto_45_anos'] === "SI" || item['mujer_adulta_45_anos'] === "SI") {
				html += '<a href="#" data-role="button" data-icon="check" data-iconpos="right">Más de 45 Años</a>\n';
			}
			html += '</div>\n';

			html += '</div>\n';

			html += '<div data-role="collapsible" data-collapsed="false" data-theme="b" class="moreinformation">\n';
			html += '<h4>Más información:</h4>\n';
			html += '<p style="text-align: justify;">' + item['informacionadic'] + '</p>\n';
			html += '</div>\n';

			$("#detailContent").html(html);
			// $.each(app.selection.clasif, function(k1, v1) {
			// 	v1.value = item[k1];
			// 	var $btn = $("#" + v1.id);
			// 	if (v1.value === "SI") {
			// 		$btn.prop("checked", true);
			// 	}
			// 	$btn.parent().removeClass("ui-disabled");
			// });

			$("#detailContent").trigger("create");
			setTimeout(function() {
				$("#detailContent .ui-disabled").removeClass("ui-disabled");
			}, 400);
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
			var sql = "SELECT * FROM datos WHERE id = '" + $link.data("row") + "'";
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