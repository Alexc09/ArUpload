const Arweave = require("arweave");
const { default: Transaction } = require("arweave/node/lib/transaction");
const fs = require('fs')
var mime = require('mime-types')


let accKey 
let accAddress 
let balance 
let data 
let response

// Or to specify a gateway when running from NodeJS you might use
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000
});


const getBal = (address) => {
    arweave.wallets.getBalance(address).then((bal) => {
        // console.log(arweave.ar.winstonToAr(bal));
        return arweave.ar.winstonToAr(bal)
    }).catch((err) => console.log(err))
}


const uploadData = async (filepath) => {
    // 1. Create transaction
    data = fs.readFileSync(filepath)
    let tx = await arweave.createTransaction({data: data}, accKey)
    tx.addTag("Content-Type", mime.lookup(filepath))
    
    // 2. Sign transaction
    await arweave.transactions.sign(tx, accKey)

    // 3. Submit transaction
    await arweave.transactions.post(tx)

    let winstonFee = tx.reward
    let fee = arweave.ar.winstonToAr(winstonFee)
    
    console.log(`Fee: ${fee} AR`)
    console.log(`https://arweave.net/${tx.id}`)
    // await arweave.transactions.sign(tx, accKey)
}


const main = async (filepath) => {
    // Initialize arweave key
    if (!fs.existsSync('key.json')) {
        accKey = await arweave.wallets.generate()
        let accKeyStr = JSON.stringify(accKey)
        fs.writeFileSync("key.json", accKeyStr)
        console.log("Created arweave key.json")
    } else {
        let rawData = fs.readFileSync("key.json")
        accKey = JSON.parse(rawData)
    }
    
    accAddress = await arweave.wallets.jwkToAddress(accKey)
    console.log(`Address: ${accAddress}`)

    let winstonBal = await arweave.wallets.getBalance(accAddress)
    balance = arweave.ar.winstonToAr(winstonBal)
    console.log(`Current Balance: ${balance} AR`)

    uploadData(filepath)
}

main("samples/image.jpg")