import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  User,
  Target,
  ListChecks,
  Clock,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Edit2,
  SendHorizonal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/FormFields';
import { cn, formatDate, formatDuration, pluralize } from '../../utils';
import { ORGANIZATIONS, DATA_PRINCIPALS, PURPOSES, ALL_FIELDS } from '../../data/mockData';
import type { ConsentField, Organization, DataPrincipal } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WizardState {
  dataOwnerOrg: Organization | null;
  dataPrincipal: DataPrincipal | null;
  purposeId: string;
  purposeName: string;
  purposeDescription: string;
  fields: ConsentField[];
  durationDays: number;
  customDays: string;
  isCustomDuration: boolean;
}

const DURATION_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 180 },
  { label: 'Custom', days: -1 },
];

const STEPS = [
  { id: 1, label: 'Data Owner', icon: Building2 },
  { id: 2, label: 'Data Principal', icon: User },
  { id: 3, label: 'Purpose', icon: Target },
  { id: 4, label: 'Fields', icon: ListChecks },
  { id: 5, label: 'Duration', icon: Clock },
  { id: 6, label: 'Review', icon: ClipboardList },
  { id: 7, label: 'Submitted', icon: CheckCircle2 },
];

const REQUESTER_ORG_ID = 'org-college-b';
const REQUESTER_ORG_NAME = 'College B';
const REQUESTER_NAME = 'Ananya Krishnan';
const REQUESTER_ID = 'user-ananya';

