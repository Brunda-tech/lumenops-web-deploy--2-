import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Download,
  Receipt,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  estimateMonthlyApplianceKwh,
  lookupBillByRrNumber,
  predictNextBillAmount,
  SAMPLE_BILL_RECORDS,
} from '../engine/billing';
import { BESCOM_FEEDERS } from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type { BillRecord, Language, PaymentMethod } from '../types/lumenops';

type ApplianceKey = 'refrigerator' | 'washingMachine';
type ApplianceUsage = {
  powerWatts: string;
  hoursPerDay: string;
  daysPerWeek: string;
};

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
  const [billHistory, setBillHistory] = useState(['', '', '', '', '', '']);
  const [nextBillEstimate, setNextBillEstimate] = useState<number | null>(null);
  const [applianceUsage, setApplianceUsage] = useState<Record<ApplianceKey, ApplianceUsage>>({
    refrigerator: { powerWatts: '150', hoursPerDay: '8', daysPerWeek: '7' },
    washingMachine: { powerWatts: '500', hoursPerDay: '1', daysPerWeek: '3' },
  });

  const t = TRANSLATIONS[lang].citizen.billing;

  useEffect(() => {
    setBillHistory(['', '', '', '', '', '']);
    setNextBillEstimate(null);
  }, [activeBill?.rrNumber]);

  const hasCompleteBillHistory = billHistory.every(
    (amount) => amount.trim() !== '' && Number.isFinite(Number(amount)) && Number(amount) >= 0
  );

  const handleGenerateForecast = () => {
    if (!hasCompleteBillHistory) return;
    setNextBillEstimate(predictNextBillAmount(billHistory.map((amount) => Number(amount))));
  };

  const applianceEstimates = {
    refrigerator: {
      kwh: estimateMonthlyApplianceKwh(
        Number(applianceUsage.refrigerator.powerWatts),
        Number(applianceUsage.refrigerator.hoursPerDay),
        Number(applianceUsage.refrigerator.daysPerWeek)
      ),
      highUsageLimit: 60,
    },
    washingMachine: {
      kwh: estimateMonthlyApplianceKwh(
        Number(applianceUsage.washingMachine.powerWatts),
        Number(applianceUsage.washingMachine.hoursPerDay),
        Number(applianceUsage.washingMachine.daysPerWeek)
      ),
      highUsageLimit: 20,
    },
  };

  const updateApplianceUsage = (
    appliance: ApplianceKey,
    field: keyof ApplianceUsage,
    value: string
  ) => {
    setApplianceUsage((previous) => ({
      ...previous,
      [appliance]: { ...previous[appliance], [field]: value },
    }));
  };

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
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-slate-900">{t.forecastTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-600">{t.forecastSubtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {t.billHistoryLabels.map((label, index) => (
              <div key={label}>
                <label
                  htmlFor={`bill-history-${index}`}
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  {label}
                </label>
                <div className="flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                  <span className="mr-1 text-sm text-slate-500">₹</span>
                  <input
                    id={`bill-history-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={billHistory[index]}
                    onChange={(e) => {
                      setNextBillEstimate(null);
                      setBillHistory((previous) =>
                        previous.map((amount, amountIndex) =>
                          amountIndex === index ? e.target.value : amount
                        )
                      );
                    }}
                    className="w-full bg-transparent py-2 text-sm font-mono text-slate-900 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerateForecast}
            disabled={!hasCompleteBillHistory}
            className="min-h-[42px] rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.generateForecast}
          </button>

          {nextBillEstimate === null ? (
            <p role="status" className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {t.forecastNeedsHistory}
            </p>
          ) : (
            <div className="rounded-xl bg-[#08152B] px-5 py-4 text-white">
              <p className="text-xs text-slate-300">{t.forecastAmount}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums text-amber-400">
                ₹{nextBillEstimate.toLocaleString('en-IN')}
              </p>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500">{t.forecastDisclaimer}</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-slate-900">{t.applianceTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-600">{t.applianceSubtitle}</p>
            </div>
          </div>

          {(
            [
              ['refrigerator', t.refrigerator, t.refrigeratorTip],
              ['washingMachine', t.washingMachine, t.washingMachineTip],
            ] as const
          ).map(([appliance, label, tip]) => {
            const usage = applianceUsage[appliance];
            const estimate = applianceEstimates[appliance];
            const isHighUsage = estimate.kwh > estimate.highUsageLimit;
            const fields: Array<{ key: keyof ApplianceUsage; label: string }> = [
              { key: 'powerWatts', label: t.powerRating },
              { key: 'hoursPerDay', label: t.hoursPerDay },
              { key: 'daysPerWeek', label: t.daysPerWeek },
            ];

            return (
              <div
                key={appliance}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-slate-900">{label}</h3>
                  <p className="text-right text-xs font-semibold text-slate-700">
                    {t.monthlyUsage}: {estimate.kwh} kWh
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`${appliance}-${field.key}`}
                        className="mb-1 block text-[11px] font-medium text-slate-600"
                      >
                        {field.label}
                      </label>
                      <input
                        id={`${appliance}-${field.key}`}
                        type="number"
                        min="0"
                        max={
                          field.key === 'hoursPerDay'
                            ? 24
                            : field.key === 'daysPerWeek'
                              ? 7
                              : undefined
                        }
                        step="0.1"
                        value={usage[field.key]}
                        onChange={(e) =>
                          updateApplianceUsage(appliance, field.key, e.target.value)
                        }
                        className="min-h-[38px] w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-mono text-slate-900"
                      />
                    </div>
                  ))}
                </div>

                {isHighUsage && (
                  <p role="status" className="flex items-start gap-2 text-xs font-medium text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t.highUsageAlert} {t.highUsageThreshold}: {estimate.highUsageLimit} kWh/month.
                    </span>
                  </p>
                )}
                <p className="text-xs leading-relaxed text-slate-600">{tip}</p>
              </div>
            );
          })}

          <p className="text-[11px] leading-relaxed text-slate-500">{t.applianceDisclaimer}</p>
        </section>
      </div>
    </div>
  );
}
