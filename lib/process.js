'use strict';
var dataUtils = require('./dataUtils');

function _processCompiledContract(contract) {
  if (!contract || !Array.isArray(contract.abi)) {
    throw new Error('No ABI array found');
  }

  var abiArray = contract.abi;
  // Iterate new abi to generate method id's
  return abiArray.map(function(abi) {
    if (abi.name && Array.isArray(abi.inputs) && abi.type) {
       return {
        hex_signature: dataUtils.convertAbiEntryToHexSignature(abi),
        abi_signature: dataUtils.convertAbiEntryToLongSignature(abi),
        abi_entry: abi
      };
      // const hex_signature = new Web3().utils.sha3(
      //   abi.name +
      //     '(' +
      //     abi.inputs
      //       .map(function(input) {
      //         return input.type;
      //       })
      //       .join(',') +
      //     ')'
      // );
      // if (abi.type == 'event') {
      //   result.hex_signature = hex_signature.slice(0);
      // } else {
      //   result.hex_signature = hex_signature.slice(0, 10);
      // }
    } else {
      return {
        error: 'Currently only support abi entries that are function or events with name and inputs.',
        abi_entry: abi
      }
    }
  });
}


module.exports = {
  processCompiledContract: _processCompiledContract
};
