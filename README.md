springroll-update
====================
[![Build Status](https://travis-ci.org/SpringRoll/springroll-update.svg)](https://travis-ci.org/SpringRoll/springroll-update) [![Dependency Status](https://david-dm.org/SpringRoll/springroll-update.svg?style=flat)](https://david-dm.org/SpringRoll/springroll-update)

Running major structural updates to games.

## Usage

```bash
springroll-update [-p] [--update=*] [*]
```

For example, to run a patch on all games:
```bash
springroll-update --update=patch.js
```

**patch.js**
```js
module.exports = function(gamePath, done)
{
  // do something to the game
  // where gamePath is the full
  // system path to the root
  // game folder.

  // Call done when we're finished
  done();
};
```

## Install

```bash
sudo npm install -g springroll-update
```

## License

MIT License.
