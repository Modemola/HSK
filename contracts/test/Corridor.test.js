const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const Role = { None: 0, Sender: 1, Payout: 2 };
const Status = { None: 0, Locked: 1, Released: 2, Refunded: 3 };
const Kind = { Settlement: 0, Refund: 1, Blocked: 2 };
const USDC = (n) => ethers.parseUnits(String(n), 6);
const h = (s) => ethers.id(s);

async function deploy() {
  const [owner, sender, payoutA, payoutB, relayer, stranger] = await ethers.getSigners();
  const token = await (await ethers.getContractFactory("MockUSDC")).deploy();
  const registry = await (await ethers.getContractFactory("CorridorRegistry")).deploy(owner.address);
  const escrow = await (await ethers.getContractFactory("CorridorEscrow")).deploy(
    await token.getAddress(),
    await registry.getAddress(),
    owner.address,
  );
  const anchor = await (await ethers.getContractFactory("EvidenceAnchor")).deploy(owner.address);

  await registry.setEscrow(await escrow.getAddress());
  await registry.registerOperator(sender.address, Role.Sender, "Hanbit Remit", "KR->HK", h("KR-FX-REG-0001"));
  await registry.registerOperator(payoutA.address, Role.Payout, "Victoria Payout", "KR->HK", h("HK-MSO-0001"));
  await registry.registerOperator(payoutB.address, Role.Payout, "Harbour Cash", "KR->HK", h("HK-MSO-0002"));
  await escrow.setRelayer(relayer.address, true);
  await anchor.setAnchorer(relayer.address, true);
  await token.mint(sender.address, USDC(1000));

  return { owner, sender, payoutA, payoutB, relayer, stranger, token, registry, escrow, anchor };
}

async function lockFor(f, { amount = USDC(100), sla = 3600, payout = f.payoutA } = {}) {
  const deadline = BigInt((await time.latest()) + sla);
  const mandateHash = h("mandate-" + Math.random());
  const quoteHash = h("quote-" + Math.random());
  await f.token.connect(f.sender).approve(await f.escrow.getAddress(), amount);
  const id = await f.escrow.computeTransferId(f.sender.address, payout.address, amount, deadline, mandateHash, quoteHash);
  await expect(f.escrow.connect(f.sender).lock(payout.address, amount, deadline, mandateHash, quoteHash))
    .to.emit(f.escrow, "Locked")
    .withArgs(id, f.sender.address, payout.address, amount, deadline, mandateHash, quoteHash);
  return { id, amount, deadline, mandateHash, quoteHash };
}

async function signReceiveAuth(token, signer, to, value, nonce, validBefore) {
  const domain = {
    name: "USD Coin",
    version: "2",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await token.getAddress(),
  };
  const types = {
    ReceiveWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };
  const msg = { from: signer.address, to, value, validAfter: 0, validBefore, nonce };
  return ethers.Signature.from(await signer.signTypedData(domain, types, msg));
}

describe("CorridorRegistry", () => {
  it("registers operators and enforces roles", async () => {
    const f = await loadFixture(deploy);
    expect(await f.registry.operatorCount()).to.equal(3);
    expect(await f.registry.isActive(f.sender.address, Role.Sender)).to.equal(true);
    expect(await f.registry.isActive(f.sender.address, Role.Payout)).to.equal(false);
    const op = await f.registry.getOperator(f.payoutA.address);
    expect(op.name).to.equal("Victoria Payout");
    expect(op.corridor).to.equal("KR->HK");
  });

  it("rejects duplicate, zero and unauthorised registrations", async () => {
    const f = await loadFixture(deploy);
    await expect(
      f.registry.registerOperator(f.sender.address, Role.Sender, "x", "KR->HK", h("x")),
    ).to.be.revertedWithCustomError(f.registry, "AlreadyRegistered");
    await expect(
      f.registry.registerOperator(ethers.ZeroAddress, Role.Sender, "x", "KR->HK", h("x")),
    ).to.be.revertedWithCustomError(f.registry, "InvalidOperator");
    await expect(
      f.registry.registerOperator(f.stranger.address, Role.None, "x", "KR->HK", h("x")),
    ).to.be.revertedWithCustomError(f.registry, "InvalidRole");
    await expect(
      f.registry.connect(f.stranger).registerOperator(f.stranger.address, Role.Payout, "x", "KR->HK", h("x")),
    ).to.be.revertedWithCustomError(f.registry, "OwnableUnauthorizedAccount");
  });

  it("only lets the escrow write outcomes and binds the escrow once", async () => {
    const f = await loadFixture(deploy);
    await expect(f.registry.recordOutcome(f.payoutA.address, 1, true)).to.be.revertedWithCustomError(
      f.registry,
      "OnlyEscrow",
    );
    await expect(f.registry.setEscrow(f.stranger.address)).to.be.revertedWithCustomError(
      f.registry,
      "EscrowAlreadySet",
    );
  });
});

