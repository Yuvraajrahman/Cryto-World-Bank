import { useChainId } from "wagmi";
import { explorerTxUrl, explorerAddressUrl } from "../../lib/explorer";

/** Inline link to block explorer when URL is available. */
export default function ExplorerLink({ hash, address, label, className = "" }) {
  const chainId = useChainId();
  const url = hash
    ? explorerTxUrl(chainId, hash)
    : address
      ? explorerAddressUrl(chainId, address)
      : null;
  if (!url) {
    if (hash || address) {
      return (
        <code className={`mono ${className}`.trim()}>
          {(hash || address).slice(0, 10)}…
        </code>
      );
    }
    return null;
  }
  return (
    <a
      className={`text-link explorer-link ${className}`.trim()}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label || (hash ? "View on explorer" : "View address")}
    </a>
  );
}
