import { ethers } from "hardhat";
import type { BaseContract } from "ethers";

/** Commit + reveal a risk score so approveLoan can proceed (Phase III oracle). */
export async function commitAndRevealRisk(
  controller: BaseContract,
  oracle: { address: string },
  loanId: bigint | number,
  scoreBps = 2500,
) {
  const salt = ethers.randomBytes(32);
  const commitHash = ethers.keccak256(
    ethers.solidityPacked(["uint16", "bytes32"], [scoreBps, salt]),
  );
  const signer = await ethers.getSigner(oracle.address);
  await controller.connect(signer).commitRiskScore(loanId, commitHash);
  await controller.connect(signer).revealRiskScore(loanId, scoreBps, salt);
}
