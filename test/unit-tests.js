var assert = require('assert');
var dataUtils = require('../lib/dataUtils');

describe('unit tests', function() {
  it('should run a simple test', function() {
    const abiEntry = dataUtils.convertTextSignatureToAbi('setTokennCrowdsale(address,uint256)');
    console.log(abiEntry);
    assert.equal(abiEntry.name, 'setTokennCrowdsale', 'abi name should be retrived');
  });

  it('should convert one 4byte entry to moesif entry', function() {
    const retrivedEntry = {
      id: 1,
      text_signature: 'balanceOf(address)',
      bytes_signature: "r'\x13\xf7",
      hex_signature: '0x722713f7'
    };

    const moesifEntry = dataUtils.convertOne4ByteEntry(retrivedEntry);
    console.log(JSON.stringify(moesifEntry, null, '  '));
    assert.ok(moesifEntry.abi_signature, 'abi signature exists');
    assert.equal(moesifEntry.abi_entry.name, 'balanceOf', 'the abi entry name is decoded');
  });
});
