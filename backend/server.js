const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const cors = require('cors');
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

async function initLedger(contract) {
    console.log(
        '\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger'
    );

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

async function CreatePrivateFractionalEHRNFT(contract, id) {
    // console.log(
    //     '\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments'
    // );
    await contract.submitTransaction('CreatePrivateFractionalEHRNFT', id);

    console.log('*** Transaction committed successfully');
}

async function AddEHRFraction(
    contract,
    id,
    fractionType,
    DataIpfs,
    accessLevel
) {
    console.log(
        '\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments'
    );

    await contract.submitTransaction(
        'AddEHRFraction',
        id,
        fractionType,
        DataIpfs,
        accessLevel
    );

    console.log('*** Transaction committed successfully');
}

async function TransferEHRFraction(contract, id, fractionType, newOwner) {
    console.log(
        '\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments'
    );

    await contract.submitTransaction(
        'TransferEHRFraction',
        id,
        fractionType,
        newOwner
    );

    console.log('*** Transaction committed successfully');
}

async function ReadPrivateFractionalEHRNFT(contract, id) {
    // console.log(
    //     '\n--> Evaluate Transaction: ReadAsset, function returns asset attributes'
    // );

    const resultBytes = await contract.evaluateTransaction(
        'ReadPrivateFractionalEHRNFT',
        id
    );

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Done');
    return result;
}

async function ReadEHRFraction(contract, id, fractionType) {
    // console.log(
    //     '\n--> Evaluate Transaction: ReadAsset, function returns asset attributes'
    // );

    const resultBytes = await contract.evaluateTransaction(
        'ReadEHRFraction',
        id,
        fractionType
    );

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Done');
    return result;
}

async function changeNFTFractionAccess(contract, newLevel, id, fractionType) {
    // console.log(
    //     '\n--> Evaluate Transaction: ReadAsset, function returns asset attributes'
    // );

    const resultBytes = await contract.evaluateTransaction(
        'changeNFTFractionAccess',
        newLevel,
        id,
        fractionType
    );

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Done');
    return result;
}

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

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
let contract, network;
initConnection().then((val) => {
    network = val.network;
    contract = val.contract;
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());
// Initialize the ledger
app.post('/api/initLedger', async (req, res) => {
    try {
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
        const { id } = await req.body;
        await CreatePrivateFractionalEHRNFT(contract, id);
        res.json({ message: 'EHR created successfully' });
    } catch (error) {
        console.error(`Failed to create EHR: ${error}`);
        res.status(500).json({ error: 'Failed to create EHR' });
    }
});

// Add a fraction to an EHR
app.post('/api/addFraction', async (req, res) => {
    try {
        const { id, fractionType, DataIpfs, accessLevel } = req.body;
        await AddEHRFraction(contract, id, fractionType, DataIpfs, accessLevel);
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
        await TransferEHRFraction(contract, id, fractionType, newOwner);
        res.json({ message: 'Fraction transferred successfully' });
    } catch (error) {
        console.error(`Failed to transfer fraction: ${error}`);
        res.status(500).json({ error: 'Failed to transfer fraction' });
    }
});

// update access levels of an nft fractions
app.post('/api/changeNFTFractionAccess', async (req, res) => {
    try {
        const { id, fractionType, newLevel } = req.body;
        await changeNFTFractionAccess(contract, newLevel, id, fractionType);
        res.json({ message: 'Fraction transferred successfully' });
    } catch (error) {
        console.error(`Failed to transfer fraction: ${error}`);
        res.status(500).json({ error: 'Failed to transfer fraction' });
    }
});

// Read an EHR
app.get('/api/readEHR', async (req, res) => {
    try {
        const { id } = req.body;
        const result = await ReadPrivateFractionalEHRNFT(contract, id);
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error(`Failed to read EHR: ${error}`);
        res.status(500).json({ error: 'Failed to read EHR' });
    }
});

// Read a specific fraction
app.get('/api/readFraction/', async (req, res) => {
    try {
        const { id, fractionType } = req.body;
        const result = await ReadEHRFraction(contract, id, fractionType);
        res.json(result);
    } catch (error) {
        console.error(`Failed to read fraction: ${error}`);
        res.status(500).json({ error: 'Failed to read fraction' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
