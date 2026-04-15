import {
  getConfiguredItemIds,
  getPluggyClient,
  normalizeErrorMessage,
} from "@/app/lib/server/pluggy";

type UserInformationResponse = {
  fullName: string | null;
  documentId: string | null;
  birthDate: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type AccountIdentityFields = {
  owner?: string | null;
  taxNumber?: string | null;
};

type PluggyIdentityField = {
  value?: string | null;
};

type PluggyIdentityAddress = {
  fullAddress?: string | null;
  primaryAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

type PluggyIdentity = {
  fullName?: string | null;
  taxNumber?: string | null;
  document?: string | null;
  birthDate?: string | Date | null;
  emails?: PluggyIdentityField[] | null;
  phoneNumbers?: PluggyIdentityField[] | null;
  addresses?: PluggyIdentityAddress[] | null;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function getFirstIdentityValue(values: PluggyIdentityField[] | null | undefined) {
  if (!values?.length) {
    return null;
  }

  for (const value of values) {
    const normalizedValue = normalizeOptionalString(value?.value);
    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return null;
}

function getAddressValue(addresses: PluggyIdentityAddress[] | null | undefined) {
  if (!addresses?.length) {
    return null;
  }

  for (const address of addresses) {
    const fullAddress = normalizeOptionalString(address.fullAddress);
    if (fullAddress) {
      return fullAddress;
    }

    const composedAddress = [
      normalizeOptionalString(address.primaryAddress),
      normalizeOptionalString(address.city),
      normalizeOptionalString(address.state),
      normalizeOptionalString(address.postalCode),
      normalizeOptionalString(address.country),
    ]
      .filter(Boolean)
      .join(", ");

    if (composedAddress) {
      return composedAddress;
    }
  }

  return null;
}

function formatBirthDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const itemIds = await getConfiguredItemIds();

    if (!itemIds.length) {
      return Response.json(
        {
          error: "No Pluggy item IDs were configured. Add a BYOK connection in Settings.",
        },
        { status: 400 },
      );
    }

    const pluggy = await getPluggyClient();
    const dataByItem = await Promise.all(
      itemIds.map(async (itemId) => {
        const [accountsResponse, identity] = await Promise.all([
          pluggy.fetchAccounts(itemId),
          pluggy.fetchIdentityByItemId(itemId).catch(() => null),
        ]);

        return {
          accounts: accountsResponse.results as AccountIdentityFields[],
          identity: identity as PluggyIdentity | null,
        };
      }),
    );

    const accounts = dataByItem.flatMap((itemData) => itemData.accounts);
    const identities = dataByItem.map((itemData) => itemData.identity).filter(Boolean);
    let fullName: string | null = null;
    let documentId: string | null = null;
    let birthDate: string | null = null;
    let email: string | null = null;
    let phone: string | null = null;
    let address: string | null = null;

    for (const identity of identities) {
      if (!identity) {
        continue;
      }

      fullName = fullName ?? normalizeOptionalString(identity.fullName);
      documentId =
        documentId ?? normalizeOptionalString(identity.document) ?? normalizeOptionalString(identity.taxNumber);
      birthDate = birthDate ?? formatBirthDate(identity.birthDate);
      email = email ?? getFirstIdentityValue(identity.emails);
      phone = phone ?? getFirstIdentityValue(identity.phoneNumbers);
      address = address ?? getAddressValue(identity.addresses);
    }

    for (const account of accounts) {
      fullName = fullName ?? normalizeOptionalString(account.owner);
      documentId = documentId ?? normalizeOptionalString(account.taxNumber);

      if (fullName && documentId && birthDate && email && phone && address) {
        break;
      }
    }

    const response: UserInformationResponse = {
      fullName,
      documentId,
      birthDate,
      email,
      phone,
      address,
    };

    return Response.json(response);
  } catch (error) {
    const message = normalizeErrorMessage(error, "Failed to load user information");
    return Response.json({ error: message }, { status: 500 });
  }
}