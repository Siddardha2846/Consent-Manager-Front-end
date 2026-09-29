import React from 'react';
import { Info, Settings, RotateCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export default function CMSettings() {
  const { resetDemoData } = useApp();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Platform configuration and information.
        </p>
      </div>

      {/* Platform Information */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-50">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Platform Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Details about this deployment.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-600">Product Name</span>
            <span className="text-sm font-medium text-gray-900">Consent Manager</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0 Demo</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-600">Environment</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
              Presentation Demo
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-600">Framework</span>
            <span className="text-sm font-medium text-gray-900">DEPA</span>
          </div>
        </div>
      </Card>

      {/* Demo Mode Settings */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-50">
            <Settings className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Demo Mode</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage the demo data state.</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-xs text-amber-800">
            This application is running in <strong>Demo Mode</strong>. All data is pre-populated
            for presentation purposes. Changes persist in your browser's local storage and do not
            affect any real systems. Use the reset button below to restore the original demo data.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={resetDemoData}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Demo Data
        </Button>
      </Card>

      {/* About DEPA */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-50">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">About DEPA</h2>
            <p className="text-xs text-gray-500 mt-0.5">Data Empowerment and Protection Architecture.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          DEPA (Data Empowerment and Protection Architecture) is India's framework for enabling
          individuals to securely share their personal data across institutions — on their own
          terms. It establishes a consent-first model where a neutral Consent Manager
          intermediary ensures that data flows only when explicit, informed consent has been given.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Under DEPA, data principals (individuals) retain full control: they can approve, reject,
          or revoke consent at any time. Organisations access data only through audited, time-bound
          grants, making personal data sharing transparent, accountable, and privacy-preserving.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          This Consent Manager prototype demonstrates the DEPA workflow across four roles —
          Consent Manager, Org User, Data Principal, and Org Admin — to show how a real-world
          DEPA deployment might operate in an academic and healthcare context.
        </p>
      </Card>
    </div>
  );
}
