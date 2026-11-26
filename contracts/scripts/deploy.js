// Deploys CorridorRegistry, CorridorEscrow and EvidenceAnchor, wires them together and
// registers the demo operators. Writes addresses to deployments/<network>.json.
//
//   DEPLOYER_PRIVATE_KEY=0x... RELAYER_ADDRESS=0x... \
//   SENDER_OPERATOR=0x... PAYOUT_OPERATORS=0xA,0xB \
//   npx hardhat run scripts/deploy.js --network hashkeyMainnet
const fs = require("fs");
const path = require("path");
const { ethers, network } = require("hardhat");

// Stablecoins accepted by HSP on HashKey Chain (from the HashKey Merchant support matrix).
const STABLECOIN = {
  hashkeyMainnet: "0x054ed45810DbBAb8B27668922D110669c9D88D0a", // USDC.e (EIP-3009), chain 177
  hashkeyTestnet: "0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e", // USDC (EIP-3009), chain 133
};

const Role = { Sender: 1, Payout: 2 };

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`network=${network.name} deployer=${deployer.address}`);

  let tokenAddress = process.env.STABLECOIN_ADDRESS || STABLECOIN[network.name];
  if (!tokenAddress) {
    const mock = await (await ethers.getContractFactory("MockUSDC")).deploy();
    await mock.waitForDeployment();
    tokenAddress = await mock.getAddress();
    console.log(`MockUSDC (local only) ${tokenAddress}`);
  }

  const registry = await (await ethers.getContractFactory("CorridorRegistry")).deploy(deployer.address);
  await registry.waitForDeployment();
  const escrow = await (await ethers.getContractFactory("CorridorEscrow")).deploy(
    tokenAddress,
    await registry.getAddress(),
    deployer.address,
  );
  await escrow.waitForDeployment();
  const anchor = await (await ethers.getContractFactory("EvidenceAnchor")).deploy(deployer.address);
  await anchor.waitForDeployment();

  await (await registry.setEscrow(await escrow.getAddress())).wait();

  const relayer = process.env.RELAYER_ADDRESS || deployer.address;
  await (await escrow.setRelayer(relayer, true)).wait();
  await (await anchor.setAnchorer(relayer, true)).wait();

  const registered = [];
  if (process.env.SENDER_OPERATOR) {
    await (
      await registry.registerOperator(
        process.env.SENDER_OPERATOR,
        Role.Sender,
        process.env.SENDER_NAME || "Hanbit Remit (demo)",
        "KR->HK",
        ethers.id(process.env.SENDER_LICENSE_REF || "DEMO-KR-VA-TRANSFER-REG"),
      )
    ).wait();
    registered.push(process.env.SENDER_OPERATOR);
  }
  const payouts = (process.env.PAYOUT_OPERATORS || "").split(",").filter(Boolean);
  const payoutNames = (process.env.PAYOUT_NAMES || "Victoria Payout (demo),Harbour Cash (demo)").split(",");
  for (const [i, addr] of payouts.entries()) {
    await (
      await registry.registerOperator(
        addr,
        Role.Payout,
        payoutNames[i] || `Payout ${i + 1} (demo)`,
        "KR->HK",
        ethers.id(`DEMO-HK-MSO-${i + 1}`),
      )
    ).wait();
    registered.push(addr);
  }

  const out = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    stablecoin: tokenAddress,
    registry: await registry.getAddress(),
    escrow: await escrow.getAddress(),
    evidenceAnchor: await anchor.getAddress(),
    relayer,
    operators: registered,
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${network.name}.json`), JSON.stringify(out, null, 2) + "\n");
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
