'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const SURVEY_QUESTIONS = {
  basic_info: {
    title: 'Basic Information',
    fields: [
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'income', label: 'Annual Household Income', type: 'select', options: ['< $30k', '$30k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k-$200k', '$200k+'] },
      { key: 'marital_status', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      { key: 'dependents', label: 'Number of Dependents', type: 'number' },
    ],
  },
  financial_stability: {
    title: 'Financial Stability',
    fields: [
      { key: 'emergency_savings_months', label: 'Emergency Savings (months)', type: 'select', options: ['None', 'Less than 1', '1-3', '3-6', '6+'] },
      { key: 'monthly_debt', label: 'Monthly Debt Payments', type: 'select', options: ['$0', '$1-$500', '$500-$1,000', '$1,000-$2,500', '$2,500-$5,000', '$5,000+'] },
      { key: 'credit_score', label: 'Credit Score Range', type: 'select', options: ['Below 580', '580-669', '670-739', '740-799', '800+'] },
      { key: 'homeowner', label: 'Homeowner?', type: 'boolean' },
    ],
  },
  family_protection: {
    title: 'Family Protection',
    fields: [
      { key: 'has_term_life', label: 'Have Term Life Insurance?', type: 'boolean' },
      { key: 'has_whole_life', label: 'Have Whole Life Insurance?', type: 'boolean' },
      { key: 'has_iul', label: 'Have IUL?', type: 'boolean' },
      { key: 'coverage_amount', label: 'Total Life Coverage Amount', type: 'select', options: ['$0', '$1-$50k', '$50k-$100k', '$100k-$250k', '$250k-$500k', '$500k-$1M', '$1M+'] },
      { key: 'has_disability', label: 'Have Disability Insurance?', type: 'boolean' },
      { key: 'has_will', label: 'Have a Will?', type: 'boolean' },
      { key: 'has_trust', label: 'Have a Trust?', type: 'boolean' },
    ],
  },
  retirement_readiness: {
    title: 'Retirement Readiness',
    fields: [
      { key: 'retirement_age', label: 'Desired Retirement Age', type: 'select', options: ['Before 55', '55-60', '60-65', '65-70', '70+'] },
      { key: 'retirement_assets', label: 'Current Retirement Assets', type: 'select', options: ['$0', '$1-$50k', '$50k-$100k', '$100k-$250k', '$250k-$500k', '$500k-$1M', '$1M+'] },
      { key: 'has_401k', label: 'Have 401(k)?', type: 'boolean' },
      { key: 'has_ira', label: 'Have IRA/Roth IRA?', type: 'boolean' },
      { key: 'has_annuity', label: 'Have Annuities?', type: 'boolean' },
    ],
  },
  long_term_care: {
    title: 'Long-Term Care Risk',
    fields: [
      { key: 'family_history', label: 'Family History of (select all)', type: 'multiselect', options: ['Alzheimer\'s', 'Dementia', 'Stroke', 'Cancer', 'Chronic Illness', 'None'] },
      { key: 'care_plan', label: 'Who Would Care For You?', type: 'select', options: ['Family', 'Spouse', 'Professional Caregiver', 'Assisted Living', 'Unsure'] },
    ],
  },
};

type AssessmentResult = {
  overall_score: number;
  risk_level: string;
  scores: Record<string, number>;
  recommendations: { priority: number; category: string; recommendation: string }[];
};

export default function AssessmentsPage() {
  const [step, setStep] = useState(0);
  const [contactId, setContactId] = useState('');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const sections = Object.entries(SURVEY_QUESTIONS);
  const currentSection = sections[step];

  const startAssessment = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const res: any = await apiClient.post(`/assessments/start/${contactId}`);
      setAssessmentId(res.data.id);
      setStarted(true);
    } catch (err) {
      alert('Error starting assessment. Ensure contact ID exists.');
    }
    setLoading(false);
  };

  const handleResponse = (key: string, value: any) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const submitSection = () => {
    if (step < sections.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    if (!assessmentId) return;
    setLoading(true);
    try {
      const res: any = await apiClient.post(`/assessments/${assessmentId}/submit`, {
        responses,
      });
      setResult(res.data);
    } catch (err) {
      alert('Error submitting assessment');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(0);
    setContactId('');
    setAssessmentId(null);
    setResponses({});
    setResult(null);
    setStarted(false);
  };

  const riskColor = (level: string) => {
    if (level.includes('Fortified')) return 'text-emerald-600 bg-emerald-50';
    if (level.includes('Prepared')) return 'text-green-600 bg-green-50';
    if (level.includes('Moderate')) return 'text-amber-600 bg-amber-50';
    if (level.includes('High')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (result) {
    return (
      <div className="page-container max-w-3xl">
        <div className="card p-8 text-center">
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4', riskColor(result.risk_level))}>
            Score: {result.overall_score}/100 — {result.risk_level}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {Object.entries(result.scores).map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(val)}</p>
              </div>
            ))}
          </div>

          <div className="text-left space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
            {result.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-fsos-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-fsos-600 text-white text-xs flex items-center justify-center font-bold shrink-0">{r.priority}</span>
                <div>
                  <p className="text-sm font-medium text-fsos-900">{r.category}</p>
                  <p className="text-sm text-fsos-700">{r.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={reset} className="btn-primary">New Assessment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Health Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered financial vulnerability analysis</p>
        </div>
      </div>

      {!started ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start Financial Assessment</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Enter a contact ID to begin the AI-powered financial health assessment.
            The system will score stability, protection, retirement, estate planning, and LTC readiness.
          </p>
          <div className="max-w-xs mx-auto space-y-4">
            <input type="text" value={contactId} onChange={(e) => setContactId(e.target.value)}
              placeholder="Contact ID" className="input-field text-center" />
            <button onClick={startAssessment} disabled={!contactId || loading} className="btn-primary w-full">
              {loading ? 'Starting...' : 'Start Assessment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{currentSection[1].title}</h2>
              <p className="text-xs text-gray-400">Step {step + 1} of {sections.length}</p>
            </div>
            <div className="flex gap-1">
              {sections.map((_, i) => (
                <div key={i} className={cn('w-8 h-1.5 rounded-full', i <= step ? 'bg-fsos-500' : 'bg-gray-200')} />
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {currentSection[1].fields.map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                {field.type === 'boolean' ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleResponse(field.key, true)}
                      className={cn('px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        responses[field.key] === true ? 'bg-fsos-50 border-fsos-500 text-fsos-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      Yes
                    </button>
                    <button onClick={() => handleResponse(field.key, false)}
                      className={cn('px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        responses[field.key] === false ? 'bg-fsos-50 border-fsos-500 text-fsos-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      No
                    </button>
                  </div>
                ) : field.type === 'select' || field.type === 'multiselect' ? (
                  <select
                    value={responses[field.key] || ''}
                    onChange={(e) => handleResponse(field.key, e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="number" value={responses[field.key] || ''}
                    onChange={(e) => handleResponse(field.key, e.target.value)}
                    className="input-field" placeholder={`Enter ${field.label.toLowerCase()}`} />
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
            <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}
              className={cn('btn-secondary', step === 0 && 'opacity-50')}>Previous</button>
            <button onClick={submitSection} disabled={loading} className="btn-primary">
              {loading ? 'Processing...' : step < sections.length - 1 ? 'Next Section' : 'Calculate Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
