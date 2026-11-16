import { useState, type FormEvent } from 'react';
import { CheckCircle2, CreditCard, Download, Receipt, Search } from 'lucide-react';
import { lookupBillByRrNumber, SAMPLE_BILL_RECORDS } from '../engine/billing';
import { BESCOM_FEEDERS } from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type { BillRecord, Language, PaymentMethod } from '../types/lumenops';

interface CitizenBillingTabProps {
  lang: Language;
  billsByRr: Record<string, BillRecord>;
  onPayBill: (bill: BillRecord, method: PaymentMethod) => BillRecord;
}

export default function CitizenBillingTab({
  lang,
  billsByRr,
  onPayBill,
}: CitizenBillingTabProps) {
  const [rrInput, setRrInput] = useState('BLR-E4-71904');
  const [activeBill, setActiveBill] = useState<BillRecord | null>(
    () => lookupBillByRrNumber('BLR-E4-71904', billsByRr)
  );
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang].citizen.billing;

  const handleFetchBill = (e?: FormEvent, overrideRr?: string) => {
    if (e) e.preventDefault();
    const query = (overrideRr ?? rrInput).trim().toUpperCase();
    if (overrideRr) setRrInput(query);
    const found = lookupBillByRrNumber(query, billsByRr);
    if (!found) {
      setErrorMsg(t.notFoundError);
      setActiveBill(null);
      return;
    }
    setErrorMsg(null);
    setActiveBill(found);
  };

  const handlePayNow = () => {
    if (!activeBill || activeBill.status === 'Paid') return;
    const paid = onPayBill(activeBill, method);
    setActiveBill(paid);
  };

  const handleDownloadReceipt = () => {
    if (!activeBill || activeBill.status !== 'Paid') return;
    const lines = [
      '============================================',
      '       BESCOM OFFICIAL PAYMENT RECEIPT      ',
      '============================================',
      `Transaction ID : ${activeBill.transactionId}`,
      `Paid Timestamp : ${activeBill.paidAt}`,
      `Payment Method : ${activeBill.paymentMethod}`,
      '--------------------------------------------',
      `Consumer RR No : ${activeBill.rrNumber}`,
      `Account Holder : ${activeBill.consumerName}`,
      `Feeder / Area  : ${activeBill.feederId} (${activeBill.area})`,
      `Tariff         : ${activeBill.tariff}`,
      `Billing Period : ${activeBill.billingCycle}`,
      `Units Consumed : ${activeBill.unitsConsumedKwh} kWh`,
      `Fixed Charges  : INR ${activeBill.fixedCharges.toFixed(2)}`,
      `Energy Charges : INR ${activeBill.energyCharges.toFixed(2)}`,
      '--------------------------------------------',
      `TOTAL PAID     : INR ${activeBill.totalAmount.toFixed(2)}`,
      'Status         : PAID',
      '============================================',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BESCOM-Receipt-${activeBill.rrNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const feederMeta = activeBill
    ? BESCOM_FEEDERS.find((f) => f.feederId === activeBill.feederId)
    : undefined;
  const localizedArea =
    activeBill && lang === 'kn' && feederMeta ? feederMeta.areaKn : activeBill?.area;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: RR Number Lookup & Sample Accounts */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-slate-900">{t.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600">{t.subtitle}</p>
        </div>

        <form onSubmit={(e) => handleFetchBill(e)} className="space-y-4">
          <div>
            <label
              htmlFor="bill-rr-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.rrInputLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="bill-rr-input"
                  type="text"
                  value={rrInput}
                  onChange={(e) => setRrInput(e.target.value.toUpperCase())}
                  placeholder={t.rrPlaceholder}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase focus-visible:outline-2 focus-visible:outline-amber-500"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-sm font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.fetchBtn}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
        </form>

        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-xs font-medium text-slate-500">{t.sampleLabel}</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_BILL_RECORDS.map((sample) => (
              <button
                key={sample.rrNumber}
                type="button"
                onClick={() => handleFetchBill(undefined, sample.rrNumber)}
                className={`min-h-[34px] px-3 py-1 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                  activeBill?.rrNumber === sample.rrNumber
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sample.rrNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Bill Summary, Payment Options & Receipt */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
        {!activeBill ? (
          <div className="py-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-700">
              Enter your BESCOM RR Number to view bill details
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-[#08152B] text-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-amber-400">
                  RR: {activeBill.rrNumber} · {activeBill.feederId}
                </p>
                <h3 className="font-display text-xl font-bold mt-0.5">
                  {activeBill.consumerName}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {localizedArea} · {activeBill.tariff}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400">{t.totalDue}</p>
                <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-amber-400">
                  ₹{activeBill.totalAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeBill.status === 'Paid'
                    ? t.paidBadge
                    : `${t.dueDate}: ${activeBill.dueDate}`}
                </p>
              </div>
            </div>

            {/* Bill Breakdown Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <dt className="text-slate-500">{t.billingCycle}</dt>
                <dd className="mt-1 font-semibold text-slate-900">{activeBill.billingCycle}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <dt className="text-slate-500">{t.unitsConsumed}</dt>
                <dd className="mt-1 font-mono font-bold tabular-nums text-slate-900">
                  {activeBill.unitsConsumedKwh} kWh
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <dt className="text-slate-500">{t.fixedCharges}</dt>
                <dd className="mt-1 font-mono font-bold tabular-nums text-slate-900">
                  ₹{activeBill.fixedCharges}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <dt className="text-slate-500">{t.energyCharges}</dt>
                <dd className="mt-1 font-mono font-bold tabular-nums text-slate-900">
                  ₹{activeBill.energyCharges}
                </dd>
              </div>
            </dl>

            {activeBill.status === 'Unpaid' ? (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">{t.paymentMethod}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(['UPI', 'Net Banking', 'Debit / Credit Card'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMethod(opt)}
                        className={`min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          method === opt
                            ? 'bg-[#08152B] text-white border-[#08152B]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayNow}
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {t.payNowBtn} · ₹{activeBill.totalAmount.toLocaleString('en-IN')}
                  </span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span>{t.receiptTitle}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    {t.paidBadge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-950">
                  <div>
                    <p className="text-emerald-700">{t.txnId}</p>
                    <p className="font-mono font-semibold mt-0.5">{activeBill.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-emerald-700">{t.paymentMethod}</p>
                    <p className="font-semibold mt-0.5">{activeBill.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-emerald-700">Timestamp</p>
                    <p className="font-mono mt-0.5 tabular-nums">{activeBill.paidAt}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-950 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.downloadReceipt}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
