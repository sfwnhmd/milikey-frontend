const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const Milikey = await hre.ethers.getContractFactory("Milikey");
  const milikey = await Milikey.deploy();
  await milikey.deployed();
  console.log("nftMarketplace deployed to:", milikey.address);

  fs.writeFileSync('./config.js', `
  export const milikeyAddress = "${milikey.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });