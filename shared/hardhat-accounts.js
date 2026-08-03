export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_ACCOUNTS = [
    {
        index: 0,
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        role: "OWNER",
        label: "World Bank Governor",
        subtitle: "Tier 1 · deposit + allocate to national",
    },
    {
        index: 1,
        address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        role: "NATIONAL_BANK_ADMIN",
        label: "Bangladesh NB Admin",
        subtitle: "Tier 2 · allocate to local bank",
    },
    {
        index: 2,
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        role: "LOCAL_BANK_ADMIN",
        label: "Dhaka LB Governor",
        subtitle: "Tier 3 · manage approvers + loans",
    },
    {
        index: 3,
        address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        role: "APPROVER",
        label: "Loan Approver",
        subtitle: "Tier 3 · approve / reject requests",
    },
    {
        index: 4,
        address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        role: "BORROWER",
        label: "Borrower — Md. Bokhtiar",
        subtitle: "Tier 4 · request + repay loans",
    },
    {
        index: 5,
        address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        role: "BORROWER",
        label: "Borrower — Aisha",
        subtitle: "Tier 4 · first-time applicant",
    },
    {
        index: 6,
        address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        role: "BORROWER",
        label: "Borrower — Karim (group)",
        subtitle: "Tier 4 · group lending demo",
    },
    {
        index: 7,
        address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        role: "REGULATOR",
        label: "Regulatory Authority",
        subtitle: "A6 · read-only audit portal",
    },
    {
        index: 8,
        address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        role: "DEV_ADMIN",
        label: "Super Admin",
        subtitle: "Full access · admin@gmail.com",
    },
];
export function findAccountByRole(role, occurrence = 0) {
    return HARDHAT_ACCOUNTS.filter((a) => a.role === role)[occurrence];
}
export function findAccountByAddress(address) {
    if (!address)
        return undefined;
    const lower = address.toLowerCase();
    return HARDHAT_ACCOUNTS.find((a) => a.address.toLowerCase() === lower);
}
