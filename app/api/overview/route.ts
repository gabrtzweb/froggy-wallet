import {
  getConfiguredItemIds,
  getPluggyClient,
  normalizeErrorMessage,
} from "@/app/lib/server/pluggy";

type OverviewItemId = string;

type OverviewAccount = {
  id: string;
  name: string;
  displayName: string;
  maskedNumber: string;
  institutionName: string;
  institutionDomain: string;
  institutionLogoUrl: string;
  balance: number;
  currencyCode: string;
  type: string;
  subtype: string;
  itemId: string;
  creditLimit: number | null;
  availableCreditLimit: number | null;
  number: string;
};

type OverviewInvestment = {
  id: string;
  name: string;
  balance: number;
  currencyCode: string;
  type: string;
  status: string | null;
};

type OverviewResponse = {
  currencyCode: string;
  bankAccounts: OverviewAccount[];
  creditCards: OverviewAccount[];
  investments: OverviewInvestment[];
  bankTotal: number;
  creditOutstanding: number;
  creditLimit: number;
  creditUtilization: number;
  investmentTotal: number;
  investmentClasses: Array<{
    name: string;
    count: number;
    activeCount: number;
    inactiveCount: number;
    balance: number;
  }>;
  balanceHistory: Array<{
    label: string;
    value: number;
  }>;
  totalAccounts: number;
  totalAssets: number;
};

async function getItemIds(): Promise<OverviewItemId[]> {
  return getConfiguredItemIds();
}

function getCurrencyCode(values: Array<{ currencyCode?: string | null }>) {
  const currencyCode = values.find((value) => Boolean(value.currencyCode))?.currencyCode;
  return currencyCode ?? "BRL";
}