// ─── Progress Indicator ──────────────────────────────────────────────────────

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const visibleSteps = STEPS.slice(0, 6); // Don't show step 7 in progress bar
  return (
    <div className="flex items-center justify-center mb-8">
      {visibleSteps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = idx === visibleSteps.length - 1;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200',
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-400'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium whitespace-nowrap',
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 w-10 mx-1 mt-[-18px] transition-colors duration-200',
                  isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Data Owner ──────────────────────────────────────────────────────

function StepDataOwner({
  value,
  onChange,
}: {
  value: Organization | null;
  onChange: (org: Organization) => void;
}) {
  const eligible = ORGANIZATIONS.filter(o => o.id !== REQUESTER_ORG_ID && o.status === 'ACTIVE');
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Data Owner</h2>
      <p className="text-sm text-gray-500 mb-5">
        Choose the organization that holds the data you need access to.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {eligible.map(org => (
          <button
            key={org.id}
            type="button"
            onClick={() => onChange(org)}
            className={cn(
              'text-left p-4 rounded-lg border-2 transition-all duration-150',
              value?.id === org.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  value?.id === org.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                )}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{org.name}</p>
                <p className="text-xs text-gray-500">{org.type}</p>
              </div>
              {value?.id === org.id && (
                <Check className="w-4 h-4 text-blue-600 ml-auto shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{org.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Data Principal ──────────────────────────────────────────────────

function StepDataPrincipal({
  dataOwnerOrgId,
  value,
  onChange,
}: {
  dataOwnerOrgId: string;
  value: DataPrincipal | null;
  onChange: (dp: DataPrincipal) => void;
}) {
  const principals = DATA_PRINCIPALS.filter(dp => dp.organizationId === dataOwnerOrgId);
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Data Principal</h2>
      <p className="text-sm text-gray-500 mb-5">
        Choose the individual whose data you are requesting access to.
      </p>
      {principals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No data principals found for the selected organization.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {principals.map(dp => (
            <button
              key={dp.id}
              type="button"
              onClick={() => onChange(dp)}
              className={cn(
                'text-left p-4 rounded-lg border-2 transition-all duration-150',
                value?.id === dp.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
                    value?.id === dp.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {dp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{dp.name}</p>
                  <p className="text-xs text-gray-500">
                    {dp.memberId} · {dp.organizationName}
                  </p>
                </div>
                {value?.id === dp.id && (
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Purpose ─────────────────────────────────────────────────────────

function StepPurpose({
  value,
  onChange,
}: {
  value: string;
  onChange: (purposeId: string, name: string, description: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Purpose</h2>
      <p className="text-sm text-gray-500 mb-5">
        Specify the reason for requesting access to this data.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PURPOSES.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id, p.name, p.description)}
            className={cn(
              'text-left p-4 rounded-lg border-2 transition-all duration-150',
              value === p.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
              {value === p.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Fields ──────────────────────────────────────────────────────────

function StepFields({
  value,
  onChange,
}: {
  value: ConsentField[];
  onChange: (fields: ConsentField[]) => void;
}) {
  const categories = Array.from(new Set(ALL_FIELDS.map(f => f.category)));
  const selectedIds = new Set(value.map(f => f.id));

  function toggle(field: ConsentField) {
    if (selectedIds.has(field.id)) {
      onChange(value.filter(f => f.id !== field.id));
    } else {
      onChange([...value, field]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">Select Data Fields</h2>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
          {pluralize(value.length, 'field')} selected
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Choose the specific data fields you need access to.
      </p>
      <div className="space-y-5">
        {categories.map(cat => {
          const catFields = ALL_FIELDS.filter(f => f.category === cat);
          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                {cat}
              </h3>
              <div className="space-y-2">
                {catFields.map(field => (
                  <label
                    key={field.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150',
                      selectedIds.has(field.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(field.id)}
                      onChange={() => toggle(field)}
                      className="mt-0.5 w-4 h-4 accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{field.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 5: Duration ────────────────────────────────────────────────────────

function StepDuration({
  durationDays,
  customDays,
  isCustom,
  onSelect,
  onCustomChange,
}: {
  durationDays: number;
  customDays: string;
  isCustom: boolean;
  onSelect: (days: number, isCustom: boolean) => void;
  onCustomChange: (val: string) => void;
}) {
  const startDate = new Date();
  const effectiveDays =
    isCustom ? (parseInt(customDays) || 0) : durationDays;
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + effectiveDays);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Set Access Duration</h2>
      <p className="text-sm text-gray-500 mb-5">
        Choose how long you need access to the data.
      </p>

      <div className="space-y-2 mb-5">
        {DURATION_OPTIONS.map(opt => {
          const isSelected = opt.days === -1 ? isCustom : (!isCustom && durationDays === opt.days);
          return (
            <label
              key={opt.label}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-150',
                isSelected
                  ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                name="duration"
                checked={isSelected}
                onChange={() => onSelect(opt.days, opt.days === -1)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {isCustom && (
        <div className="mb-5">
          <Input
            label="Number of days"
            type="number"
            min={1}
            max={365}
            value={customDays}
            onChange={e => onCustomChange(e.target.value)}
            placeholder="e.g. 45"
            hint="Between 1 and 365 days"
          />
        </div>
      )}

      {effectiveDays > 0 && (
        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Start:</span>
            <span>{formatDate(startDate.toISOString())}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Expiry:</span>
            <span>{formatDate(expiryDate.toISOString())}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Review ──────────────────────────────────────────────────────────

function StepReview({
  wizard,
  onEdit,
}: {
  wizard: WizardState;
  onEdit: (step: number) => void;
}) {
  const effectiveDays = wizard.isCustomDuration
    ? parseInt(wizard.customDays) || 0
    : wizard.durationDays;

  const fieldsByCategory = wizard.fields.reduce<Record<string, ConsentField[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  function ReviewSection({
    title,
    step,
    children,
  }: {
    title: string;
    step: number;
    children: React.ReactNode;
  }) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    );
  }

  function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex gap-2 text-sm">
        <span className="text-gray-500 w-36 shrink-0">{label}</span>
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Review Your Request</h2>
      <p className="text-sm text-gray-500 mb-5">
        Please review all details before submitting.
      </p>
      <div className="space-y-3">
        <ReviewSection title="Data Owner" step={1}>
          <InfoRow label="Organization" value={wizard.dataOwnerOrg?.name} />
          <InfoRow label="Type" value={wizard.dataOwnerOrg?.type} />
        </ReviewSection>

        <ReviewSection title="Data Principal" step={2}>
          <InfoRow label="Name" value={wizard.dataPrincipal?.name} />
          <InfoRow label="Member ID" value={wizard.dataPrincipal?.memberId} />
        </ReviewSection>

        <ReviewSection title="Purpose" step={3}>
          <InfoRow label="Purpose" value={wizard.purposeName} />
          <div className="text-xs text-gray-500 mt-1">{wizard.purposeDescription}</div>
        </ReviewSection>

        <ReviewSection title={`Fields (${wizard.fields.length})`} step={4}>
          {Object.entries(fieldsByCategory).map(([cat, fields]) => (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {cat}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span
                    key={f.id}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </ReviewSection>

        <ReviewSection title="Duration" step={5}>
          <InfoRow label="Duration" value={formatDuration(effectiveDays)} />
        </ReviewSection>
      </div>
    </div>
  );
}

// ─── Step 7: Submitted ───────────────────────────────────────────────────────

function StepSubmitted({
  requestId,
  onViewRequest,
  onDashboard,
}: {
  requestId: string;
  onViewRequest: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Your data access request has been submitted and is now awaiting consent from the data
        principal.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 mb-6 w-full max-w-xs">
        <p className="text-xs text-gray-500 mb-1">Request ID</p>
        <p className="font-mono font-semibold text-gray-800">{requestId}</p>
        <div className="mt-2">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
            Consent Requested
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="md" onClick={onViewRequest}>
          View Request
        </Button>
        <Button variant="outline" size="md" onClick={onDashboard}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function CreateRequestWizard() {
  const navigate = useNavigate();
  const { createRequest, addToast } = useApp();

  const [step, setStep] = useState(1);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [wizard, setWizard] = useState<WizardState>({
    dataOwnerOrg: null,
    dataPrincipal: null,
    purposeId: '',
    purposeName: '',
    purposeDescription: '',
    fields: [],
    durationDays: 30,
    customDays: '',
    isCustomDuration: false,
  });

  function canProceed(): boolean {
    switch (step) {
      case 1: return wizard.dataOwnerOrg !== null;
      case 2: return wizard.dataPrincipal !== null;
      case 3: return wizard.purposeId !== '';
      case 4: return wizard.fields.length > 0;
      case 5: {
        if (wizard.isCustomDuration) {
          const d = parseInt(wizard.customDays);
          return d >= 1 && d <= 365;
        }
        return wizard.durationDays > 0;
      }
      default: return true;
    }
  }

  function getErrorMsg(): string {
    switch (step) {
      case 1: return 'Please select a data owner organization.';
      case 2: return 'Please select a data principal.';
      case 3: return 'Please select a purpose.';
      case 4: return 'Please select at least one data field.';
      case 5: return 'Please select a valid duration.';
      default: return '';
    }
  }

  function handleNext() {
    if (!canProceed()) {
      setError(getErrorMsg());
      return;
    }
    setError('');
    // When moving away from step 1, reset principal if org changed
    if (step === 1) {
      setWizard(w => ({
        ...w,
        dataPrincipal:
          w.dataPrincipal?.organizationId === w.dataOwnerOrg?.id ? w.dataPrincipal : null,
      }));
    }
    setStep(s => s + 1);
  }

  function handleBack() {
    setError('');
    setStep(s => s - 1);
  }

  async function handleSubmit() {
    if (!wizard.dataOwnerOrg || !wizard.dataPrincipal) return;
    setIsSubmitting(true);
    const effectiveDays = wizard.isCustomDuration
      ? parseInt(wizard.customDays)
      : wizard.durationDays;

    const now = new Date().toISOString();
    const newReq = createRequest({
      requesterId: REQUESTER_ID,
      requesterName: REQUESTER_NAME,
      requesterOrgId: REQUESTER_ORG_ID,
      requesterOrgName: REQUESTER_ORG_NAME,
      dataOwnerOrgId: wizard.dataOwnerOrg.id,
      dataOwnerOrgName: wizard.dataOwnerOrg.name,
      dataPrincipalId: wizard.dataPrincipal.id,
      dataPrincipalName: wizard.dataPrincipal.name,
      purpose: wizard.purposeName,
      purposeDescription: wizard.purposeDescription,
      fields: wizard.fields,
      durationDays: effectiveDays,
      startDate: now,
      expiryDate: '',
      notes: '',
    });
    setSubmittedRequestId(newReq.id);
    addToast('Data request submitted successfully', 'success');
    setIsSubmitting(false);
    setStep(7);
  }

  const showProgress = step < 7;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/org/requests')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Requests
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Data Request</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Complete all steps to submit a data access request.
        </p>
      </div>

      {/* Wizard card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {showProgress && <ProgressIndicator currentStep={step} />}

        {/* Step content */}
        <div className="min-h-[320px]">
          {step === 1 && (
            <StepDataOwner
              value={wizard.dataOwnerOrg}
              onChange={org => setWizard(w => ({ ...w, dataOwnerOrg: org }))}
            />
          )}
          {step === 2 && (
            <StepDataPrincipal
              dataOwnerOrgId={wizard.dataOwnerOrg?.id ?? ''}
              value={wizard.dataPrincipal}
              onChange={dp => setWizard(w => ({ ...w, dataPrincipal: dp }))}
            />
          )}
          {step === 3 && (
            <StepPurpose
              value={wizard.purposeId}
              onChange={(id, name, desc) =>
                setWizard(w => ({
                  ...w,
                  purposeId: id,
                  purposeName: name,
                  purposeDescription: desc,
                }))
              }
            />
          )}
          {step === 4 && (
            <StepFields
              value={wizard.fields}
              onChange={fields => setWizard(w => ({ ...w, fields }))}
            />
          )}
          {step === 5 && (
            <StepDuration
              durationDays={wizard.durationDays}
              customDays={wizard.customDays}
              isCustom={wizard.isCustomDuration}
              onSelect={(days, isCustom) =>
                setWizard(w => ({
                  ...w,
                  durationDays: isCustom ? 0 : days,
                  isCustomDuration: isCustom,
                }))
              }
              onCustomChange={val => setWizard(w => ({ ...w, customDays: val }))}
            />
          )}
          {step === 6 && (
            <StepReview wizard={wizard} onEdit={targetStep => { setError(''); setStep(targetStep); }} />
          )}
          {step === 7 && (
            <StepSubmitted
              requestId={submittedRequestId}
              onViewRequest={() => navigate(`/org/requests/${submittedRequestId}`)}
              onDashboard={() => navigate('/org/dashboard')}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Navigation */}
        {step < 7 && (
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <Button
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {step < 6 ? (
              <Button variant="primary" size="md" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                loading={isSubmitting}
                onClick={handleSubmit}
              >
                <SendHorizonal className="w-4 h-4 mr-1.5" />
                Submit Request
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
