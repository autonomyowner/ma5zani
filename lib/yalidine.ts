// Yalidine API Client
// Docs: https://api.yalidine.app/v1

const BASE_URL = "https://api.yalidine.app/v1";

export interface YalidineCredentials {
  apiId: string;
  apiToken: string;
}

export interface DeliveryFees {
  home_fee: number;
  desk_fee: number;
}

export interface YalidineParcel {
  order_id: string;
  from_wilaya_name: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  to_commune_name: string;
  to_wilaya_name: string;
  product_list: string;
  price: number;
  is_stopdesk: boolean;
  has_exchange: boolean;
  weight: number;
}

export interface YalidineParcelResponse {
  tracking: string;
  label: string;
  order_id: string;
}

export interface YalidineStatusResponse {
  tracking: string;
  historique: Array<{
    date: string;
    status: string;
  }>;
}

function headers(creds: YalidineCredentials): Record<string, string> {
  return {
    "X-API-ID": creds.apiId,
    "X-API-TOKEN": creds.apiToken,
    "Content-Type": "application/json",
  };
}

export async function getDeliveryFees(
  creds: YalidineCredentials,
  fromWilayaId: number,
  toWilayaId: number
): Promise<DeliveryFees> {
  const res = await fetch(
    `${BASE_URL}/deliveryfees/?from_wilaya_id=${fromWilayaId}&to_wilaya_id=${toWilayaId}`,
    { headers: headers(creds) }
  );
  if (!res.ok) {
    throw new Error(`Yalidine fees error: ${res.status}`);
  }
  const data = await res.json();
  // API returns array of fee objects
  const feeData = Array.isArray(data) ? data[0] : data;
  return {
    home_fee: feeData.home_fee ?? 0,
    desk_fee: feeData.desk_fee ?? 0,
  };
}

export async function createParcel(
  creds: YalidineCredentials,
  parcel: YalidineParcel
): Promise<YalidineParcelResponse> {
  const res = await fetch(`${BASE_URL}/parcels/`, {
    method: "POST",
    headers: headers(creds),
    body: JSON.stringify([parcel]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Yalidine create parcel error: ${res.status} - ${text}`);
  }
  const data = await res.json();
  // API returns array of results
  const result = Array.isArray(data) ? data[0] : data;
  if (!result.tracking) {
    throw new Error(`Yalidine: no tracking returned - ${JSON.stringify(result)}`);
  }
  return result;
}

export async function getParcelStatus(
  creds: YalidineCredentials,
  tracking: string
): Promise<YalidineStatusResponse> {
  const res = await fetch(`${BASE_URL}/parcels/${tracking}`, {
    headers: headers(creds),
  });
  if (!res.ok) {
    throw new Error(`Yalidine status error: ${res.status}`);
  }
  return res.json();
}

export async function testCredentials(
  creds: YalidineCredentials
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/wilayas/`, {
      headers: headers(creds),
    });
    return res.ok;
  } catch {
    return false;
  }
}
