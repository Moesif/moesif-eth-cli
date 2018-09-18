# Moesif Ethereum CLI

[Source Code on GitHub](https://github.com/moesif/moesif-eth-cli)

[Package on NPMJS](https://www.npmjs.com/package/moesif-eth-cli)

This CLI uploads compiled contract artifacts from your Dapp to Moesif
which enables automatic decoding of your captured DApp transactions.

The decoded data allows you to query on the functions, methods, events and
parameters in Moesif for Ethereum DApp analytics and debugging.

## Usage

Example:

```shell
npm install -g moesif-eth-cli
moesif-eth -f ./build/contracts -t MOESIF_MANAGEMENT_API_TOKEN
```

Replace MOESIF_MANAGEMENT_API_TOKEN with your actual Moesif Management API Token
The uploaded files should be compiled contracts in JSON format.

If a token is not provided, the CLI will read the `MOESIF_MANAGEMENT_API_TOKEN` environment variable
by default.

Full help is available below:

```
Usage: moesif-eth -f [directory] -t [token]

Options:
  --version      Show version number                                   [boolean]
  -f, --folder   Directory of your compiled contracts                 [required]
  -t, --token    Your Moesif uploader api token for Abi files         [required]
  -v, --verbose  verbose level. -vvv is highest verbose level            [count]
  -h, --help     Show help                                             [boolean]

Examples:
  moesif-eth -f ./build/contracts -t     uploads compiled smart contracts
  MOESIF_MANAGEMENT_API_TOKEN               *.json in build/contract folder to
                                            moesif
```


## Obtaining a MOESIF_MANAGEMENT_API_TOKEN

Go to your Moesif account, upper right menu > Management API.
Create a token that includes at least the scope `create:eth_abi`.
You can make the token non-expiring.