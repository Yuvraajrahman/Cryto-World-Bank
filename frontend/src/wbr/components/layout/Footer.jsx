import { Link } from "react-router-dom";
import LogoMark from "../ui/LogoMark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/about" },
      { label: "Lending & savings", href: "/#product" },
      { label: "Reserve dashboard", href: "/reserve" },
      { label: "Launch platform", href: "/app/dashboard" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Bank hierarchy", href: "/about#tiers" },
      { label: "Credit passport", href: "/about#credit" },
      { label: "KYC levels", href: "/about#kyc" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Open an account", href: "/login" },
      { label: "Contract addresses", href: "/reserve#contracts" },
      { label: "Audit status", href: "/reserve#proof" },
      { label: "AI assistant", href: "/app/assistant" },
    ],
  },
];

function FootLink({ href, children }) {
  if (href.startsWith("/") && !href.includes("#")) {
    return <Link to={href}>{children}</Link>;
  }
  if (href.includes("#") && href.startsWith("/")) {
    return <Link to={href}>{children}</Link>;
  }
  return <a href={href}>{children}</a>;
}

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="logo" to="/">
              <LogoMark />
              Crypto World Bank
            </Link>
            <p>
              An institutional digital reserve for lending, deposits, and credit — organised across
              four tiers, with solvency attested on-chain.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FootLink href={link.href}>{link.label}</FootLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 Crypto World Bank — Deployed on Sepolia Testnet</span>
          <span>Not a licensed depository institution</span>
        </div>
      </div>
    </footer>
  );
}