function getInstitutionDomain(institutionUrl: string | null | undefined) {
  if (!institutionUrl) {
    return "";
  }

  try {
    return new URL(institutionUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isGenericInstitutionName(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  const normalizedValue = normalizeErrorName(value);
  return (
    !normalizedValue ||
    normalizedValue === "pluggy" ||
    normalizedValue === "meu pluggy" ||
    normalizedValue === "meupluggy"
  );
}

function normalizeErrorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getStringCandidate(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const BANK_CODE_MAPPINGS: Record<string, { name: string; domain: string }> = {
  "001": { name: "Banco do Brasil", domain: "bb.com.br" },
  "033": { name: "Santander", domain: "santander.com.br" },
  "077": { name: "Inter", domain: "inter.co" },
  "104": { name: "Caixa", domain: "caixa.gov.br" },
  "237": { name: "Bradesco", domain: "bradesco.com.br" },
  "260": { name: "Nubank", domain: "nubank.com.br" },
  "341": { name: "Itaú", domain: "itau.com.br" },
  "336": { name: "C6 Bank", domain: "c6bank.com.br" },
  "748": { name: "Sicredi", domain: "sicredi.com.br" },
  "756": { name: "Sicoob", domain: "sicoob.com.br" },
};

function getBankCodeFromTransferNumber(transferNumber: string | null | undefined) {
  if (!transferNumber) {
    return "";
  }

  const match = transferNumber.match(/^0*(\d{3})[\/-]/);
  return match?.[1] ?? "";
}

function getInstitutionIdentityFromBankCode(code: string) {
  return BANK_CODE_MAPPINGS[code] ?? { name: "", domain: "" };
}

function getInstitutionIdentityFromDomain(domain: string) {
  const normalizedDomain = domain.toLowerCase();

  const mappings: Array<{ domains: string[]; name: string; domain: string }> = [
    { domains: ["nubank.com.br"], name: "Nubank", domain: "nubank.com.br" },
    { domains: ["inter.co", "bancointer.com.br"], name: "Inter", domain: "inter.co" },
    { domains: ["bb.com.br"], name: "Banco do Brasil", domain: "bb.com.br" },
    { domains: ["itau.com.br"], name: "Itaú", domain: "itau.com.br" },
    { domains: ["bradesco.com.br"], name: "Bradesco", domain: "bradesco.com.br" },
    { domains: ["santander.com.br"], name: "Santander", domain: "santander.com.br" },
    { domains: ["caixa.gov.br"], name: "Caixa", domain: "caixa.gov.br" },
    { domains: ["c6bank.com.br"], name: "C6 Bank", domain: "c6bank.com.br" },
    { domains: ["neon.com.br"], name: "Neon", domain: "neon.com.br" },
    { domains: ["next.me"], name: "next", domain: "next.me" },
    { domains: ["picpay.com"], name: "PicPay", domain: "picpay.com" },
    { domains: ["mercadopago.com.br"], name: "Mercado Pago", domain: "mercadopago.com.br" },
    { domains: ["sicoob.com.br"], name: "Sicoob", domain: "sicoob.com.br" },
    { domains: ["sicredi.com.br"], name: "Sicredi", domain: "sicredi.com.br" },
    { domains: ["btgpactual.com"], name: "BTG Pactual", domain: "btgpactual.com" },
    { domains: ["willbank.com.br"], name: "Will Bank", domain: "willbank.com.br" },
    { domains: ["pagbank.com.br"], name: "PagBank", domain: "pagbank.com.br" },
    { domains: ["bancooriginal.com.br"], name: "Banco Original", domain: "bancooriginal.com.br" },
    { domains: ["bancopan.com.br"], name: "Banco Pan", domain: "bancopan.com.br" },
  ];

  const match = mappings.find((mapping) =>
    mapping.domains.some((mappedDomain) => normalizedDomain.endsWith(mappedDomain)),
  );

  return {
    name: match?.name ?? "",
    domain: match?.domain ?? "",
  };
}

function getBankIdentity(rawName: string) {
  const normalizedName = normalizeErrorName(rawName);

  const mappings: Array<{ test: RegExp; name: string; domain: string }> = [
    { test: /nu pagamentos|nubank|nu bank/, name: "Nubank", domain: "nubank.com.br" },
    { test: /banco inter|\binter\b/, name: "Inter", domain: "inter.co" },
    { test: /banco do brasil|\bbb\b/, name: "Banco do Brasil", domain: "bb.com.br" },
    { test: /itau|itaú/, name: "Itaú", domain: "itau.com.br" },
    { test: /bradesco/, name: "Bradesco", domain: "bradesco.com.br" },
    { test: /santander/, name: "Santander", domain: "santander.com.br" },
    { test: /caixa/, name: "Caixa", domain: "caixa.gov.br" },
    { test: /c6/, name: "C6 Bank", domain: "c6bank.com.br" },
    { test: /neon/, name: "Neon", domain: "neon.com.br" },
    { test: /next/, name: "next", domain: "next.me" },
    { test: /picpay/, name: "PicPay", domain: "picpay.com" },
    { test: /mercado pago|mercadopago/, name: "Mercado Pago", domain: "mercadopago.com.br" },
    { test: /sicoob/, name: "Sicoob", domain: "sicoob.com.br" },
    { test: /sicredi/, name: "Sicredi", domain: "sicredi.com.br" },
    { test: /btg/, name: "BTG Pactual", domain: "btgpactual.com" },
    { test: /will bank/, name: "Will Bank", domain: "willbank.com.br" },
    { test: /pagbank|pagseguro/, name: "PagBank", domain: "pagbank.com.br" },
    { test: /original/, name: "Banco Original", domain: "bancooriginal.com.br" },
    { test: /pan/, name: "Banco Pan", domain: "bancopan.com.br" },
  ];

  const match = mappings.find((mapping) => mapping.test.test(normalizedName));

  return {
    name: match?.name ?? "",
    domain: match?.domain ?? "",
  };
}

function getInstitutionIdentityFromItem(item: {
  connector?: {
    name?: string | null;
    institutionUrl?: string | null;
  };
}, accounts: Array<Record<string, unknown>>) {
  const bankCodeCandidates = accounts
    .map((account) => {
      const bankData = account.bankData as { transferNumber?: string | null } | null | undefined;
      return getBankCodeFromTransferNumber(bankData?.transferNumber);
    })
    .filter(Boolean);

  for (const code of bankCodeCandidates) {
    const identity = getInstitutionIdentityFromBankCode(code);
    if (identity.name) {
      return identity;
    }
  }

  const domainCandidates = [
    getInstitutionDomain(item.connector?.institutionUrl),
    ...accounts.flatMap((account) => [
      getInstitutionDomain(getStringCandidate(account.institutionUrl)),
      getInstitutionDomain(getStringCandidate(account.institutionDomain)),
      getInstitutionDomain(getStringCandidate(account.institutionWebsite)),
    ]),
  ].filter(Boolean);

  for (const domain of domainCandidates) {
    const identity = getInstitutionIdentityFromDomain(domain);
    if (identity.name) {
      return identity;
    }
  }

  const nameCandidates = [
    getStringCandidate(item.connector?.name),
    ...accounts.flatMap((account) => [
      getStringCandidate(account.institutionName),
      getStringCandidate(account.institutionLabel),
      getStringCandidate(account.bankName),
      getStringCandidate(account.financialInstitutionName),
      getStringCandidate(account.providerName),
      getStringCandidate(account.connectorName),
    ]),
  ].filter((value) => value && !isGenericInstitutionName(value));

  for (const name of nameCandidates) {
    const identity = getBankIdentity(name);
    if (identity.name) {
      return identity;
    }
  }

  const fallbackName = nameCandidates[0] ?? "";

  return {
    name: fallbackName,
    domain: getInstitutionDomain(item.connector?.institutionUrl),
  };
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function getCreditCardDisplayName(account: {
  name: string;
  marketingName: string | null;
  creditData: { brand: string | null; level: string | null } | null;
}) {
  const brand = account.creditData?.brand ? toTitleCase(account.creditData.brand) : "";
  const level = account.creditData?.level ? toTitleCase(account.creditData.level) : "";
  const label = [brand, level].filter(Boolean).join(" ").trim();

  return label || account.marketingName || account.name;
}

function getMaskedCardNumber(number: string) {
  const lastDigits = number.slice(-4);
  return lastDigits ? `xxxx ${lastDigits}` : number;
}

function formatInvestmentClassName(investmentType: string) {
  switch (investmentType) {
    case "FIXED_INCOME":
      return "Renda Fixa";
    case "MUTUAL_FUND":
      return "Fundos";
    case "EQUITY":
      return "Renda Variavel";
    case "ETF":
      return "ETF";
    case "SECURITY":
      return "Previdencia";
    case "COE":
      return "COE";
    default:
      return "Outros";
  }
}

function buildMonthlyHistory(
  transactions: Array<{ date: string | Date; amount: number; type: string }>,
  locale: string,
) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentDay = now.getUTCDate();
  const days: Array<{ key: string; label: string; net: number }> = Array.from(
    { length: currentDay },
    (_, index) => {
      const day = index + 1;
      const current = new Date(Date.UTC(year, month, day));

      return {
        key: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        label: new Intl.DateTimeFormat(locale, { day: "numeric" }).format(current),
        net: 0,
      };
    },
  );

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() > currentDay) {
      continue;
    }

    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
      date.getUTCDate(),
    ).padStart(2, "0")}`;
    const bucket = days.find((day) => day.key === key);

    if (!bucket) {
      continue;
    }

    const amount = Number(transaction.amount ?? 0);
    const signedAmount = transaction.type === "DEBIT" ? -Math.abs(amount) : Math.abs(amount);
    bucket.net += signedAmount;
  }

  let runningTotal = 0;

  return days.map((day) => {
    runningTotal += day.net;

    return {
      label: day.label,
      value: Number(runningTotal.toFixed(2)),
    };
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") ?? "pt-BR";
    const itemIds = await getItemIds();

    if (!itemIds.length) {
      return Response.json(
        {
          error: "No Pluggy item IDs were configured. Add a BYOK connection in Settings.",
        },
        { status: 400 },
      );
    }

    const pluggy = await getPluggyClient();
    const dateTo = new Date();
    const dateFrom = new Date(dateTo);
    dateFrom.setUTCMonth(dateFrom.getUTCMonth() - 11);
    dateFrom.setUTCDate(1);
    dateFrom.setUTCHours(0, 0, 0, 0);

    const itemResults = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await pluggy.fetchItem(itemId);
        const [accountsResponse, investmentsResponse] = await Promise.all([
          pluggy.fetchAccounts(itemId),
          pluggy.fetchInvestments(itemId, undefined, { pageSize: 500 }),
        ]);

        const institutionIdentity = getInstitutionIdentityFromItem(item, accountsResponse.results as Array<Record<string, unknown>>);
        const institutionName = institutionIdentity.name || item.connector.name;
        const institutionDomain = institutionIdentity.domain || getInstitutionDomain(item.connector.institutionUrl);
        const institutionLogoUrl = item.connector.imageUrl;

        const bankAccounts = accountsResponse.results.filter(
          (account) => account.type === "BANK" && account.subtype !== "CREDIT_CARD",
        );
        const creditCards = accountsResponse.results.filter(
          (account) => account.type === "CREDIT" || account.subtype === "CREDIT_CARD",
        );

        const bankTransactions = await Promise.all(
          bankAccounts.map(async (account) => {
            try {
              const response = await pluggy.fetchAllTransactions(account.id, {
                from: dateFrom.toISOString(),
                to: dateTo.toISOString(),
              });

              return response;
            } catch {
              return [];
            }
          }),
        );

        return {
          institutionName,
          institutionDomain,
          institutionLogoUrl,
          accounts: [...bankAccounts, ...creditCards],
          investments: investmentsResponse.results,
          transactions: bankTransactions.flat(),
        };
      }),
    );

    const accounts = itemResults.flatMap((result) => result.accounts);
    const investments = itemResults.flatMap((result) => result.investments);
    const transactions = itemResults.flatMap((result) => result.transactions);

    const bankAccounts = accounts
      .filter((account) => account.type === "BANK" && account.subtype !== "CREDIT_CARD")
      .map((account) => {
        const itemResult = itemResults.find((result) =>
          result.accounts.some((resultAccount) => resultAccount.itemId === account.itemId),
        );

        return {
          id: account.id,
          name: account.marketingName ?? account.name,
          displayName: account.marketingName ?? account.name,
          maskedNumber: account.number,
          institutionName: itemResult?.institutionName ?? account.name,
          institutionDomain: itemResult?.institutionDomain ?? "",
          institutionLogoUrl: itemResult?.institutionLogoUrl ?? "",
          balance: Number(account.balance ?? 0),
          currencyCode: account.currencyCode,
          type: account.type,
          subtype: account.subtype,
          itemId: account.itemId,
          creditLimit: null,
          availableCreditLimit: null,
          number: account.number,
        };
      })
      .sort((left, right) => right.balance - left.balance);

    const creditCards = accounts
      .filter((account) => account.type === "CREDIT" || account.subtype === "CREDIT_CARD")
      .map((account) => {
        const itemResult = itemResults.find((result) =>
          result.accounts.some((resultAccount) => resultAccount.itemId === account.itemId),
        );

        return {
          id: account.id,
          name: account.marketingName ?? account.name,
          displayName: getCreditCardDisplayName(account),
          maskedNumber: getMaskedCardNumber(account.number),
          institutionName: itemResult?.institutionName ?? account.name,
          institutionDomain: itemResult?.institutionDomain ?? "",
          institutionLogoUrl: itemResult?.institutionLogoUrl ?? "",
          balance: Number(account.balance ?? 0),
          currencyCode: account.currencyCode,
          type: account.type,
          subtype: account.subtype,
          itemId: account.itemId,
          creditLimit: account.creditData?.creditLimit ?? null,
          availableCreditLimit: account.creditData?.availableCreditLimit ?? null,
          number: account.number,
        };
      })
      .sort((left, right) => right.balance - left.balance);

    const formattedInvestments = investments
      .map((investment) => ({
        id: investment.id,
        name: investment.name,
        balance: Number(investment.balance ?? 0),
        currencyCode: investment.currencyCode,
        type: investment.type,
        status: investment.status,
      }))
      .sort((left, right) => right.balance - left.balance);

    const bankTotal = Number(
      bankAccounts.reduce((sum, account) => sum + account.balance, 0).toFixed(2),
    );
    const creditOutstanding = Number(
      creditCards.reduce((sum, account) => sum + account.balance, 0).toFixed(2),
    );
    const creditLimit = Number(
      creditCards
        .reduce((sum, account) => sum + Number(account.creditLimit ?? 0), 0)
        .toFixed(2),
    );
    const creditUtilization = creditLimit > 0 ? creditOutstanding / creditLimit : 0;
    const investmentTotal = Number(
      formattedInvestments.reduce((sum, investment) => sum + investment.balance, 0).toFixed(2),
    );

    const investmentClassMap = new Map<
      string,
      { name: string; count: number; activeCount: number; inactiveCount: number; balance: number }
    >();

    for (const investment of formattedInvestments) {
      const className = formatInvestmentClassName(investment.type);
      const existing = investmentClassMap.get(className);
      const isActive = investment.status === "ACTIVE";

      if (existing) {
        existing.count += 1;
        existing.balance += investment.balance;
        existing.activeCount += isActive ? 1 : 0;
        existing.inactiveCount += isActive ? 0 : 1;
        continue;
      }

      investmentClassMap.set(className, {
        name: className,
        count: 1,
        activeCount: isActive ? 1 : 0,
        inactiveCount: isActive ? 0 : 1,
        balance: investment.balance,
      });
    }

    const balanceHistory = buildMonthlyHistory(
      transactions.map((transaction) => ({
        date: transaction.date,
        amount: Number(transaction.amount ?? 0),
        type: transaction.type,
      })),
      locale,
    );

    const currencyCode = getCurrencyCode([
      ...bankAccounts,
      ...creditCards,
      ...formattedInvestments,
    ]);

    const response: OverviewResponse = {
      currencyCode,
      bankAccounts,
      creditCards,
      investments: formattedInvestments,
      bankTotal,
      creditOutstanding,
      creditLimit,
      creditUtilization,
      investmentTotal,
      investmentClasses: [...investmentClassMap.values()].sort(
        (left, right) => right.balance - left.balance,
      ),
      balanceHistory,
      totalAccounts: accounts.length,
      totalAssets: accounts.length + investments.length,
    };

    return Response.json(response);
  } catch (error) {
    const message = normalizeErrorMessage(error, "Failed to load overview data");
    return Response.json({ error: message }, { status: 500 });
  }
}