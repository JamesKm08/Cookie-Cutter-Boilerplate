import { expect } from "chai";
import {ethers} from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("HelloWorld", function () {

    async function deployContract() {
        const accounts = await ethers.getSigners();
        const helloWorldFactory = await ethers.getContractFactory("HelloWorld");
        const helloWorldContract = await helloWorldFactory.deploy();
        await helloWorldContract.waitForDeployment();
      
        return {helloWorldContract, accounts};
      }
    

    it("Should print out Hello World", async function () {
        const {helloWorldContract} = await loadFixture(deployContract)
        const text = await helloWorldContract.helloWorld();
        expect(text).to.eq("Hello World");
    })

    it("Should set owner to deployer account", async function () {
        const {helloWorldContract, accounts} = await loadFixture(deployContract)
        const owner = await helloWorldContract.owner();
        expect(owner).to.eq(accounts[0].address);
    })

    it("Should not allow anyone other than owner to call transferOwnership", async function (){
        const {helloWorldContract, accounts} = await loadFixture(deployContract)
        await expect(helloWorldContract.connect(accounts[1]).transferOwnership(accounts[1].address))
        .to.be.revertedWith("Caller is not the owner");
    })

    it("Should execute transferOwnership correctly", async function () {
        const {helloWorldContract, accounts} = await loadFixture(deployContract)
            // Get the current owner
        const currentOwner = await helloWorldContract.owner();
            // Generate a new owner for the transfer
        const newOwner = ethers.Wallet.createRandom().address;
            // Transfer from current to new owner
        await helloWorldContract.connect(accounts[0]).transferOwnership(newOwner);
            // Get the current owner to be contract owner
        const newContractOwner = await helloWorldContract.owner();
            // Check if current owner is new owner
        expect(newContractOwner).to.be.eq(newOwner);
        expect(currentOwner).not.to.eq(newContractOwner); 
      });

      it("Should not allow anyone other than owner to change text", async function () {
        const {helloWorldContract, accounts} = await loadFixture(deployContract);
        //Get owner of contract
        const owner = await helloWorldContract.owner();
        //Get the current text
        const text = await helloWorldContract.helloWorld();
        //Set text by owner
        await helloWorldContract.connect(accounts[0]).setText(owner);
        //Check if other address can change
        await expect(helloWorldContract.connect(accounts[2]).setText(""))
        .to.be.revertedWith("Caller is not the owner");
        //check if text has changed
        expect(text).to.eq("Hello World");
      });
    
});