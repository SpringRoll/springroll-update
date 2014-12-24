pbskids-games-update
====================
[![Build Status](https://travis-ci.org/SpringRoll/pbskids-games-update.svg)](https://travis-ci.org/SpringRoll/pbskids-games-update) [![Dependency Status](https://david-dm.org/SpringRoll/pbskids-games-update.svg?style=flat)](https://david-dm.org/SpringRoll/pbskids-games-update)

Running major structural updates to games created with the [PBSKidsGameTemplate](https://github.com/SpringRoll/PBSKidsGameTemplate).

## Usage

```bash
games-update [--all] [--pull] [--update=*] [*]
```

For example, to run a patch on all games:
```bash
games-update --all --update=patch.js
```

**patch.js**
```js
module.exports = function(gamePath)
{
  // do something to the game
  // where gamePath is the full
  // system path to the root
  // game folder.
};
```

## Install

```bash
sudo npm install -g pbskids-games-update
```

## License

MIT License.
