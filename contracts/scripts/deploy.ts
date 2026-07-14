import { ethers } from "hardhat";

async function main() {
  const PaymentRegistry = await ethers.getContractFactory("PaymentRegistry");
  const registry = await PaymentRegistry.deploy();
  await registry.waitForDeployment();

  console.log("PaymentRegistry deployed to:", await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
