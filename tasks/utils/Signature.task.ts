import { ethers } from "hardhat";
import { task } from "hardhat/config"


// npx hardhat set-sign --network localhost --address 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 --signer 1
task("set-sign", "Create a signature to change the commission")
    .addParam("address", "The contract proxy address")
    .addParam("signer", "The new signer")
    .setAction(async (taskArgs, hre) => {



        const sign = await hre.ethers.getSigners();
        const TicTacToe_example = await hre.ethers.getContractFactory("TicTacToe")
        const proxied = new hre.ethers.Contract(taskArgs.address, TicTacToe_example.interface, sign[0]);
        //const answer = await proxied.connect(sign[0]).getTest();
        const answer = await proxied.connect(sign[0]).setSigner(sign[taskArgs.signer].address);

        console.log("Done!");
    })



// npx hardhat new-commission-sign --network localhost --address 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 --commission 5 --nonce 1 --sign 0xb529fd992f2ad11fa369a3133f83144753b78c97fa1335971c5c9f1efbdda4206cd49ebaf6bd2e81a66ee9de68574baafc55716ac3a2020d063b59c6156d62b51c
task("new-commission-sign", "new commisison with sign message")
    .addParam("address", "The contract proxy address")
    .addParam("commission", "The new commission")
    .addParam("nonce", "The new nonce")
    .addParam("sign", "The signature")
    .setAction(async (taskArgs, hre) => {



        const sign = await hre.ethers.getSigners();
        const TicTacToe_example = await hre.ethers.getContractFactory("TicTacToe")
        const proxied = new hre.ethers.Contract(taskArgs.address, TicTacToe_example.interface, sign[0]);
        //const answer = await proxied.connect(sign[0]).getTest();
        const answer = await proxied.connect(sign[0]).newCommission(taskArgs.commission, taskArgs.sign, taskArgs.nonce);



        console.log("Done!");
    })


// npx hardhat new-sign --network localhost --address 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 --commission 5 --nonce 1 --signer 1
task("new-sign", "Create a signature to change the commission")
    .addParam("address", "The contract proxy address")
    .addParam("commission", "The new commission")
    .addParam("nonce", "The new nonce")
    .addParam("signer", "The new signer")
    .setAction(async (taskArgs, hre) => {


        const sign = await hre.ethers.getSigners();
        const fromAdress = sign[1].address;
        const _chainId = await hre.getChainId()


        const typedData = JSON.stringify({
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                Permit: [
                    { name: 'name', type: 'string' },
                    { name: 'academy', type: 'string' },
                    { name: 'homework', type: 'string' },
                    { name: 'commission', type: 'uint256' },
                    { name: "nonce", type: "uint256" },
                ],
            },
            primaryType: 'Permit',
            domain: {
                name: 'New commission',
                version: '1',
                chainId: _chainId,
                verifyingContract: taskArgs.address,
                //verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
            },
            message: {
                "name": "Dmitry St.",
                "academy": "ilink",
                "homework": "#5",
                "commission": taskArgs.commission,
                "nonce": taskArgs.nonce,
            },
        });


        const res = await hre.ethers.provider.send("eth_signTypedData_v4", [fromAdress, typedData])
        const signature = res.substring(2)
        const v = parseInt(signature.substring(128, 130), 16)
        const r = "0x" + signature.substring(0, 64)
        const s = "0x" + signature.substring(64, 128)


        console.log("Signature: " + res);
        console.log("v: " + v);
        console.log("r: " + r);
        console.log("s: " + s);



        console.log("Done!");
    })
