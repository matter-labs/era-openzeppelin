/// ENVVAR
// - CI:                output gas report to file instead of stdout
// - COVERAGE:          enable coverage report
// - ENABLE_GAS_REPORT: enable gas report
// - COMPILE_MODE:      production modes enables optimizations (default: development)
// - COMPILE_VERSION:   compiler version (default: 0.8.9)
// - COINMARKETCAP:     coinmarkercat api key for USD value in gas report

const fs = require('fs');
const path = require('path');
const argv = require('yargs/yargs')()
  .env('')
  .options({
    coverage: {
      type: 'boolean',
      default: false,
    },
    gas: {
      alias: 'enableGasReport',
      type: 'boolean',
      default: false,
    },
    gasReport: {
      alias: 'enableGasReportPath',
      type: 'string',
      implies: 'gas',
      default: undefined,
    },
    mode: {
      alias: 'compileMode',
      type: 'string',
      choices: [ 'production', 'development' ],
      default: 'development',
    },
    ir: {
      alias: 'enableIR',
      type: 'boolean',
      default: false,
    },
    compiler: {
      alias: 'compileVersion',
      type: 'string',
      default: '0.8.17',
    },
    coinmarketcap: {
      alias: 'coinmarketcapApiKey',
      type: 'string',
    },
  })
  .argv;

require('@matterlabs/hardhat-zksync-solc');
require('@nomiclabs/hardhat-truffle5');

if (argv.gas) {
  require('hardhat-gas-reporter');
}

for (const f of fs.readdirSync(path.join(__dirname, 'hardhat'))) {
  require(path.join(__dirname, 'hardhat', f));
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  zksolc: {
    version: '1.3.1',
    compilerSource: 'binary',
  },
  solidity: {
    version: argv.compiler,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'zksync',
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      zksync: true,
    },
    zksync: {
      url: 'http://localhost:3050/',
      zksync: true,
    },
  },
  gasReporter: {
    showMethodSig: true,
    currency: 'USD',
    outputFile: argv.gasReport,
    coinmarketcap: argv.coinmarketcap,
  },
};

if (argv.coverage) {
  require('solidity-coverage');
  module.exports.networks.hardhat.initialBaseFeePerGas = 0;
}
