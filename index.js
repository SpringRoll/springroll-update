#!/usr/bin/env node

// Import external dependencies
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var glob = require('glob');
var _ = require('lodash');
var colors = require('colors');
var game = require('./lib/game.js');
var latest = require('latest');
var semver = require('semver');
var p = require(path.join(__dirname, 'package.json'));

// The folder names to ignore
var ignore = ['node_modules', 'KrakenWebsite', 'kraken-website'];

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
	console.log("-a or --all      Do all games in the current folder");
	console.log("-u or --update   Run the update script on the game");
	console.log("-p or --pull     Update to master branch from Git origin");
	console.log("[game]           The path to the game or folder");
	console.log("                 must be the last argument.");
	console.log("---------------------------------------------------------".dim);
	console.log("Usage\n".bold);
	console.log("Run the update script on all games".dim);
	console.log("games-update --all --update\n");
	console.log("Update all games from Git".dim);
	console.log("games-update --all --pull\n");
	console.log("Update a single game from Git:".dim);
	console.log("games-update --pull scrub-a-dub\n");
	console.log("---------------------------------------------------------".dim);
	console.log("\n");
	process.exit();
}

// Check for the latest version of the library
latest(p.name, function(err, v) {
	if (semver.lt(p.version, v))
	{
		console.log((">> " + p.name + " is old ("+p.version+") a newer version ("+v+") is available").red);
		console.log(">> [sudo] npm update -g pbskids-games-update\n".red);
		process.exit(1);
	}
	else
	{
		start();
	}
});

function start()
{	
	if (args.indexOf("--all") > -1 || args.indexOf("-a") > -1)
	{
		_.each(games, processGame);
	}
	else if (games.indexOf(lastArg) > -1)
	{
		processGame(lastArg);
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
				}
			);
		}
		if (args.indexOf('--update') > -1 || args.indexOf('-u') > -1)
		{
			game(path.join(cwd, folder));
		}
		console.log("");
	}
}