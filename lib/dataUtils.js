"use strict";
var Web3 = require('web3');
var stableStringify = require('./stableStringify');


function createParamItem(type) {
  return {
    type: type
  };
}

// function parseTextSignature(sig) {
//   console.log('about to process:')
//   console.log(sig);
//   var tmp = /^(\w+)\((.+)\)$/.exec(sig);
//   if (tmp.length !== 3) {
//     throw new Error('not valid signature');
//   }

//   var args = /^(.+)\):\((.+)$/.exec(tmp[2]);

//   if (args !== null && args.length === 3) {
//     return {
//       name: tmp[1],
//       inputs: args[1].split(',').map(createParamItem),
//       outputs: args[2].split(',').map(createParamItem),
//       type: 'function'
//     };
//   } else {
//     return {
//       name: tmp[1],
//       inputs: tmp[2].split(',').map(createParamItem),
//       outputs: [],
//       type: 'function'
//     };
//   }
// }

function parseTextSignature(sig) {
  try {
    var part1 = sig.split('(');
    var funcName = part1[0];
    var part2 = part1[1].split(')');
    var args = part2[0] ? part2[0].split(',') : [];
    return {
      name: funcName,
      inputs: args.map(createParamItem),
      outputs: [],
    };
  } catch (err) {
    console.log(err);
    console.log('can not parse sig: ' + sig);
    return null;
  }
}

function _convertTextSignatureToAbi(textSiganture) {
  if (!textSiganture || typeof textSiganture !== 'string') return null;
  return parseTextSignature(textSiganture);
}

function _convertAbiEntryToHexSignature(abiEntry) {
  const signature = Web3.utils.sha3(
    abiEntry.name +
      '(' +
      abiEntry.inputs
        .map(function(input) {
          return input.type;
        })
        .join(',') +
      ')'
  );
  if (abiEntry.type == 'event') {
    return signatures;
  } else {
    return signature.slice(0, 10);
  }
}

function _convertAbiEntryToAbiSignature(abiEntry) {
  return Web3.utils.sha3(stableStringify(abiEntry)).slice(2, 18);
}

function _convertOne4ByteEntry(directoryEntry) {
  const abiEntry = _convertTextSignatureToAbi(directoryEntry.text_signature);
  return {
    hex_signature: directoryEntry.hex_signature,
    abi_signature: _convertAbiEntryToAbiSignature(abiEntry),
    abi_entry: abiEntry
  };
}

module.exports = {
  convertTextSignatureToAbi: _convertTextSignatureToAbi,
  convertAbiEntryToHexSignature: _convertAbiEntryToHexSignature,
  convertAbiEntryToLongSignature: _convertAbiEntryToAbiSignature,
  convertOne4ByteEntry: _convertOne4ByteEntry
};
