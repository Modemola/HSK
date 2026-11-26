// The three demo cases: a compliant settlement, a structuring attempt, an SLA refund.
import { FX } from "../compliance/rules.ts";
import type { Party, TransferRequest } from "../compliance/types.ts";

const t0 = () => Math.floor(Date.now() / 1000);

const SME: Party = {
  id: "KR-CUST-0042",
  name: "Seoul Auto Parts Co.",
  country: "KR",
  address: "12 Teheran-ro, Gangnam-gu, Seoul",
  nationalIdRef: "BRN:hash:7f3a…",
  accountRef: "KR-HANBIT-110-234-5678",
  institution: "Hanbit Remit (demo)",
};

const SUPPLIER: Party = {
  id: "HK-BEN-0007",
  name: "Kowloon Parts Trading Ltd",
  country: "HK",
  address: "88 Nathan Road, Tsim Sha Tsui, Kowloon",
  accountRef: "HK-FPS-004-888-112233",
  institution: "Victoria Payout (demo)",
};

const WORKER: Party = {
  id: "KR-CUST-0913",
  name: "Nguyen Van An",
  country: "KR",
  address: "Ansan-si, Gyeonggi-do",
  dateOfBirth: "1994-03-02",
  accountRef: "KR-HANBIT-110-999-0001",
  institution: "Hanbit Remit (demo)",
};

const COUSIN: Party = {
  id: "HK-BEN-0311",
  name: "Tran Minh Duc",
  country: "HK",
  accountRef: "HK-FPS-004-555-778899",
};

export const krwForHkd = (hkd: number) => Math.round(hkd * FX.KRW_PER_HKD);

export function settlementCase(): TransferRequest {
  return {
    caseId: `CR-${t0()}-001`,
    createdAt: t0(),
    originator: SME,
    beneficiary: SUPPLIER,
    amountKrw: 3_000_000,
    memo: "Invoice KPT-2026-118 — brake pads, 400 units",
    declaredPurpose: "Payment for imported goods",
  };
}

export function structuringCases(): TransferRequest[] {
  const now = t0();
  return [
    { caseId: `CR-${now}-101`, createdAt: now, originator: WORKER, beneficiary: COUSIN, amountKrw: krwForHkd(7_900), memo: "for family" },
    { caseId: `CR-${now}-102`, createdAt: now + 600, originator: WORKER, beneficiary: COUSIN, amountKrw: krwForHkd(7_900), memo: "family 2" },
    {
      caseId: `CR-${now}-103`,
      createdAt: now + 1200,
      originator: WORKER,
      beneficiary: COUSIN,
      amountKrw: krwForHkd(7_900),
      memo: "신고 안 되게 세 번 나눠서 보내요 (sending in three parts so it isn't reported)",
    },
  ];
}

export function refundCase(): TransferRequest {
  return {
    caseId: `CR-${t0()}-201`,
    createdAt: t0(),
    originator: SME,
    beneficiary: SUPPLIER,
    amountKrw: 1_200_000,
    memo: "Invoice KPT-2026-131 — wiper blades",
    declaredPurpose: "Payment for imported goods",
  };
}
