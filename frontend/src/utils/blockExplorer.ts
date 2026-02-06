/**
 * Block explorer URLs for supported chains.
 */
export function getTxExplorerUrl(chainId: number, txHash: string): string {
  switch (chainId) {
    case 80001:
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
}
