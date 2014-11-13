
Pear
====

Pear is an in-memory cache especially handy when:
- cached values need to be retrieved asynchronously
- cache is invalidated based on a preset delay


When a key is not in the cache and needs to be retrieved, Pear fires only one cache fetch request at a time for that key.


Install
=======

```
npm install pear --save
```

Usage
=====

```
var Pear = require('pear')

var cache = new Pear({ stdTTL: 60 }) // options are passed to [node-cache](https://github.com/tcs-de/nodecache)

cache.on('fetch', function(key, callback) {
  // cache value needs to be retrieved for this key
  callback(err, newCacheValue)
})

cache.get(key, function(err, value) { ... })
cache.get(key, function(err, value) { ... })
```

