import { expect } from "chai";
import { ethers } from "hardhat";

describe("HandleRegistry", () => {
  async function deploy() {
    const [sam, jane, mallory] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("HandleRegistry");
    const registry = await Factory.deploy();
    return { registry, sam, jane, mallory };
  }

  it("registers a handle", async () => {
    const { registry, sam } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    expect(await registry.resolve("sam")).to.equal(sam.address);
    expect(await registry.handleOf(sam.address)).to.equal("sam");
  });

  it("rejects duplicate handle", async () => {
    const { registry, sam, jane } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await expect(registry.connect(jane).registerHandle("sam")).to.be.revertedWithCustomError(
      registry,
      "HandleTaken"
    );
  });

  it("rejects a second handle for the same address", async () => {
    const { registry, sam } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await expect(registry.connect(sam).registerHandle("samuel")).to.be.revertedWithCustomError(
      registry,
      "AlreadyHasHandle"
    );
  });

  it("lets the owner update their address", async () => {
    const { registry, sam, jane } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await registry.connect(sam).setAddress("sam", jane.address);
    expect(await registry.resolve("sam")).to.equal(jane.address);
  });

  it("blocks non-owners from updating the address", async () => {
    const { registry, sam, mallory } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await expect(
      registry.connect(mallory).setAddress("sam", mallory.address)
    ).to.be.revertedWithCustomError(registry, "NotHandleOwner");
  });

  it("logs a payment only from the real handle owner", async () => {
    const { registry, sam, jane, mallory } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await registry.connect(jane).registerHandle("jane");

    await expect(registry.connect(sam).logPayment("sam", "jane", 12, "coffee"))
      .to.emit(registry, "PaymentLogged")
      .withArgs("sam", "jane", sam.address, jane.address, 12, "coffee");

    await expect(
      registry.connect(mallory).logPayment("sam", "jane", 999, "fake")
    ).to.be.revertedWithCustomError(registry, "NotHandleOwner");
  });

  it("rejects logging a payment to an unknown handle", async () => {
    const { registry, sam } = await deploy();
    await registry.connect(sam).registerHandle("sam");
    await expect(
      registry.connect(sam).logPayment("sam", "ghost", 5, "")
    ).to.be.revertedWithCustomError(registry, "HandleNotFound");
  });
});
