module.exports = function(gamePath)
{
	var fs = require('fs');
	var path = require('path');
	var exec = require('child_process').exec;
	var colors = require('colors');

	var file, data, i;

	file = path.join(gamePath, "build.json");

	console.log("[1/16] Removing any references to cloudkid-framework...".dim);
	if (fs.existsSync(file))
	{
		data = readJSON(file);
		for(var k in data)
		{
			if (Array.isArray(data[k]))
			{
				for (var i = 0; i < data[k].length; i++)
				{
					data[k][i] = data[k][i].replace(
						'cloudkid-framework',
						'springroll'
					);
				}
			}
		}
		i = data.main.indexOf("src/prefixer.less");
		// remove the prefixer
		if (i > -1)
		{
			data.main.splice(i, 1);
		}
		// remove unused "src/Bundle*.js" from main build files
		i = data.main.indexOf("src/Bundle*.js");
		if (i > -1)
		{
			data.main.splice(i, 1);
		}

		missingPush(
			data.libraries,
			"components/pbskids-game/dist/game.min.js",
			"components/pbskids-game/dist/modules/createjs-game.min.js"
		);
		missingPush(
			data.librariesDebug,
			"components/pbskids-game/dist/game.js",
			"components/pbskids-game/dist/modules/createjs-game.js"
		);
		missingPush(data.libraries, "components/pbskids-game/dist/modules/progress-tracker.min.js");
		missingPush(data.librariesDebug, "components/pbskids-game/dist/modules/progress-tracker.js");
		missingPush(data.librariesDebug, "components/pbskids-game/dist/modules/progress-tracker.css");

		writeJSON(file, data);
	}

	console.log("[2/16] Renaming build.json to springroll.json...".dim);
	if (fs.existsSync(file))
	{
		fs.renameSync(file, path.join(gamePath, "springroll.json"));
	}

	console.log("[3/12] Removing prefixer.less...".dim);
	file = path.join(gamePath, "src/prefixer.less");
	if (fs.existsSync(file))
	{
		fs.unlinkSync(file);
	}

	console.log("[4/13] Updating main.less...".dim);
	file = path.join(gamePath, "src/main.less");
	if (fs.existsSync(file))
	{
		fs.writeFileSync(file, "body {\n\tpadding:0;\n\tmargin:0;\n\tposition: absolute;\n\tbackground:#000;\n\twidth:100%;\n\theight:100%;\n}\n\n/**\n * The framing to support Progress Tracker\n */\n#frame {\n\tposition:absolute;\n\tleft:0;\n\tright:0;\n\theight:100%;\n\t.pt-tray-show & {\n\t\tright:600px;\n\t}\n}\n\n/**\n*  For debugging performance issues\n*/\n#framerate {\n\tposition: absolute;\n\tcolor:#fff;\n\tfont-size:12px;\n\tpadding:5px;\n\tbackground:rgba(0, 0, 0, 0.4);\n\tz-index: 2;\n\tfont-family:\"Lucida Console\",Monaco,monospace;\n}\n\n/**\n*  The captions \n*/\n#captions {\n\tposition:absolute;\n\tz-index: 1;\n\twidth:100%;\n\tcolor:#fff;\n\ttext-align:center;\n\tfont-size:120%;\n\tline-height:2;\n\tbackground:rgba(0, 0, 0, 0.4);\n}\n\n/**\n*  Don\'t select the text\n*/\n#captions, #framerate {\n\t-webkit-touch-callout: none;\n    -webkit-user-select: none;\n    -khtml-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n    cursor:default;\n}\n\n/**\n*  We\'ll vertically center the content\n*  the JavaScript will resize the canvas\n*  content to the Window size\n*/\n#content {\n\tposition: absolute;\n\tdisplay:block;\n\ttop:50%;\n\tleft:50%;\n\t-webkit-transform: translate(-50%, -50%);\n\t-moz-transform: translate(-50%, -50%);\n\t-ms-transform: translate(-50%, -50%);\n\t-o-transform: translate(-50%, -50%);\n\ttransform: translate(-50%, -50%);\n\tcanvas {\n\t\tdisplay:block;\n\t\tbackground:#000;\n\t}\n}");
	}

	console.log("[5/16] Update main.js...".dim);
	file = path.join(gamePath, "src/main.js");
	if (fs.existsSync(file))
	{
		data = fs.readFileSync(file, {encoding:"utf8"});

		// Get the class name and fps
		var className = data.match(/new ([a-zA-Z0-9\.]+)\(/);
		var fps = data.match(/fps\: ?([0-9]+)/);

		if (className)
		{
			data = "(function(){\n\n\tvar options = {\n\t\tfps: %FPS%,\n\t\traf: true,\n\t\tcrossOrigin: false,\n\t\tparseQueryString: DEBUG,\n\t\tresizeElement: document.getElementById(\"frame\"),\n\t\tdebug: DEBUG,\n\t\tcacheBust: DEBUG,\n\t\tcanvasId: \"stage\",\n\t\tdisplay: springroll.CreateJSDisplay,\n\t\tdisplayOptions:\t{\n\t\t\tclearView: true,\n\t\t}\n\t};\n\n\tif (DEBUG)\n\t{\n\t\toptions.framerate = \"framerate\";\n\t\tvar stage = document.getElementById(\"stage\");\n\t\tvar framerate = document.createElement(\"div\");\n\t\tframerate.id = \"framerate\";\n\t\tframerate.innerHTML = \"FPS: 00.000\";\n\t\tstage.parentNode.insertBefore(framerate, stage);\n\t}\n\n\tnew %CLASSNAME%(options);\n\t\n}());";

			data = data.replace("%CLASSNAME%", className[1])
				.replace("%FPS%", fps ? fps[1] : 15);

			fs.writeFileSync(file, data);
		}
	}

	console.log("[6/16] Update index.html with new progress tracker structure...".dim);
	file = path.join(gamePath, "deploy/index.html");
	if (fs.existsSync(file))
	{
		data = fs.readFileSync(file, {encoding:'utf8'});
		var title = data.match(/\<title\>([^\<]+)\<\/title\>/);
		var size = data.match(/id\=\"stage\" width\=\"([0-9]+)\" height\=\"([0-9]+)\"/);

		if (title && size)
		{
			data = "<!DOCTYPE html>\n<html class=\"no-js\">\n\t<head>\n\t\t<meta charset=\"utf-8\">\n\t\t<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n\t\t<title>%TITLE%</title>\n\t\t<meta name=\"description\" content=\"\">\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0\">\n\t\t<link rel=\"icon\" type=\"image/x-icon\" href=\"favicon.ico\" />\n\t\t<link rel=\"stylesheet\" href=\"assets/css/libraries.css\">\n\t\t<link rel=\"stylesheet\" href=\"assets/css/main.css\">\n\t</head>\n\t<body>\n\t\t<div id=\"frame\">\n\t\t\t<div id=\"content\">\n\t\t\t\t<div id=\"container\">\n\t\t\t\t\t<div id=\"captions\"></div>\n\t\t\t\t\t<canvas id=\"stage\" width=\"%WIDTH%\" height=\"%HEIGHT%\"></canvas>\n\t\t\t\t</div>\n\t\t\t\t<script src=\"assets/js/libraries.js\"></script>\n\t\t\t\t<script src=\"assets/js/assets.js\"></script>\n\t\t\t\t<script src=\"assets/js/main.js\"></script>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>";

			data = data.replace("%TITLE%", title[1])
				.replace("%WIDTH%", size[1])
				.replace("%HEIGHT%", size[2]);

			fs.writeFileSync(file, data);
		}
	}

	file = path.join(gamePath, "tasks/curl.js");
	console.log("[7/16] Add the curl task...".dim);
	if (!fs.existsSync(file))
	{
		data = "module.exports = {\n\t'<%= configSrc %>/spec.json': 'http://stage.pbskids.org/progresstracker/api/v2/games/<%= eventSpec %>/events-spec.json'\n};";
		fs.writeFileSync(file, data);
	}

	file = path.join(gamePath, "package.json");
	console.log("[8/16] Updating package.json dependencies...".dim);
	if (fs.existsSync(file))
	{
		data = readJSON(file);
		delete data.dependencies["grunt-game-builder"];
		delete data.dependencies["grunt-merge-json"];
		data.dependencies['grunt-springroll'] = "*";
		data.dependencies['grunt-concat-json'] = "*";
		data.dependencies['grunt-curl'] = "~2.0.3";
		writeJSON(file, data);
	}

	file = path.join(gamePath, "Gruntfile.js");
	console.log("[9/16] Remove grunt-game-builder references in Gruntfile.js...".dim);
	if (fs.existsSync(file))
	{
		data = fs.readFileSync(file, {encoding:"utf8"});

		// Replace game builder with springroll grunt
		if (data.indexOf('grunt-game-builder') > -1)
		{
			data = data.replace(/grunt-game-builder/g, 'grunt-springroll');
		}

		// Add the event spec property if it doesn't exist
		if (data.indexOf('eventSpec') === -1)
		{
			data = data.replace(
				/configSrc\: ?\'([a-zA-Z0-9\-\_\/\.]+)\'/,
				"configSrc: '$1',\n\t\t\t\teventSpec: ''"
			);
		}
		fs.writeFileSync(file, data);
	}

	file = path.join(gamePath, "tasks/merge-json.js");
	console.log("[10/16] Renaming merge-json.js to concat-json.js...".dim);
	if (fs.existsSync(file))
	{
		fs.renameSync(file, path.join(gamePath, "tasks/concat-json.js"));
	}

	file = path.join(gamePath, "tasks/aliases.js");
	console.log("[11/16] Replacing merge-json task...".dim);
	if (fs.existsSync(file))
	{
		data = fs.readFileSync(file, {encoding:"utf8"});
		if (data.indexOf('merge-json') > -1)
		{
			data = data.replace(/\'merge-json\'/g, "//'curl',\n\t\t\t'concat-json'");
			fs.writeFileSync(file, data);
		}
	}
	file = path.join(gamePath, "tasks/watch.js");
	if (fs.existsSync(file))
	{
		data = fs.readFileSync(file, {encoding:"utf8"});
		if (data.indexOf('merge-json') > -1)
		{
			data = data.replace(/\'merge-json\'/g, "'concat-json'");
			fs.writeFileSync(file, data);
		}
	}

	file = path.join(gamePath, "bower.json");
	console.log("[12/16] Updating bower references to springroll...".dim);
	if (fs.existsSync(file))
	{
		data = readJSON(file);
		if (data.dependencies['cloudkid-framework'])
		{
			delete data.dependencies['cloudkid-framework'];
			data.dependencies['springroll'] = "*";
			writeJSON(file, data);
		}
	}

	console.log("[13/16] Removing node_modules/grunt-game-builder...".dim);
	removeDir('node_modules', 'grunt-game-builder');

	console.log("[14/16] Removing node_modules/grunt-merge-json...".dim);
	removeDir('node_modules', 'grunt-merge-json');

	console.log("[15/16] Removing components/cloudkid-framework...".dim);
	removeDir('components', 'cloudkid-framework');

	console.log("[16/16] Doing an npm install...".dim);
	exec('npm install', {cwd: gamePath}, finishExec);

	function removeDir(type, module)
	{
		var dir = path.join(gamePath, type, module);
		if (fs.existsSync(dir))
		{
			exec('rm -rf ' + dir, finishExec);
		}
	}

	function missingPush(arr, file, before)
	{
		if (arr.indexOf(file) === -1)
		{
			if (before)
			{
				var i = arr.indexOf(before);
				if (i !== -1)
				{
					arr.splice(i, 0, file);
					return;
				}
			}
			arr.push(file);
		}
	}

	function finishExec(err, stdout, stderr)
	{
		if (err) console.log(('ERROR: ' + err).red);
	}

	function readJSON(path)
	{
		return JSON.parse(fs.readFileSync(path));
	}

	function writeJSON(path, obj)
	{
		fs.writeFileSync(path, JSON.stringify(obj, null, "\t"));
	}
};