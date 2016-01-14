var protobuf = require('../')
var fs = require('fs')
var protoBench = fs.readFileSync(__dirname + '/bench.proto')
var descBench = fs.readFileSync(__dirname + '/bench.desc')
var messages = protobuf(protoBench)

var libProtobuf = require ('node-protobuf');
var libProto = new libProtobuf(descBench);

// Synchronously
var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadProtoFile(__dirname + '/bench.proto');
var classTest = builder.build ("Test");


var TIMES = 1000000

var then = 0
var diff = 0

var run = function(name, encode, decode, schema) {

  var result = {}

  var EXAMPLE = {
    foo: 'hello',
    hello: 42,
    payload: new Buffer('a'),
    meh: {
      b: {
        tmp: {
          baz: 1000
        }
      },
      lol: 'lol'
    }
  }

  var EXAMPLE_BUFFER = schema ? encode(EXAMPLE, schema) : encode(EXAMPLE)

  console.log('Benchmarking %s', name)
  console.log('  Running object encoding benchmark...')

  then = Date.now()
  for (var i = 0; i < TIMES; i++) {
    schema ? encode(EXAMPLE, schema) : encode(EXAMPLE)
  }
  diff = Date.now() - then

  result.encode = (1000 * TIMES / diff).toFixed(0)

  console.log('  Encoded %d objects in %d ms (%d enc/s)\n', TIMES, diff, result.encode)

  console.log('  Running object decoding benchmark...')

  then = Date.now()
  for (var i = 0; i < TIMES; i++) {
    schema ? decode(EXAMPLE_BUFFER, schema) : decode(EXAMPLE_BUFFER)
  }
  diff = Date.now() - then

  result.decode = (1000 * TIMES / diff).toFixed(0)

  console.log('  Decoded %d objects in %d ms (%d dec/s)\n', TIMES, diff, result.decode)

  console.log('  Running object encoding+decoding benchmark...')

  then = Date.now()
  for (var i = 0; i < TIMES; i++) {
    schema ? decode(encode(EXAMPLE, schema), schema) : decode(encode(EXAMPLE))
  }
  diff = Date.now() - then

  result.decodeencode = (1000 * TIMES / diff).toFixed(0)

  console.log('  Encoded+decoded %d objects in %d ms (%d enc+dec/s)\n', TIMES, diff, result.decodeencode)

  return result;
}

var results = {}

results["json"]             = run('JSON (baseline)', JSON.stringify, JSON.parse)
results["protocol-buffers"] = run('protocol-buffers', messages.Test.encode, messages.Test.decode)
results["protobufjs"]       = run('protobufjs', classTest.encode, classTest.decode)
results["node-protobuf"]    = run('node-protobuf', libProto.serialize.bind (libProto), libProto.parse.bind (libProto), "Test")

var svgText = require (__dirname + '/svg.js')(results)

fs.writeFileSync (__dirname + '/bench.svg', svgText)

