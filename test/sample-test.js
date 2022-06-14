const { expect } = require("chai");
const { ethers } = require("hardhat");

/* test/sample-test.js */
describe("Milikey", function() {
  it("Should create and execute market sales", async function() {
    /* deploy the marketplace */
    const Milikey = await ethers.getContractFactory("Milikey")
    const milikey = await Milikey.deploy()
    await milikey.deployed()

    let listingPrice = await milikey.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* create two tokens */
    await milikey.createToken("https://www.mytokenlocation.com", auctionPrice, { value: listingPrice })
    await milikey.createToken("https://www.mytokenlocation2.com", auctionPrice, { value: listingPrice })
      
    const [_, buyerAddress] = await ethers.getSigners()
  
    /* execute sale of token to another user */
    await milikey.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

    /* resell a token */
    await milikey.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

    /* query for and return the unsold items */
    items = await milikey.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await milikey.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})