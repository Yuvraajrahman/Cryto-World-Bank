/**
 * Testing-phase world seed: World + ~196 national banks + major-city local banks
 * + 20 clients per local bank. Idempotent / batched.
 *
 * Usage:
 *   cd backend && npx tsx scripts/seed-testing-world.ts
 *
 * Env:
 *   CLIENTS_PER_LOCAL=20   (default 20)
 *   SKIP_CLIENTS=1         skip client seeding
 *   BCRYPT_ROUNDS=4        password hash cost (testing)
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  PrismaClient,
  InstitutionType,
  UserRole,
  KycLevel,
  BankUserRole,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const WORLD_ID = "bank_world";
const WORLD_RESERVE_USDC = 1_000_000_000;
const CLIENTS_PER_LOCAL = Number(process.env.CLIENTS_PER_LOCAL || 20);
const SKIP_CLIENTS = process.env.SKIP_CLIENTS === "1";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 4);

const SUPER_ADMIN_EMAIL = "admin@gmail.com";
const SUPER_ADMIN_PASSWORD = "i_am_admin";

type CountryRow = {
  countryCode: string;
  iso2: string;
  name: string;
  slug: string;
  capital: string;
};

type CityRow = {
  countryCode: string;
  countrySlug: string;
  countryName: string;
  cityName: string;
  citySlug: string;
  population: number;
  isCapital: boolean;
};

function syntheticWallet(loginId: string): string {
  const h = createHash("sha256").update(`cwb:login:${loginId}`).digest("hex");
  return `0x${h.slice(0, 40)}`;
}

function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(filePath: string, headers: string[], rows: Array<Array<string | number>>) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  fs.writeFileSync(filePath, lines.join("\n") + "\n");
}

const FIRST = ["Alex", "Sam", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Avery", "Quinn", "Jamie", "Kai", "Noor", "Amir", "Sofia", "Lina", "Omar", "Yuki", "Chen", "Priya", "Luis"];
const LAST = ["Nguyen", "Garcia", "Khan", "Silva", "Kim", "Patel", "Hassan", "Costa", "Anders", "Okeke", "Ivanov", "Mbeki", "Sato", "Cohen", "Diaz", "Rahman", "Berg", "Zhou", "Ali", "Singh"];
const STREETS = ["Main St", "Oak Ave", "River Rd", "Market St", "Hill Rd", "Park Ln", "Lake View", "Cedar Blvd", "Station Rd", "Harbor Way"];

function seededRand(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000_000) / 10_000_000;
  };
}

function randomPii(loginId: string, countryName: string, cityName: string) {
  const rnd = seededRand(loginId);
  const first = FIRST[Math.floor(rnd() * FIRST.length)]!;
  const last = LAST[Math.floor(rnd() * LAST.length)]!;
  const street = STREETS[Math.floor(rnd() * STREETS.length)]!;
  const n = Math.floor(rnd() * 900) + 100;
  const year = 1975 + Math.floor(rnd() * 30);
  const month = 1 + Math.floor(rnd() * 12);
  const day = 1 + Math.floor(rnd() * 28);
  const phone = `+${100 + Math.floor(rnd() * 800)}${String(Math.floor(rnd() * 1e9)).padStart(9, "0")}`;
  return {
    displayName: `${first} ${last}`,
    phone,
    dateOfBirth: new Date(Date.UTC(year, month - 1, day)),
    country: countryName,
    address: `${n} ${street}, ${cityName}, ${countryName}`,
  };
}

async function ensureWorld() {
  await prisma.institution.upsert({
    where: { id: WORLD_ID },
    update: { name: "Crypto World Bank Reserve", institutionType: InstitutionType.WORLD },
    create: {
      id: WORLD_ID,
      institutionType: InstitutionType.WORLD,
      name: "Crypto World Bank Reserve",
      worldBank: { create: { lendingAprBps: 300 } },
    },
  });
  if (!(await prisma.worldBank.findUnique({ where: { institutionId: WORLD_ID } }))) {
    await prisma.worldBank.create({ data: { institutionId: WORLD_ID, lendingAprBps: 300 } });
  }
  await prisma.institutionCapital.upsert({
    where: { institutionId: WORLD_ID },
    update: {
      reserveEth: WORLD_RESERVE_USDC,
      allocatedEth: 0,
      lentEth: 0,
      repaidEth: 0,
      insuranceEth: 0,
      activeLoanCount: 0,
      syncedAt: new Date(),
    },
    create: {
      institutionId: WORLD_ID,
      reserveEth: WORLD_RESERVE_USDC,
      allocatedEth: 0,
      lentEth: 0,
      repaidEth: 0,
      insuranceEth: 0,
      activeLoanCount: 0,
      syncedAt: new Date(),
    },
  });
}

async function ensureSuperAdmin() {
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  const wallet = syntheticWallet("admin");
  const existing = await prisma.user.findFirst({
    where: { OR: [{ id: "usr_dev_admin" }, { email: SUPER_ADMIN_EMAIL }, { loginId: "admin" }] },
  });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        loginId: "admin",
        email: SUPER_ADMIN_EMAIL,
        emailConfirmed: true,
        passwordHash,
        role: UserRole.DEV_ADMIN,
        displayName: "Super Admin",
        onboardingComplete: true,
        isFirstTime: false,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        id: "usr_dev_admin",
        wallet,
        loginId: "admin",
        email: SUPER_ADMIN_EMAIL,
        emailConfirmed: true,
        passwordHash,
        role: UserRole.DEV_ADMIN,
        displayName: "Super Admin",
        onboardingComplete: true,
        isFirstTime: false,
      },
    });
  }
}

async function upsertStaffUser(opts: {
  id: string;
  loginId: string;
  displayName: string;
  role: UserRole;
  bankId: string;
  bankRole: BankUserRole;
  country?: string;
  passwordHash: string;
}) {
  const wallet = syntheticWallet(opts.loginId);
  const data = {
    wallet,
    loginId: opts.loginId,
    displayName: opts.displayName,
    role: opts.role,
    bankId: opts.bankId,
    passwordHash: opts.passwordHash,
    email: null as string | null,
    emailConfirmed: false,
    country: opts.country,
    onboardingComplete: true,
    isFirstTime: false,
  };

  const byLogin = await prisma.user.findUnique({ where: { loginId: opts.loginId } });
  if (byLogin) {
    await prisma.user.update({ where: { id: byLogin.id }, data });
  } else {
    const byId = await prisma.user.findUnique({ where: { id: opts.id } });
    if (byId) {
      await prisma.user.update({ where: { id: opts.id }, data });
    } else {
      await prisma.user.create({ data: { id: opts.id, ...data } });
    }
  }

  await prisma.bankUser.upsert({
    where: { walletAddress: wallet },
    update: {
      role: opts.bankRole,
      displayName: opts.displayName,
      institutionId: opts.bankId,
    },
    create: {
      institutionId: opts.bankId,
      walletAddress: wallet,
      displayName: opts.displayName,
      role: opts.bankRole,
    },
  });
}

async function main() {
  const dataDir = path.join(__dirname, "../prisma/data");
  const countries: CountryRow[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "un_countries.json"), "utf8"),
  );
  const cities: CityRow[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "major_cities.json"), "utf8"),
  );

  console.log(`Geo pack: ${countries.length} countries, ${cities.length} cities`);
  console.log(`Clients per local: ${CLIENTS_PER_LOCAL} (SKIP_CLIENTS=${SKIP_CLIENTS})`);

  await ensureWorld();
  await ensureSuperAdmin();
  console.log(`World reserve set to ${WORLD_RESERVE_USDC} USDC`);

  const nationalCreds: Array<Array<string | number>> = [];
  const localCreds: Array<Array<string | number>> = [];
  const clientCreds: Array<Array<string | number>> = [];

  // ---- Countries + National banks ----
  let ni = 0;
  for (const c of countries) {
    ni++;
    await prisma.country.upsert({
      where: { countryCode: c.countryCode },
      update: { name: c.name },
      create: { countryCode: c.countryCode, name: c.name },
    });

    const nbId = `bank_nb_${c.slug}`;
    const loginId = c.slug; // e.g. north_korea, bangladesh
    const passwordHash = await bcrypt.hash(loginId, BCRYPT_ROUNDS);

    await prisma.institution.upsert({
      where: { id: nbId },
      update: {
        name: `${c.name} National Bank`,
        countryCode: c.countryCode,
        institutionType: InstitutionType.NATIONAL,
      },
      create: {
        id: nbId,
        institutionType: InstitutionType.NATIONAL,
        name: `${c.name} National Bank`,
        countryCode: c.countryCode,
        nationalBank: {
          create: {
            parentWorldBankId: WORLD_ID,
            lendingAprBps: 500,
            jurisdiction: c.name,
          },
        },
      },
    });
    if (!(await prisma.nationalBank.findUnique({ where: { institutionId: nbId } }))) {
      await prisma.nationalBank.create({
        data: {
          institutionId: nbId,
          parentWorldBankId: WORLD_ID,
          lendingAprBps: 500,
          jurisdiction: c.name,
        },
      });
    }
    await prisma.institutionCapital.upsert({
      where: { institutionId: nbId },
      update: {
        reserveEth: 0,
        allocatedEth: 0,
        lentEth: 0,
        repaidEth: 0,
        syncedAt: new Date(),
      },
      create: {
        institutionId: nbId,
        reserveEth: 0,
        allocatedEth: 0,
        lentEth: 0,
        repaidEth: 0,
        syncedAt: new Date(),
      },
    });

    await upsertStaffUser({
      id: `usr_nb_${c.slug}`,
      loginId,
      displayName: `${c.name} National Admin`,
      role: UserRole.NATIONAL_BANK_ADMIN,
      bankId: nbId,
      bankRole: BankUserRole.NATIONAL_BANK_ADMIN,
      country: c.name,
      passwordHash,
    });

    nationalCreds.push([c.countryCode, c.name, loginId, loginId, nbId]);

    if (ni % 25 === 0 || ni === countries.length) {
      console.log(`  National banks: ${ni}/${countries.length}`);
    }
  }

  // ---- Local banks ----
  let li = 0;
  for (const city of cities) {
    li++;
    const nbId = `bank_nb_${city.countrySlug}`;
    const lbId = `bank_lb_${city.countrySlug}_${city.citySlug}`;
    const loginId = `local_${city.countrySlug}_${city.citySlug}`;
    const passwordHash = await bcrypt.hash(loginId, BCRYPT_ROUNDS);

    await prisma.institution.upsert({
      where: { id: lbId },
      update: {
        name: `Local Bank — ${city.cityName}, ${city.countryName}`,
        countryCode: city.countryCode,
        institutionType: InstitutionType.LOCAL,
      },
      create: {
        id: lbId,
        institutionType: InstitutionType.LOCAL,
        name: `Local Bank — ${city.cityName}, ${city.countryName}`,
        countryCode: city.countryCode,
        localBank: {
          create: {
            parentNationalBankId: nbId,
            borrowAprBps: 800,
            region: city.cityName,
          },
        },
      },
    });
    if (!(await prisma.localBank.findUnique({ where: { institutionId: lbId } }))) {
      await prisma.localBank.create({
        data: {
          institutionId: lbId,
          parentNationalBankId: nbId,
          borrowAprBps: 800,
          region: city.cityName,
        },
      });
    }
    await prisma.institutionCapital.upsert({
      where: { institutionId: lbId },
      update: {
        reserveEth: 0,
        allocatedEth: 0,
        lentEth: 0,
        repaidEth: 0,
        syncedAt: new Date(),
      },
      create: {
        institutionId: lbId,
        reserveEth: 0,
        allocatedEth: 0,
        lentEth: 0,
        repaidEth: 0,
        syncedAt: new Date(),
      },
    });

    await upsertStaffUser({
      id: `usr_lb_${city.countrySlug}_${city.citySlug}`,
      loginId,
      displayName: `${city.cityName} Local Admin`,
      role: UserRole.LOCAL_BANK_ADMIN,
      bankId: lbId,
      bankRole: BankUserRole.LOCAL_BANK_ADMIN,
      country: city.countryName,
      passwordHash,
    });

    localCreds.push([
      city.countryCode,
      city.countryName,
      city.cityName,
      loginId,
      loginId,
      lbId,
      nbId,
    ]);

    if (li % 100 === 0 || li === cities.length) {
      console.log(`  Local banks: ${li}/${cities.length}`);
    }
  }

  // ---- Clients (batched) ----
  if (!SKIP_CLIENTS) {
    type ClientRow = {
      id: string;
      loginId: string;
      wallet: string;
      passwordHash: string;
      displayName: string;
      phone: string;
      country: string;
      dateOfBirth: Date;
      bankId: string;
      cityName: string;
    };

    const planned: Omit<ClientRow, "passwordHash">[] = [];
    for (const city of cities) {
      const lbId = `bank_lb_${city.countrySlug}_${city.citySlug}`;
      for (let n = 1; n <= CLIENTS_PER_LOCAL; n++) {
        const seq = String(n).padStart(5, "0");
        const loginId = `client_${city.countrySlug}_${city.citySlug}_${seq}`;
        const pii = randomPii(loginId, city.countryName, city.cityName);
        planned.push({
          id: `usr_${loginId}`,
          loginId,
          wallet: syntheticWallet(loginId),
          displayName: pii.displayName,
          phone: pii.phone,
          country: pii.country,
          dateOfBirth: pii.dateOfBirth,
          bankId: lbId,
          cityName: city.cityName,
        });
      }
    }

    console.log(`  Hashing ${planned.length} client passwords (rounds=${BCRYPT_ROUNDS})…`);
    const HASH_PARALLEL = 64;
    const clients: ClientRow[] = [];
    for (let i = 0; i < planned.length; i += HASH_PARALLEL) {
      const slice = planned.slice(i, i + HASH_PARALLEL);
      const hashed = await Promise.all(
        slice.map(async (row) => ({
          ...row,
          passwordHash: await bcrypt.hash(row.loginId, BCRYPT_ROUNDS),
        })),
      );
      clients.push(...hashed);
      if ((i + HASH_PARALLEL) % 1024 < HASH_PARALLEL || i + HASH_PARALLEL >= planned.length) {
        console.log(`  Hashed: ${Math.min(i + HASH_PARALLEL, planned.length)}/${planned.length}`);
      }
    }

    const BATCH = 200;
    for (let i = 0; i < clients.length; i += BATCH) {
      const batch = clients.slice(i, i + BATCH);
      await prisma.$transaction(
        batch.map((row) =>
          prisma.user.upsert({
            where: { loginId: row.loginId },
            update: {
              wallet: row.wallet,
              passwordHash: row.passwordHash,
              displayName: row.displayName,
              phone: row.phone,
              country: row.country,
              dateOfBirth: row.dateOfBirth,
              role: UserRole.BORROWER,
              bankId: row.bankId,
              email: null,
              emailConfirmed: false,
              onboardingComplete: true,
              isFirstTime: false,
            },
            create: {
              id: row.id,
              wallet: row.wallet,
              loginId: row.loginId,
              passwordHash: row.passwordHash,
              displayName: row.displayName,
              phone: row.phone,
              country: row.country,
              dateOfBirth: row.dateOfBirth,
              role: UserRole.BORROWER,
              bankId: row.bankId,
              onboardingComplete: true,
              isFirstTime: false,
            },
          }),
        ),
      );
      await prisma.$transaction(
        batch.map((row) =>
          prisma.borrower.upsert({
            where: { walletAddress: row.wallet },
            update: { registeredLocalBankId: row.bankId },
            create: {
              walletAddress: row.wallet,
              registeredLocalBankId: row.bankId,
              kycLevel: KycLevel.LEVEL_0,
            },
          }),
        ),
      );
      for (const row of batch) {
        clientCreds.push([
          row.loginId,
          row.loginId,
          row.displayName,
          row.country,
          row.cityName,
          row.bankId,
          row.wallet,
        ]);
      }
      console.log(`  Clients upserted: ${Math.min(i + BATCH, clients.length)}/${clients.length}`);
    }
  }

  const docsDir = path.join(__dirname, "../../Documentation/testing");
  writeCsv(
    path.join(docsDir, "credentials-national.csv"),
    ["countryCode", "countryName", "loginId", "password", "bankId"],
    nationalCreds,
  );
  writeCsv(
    path.join(docsDir, "credentials-local.csv"),
    ["countryCode", "countryName", "cityName", "loginId", "password", "bankId", "parentNationalBankId"],
    localCreds,
  );
  if (!SKIP_CLIENTS) {
    writeCsv(
      path.join(docsDir, "credentials-clients.csv"),
      ["loginId", "password", "displayName", "country", "city", "localBankId", "wallet"],
      clientCreds,
    );
  }

  const nbCount = await prisma.institution.count({ where: { institutionType: "NATIONAL" } });
  const lbCount = await prisma.institution.count({ where: { institutionType: "LOCAL" } });
  const borrowerCount = await prisma.user.count({ where: { role: "BORROWER" } });
  const worldCap = await prisma.institutionCapital.findUnique({ where: { institutionId: WORLD_ID } });

  console.log("---- Done ----");
  console.log(`National institutions: ${nbCount}`);
  console.log(`Local institutions: ${lbCount}`);
  console.log(`Borrower users: ${borrowerCount}`);
  console.log(`World reserve (USDC units): ${worldCap?.reserveEth}`);
  console.log(`Credentials written under Documentation/testing/`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
