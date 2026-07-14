import { expect } from "chai";
import { ethers } from "hardhat";
import type { PaymentRegistry } from "../typechain-types";

describe("PaymentRegistry", function () {
  async function deploy() {
    const [alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PaymentRegistry");
    const registry = (await Factory.deploy()) as unknown as PaymentRegistry;
    await registry.waitForDeployment();
    return { registry, alice, bob, carol };
  }

  it("logs a payment and emits PaymentLogged with the correct sender", async function () {
    const { registry, alice, bob } = await deploy();

    await expect(
      registry.connect(alice).logPayment(bob.address, 1_000_000n, "alice", "bob", "🍔 Food")
    )
      .to.emit(registry, "PaymentLogged")
      .withArgs(alice.address, bob.address, 1_000_000n, "alice", "bob", "🍔 Food", anyUint());
  });

  it("cannot log a payment on someone else's behalf — msg.sender is always the sender", async function () {
    const { registry, alice, bob, carol } = await deploy();

    // carol calls it, so carol is recorded as sender regardless of the
    // fromHandle string passed in — there's no ownership check on handles.
    await registry.connect(carol).logPayment(bob.address, 500n, "alice", "bob", "");
    const carolStats = await registry.getStats(carol.address);
    expect(carolStats.sentCount).to.equal(1n);

    const aliceStats = await registry.getStats(alice.address);
    expect(aliceStats.sentCount).to.equal(0n);
  });

  it("reverts on zero amount", async function () {
    const { registry, bob } = await deploy();
    await expect(registry.logPayment(bob.address, 0n, "a", "b", "")).to.be.revertedWithCustomError(
      registry,
      "ZeroAmount"
    );
  });

  it("reverts on zero address recipient", async function () {
    const { registry } = await deploy();
    await expect(
      registry.logPayment(ethers.ZeroAddress, 100n, "a", "b", "")
    ).to.be.revertedWithCustomError(registry, "ZeroAddress");
  });

  it("accumulates running totals correctly across multiple payments", async function () {
    const { registry, alice, bob, carol } = await deploy();

    await registry.connect(alice).logPayment(bob.address, 100n, "alice", "bob", "");
    await registry.connect(alice).logPayment(carol.address, 250n, "alice", "carol", "");
    await registry.connect(bob).logPayment(alice.address, 40n, "bob", "alice", "");

    const aliceStats = await registry.getStats(alice.address);
    expect(aliceStats.totalSentWei).to.equal(350n);
    expect(aliceStats.sentCount).to.equal(2n);
    expect(aliceStats.totalReceivedWei).to.equal(40n);
    expect(aliceStats.receivedCount).to.equal(1n);

    expect(await registry.totalPayments()).to.equal(3n);
    expect(await registry.totalVolumeWei()).to.equal(390n);
  });
});

// Chai matcher helper for the block.timestamp arg we can't predict exactly.
function anyUint() {
  return (v: unknown) => typeof v === "bigint" || typeof v === "number";
}
