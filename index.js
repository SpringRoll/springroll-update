#!/usr/bin/env node

// Import external dependencies
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var glob = require('glob');
var _ = require('lodash');
var colors = require('colors');
var latest = require('latest');
var semver = require('semver');
var p = require(path.join(__dirname, 'package.json'));
var script = null;
var command = null;

// The folder names to ignore
var ignore = [
	'node_modules',
	'KrakenWebsite',
	'kraken-website',
	'_patches',
	'measurement-skillpack',
	'measurement-skillpack-frontend'
];

var cwd = process.cwd();

console.log("\n----------------------- U P D A T E ---------------------\n".cyan);

// Loop through each folder and run the updates
var games = glob.sync('*');
var args = process.argv;

var lastArg = path.basename(args[args.length - 1]);

if (args.length === 2)
{
	console.log("No arguments".red.bold);
	console.log("---------------------------------------------------------".dim);
	console.log("Arguments\n".bold);
	console.log("--update=[script]   Either a command line or a path");
	console.log("                    to an update script to run");
	console.log("--pull or -p        Update to master branch from Git origin");
	console.log("[game]              The path to the game or folder");
	console.log("                    must be the last argument.");
	console.log("---------------------------------------------------------".dim);
	console.log("Usage\n".bold);
	console.log("Run the update script on all games".dim);
	console.log("games-update --update=~/Desktop/patch.js\n");
	console.log("Update all games from Git".dim);
	console.log("games-update -p\n");
	console.log("Update a single game from Git:".dim);
	console.log("games-update -p scrub-a-dub\n");
	console.log("---------------------------------------------------------".dim);
	console.log("\n");
	process.exit();
}

// Check for the latest version of the library
latest(p.name, function(err, v) {
	if (semver.lt(p.version, v))
	{
		console.log((">> " + p.name + " is old ("+p.version+") a newer version ("+v+") is available").red);
		console.log(">> [sudo] npm update -g springroll-update\n".red);
		process.exit(1);
	}
	else
	{
		start();
	}
});

function start()
{
	var matches = _.filter(args, function(a){
		return /--update=.+/.exec(a);
	});

	if (matches && matches.length)
	{
		// Check for the update
		var update = matches[0].replace("--update=", '');

		if (/\.js$/.test(update))
		{
			var scriptUri = path.resolve(cwd, update);
			if (!fs.existsSync(scriptUri))
			{
				console.log((">> The update script '" + update + "' doesn't exist").red);
				console.log(scriptUri.red);
				process.exit(1);
			}
			console.log(scriptUri.blue);
			script = require(scriptUri);
		}
		else if (update.length) // make sure we have something
		{
			command = update;
		}
	}

	if (games.indexOf(lastArg) > -1)
	{
		games = [lastArg];
	}
	nextGame();
}

function nextGame()
{
	if (games.length)
	{
		var folder = games.shift();
		processGame(folder);
	}
}

function processGame(folder)
{
	// Check if is directory
	if (fs.lstatSync(folder).isDirectory() && ignore.indexOf(folder) === -1)
	{
		console.log(("Processing " + folder + "...").green.bold);

		if (args.indexOf('--pull') > -1 || args.indexOf('-p') > -1)
		{
			console.log("git pull origin master".dim);
			exec(
				'git pull origin master', 
				{ cwd: path.join(cwd, folder) }, 
				function(error, stdout, stderr)
				{
					console.log(folder.blue);
					console.log(stdout);
					console.log(stderr.dim);
					if (error !== null)
					{
						console.log(error.red);
					}
					nextGame();
				}
			);
		}
		if (script)
		{
			script(path.join(cwd, folder), nextGame);
		}
		else if (command)
		{
			runCommand(command, path.join(cwd, folder), nextGame);
		}
		console.log("");
	}
	else
	{
		nextGame();
	}
}

function runCommand(cmd, gamePath, completed)
{
	var path = require('path');
	var exec = require('child_process').exec;
	exec(cmd, {cwd: gamePath}, function (error, stdout, stderr) {
	    console.log(gamePath.green);
	    console.log(stdout);
	    console.log(stderr);
	    if (error !== null)
	    {
	    	console.log(String(error).red);
	    }
	    completed();
	    console.log("Done.".gray);
    });
}