describe("CorridorEscrow", () => {
  it("locks, anchors the HSP receipt and releases to the payout operator", async () => {
    const f = await loadFixture(deploy);
    const { id, amount } = await lockFor(f);
    expect((await f.escrow.getTransfer(id)).status).to.equal(Status.Locked);

    await expect(f.escrow.connect(f.payoutA).confirmPayout(id, h("proof"))).to.be.revertedWithCustomError(
      f.escrow,
      "ReceiptMissing",
    );
    await expect(f.escrow.connect(f.relayer).anchorReceipt(id, h("receipt")))
      .to.emit(f.escrow, "ReceiptAnchored")
      .withArgs(id, h("receipt"));
    await expect(f.escrow.connect(f.payoutB).confirmPayout(id, h("proof"))).to.be.revertedWithCustomError(
      f.escrow,
      "NotPayout",
    );
    await expect(f.escrow.connect(f.payoutA).confirmPayout(id, h("proof")))
      .to.emit(f.escrow, "Released")
      .withArgs(id, f.payoutA.address, amount, h("proof"));

    expect(await f.token.balanceOf(f.payoutA.address)).to.equal(amount);
    const t = await f.escrow.getTransfer(id);
    expect(t.status).to.equal(Status.Released);
    expect(t.hspReceiptHash).to.equal(h("receipt"));
    const op = await f.registry.getOperator(f.payoutA.address);
    expect(op.settledCount).to.equal(1);
    expect(op.settledVolume).to.equal(amount);
  });

  it("refunds the sender after the SLA and keeps the receipt attached", async () => {
    const f = await loadFixture(deploy);
    const { id, amount, deadline } = await lockFor(f);
    await f.escrow.connect(f.relayer).anchorReceipt(id, h("receipt"));
    await expect(f.escrow.refund(id)).to.be.revertedWithCustomError(f.escrow, "NotExpired");

    await time.increaseTo(deadline + 1n);
    await expect(f.escrow.connect(f.payoutA).confirmPayout(id, h("late"))).to.be.revertedWithCustomError(
      f.escrow,
      "Expired",
    );
    const before = await f.token.balanceOf(f.sender.address);
    await expect(f.escrow.connect(f.stranger).refund(id))
      .to.emit(f.escrow, "Refunded")
      .withArgs(id, f.sender.address, amount, h("receipt"));
    expect(await f.token.balanceOf(f.sender.address)).to.equal(before + amount);
    expect((await f.escrow.getTransfer(id)).status).to.equal(Status.Refunded);
    expect((await f.registry.getOperator(f.payoutA.address)).refundedCount).to.equal(1);
    await expect(f.escrow.refund(id)).to.be.revertedWithCustomError(f.escrow, "NotLocked");
  });

  it("rejects unregistered or deactivated operators", async () => {
    const f = await loadFixture(deploy);
    const deadline = BigInt((await time.latest()) + 3600);
    await expect(
      f.escrow.connect(f.stranger).lock(f.payoutA.address, USDC(1), deadline, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "NotSender");
    await expect(
      f.escrow.connect(f.sender).lock(f.stranger.address, USDC(1), deadline, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "NotPayout");
    await f.registry.setActive(f.payoutB.address, false);
    await expect(
      f.escrow.connect(f.sender).lock(f.payoutB.address, USDC(1), deadline, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "NotPayout");
  });

  it("validates amount, hashes and SLA bounds", async () => {
    const f = await loadFixture(deploy);
    const now = BigInt(await time.latest());
    await expect(
      f.escrow.connect(f.sender).lock(f.payoutA.address, 0, now + 3600n, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "BadAmount");
    await expect(
      f.escrow.connect(f.sender).lock(f.payoutA.address, 1, now + 3600n, ethers.ZeroHash, h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "ZeroHash");
    await expect(
      f.escrow.connect(f.sender).lock(f.payoutA.address, 1, now + 10n, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "BadDeadline");
    await expect(
      f.escrow.connect(f.sender).lock(f.payoutA.address, 1, now + 8n * 86400n, h("m"), h("q")),
    ).to.be.revertedWithCustomError(f.escrow, "BadDeadline");
  });

  it("only relayers anchor receipts, once", async () => {
    const f = await loadFixture(deploy);
    const { id } = await lockFor(f);
    await expect(f.escrow.connect(f.stranger).anchorReceipt(id, h("r"))).to.be.revertedWithCustomError(
      f.escrow,
      "NotRelayer",
    );
    await f.escrow.connect(f.relayer).anchorReceipt(id, h("r"));
    await expect(f.escrow.connect(f.relayer).anchorReceipt(id, h("r2"))).to.be.revertedWithCustomError(
      f.escrow,
      "ReceiptAlreadyAnchored",
    );
    await expect(f.escrow.connect(f.relayer).anchorReceipt(h("nope"), h("r"))).to.be.revertedWithCustomError(
      f.escrow,
      "NotLocked",
    );
  });

  it("locks with an EIP-3009 authorization bound to the transfer terms", async () => {
    const f = await loadFixture(deploy);
    const amount = USDC(25);
    const deadline = BigInt((await time.latest()) + 3600);
    const [m, q] = [h("m-3009"), h("q-3009")];
    const escrowAddr = await f.escrow.getAddress();
    const id = await f.escrow.computeTransferId(f.sender.address, f.payoutA.address, amount, deadline, m, q);
    const validBefore = deadline;
    const sig = await signReceiveAuth(f.token, f.sender, escrowAddr, amount, id, validBefore);

    // A relayer trying to redirect the signed funds to another payout operator fails: the id/nonce changes.
    await expect(
      f.escrow
        .connect(f.relayer)
        .lockWithAuthorization(f.sender.address, f.payoutB.address, amount, deadline, m, q, 0, validBefore, sig.v, sig.r, sig.s),
    ).to.be.revertedWith("invalid signature");

    await expect(
      f.escrow
        .connect(f.relayer)
        .lockWithAuthorization(f.sender.address, f.payoutA.address, amount, deadline, m, q, 0, validBefore, sig.v, sig.r, sig.s),
    ).to.emit(f.escrow, "Locked");
    expect(await f.token.balanceOf(escrowAddr)).to.equal(amount);
    expect((await f.escrow.getTransfer(id)).sender).to.equal(f.sender.address);
  });
});

describe("EvidenceAnchor", () => {
  it("anchors packs append-only and rejects duplicates and strangers", async () => {
    const f = await loadFixture(deploy);
    const subject = h("case-1");
    await expect(f.anchor.connect(f.relayer).anchor(subject, h("pack-1"), Kind.Blocked, "corridor://case-1"))
      .to.emit(f.anchor, "EvidenceAnchored")
      .withArgs(subject, h("pack-1"), Kind.Blocked, "corridor://case-1", f.relayer.address);
    await f.anchor.connect(f.relayer).anchor(subject, h("pack-2"), Kind.Settlement, "");
    const recs = await f.anchor.recordsOf(subject);
    expect(recs.length).to.equal(2);
    expect(recs[0].kind).to.equal(Kind.Blocked);
    expect(await f.anchor.totalRecords()).to.equal(2);
    await expect(
      f.anchor.connect(f.relayer).anchor(subject, h("pack-1"), Kind.Settlement, ""),
    ).to.be.revertedWithCustomError(f.anchor, "DuplicatePack");
    await expect(
      f.anchor.connect(f.stranger).anchor(subject, h("pack-3"), Kind.Settlement, ""),
    ).to.be.revertedWithCustomError(f.anchor, "NotAnchorer");
  });
});
