export type InstitutionIdentity = {
  name: string;
  domain: string;
};

type InstitutionAccountLike = {
  name?: string | null;
  institutionName?: string | null;
  institutionDomain?: string | null;
  marketingName?: string | null;
  bankData?: {
    transferNumber?: string | null;
  } | null;
};

type InstitutionItemLike = {
  item?: {
    connector?: {
      name?: string | null;
      institutionUrl?: string | null;
    };
  };
  accounts?: InstitutionAccountLike[];
};

export type InstitutionIdentityInput = InstitutionAccountLike | InstitutionItemLike;

const BANK_CODE_MAP: Record<string, InstitutionIdentity> = {
  "001": { name: "Banco do Brasil", domain: "bb.com.br" },
  "033": { name: "Santander", domain: "santander.com.br" },
  "077": { name: "Inter", domain: "inter.co" },
  "104": { name: "Caixa", domain: "caixa.gov.br" },
  "237": { name: "Bradesco", domain: "bradesco.com.br" },
  "260": { name: "Nubank", domain: "nubank.com.br" },
  "336": { name: "C6 Bank", domain: "c6bank.com.br" },
  "341": { name: "Ita\u00fa", domain: "itau.com.br" },
  "748": { name: "Sicredi", domain: "sicredi.com.br" },
  "756": { name: "Sicoob", domain: "sicoob.com.br" },
};

const NAME_IDENTITY_MAP: Array<{ test: RegExp; identity: InstitutionIdentity }> = [
  { test: /nu pagamentos|nubank|nu bank/, identity: { name: "Nubank", domain: "nubank.com.br" } },
  { test: /banco inter|\binter\b/, identity: { name: "Inter", domain: "inter.co" } },
  { test: /banco do brasil|\bbb\b/, identity: { name: "Banco do Brasil", domain: "bb.com.br" } },
  { test: /itau|ita\u00fa/, identity: { name: "Ita\u00fa", domain: "itau.com.br" } },
  { test: /bradesco/, identity: { name: "Bradesco", domain: "bradesco.com.br" } },
  { test: /santander/, identity: { name: "Santander", domain: "santander.com.br" } },
  { test: /caixa/, identity: { name: "Caixa", domain: "caixa.gov.br" } },
  { test: /c6/, identity: { name: "C6 Bank", domain: "c6bank.com.br" } },
  { test: /neon/, identity: { name: "Neon", domain: "neon.com.br" } },
  { test: /next/, identity: { name: "next", domain: "next.me" } },
  { test: /picpay/, identity: { name: "PicPay", domain: "picpay.com" } },
  { test: /mercado pago|mercadopago/, identity: { name: "Mercado Pago", domain: "mercadopago.com.br" } },
  { test: /sicoob/, identity: { name: "Sicoob", domain: "sicoob.com.br" } },
  { test: /sicredi/, identity: { name: "Sicredi", domain: "sicredi.com.br" } },
  { test: /btg/, identity: { name: "BTG Pactual", domain: "btgpactual.com" } },
  { test: /will bank/, identity: { name: "Will Bank", domain: "willbank.com.br" } },
  { test: /pagbank|pagseguro/, identity: { name: "PagBank", domain: "pagbank.com.br" } },
  { test: /original/, identity: { name: "Banco Original", domain: "bancooriginal.com.br" } },
  { test: /pan/, identity: { name: "Banco Pan", domain: "bancopan.com.br" } },
];

function inferIdentityByName(rawName: string): InstitutionIdentity {
  const normalized = normalizeText(rawName);
  const match = NAME_IDENTITY_MAP.find((mapping) => mapping.test.test(normalized));

  return {
    name: match?.identity.name ?? "",
    domain: match?.identity.domain ?? "",
  };
}

function getDomainFromUrl(urlValue: string | null | undefined) {
  if (!urlValue) {
    return "";
  }

  try {
    return new URL(urlValue).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getBankCode(transferNumber: string | null | undefined) {
  if (!transferNumber) {
    return "";
  }

  const match = transferNumber.match(/^0*(\d{3})[\/-]/);
  return match?.[1] ?? "";
}

function isGenericInstitutionName(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  const normalized = normalizeText(value).trim();
  return normalized === "meupluggy" || normalized === "meu pluggy" || normalized === "pluggy";
}

function asItemLike(value: InstitutionIdentityInput): InstitutionItemLike | null {
  if ("accounts" in value || "item" in value) {
    return value as InstitutionItemLike;
  }

  return null;
}

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function resolveInstitutionIdentity(source: InstitutionIdentityInput): InstitutionIdentity {
  const itemLike = asItemLike(source);

  if (itemLike?.accounts?.length) {
    const bankCodeIdentity = itemLike.accounts
      .map((account) => getBankCode(account.bankData?.transferNumber))
      .map((bankCode) => BANK_CODE_MAP[bankCode])
      .find(Boolean);

    if (bankCodeIdentity) {
      return bankCodeIdentity;
    }

    const accountNames = itemLike.accounts
      .flatMap((account) => [account.institutionName, account.marketingName, account.name])
      .filter((value): value is string => Boolean(value) && !isGenericInstitutionName(value));

    const nameIdentity = accountNames
      .map((value) => inferIdentityByName(value))
      .find((identity) => identity.domain);

    if (nameIdentity) {
      return nameIdentity;
    }

    const connectorName = itemLike.item?.connector?.name ?? "Bank connection";
    const connectorDomain = getDomainFromUrl(itemLike.item?.connector?.institutionUrl);

    return {
      name: isGenericInstitutionName(connectorName) ? "Bank connection" : connectorName,
      domain: connectorDomain,
    };
  }

  const accountLike = source as InstitutionAccountLike;
  const combinedName = `${accountLike.institutionName || ""} ${accountLike.name || ""}`;
  const identityByName = inferIdentityByName(combinedName);

  return {
    name: identityByName.domain ? identityByName.name : (accountLike.institutionName || accountLike.name || "Bank connection"),
    domain: identityByName.domain || accountLike.institutionDomain || "",
  };
}

export function getInstitutionLogoUrl(domain: string) {
  return domain ? `https://logos-api.apistemic.com/domain:${domain}?fallback=404` : "";
}

export function createInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

export function createFallbackLogoDataUrl(name: string) {
  const initials = createInitials(name);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="18" fill="#0f1812"/>
    <rect x="1" y="1" width="94" height="94" rx="17" stroke="rgba(255,255,255,0.12)"/>
    <text x="48" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#eafaf0">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}