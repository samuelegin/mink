import { expect } from "chai";
import { ethers } from "hardhat";

describe("HandleRegistry — audit", () => {
  async function deploy() {
    const [sam, jane, mallory, ghost] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("HandleRegistry");
    const registry = await Factory.deploy();
    return { registry, sam, jane, mallory, ghost };
  }

  describe("input validation", () => {
    it("rejects an empty handle", async () => {
      const { registry, sam } = await deploy();
      await expect(registry.connect(sam).registerHandle("")).to.be.revertedWithCustomError(
        registry,
        "InvalidHandle"
      );
    });

    it("accepts a handle at exactly the 32-byte limit", async () => {
      const { registry, sam } = await deploy();
      const handle = "a".repeat(32);
      await expect(registry.connect(sam).registerHandle(handle)).to.not.be.reverted;
    });

    it("rejects a handle over the 32-byte limit", async () => {
      const { registry, sam } = await deploy();
      const handle = "a".repeat(33);
      await expect(registry.connect(sam).registerHandle(handle)).to.be.revertedWithCustomError(
        registry,
        "InvalidHandle"
      );
    });

    it("treats handles as byte length, not character count (multibyte input)", async () => {
      const { registry, sam } = await deploy();
      const handle = "🔥".repeat(9); // 4 bytes each = 36 bytes, over limit
      await expect(registry.connect(sam).registerHandle(handle)).to.be.revertedWithCustomError(
        registry,
        "InvalidHandle"
      );
    });

    it("treats handles as case-sensitive and distinct from lookalikes", async () => {
      const { registry, sam, jane } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(registry.connect(jane).registerHandle("Sam")).to.not.be.reverted;
      expect(await registry.resolve("sam")).to.equal(sam.address);
      expect(await registry.resolve("Sam")).to.equal(jane.address);
    });

    it("rejects setAddress to the zero address", async () => {
      const { registry, sam } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(
        registry.connect(sam).setAddress("sam", ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidHandle");
    });

    it("reverts resolving a handle that was never registered", async () => {
      const { registry } = await deploy();
      await expect(registry.resolve("ghost")).to.be.revertedWithCustomError(registry, "HandleNotFound");
    });

    it("reverts resolving an empty-string handle", async () => {
      const { registry } = await deploy();
      await expect(registry.resolve("")).to.be.revertedWithCustomError(registry, "HandleNotFound");
    });

    it("handleOf returns empty string for an address with no handle", async () => {
      const { registry, ghost } = await deploy();
      expect(await registry.handleOf(ghost.address)).to.equal("");
    });
  });

  describe("state invariants", () => {
    it("blocks setAddress from pointing a handle at an address that already owns a different handle", async () => {
      const { registry, sam, jane } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(jane).registerHandle("jane");

      await expect(
        registry.connect(sam).setAddress("sam", jane.address)
      ).to.be.revertedWithCustomError(registry, "AlreadyHasHandle");

      // jane's own handle must remain untouched
      expect(await registry.resolve("jane")).to.equal(jane.address);
      expect(await registry.handleOf(jane.address)).to.equal("jane");
    });

    it("keeps forward and reverse mappings consistent after a legitimate setAddress", async () => {
      const { registry, sam, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(sam).setAddress("sam", mallory.address);

      expect(await registry.resolve("sam")).to.equal(mallory.address);
      expect(await registry.handleOf(mallory.address)).to.equal("sam");
      expect(await registry.handleOf(sam.address)).to.equal("");
      expect(await registry.isAvailable("sam")).to.equal(false);
    });

    it("frees up the old owner's reverse-lookup slot so they could register a new handle", async () => {
      const { registry, sam, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(sam).setAddress("sam", mallory.address);

      await expect(registry.connect(sam).registerHandle("samuel")).to.not.be.reverted;
      expect(await registry.resolve("samuel")).to.equal(sam.address);
    });

    it("does not let a handle be registered twice even via race-like sequential calls", async () => {
      const { registry, sam, jane } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(registry.connect(jane).registerHandle("sam")).to.be.revertedWithCustomError(
        registry,
        "HandleTaken"
      );
      // state must still reflect the original owner, not be left ambiguous
      expect(await registry.resolve("sam")).to.equal(sam.address);
    });

    it("isAvailable reflects registration state accurately", async () => {
      const { registry, sam } = await deploy();
      expect(await registry.isAvailable("sam")).to.equal(true);
      await registry.connect(sam).registerHandle("sam");
      expect(await registry.isAvailable("sam")).to.equal(false);
    });
  });

  describe("access control", () => {
    it("blocks setAddress called by a non-owner even with a plausible-looking handle", async () => {
      const { registry, sam, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(
        registry.connect(mallory).setAddress("sam", mallory.address)
      ).to.be.revertedWithCustomError(registry, "NotHandleOwner");
    });

    it("blocks setAddress on a handle that was never registered", async () => {
      const { registry, mallory } = await deploy();
      await expect(
        registry.connect(mallory).setAddress("ghost", mallory.address)
      ).to.be.revertedWithCustomError(registry, "NotHandleOwner");
    });

    it("blocks logPayment impersonation from any third party", async () => {
      const { registry, sam, jane, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(jane).registerHandle("jane");
      await expect(
        registry.connect(mallory).logPayment("sam", "jane", 100, "not really from sam")
      ).to.be.revertedWithCustomError(registry, "NotHandleOwner");
    });

    it("blocks logPayment from the old owner after their handle address changed", async () => {
      const { registry, sam, jane, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(jane).registerHandle("jane");
      await registry.connect(sam).setAddress("sam", mallory.address);

      // sam's original wallet no longer controls "sam"
      await expect(
        registry.connect(sam).logPayment("sam", "jane", 10, "stale key")
      ).to.be.revertedWithCustomError(registry, "NotHandleOwner");

      // mallory, the new owner, can
      await expect(registry.connect(mallory).logPayment("sam", "jane", 10, "valid"))
        .to.emit(registry, "PaymentLogged")
        .withArgs("sam", "jane", mallory.address, jane.address, 10, "valid");
    });

    it("rejects logPayment targeting a nonexistent recipient handle", async () => {
      const { registry, sam } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(
        registry.connect(sam).logPayment("sam", "nobody", 5, "")
      ).to.be.revertedWithCustomError(registry, "HandleNotFound");
    });
  });

  describe("event correctness", () => {
    it("emits HandleRegistered with correct args on registration", async () => {
      const { registry, sam } = await deploy();
      await expect(registry.connect(sam).registerHandle("sam"))
        .to.emit(registry, "HandleRegistered")
        .withArgs("sam", sam.address);
    });

    it("emits AddressUpdated with correct old and new owner", async () => {
      const { registry, sam, mallory } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await expect(registry.connect(sam).setAddress("sam", mallory.address))
        .to.emit(registry, "AddressUpdated")
        .withArgs("sam", sam.address, mallory.address);
    });

    it("allows a zero-amount payment log without reverting (informational, not a fund transfer)", async () => {
      const { registry, sam, jane } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(jane).registerHandle("jane");
      await expect(registry.connect(sam).logPayment("sam", "jane", 0, ""))
        .to.emit(registry, "PaymentLogged")
        .withArgs("sam", "jane", sam.address, jane.address, 0, "");
    });
  });

  describe("no custody / no reentrancy surface", () => {
    it("contract never receives ETH — there is no payable function", async () => {
      const { registry, sam } = await deploy();
      const registryAddress = await registry.getAddress();
      await expect(
        sam.sendTransaction({ to: registryAddress, value: 1 })
      ).to.be.reverted;
    });

    it("contract balance stays zero through normal usage", async () => {
      const { registry, sam, jane } = await deploy();
      await registry.connect(sam).registerHandle("sam");
      await registry.connect(jane).registerHandle("jane");
      await registry.connect(sam).logPayment("sam", "jane", 500, "test");

      const registryAddress = await registry.getAddress();
      expect(await ethers.provider.getBalance(registryAddress)).to.equal(0n);
    });
  });
});
