#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var glob = require('glob');
var _ = require('lodash');
var colors = require('colors');

var ignore = ['node_modules', 'KrakenWebsite'];
var cwd = __dirname;

console.log("---------------------------------------------------------");
console.log(" __   ___   ___   _   _      __    ___   ___   _     _   ");
console.log("( (` | |_) | |_) | | | |\\ | / /`_ | |_) / / \\ | |   | |  ");
console.log("_)_) |_|   |_| \\ |_| |_| \\| \\_\\_/ |_| \\ \\_\\_/ |_|__ |_|__");
console.log("\n----------------------- U P D A T E ---------------------\n");

// Loop through each folder and run the updates
_.each(glob.sync('*'), function(folder){
	// Check if is directory
	if (fs.lstatSync(folder).isDirectory() && ignore.indexOf(folder) === -1)
	{
		console.log(("Processing " + folder + "...").green.bold);

		if (process.argv.indexOf('--pull') > -1)
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
		else if (process.argv.indexOf('--update') > -1)
		{
			console.log("Do update!".dim);
		}
		else
		{
			console.log("Doing nothing.".dim);
		}
		console.log("");
	}
});