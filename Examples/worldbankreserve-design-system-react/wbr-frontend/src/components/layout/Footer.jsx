import LogoMark from '../ui/LogoMark';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#tiers' },
      { label: 'Lending & savings', href: '#product' },
      { label: 'Reserve dashboard', href: '#transparency' },
      { label: 'Credit passport', href: '#' },
    ],
  },
  {
    title: 'Governance',
    links: [
      { label: 'Bank hierarchy', href: '#' },
      { label: 'Rate & reserve policy', href: '#' },
      { label: 'Regulatory portal', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Contract addresses', href: '#' },
      { label: 'Audit reports', href: '#' },
      { label: 'Block explorer', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="logo" href="/">
              <LogoMark />
              WorldBankReserve
            </a>
            <p>A four-tier, collateral- and credit-based lending reserve, custodied on-chain and open to public audit.</p>
          </div>
          {COLUMNS.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 WorldBankReserve — Deployed on Sepolia Testnet</span>
          <span>Not a licensed depository institution</span>
        </div>
      </div>
    </footer>
  );
}
