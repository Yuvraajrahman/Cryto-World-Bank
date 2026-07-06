import { ethers } from "ethers";
import { config } from "../config";

export function getChainProvider(): ethers.JsonRpcProvider | null {
  if (!config.chainRpcUrl) return null;
  return new ethers.JsonRpcProvider(config.chainRpcUrl);
}
