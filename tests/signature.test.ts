import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners, prepareERC20Tokens, prepareTicTacToe, prepareWallet } from "./utils/prepare"
import { BigNumber } from "ethers"
import { parseBytes32String } from "ethers/lib/utils"

//Функция формирования сообщения
function getJSON(_chainId: number, token4Address: string, _commission: number, _nonce: number) {
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
            verifyingContract: token4Address,

        },
        message: {
            "name": "Dmitry St.",
            "academy": "ilink",
            "homework": "#5",
            "commission": _commission,
            "nonce": _nonce,
        },
    });

    return typedData;
}







use(waffle.solidity)
describe("Signature check", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareERC20Tokens(this, this.bob)
        await prepareTicTacToe(this, this.bob)
        this.token4.connect(this.bob).initialize(this.token1.address);
        await prepareWallet(this, this.bob)
        await this.token1.connect(this.bob).transfer(this.token4.address, 1000000);
    })




    describe("Testing #1", function () {

        it("Basic test", async function () {
            const _chainId = 31337; // Hardhat


            await this.token4.connect(this.bob).setSigner(this.misha.address); // Миша подписывает сообщения

            expect(await this.token4.connect(this.bob).getCommission()).to.eq(10) // Изначально комиссия 10

            let typedData = getJSON(_chainId, this.token4.address, 5, 0); // создаем сообщение (новая комиссия 5)
            let res = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData]) // подписываем сообщение (новая комиссия 5)

            expect(await this.token4.connect(this.bob).getCommission()).to.eq(10) // Изначально комиссия 10
            await this.token4.connect(this.bob).newCommission(5, res, 0) // Попытка изменить комиссию
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(5) // новая комиссия 5


            typedData = getJSON(_chainId, this.token4.address, 20, 1); // создаем сообщение (новая комиссия 20)
            res = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData]) // подписываем сообщение (новая комиссия 20)

            expect(await this.token4.connect(this.bob).getCommission()).to.eq(5) // Изначально комиссия 5
            await this.token4.connect(this.bob).newCommission(20, res, 1) // Попытка изменить комиссию
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(20) // новая комиссия 20
        })



        it("check require", async function () {
            const _chainId = 31337; // Hardhat




            await this.token4.connect(this.bob).setSigner(this.misha.address) // Миша подписывает сообщения
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(10) // Изначально комиссия 10

            let typedData = getJSON(_chainId, this.token4.address, 5, 0); // создаем сообщение (новая комиссия 5)


            let res = await ethers.provider.send("eth_signTypedData_v4", [this.tema.address, typedData]) // Тема подписывает сообщение (новая комиссия 5)
            await expect(this.token4.connect(this.bob).newCommission(5, res, 0)).to.be.reverted;  // адрес подписанта не совпадает!
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(10) // комиссия не изменилась

            res = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData]) // Миша подписывает сообщение (новая комиссия 5)
            await expect(this.token4.connect(this.bob).newCommission(80, res, 0)).to.be.reverted;  // Размер комиссия не совпадает!
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(10) // комиссия не изменилась

            await this.token4.connect(this.bob).newCommission(5, res, 0) // Попытка изменить комиссию (успешно)
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(5) // новая комиссия 5


            let typedData2 = getJSON(_chainId, this.token4.address, 50, 0); // создаем сообщение (новая комиссия 50, nonce 0)
            let res2 = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData2]) // Миша подписывает сообщение (новая комиссия 50)
            let typedData3 = getJSON(_chainId, this.token4.address, 60, 1); // создаем сообщение (новая комиссия 60, nonce 1)
            let res3 = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData3]) // Миша подписывает сообщение (новая комиссия 50)
            let typedData4 = getJSON(_chainId, this.token4.address, 70, 2); // создаем сообщение (новая комиссия 70, nonce 2)
            let res4 = await ethers.provider.send("eth_signTypedData_v4", [this.misha.address, typedData4]) // Миша подписывает сообщение (новая комиссия 50)


            await expect(this.token4.connect(this.bob).newCommission(50, res2, 0)).to.be.reverted;  // nonce не совпадает
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(5) // комиссия не изменилась

            await expect(this.token4.connect(this.bob).newCommission(70, res4, 2)).to.be.reverted;  // nonce не совпадает
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(5) // комиссия не изменилась

            await this.token4.connect(this.bob).newCommission(60, res3, 1) // Попытка изменить комиссию (успешно)
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(60) // новая комиссия 5

            await expect(this.token4.connect(this.bob).newCommission(60, res3, 1)).to.be.reverted;  // nonce не совпадает
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(60) // комиссия не изменилась

            await expect(this.token4.connect(this.bob).newCommission(50, res2, 0)).to.be.reverted;  // nonce не совпадает
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(60) // комиссия не изменилась

            await this.token4.connect(this.bob).newCommission(70, res4, 2) // Попытка изменить комиссию (успешно)
            expect(await this.token4.connect(this.bob).getCommission()).to.eq(70) // новая комиссия 5

        })


    })



})


