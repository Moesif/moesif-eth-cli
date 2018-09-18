#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs');
var jwtDecode = require('jwt-decode');
var superagent = require('superagent');
var decodedToken = null;

var argv = require('yargs')
  .usage('Usage: moesif-eth -f [directory] -t [token] ')
  .example(
    'moesif-eth -f ./build/contracts -t MOESIF_MANAGEMENT_API_TOKEN',
    'uploads compiled smart contracts *.json in build/contract folder to moesif'
  )
  .alias('f', 'folder')
  .alias('t', 'token')
  .alias('d', 'dev')
  .nargs('f', 1)
  .nargs('t', 1)
  .version('1.0.0')
  .boolean('dev')
  .count('verbose')
  .alias('v', 'verbose')
  .describe('f', 'Directory of your compiled contracts')
  .describe('t', 'Moesif management api token. Can also be set via process.env.MOESIF_MANAGEMENT_API_TOKEN.')
  .describe('v', 'verbose level. -vvv is highest verbose level')
  .check(function(argv) {
    var apiKey = argv.token || process.env.MOESIF_MANAGEMENT_API_TOKEN;
    if (!apiKey) {
      throw new Error(
        'Please either set process.env.MOESIF_MANAGEMENT_API_TOKEN or provide the token via the command line -t option'
      );
    } else {
      try {
        decodedToken = jwtDecode(argv.token);
        if (decodedToken.app && decodedToken.org) {
          return true;
        } else {
          throw new Error(
            'The token seems to be wrong format, please go to your moesif account > Management APIs and generate a token with scope of "create:eth_abi"'
          );
        }
      } catch (error) {
        throw new Error(
          'The token seems to be wrong format, please go to your moesif account > Management APIs and generate a token with scope of "create:eth_abi"'
        );
      }
    }
  })
  .demandOption(['f'])
  .help('h')
  .alias('h', 'help').argv;

var VERBOSE_LEVEL = argv.verbose;

function WARN() {
  VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments);
}
function INFO() {
  VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments);
}
function DEBUG() {
  VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments);
}
var apiKey = argv.token || process.env.MOESIF_MANAGEMENT_API_TOKEN;

if (argv.dev) {
  INFO('using dev environment');
}

var processor = require('../lib/process');
var processCompiledContract = processor.processCompiledContract;
var MOESIF_API_BASERUL = 'https://www.moesif.com/api/search/';
var MOESIF_API_DEV_BASERUL = 'https://web-dev.moesif.com/api/search/';
// POST /search/:orgId/eth/abi?app_id=XXXX
// http://localhost:8080/api/search/314:10/eth/abi?app_id=xxx
function submitToMoesif(body, orgId, appId, token, isDev) {
  DEBUG('submitting to moesif');
  var finalUrl = isDev ? MOESIF_API_DEV_BASERUL : MOESIF_API_BASERUL;
  finalUrl = finalUrl + orgId + '/eth/abi';
  DEBUG('final url: ' + finalUrl);
  DEBUG('orgId: ' + orgId + ' appId: ' + appId);
  return superagent
    .post(finalUrl)
    .query({ app_id: appId })
    .set('Authorization', 'Bearer ' + token)
    .type('json')
    .send(body);
}

function processOneFile(filename) {
  DEBUG('processing ' + filename);
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
      WARN('failed to load: ', filename);
      WARN(err);
    } else {
      try {
        DEBUG('file loaded, about to process the file: ', filename);
        var obj = JSON.parse(data);
        var processedData = processCompiledContract(obj);
        DEBUG('ABI procssed for ' + filename);
        DEBUG(processedData);
        processedData
          .filter(function(item) {
            return item.error;
          })
          .forEach(function(item) {
            WARN(
              'skip ABI entry that are not function or events or do not have or name or inputs (found in ' +
                filename +
                ')'
            );
            WARN(JSON.stringify(item.abi_entry));
          });
        var enTriesWithNoError = processedData.filter(function(item) {
          return !item.error;
        });
        submitToMoesif(enTriesWithNoError, decodedToken.org, decodedToken.app, apiKey, argv.dev)
          .then(function() {
            INFO('File processed: ', filename);
          })
          .catch(function(err) {
            WARN('failed to submit to moesif: ', filename);
            WARN(err.toString());
          });
      } catch (err) {
        WARN('failed to process: ', filename);
        WARN(err.toString());
      }
    }
  });
}

function processFolder(startPath, filter) {
  DEBUG('startPath: ' + startPath);
  DEBUG('filter: ' + filter);
  if (!fs.existsSync(startPath)) {
    WARN('no dir ', startPath);
    return;
  }
  var files = fs.readdirSync(startPath);
  DEBUG(files.length);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    DEBUG(filename.indexOf(filter));
    DEBUG(filename);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      // ignore for now.
      DEBUG('is directory');
    } else if (filename.indexOf(filter) >= 0) {
      DEBUG('-- found: ', filename);
      processOneFile(filename);
    }
  }
}

processFolder(argv.folder, '.json');
