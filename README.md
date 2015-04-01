springroll-update
====================
[![Build Status](https://travis-ci.org/SpringRoll/springroll-update.svg)](https://travis-ci.org/SpringRoll/springroll-update) [![Dependency Status](https://david-dm.org/SpringRoll/springroll-update.svg?style=flat)](https://david-dm.org/SpringRoll/springroll-update)

Running major structural updates to games.

## Install

Install using NPM. Make sure to install globally.

```bash
sudo npm install -g springroll-update
```

## Usage

Open the directory which contains all your projects and run the `games-update` command. Below is the format of the script arguments.

```bash
games-update [--pull|-p] [--update=*] [*]
```

### Examples 

####Git Pull All

To update all games from Git. This would be like called `git pull master origin` from each folder. 

```bash
springroll-update -p
```

#### Custom Command

To run a custom bash script, set it as the update argument.

```bash
games-update --update="grunt clean config manifest default"
```

#### Custom Update Script

For example, to run a patch on all games:

```bash
springroll-update --update=patch.js
```

**patch.js**
```js
module.exports = function(gamePath, completed)
{
  // do something to the game
  // where gamePath is the full
  // system path to the root
  // game folder.
  
  // When done, call completed
  // this can be useful for doing async updates
  completed();
};
```

## License

MIT License.
