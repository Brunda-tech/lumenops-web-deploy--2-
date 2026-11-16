import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, FilePlus2, Lock, Zap } from 'lucide-react';
import { estimateNewConnectionFee } from '../engine/billing';
import { ALL_CIRCLES, BESCOM_FEEDERS } from '../engine/dbscan';
import { TRANSLATIONS } from '../i18n/translations';
import type {
  AdminUser,
  BescomCircle,
  ConnectionCategory,
  Language,
  NewConnectionApplication,
} from '../types/lumenops';

interface CitizenNewConnectionTabProps {
  lang: Language;
  adminUser: AdminUser | null;
  onRequireAdminLogin: () => void;
  applications: NewConnectionApplication[];
  onSubmitApplication: (
    payload: Omit<NewConnectionApplication, 'applicationId' | 'status' | 'submittedAt'>
  ) => NewConnectionApplication;
  onAdvanceApplicationStatus: (applicationId: string) => void;
}

export default function CitizenNewConnectionTab({
  lang,
  adminUser,
  onRequireAdminLogin,
  applications,
  onSubmitApplication,
  onAdvanceApplicationStatus,
}: CitizenNewConnectionTabProps) {
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('+91 98450 55120');
  const [email, setEmail] = useState('');
  const [circle, setCircle] = useState<BescomCircle>('Bengaluru East');
  const [feederId, setFeederId] = useState('FDR-IND-04');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('560038');
  const [category, setCategory] = useState<ConnectionCategory>('LT-2(a) Domestic');
  const [loadKw, setLoadKw] = useState(3);
  const [phase, setPhase] = useState<'Single Phase' | 'Three Phase'>('Single Phase');
  const [proofDocument, setProofDocument] = useState('BBMP Khata & Sale Deed');
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang].citizen.newConnection;
  const tGlobal = TRANSLATIONS[lang];

  const circleFeeders = useMemo(
    () => BESCOM_FEEDERS.filter((f) => f.circle === circle),
    [circle]
  );

  const selectedFeeder =
    BESCOM_FEEDERS.find((f) => f.feederId === feederId) ?? circleFeeders[0] ?? BESCOM_FEEDERS[0];

  const estimatedFee = estimateNewConnectionFee(category, loadKw, phase);

  const handleCircleChange = (nextCircle: BescomCircle) => {
    setCircle(nextCircle);
    const first = BESCOM_FEEDERS.find((f) => f.circle === nextCircle);
    if (first) setFeederId(first.feederId);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const created = onSubmitApplication({
      applicantName: applicantName.trim() || 'BESCOM Applicant',
      phone: phone.trim(),
      email: email.trim() || 'applicant@example.in',
      circle,
      feederId: selectedFeeder.feederId,
      area: selectedFeeder.area,
      address: address.trim(),
      pincode: pincode.trim(),
      category,
      loadKw,
      phase,
      proofDocument,
      estimatedFee,
    });
    setSubmittedAppId(created.applicationId);
    setApplicantName('');
    setAddress('');
    setEmail('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: New Electricity Connection Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="space-y-1 pb-3 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-slate-900">{t.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nc-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.applicantName}
            </label>
            <input
              id="nc-name"
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="e.g. Rajeshwari N / TechPark Unit 4"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="nc-phone"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.phone}
            </label>
            <input
              id="nc-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="nc-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.email}
            </label>
            <input
              id="nc-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="nc-proof"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.proofDoc}
            </label>
            <select
              id="nc-proof"
              value={proofDocument}
              onChange={(e) => setProofDocument(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="BBMP Khata & Sale Deed">BBMP Khata &amp; Sale Deed</option>
              <option value="Rental Agreement + Owner NOC">Rental Agreement + Owner NOC</option>
              <option value="Building Plan Sanction">Building Plan Sanction</option>
              <option value="Commercial Trade License">Commercial Trade License</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nc-circle"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.circle}
            </label>
            <select
              id="nc-circle"
              value={circle}
              onChange={(e) => handleCircleChange(e.target.value as BescomCircle)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              {ALL_CIRCLES.map((c) => (
                <option key={c} value={c}>
                  {tGlobal.circleLabels[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="nc-feeder"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.feeder}
            </label>
            <select
              id="nc-feeder"
              value={selectedFeeder.feederId}
              onChange={(e) => setFeederId(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              {circleFeeders.map((f) => (
                <option key={f.feederId} value={f.feederId}>
                  {lang === 'kn' ? f.areaKn : f.area} ({f.feederId})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="nc-address"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.address}
            </label>
            <input
              id="nc-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Plot No, Cross, Main Road"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="nc-pin"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.pincode}
            </label>
            <input
              id="nc-pin"
              type="text"
              required
              pattern="[0-9]{6}"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="nc-cat"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.category}
            </label>
            <select
              id="nc-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as ConnectionCategory)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="LT-2(a) Domestic">LT-2(a) Domestic</option>
              <option value="LT-3 Commercial">LT-3 Commercial</option>
              <option value="LT-5 Industrial">LT-5 Industrial</option>
              <option value="EV Charging Point">EV Charging Point</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="nc-load"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.loadKw}
            </label>
            <select
              id="nc-load"
              value={loadKw}
              onChange={(e) => {
                const kw = Number(e.target.value);
                setLoadKw(kw);
                if (kw >= 5) setPhase('Three Phase');
              }}
              className="w-full min-h-[42px] px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              {[1, 2, 3, 5, 10, 15, 25, 50].map((kw) => (
                <option key={kw} value={kw}>
                  {kw} kW
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="nc-phase"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.phase}
            </label>
            <select
              id="nc-phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value as 'Single Phase' | 'Three Phase')}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="Single Phase">Single Phase (230V)</option>
              <option value="Three Phase">Three Phase (415V)</option>
            </select>
          </div>
        </div>

        {/* Fee Estimate Box */}
        <div className="rounded-xl bg-[#08152B] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-slate-200">{t.estFeeLabel}</span>
          </div>
          <span className="font-display text-xl font-bold tabular-nums text-amber-400">
            ₹{estimatedFee.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          type="submit"
          className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer"
        >
          <FilePlus2 className="w-4 h-4" aria-hidden="true" />
          <span>{t.submitAppBtn}</span>
        </button>

        {submittedAppId && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>
              {t.submittedSuccess}{' '}
              <strong className="font-mono">{submittedAppId}</strong>
            </span>
          </div>
        )}
      </form>

      {/* Right: Application Status Tracker */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">{t.trackerTitle}</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {applications.length} applications
          </span>
        </div>

        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          {applications.map((app) => {
            const feederMeta = BESCOM_FEEDERS.find((f) => f.feederId === app.feederId);
            const displayArea = lang === 'kn' && feederMeta ? feederMeta.areaKn : app.area;
            const statusColor =
              app.status === 'Meter Sanctioned'
                ? 'text-emerald-700'
                : app.status === 'Field Inspection'
                  ? 'text-amber-700'
                  : 'text-slate-700';

            return (
              <div
                key={app.applicationId}
                className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-600">
                      {app.applicationId}
                    </p>
                    <h3 className="font-display text-sm font-bold text-slate-900 mt-0.5">
                      {app.applicantName}
                    </h3>
                  </div>
                  <span className={`font-mono text-xs font-bold whitespace-nowrap ${statusColor}`}>
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    {displayArea} ({app.feederId}) · {app.pincode}
                  </p>
                  <p className="tabular-nums">
                    {app.category} · {app.loadKw} kW · {app.phase}
                  </p>
                  <p className="font-mono text-slate-800">
                    Fee: ₹{app.estimatedFee.toLocaleString('en-IN')} · {app.submittedAt}
                  </p>
                </div>

                {app.status !== 'Meter Sanctioned' && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminUser) {
                          onRequireAdminLogin();
                          return;
                        }
                        onAdvanceApplicationStatus(app.applicationId);
                      }}
                      className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    >
                      {!adminUser && (
                        <Lock className="w-3 h-3 text-amber-400" aria-hidden="true" />
                      )}
                      <span>{t.advanceStatusBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
