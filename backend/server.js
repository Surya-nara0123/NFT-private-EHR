const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
// const path = require("path")
// const fs = require("fs")
require('dotenv').config();

/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'cc1');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

// Path to user private key directory.
const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

// Path to user certificate directory.
const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const assetId = `asset${String(Date.now())}`;

async function initConnection() {
    displayInputParameters();
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });
    try {
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // if needed uncomment the next line
        // await initLedger(contract);

        return { network, contract };
    } finally {
        //
    }
}
// async function main() {
// }

// main().catch((error) => {
//     console.error('******** FAILED to run the application:', error);
//     process.exitCode = 1;
// });

async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract) {
    console.log(
        '\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger'
    );

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllAssets(contract) {
    console.log(
        '\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger'
    );

    const resultBytes = await contract.evaluateTransaction('GetAllAssets');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createAsset(contract) {
    console.log(
        '\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments'
    );

    await contract.submitTransaction(
        'CreateAsset',
        assetId,
        'yellow',
        '5',
        'Tom',
        '1300'
    );

    console.log('*** Transaction committed successfully');
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferAssetAsync(contract) {
    console.log(
        '\n--> Async Submit Transaction: TransferAsset, updates existing asset owner'
    );

    const commit = await contract.submitAsync('TransferAsset', {
        arguments: [assetId, 'Saptha'],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(
        `*** Successfully submitted transaction to transfer ownership from ${oldOwner} to Saptha`
    );
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(
            `Transaction ${
                status.transactionId
            } failed to commit with status code ${String(status.code)}`
        );
    }

    console.log('*** Transaction committed successfully');
}

async function readAssetByID(contract) {
    console.log(
        '\n--> Evaluate Transaction: ReadAsset, function returns asset attributes'
    );

    const resultBytes = await contract.evaluateTransaction(
        'ReadAsset',
        assetId
    );

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateNonExistentAsset(contract) {
    console.log(
        '\n--> Submit Transaction: UpdateAsset asset70, asset70 does not exist and should return an error'
    );

    try {
        await contract.submitTransaction(
            'UpdateAsset',
            'asset70',
            'blue',
            '5',
            'Tomoko',
            '300'
        );
        console.log('******** FAILED to return an error');
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    }
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
function displayInputParameters() {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Initialize the ledger
app.post('/api/initLedger', async (req, res) => {
    try {
        const { network, contract } = await initConnection();
        initLedger(contract).then((val) => {
            res.json('InitLedger function executed successfully');
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    } finally {
        // network.close();
        // contract.close();
    }
});

// Create a new EHR
app.post('/api/createEHR', async (req, res) => {
    try {
        const { id, patientID } = req.body;
        const { contract } = await getNetworkConnection();
        await contract.submitTransaction(
            'CreatePrivateFractionalEHRNFT',
            id,
            patientID
        );
        res.json({ message: 'EHR created successfully' });
    } catch (error) {
        console.error(`Failed to create EHR: ${error}`);
        res.status(500).json({ error: 'Failed to create EHR' });
    }
});

// Add a fraction to an EHR
app.post('/api/addFraction', async (req, res) => {
    try {
        const { id, fractionType, dataHash, accessLevel } = req.body;
        const { contract } = await getNetworkConnection();
        await contract.submitTransaction(
            'AddEHRFraction',
            id,
            fractionType,
            dataHash,
            accessLevel
        );
        res.json({ message: 'Fraction added successfully' });
    } catch (error) {
        console.error(`Failed to add fraction: ${error}`);
        res.status(500).json({ error: 'Failed to add fraction' });
    }
});

// Transfer a fraction
app.post('/api/transferFraction', async (req, res) => {
    try {
        const { id, fractionType, newOwner } = req.body;
        const { contract } = await getNetworkConnection();
        await contract.submitTransaction(
            'TransferEHRFraction',
            id,
            fractionType,
            newOwner
        );
        res.json({ message: 'Fraction transferred successfully' });
    } catch (error) {
        console.error(`Failed to transfer fraction: ${error}`);
        res.status(500).json({ error: 'Failed to transfer fraction' });
    }
});

// Read an EHR
app.get('/api/readEHR/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { contract } = await getNetworkConnection();
        const result = await contract.evaluateTransaction(
            'ReadPrivateFractionalEHRNFT',
            id
        );
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to read EHR: ${error}`);
        res.status(500).json({ error: 'Failed to read EHR' });
    }
});

// Read a specific fraction
app.get('/api/readFraction/:id/:fractionType', async (req, res) => {
    try {
        const { id, fractionType } = req.params;
        const { contract } = await getNetworkConnection();
        const result = await contract.evaluateTransaction(
            'ReadEHRFraction',
            id,
            fractionType
        );
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to read fraction: ${error}`);
        res.status(500).json({ error: 'Failed to read fraction' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
