import { ethers } from "hardhat";

async function main() {
  const HandleRegistry = await ethers.getContractFactory("HandleRegistry");
  const registry = await HandleRegistry.deploy();
  await registry.waitForDeployment();

  console.log("HandleRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
