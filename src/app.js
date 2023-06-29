import ConnectDatabase from './config/database';
import { config } from './config';
import { pairSchema } from './models';

const { default: axios } = require('axios');
const { ethers } = require('ethers');
const rpc = 'https://bscrpc.com';
const provider = new ethers.providers.JsonRpcProvider(rpc);

ConnectDatabase(config.mongoURI);

let abi = [
    "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
];
let iface = new ethers.utils.Interface(abi);

const methods = [
    '0xc9c65396'
]

const scanBlock = async (blockNum) => {
    try {
        const curBlock = await provider.getBlockNumber();
        console.log(`blockNum:::${blockNum}:::curblock:::${curBlock}`);
        if (blockNum <= curBlock) {
            const block = await provider.getBlockWithTransactions(blockNum);
            console.log(`current block:::`, blockNum);
            if (block) {
                const txs = [];
                for (let v of block.transactions) {
                    if (methods.indexOf(v.data.slice(0, 10)) !== -1) {
                        txs.push(v.hash);
                    }
                }

                if (txs.length) {
                    const results = await axios.post(rpc, txs.map((i, k) => ({
                        "jsonrpc": "2.0",
                        "method": "eth_getTransactionReceipt",
                        "params": [i],
                        "id": k
                    })));
                    for (let i of results.data) {
                        if (i.result && i.result.status === '0x1' && i.result.logs.length) {
                            for (let log of i.result.logs) {
                                const eventName = iface.parseLog(log).name;
                                const token1 = iface.parseLog(log).args[0];
                                const token2 = iface.parseLog(log).args[1];
                                const pair = iface.parseLog(log).args[2];
                                const factory = log.address;

                                console.log(`eventname::`, eventName);
                                console.log(`token1::`, iface.parseLog(log).args[0]);
                                console.log(`token2::`, iface.parseLog(log).args[1]);
                                console.log(`pair::`, iface.parseLog(log).args[2]);
                                console.log(`factory::`, log.address);
                                if (factory == '0xca143ce32fe78f1f7019d7d551a6402fc5350c73' || factory == '0xc35DADB65012eC5796536bD9864eD8773aBc74C4') {
                                    let data = new pairSchema({
                                        address: pair,
                                        token1: token1,
                                        token2: token2,
                                        factory: factory,
                                        chain: 'bsc',
                                        liquidity: 0
                                    });
                                    await data.save();
                                }

                            }
                        }
                    }

                }
            }
            setTimeout(async () => {
                await scanBlock(blockNum + 1);
            }, 100)
        } else {
            console.log(`skip without action...`);
            setTimeout(async () => {
                await scanBlock(blockNum);
            }, 500)
        }

    } catch (err) {
        console.log(`error::`, err);
    }
}

(async () => {
    console.log(`123123`);
    let startBlock = await provider.getBlockNumber();
    console.log(`startBlock::`, startBlock);
    await scanBlock(24959865);
})();