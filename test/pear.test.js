var assert = require('assert')
var uuid = require('uuid')
var Pear = require('../pear.js')

describe('pear', function() {

	it('simple get', function(done) {

		var pear = new Pear()

		var id = uuid.v4()
		pear.on('fetch', function(key, callback) {
			callback(undefined, id)
		})


		pear.get('foo', function(err, fetchedId) {
			assert.ok(!err, err)
			assert.equal(fetchedId, id)
			done()
		})

	})

	it('2 keys get', function(done) {

		var pear = new Pear()

		var id1 = uuid.v4()
		var id2 = uuid.v4()
		pear.on('fetch', function(key, callback) {
			if(key === '1') {
				callback(undefined, id1)
			} else {
				callback(undefined, id2)
			}
		})


		pear.get('1', function(err, fetchedId) {
			assert.ok(!err, err)
			assert.equal(fetchedId, id1)

			pear.get('2', function(err, fetchedId) {
				assert.ok(!err, err)
				assert.equal(fetchedId, id2)
				done()
			})
		})

	})

	it('cache values', function(done) {

		var pear = new Pear()

		var id = uuid.v4()
		var shouldBeCached = false
		pear.on('fetch', function(key, callback) {
			assert.ok(!shouldBeCached, 'expected cache to be used instead of fetching data again')
			shouldBeCached = true
			callback(undefined, id)
		})

		pear.get('foo', function(err, fetchedId) {

			assert.ok(!err, err)
			assert.equal(fetchedId, id)

			pear.get('foo', function(err, fetchedId) {
				assert.ok(!err, err)
				assert.equal(fetchedId, id)
				done()
			})
		})

	})

	it('cache times out values', function(done) {

		var pear = new Pear({stdTTL: 1/*second*/})

		var id
		var shouldBeCached = false
		pear.on('fetch', function(key, callback) {
			assert.ok(!shouldBeCached, 'expected cache to be used instead of fetching data again')
			shouldBeCached = true
			id = uuid.v4()
			callback(undefined, id)
		})

		pear.get('foo', function(err, fetchedId) {

			assert.ok(!err, err)
			assert.equal(fetchedId, id)

			pear.get('foo', function(err, fetchedId) {
				assert.ok(!err, err)
				assert.equal(fetchedId, id)

				setTimeout(function() {
					shouldBeCached = false;
					id = null // will be set by the fetch
					pear.get('foo', function(err, newlyFetchedId) {
						assert.ok(!err, err)
						assert.ok(newlyFetchedId !== fetchedId, 'expected a new fetch to have been processed')
						assert.equal(newlyFetchedId, id)
						done()
					})
				}, 1000)
			})
		})

	})


})
