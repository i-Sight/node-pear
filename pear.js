
var NodeCache = require( 'node-cache' )
var EventEmitter = require( 'events' ).EventEmitter
var util = require( 'util' )

function Pear(options) {
	EventEmitter.call(this)
	this._cache = new NodeCache(options)
	this._callbackQueues = {}
	this._fetchInProgress = {}

	var self = this

	this.on('fetched', function(key, err, value) {
		var callbacks = self._callbackQueues[key]
		delete self._callbackQueues[key]
		self._fetchInProgress[key] = false
		if(callbacks) {
			for(var i = 0 ; i < callbacks.length ; i++) {
				setImmediate(
					(function(callback) {
						callback(err, value)
					})(callbacks[i])
				)
			}
		}
	})
}
util.inherits(Pear, EventEmitter)

Pear.prototype.invalidate = function(key) {
  if(key) {
    this._cache.del(key)
  } else {
    this._cache.del(this._cache.keys())
  }
}

Pear.prototype.get = function(key, callback) {
	var self = this

	var cachedValue = self._cache.get(key)

	if(cachedValue[key]) {

		setImmediate(function() {
			callback(undefined, cachedValue[key])
		})

	} else if(self._fetchInProgress[key]) {

		if(!self._callbackQueues[key]) {
			self._callbackQueues[key] = []
		}
		self._callbackQueues[key].push(callback)

	} else if(!this._fetchInProgress[key]) {

		self._fetchInProgress[key] = true
		self.emit('fetch', key, function(err, value) {
			self.emit('fetched', key, err, value)
			if(!err) {
				self._cache.set(key, value)
			}
			self._fetchInProgress[key] = false
			callback(err, value)
		})

	}
}

module.exports = Pear
