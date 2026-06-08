import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Building2,
  Users,
  Banknote,
  Receipt,
  PieChart,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Loader2
} from 'lucide-react';

const STEP_META = [
  { icon: Building2, label: 'Alapadatok' },
  { icon: Users, label: 'Alkalmazottak' },
  { icon: Banknote, label: 'Bevétel' },
  { icon: Receipt, label: 'Adózás' },
  { icon: PieChart, label: 'Kiadások' },
];

const INDUSTRIES = ['Kereskedelem', 'Szolgáltatás', 'IT', 'Építőipar', 'Vendéglátás', 'Egyéb'];
const EMPLOYEE_RANGES = ['0', '1-2', '3-5', '6-15', '15+'];
const REVENUE_RANGES = ['0-5M Ft', '5-12M Ft', '12-25M Ft', '25-50M Ft', '50M+ Ft'];
const TAX_REGIMES = ['KATA', 'Átalányadó', 'KIVA', 'TAO Kft.', 'Nem tudom'];
const EXPENSE_TYPES = ['Bérek', 'Alapanyag', 'Rezsi', 'Marketing', 'Eszközök', 'Lízing'];

const initialFormData = {
  name: '',
  industry: '',
  employee_count: '',
  monthly_revenue_range: '',
  tax_regime: '',
  main_expenses: [],
};

/* ─── Reusable Input ──────────────────────────────────────────── */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{label}</label>
      <input
        className="w-full rounded-lg border border-[#E2E8F0] bg-white p-3 text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1F5FAD] focus:border-transparent transition"
        {...props}
      />
    </div>
  );
}

/* ─── Reusable Select ─────────────────────────────────────────── */
function Select({ label, options, placeholder, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{label}</label>
      <select
        className="w-full rounded-lg border border-[#E2E8F0] bg-white p-3 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1F5FAD] focus:border-transparent transition appearance-none"
        {...props}
      >
        <option value="">{placeholder || 'Válassz…'}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Radio Card Group ────────────────────────────────────────── */
function RadioCards({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-2">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`relative flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                selected
                  ? 'border-[#1F5FAD] bg-[#EFF6FF] shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected ? 'border-[#1F5FAD]' : 'border-[#CBD5E1]'
                }`}
              >
                {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#1F5FAD]" />}
              </span>
              <span className={`text-sm font-medium ${selected ? 'text-[#1F5FAD]' : 'text-[#1E293B]'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Checkbox Card Group ─────────────────────────────────────── */
function CheckboxCards({ label, options, values, onChange }) {
  const toggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-2">{label}</label>
      <p className="text-xs text-[#64748B] mb-3">Többet is kiválaszthatsz.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`relative flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                selected
                  ? 'border-[#1A7A4A] bg-[#F0FDF4] shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selected ? 'border-[#1A7A4A] bg-[#1A7A4A]' : 'border-[#CBD5E1] bg-white'
                }`}
              >
                {selected && (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${selected ? 'text-[#15643D]' : 'text-[#1E293B]'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step Components ─────────────────────────────────────────── */

function StepBasic({ data, update }) {
  return (
    <div className="space-y-5">
      <Input 
        label="Cég neve" 
        placeholder="Példa Kft." 
        value={data.name} 
        onChange={(e) => update('name', e.target.value)} 
      />
      <Select 
        label="Iparág" 
        options={INDUSTRIES} 
        value={data.industry} 
        onChange={(e) => update('industry', e.target.value)} 
        placeholder="Válassz iparágat..." 
      />
    </div>
  );
}

function StepEmployees({ data, update }) {
  return (
    <div className="space-y-5">
      <RadioCards 
        label="Alkalmazottak száma (fő)" 
        options={EMPLOYEE_RANGES} 
        value={data.employee_count} 
        onChange={(v) => update('employee_count', v)} 
      />
    </div>
  );
}

function StepRevenue({ data, update }) {
  return (
    <div className="space-y-5">
      <RadioCards 
        label="Éves bevétel sáv" 
        options={REVENUE_RANGES} 
        value={data.monthly_revenue_range} 
        onChange={(v) => update('monthly_revenue_range', v)} 
      />
    </div>
  );
}

function StepTax({ data, update }) {
  return (
    <div className="space-y-5">
      <RadioCards 
        label="Jelenlegi adózási forma" 
        options={TAX_REGIMES} 
        value={data.tax_regime} 
        onChange={(v) => update('tax_regime', v)} 
      />
    </div>
  );
}

function StepExpenses({ data, update }) {
  return (
    <div className="space-y-5">
      <CheckboxCards 
        label="Fő kiadástípusok" 
        options={EXPENSE_TYPES} 
        values={data.main_expenses} 
        onChange={(v) => update('main_expenses', v)} 
      />
    </div>
  );
}

/* ─── Main Onboarding Component ───────────────────────────────── */

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Ellenőrizzük, hogy az adott lépés kötelező adatai ki vannak-e töltve
  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '' && formData.industry !== '';
      case 1: return formData.employee_count !== '';
      case 2: return formData.monthly_revenue_range !== '';
      case 3: return formData.tax_regime !== '';
      case 4: return formData.main_expenses.length > 0;
      default: return true;
    }
  };

  const next = () => {
    if (isStepValid()) {
      setCurrentStep((s) => Math.min(s + 1, 4));
    }
  };
  const back = () => setCurrentStep((s) => Math.max(s - 0, 0)); // Fix back step index
  
  const finish = async () => {
    if (!isStepValid()) return;
    setIsSubmitting(true);
    
    try {
      // Beszúrás a Supabase-be
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          name: formData.name,
          industry: formData.industry,
          employee_count: formData.employee_count,
          monthly_revenue_range: formData.monthly_revenue_range,
          tax_regime: formData.tax_regime,
          main_expenses: formData.main_expenses
        }])
        .select()
        .single();
        
      if (error) {
        console.error("Supabase mentés hiba:", error);
        // Továbbengedjük a dashboardra akkor is, ha nincs backend beállítva
      }
      
      // Átirányítás és adat átadása a dashboardnak
      navigate('/dashboard', { state: { companyData: data || formData } });
    } catch (err) {
      console.error(err);
      // Hibatűrés - átirányítás mindenképp
      navigate('/dashboard', { state: { companyData: formData } });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIcon = STEP_META[currentStep].icon;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepBasic data={formData} update={update} />;
      case 1: return <StepEmployees data={formData} update={update} />;
      case 2: return <StepRevenue data={formData} update={update} />;
      case 3: return <StepTax data={formData} update={update} />;
      case 4: return <StepExpenses data={formData} update={update} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter] flex flex-col">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F5FAD] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1E293B]">KKV Mentor</span>
          </Link>
          <span className="text-sm text-[#64748B]">
            Lépés {currentStep + 1} / {STEP_META.length}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 py-3">
            {STEP_META.map((step, i) => (
              <div key={step.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%',
                      backgroundColor: '#1F5FAD',
                    }}
                  />
                </div>
                <span
                  className={`hidden sm:block text-xs transition-colors ${
                    i <= currentStep ? 'text-[#1F5FAD] font-medium' : 'text-[#94A3B8]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 flex items-start justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            {/* Step header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-[#1F5FAD]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">{STEP_META[currentStep].label}</h2>
                  <p className="text-sm text-[#64748B]">
                    {currentStep === 0 && 'Add meg a vállalkozásod alapadatait'}
                    {currentStep === 1 && 'Hány főt foglalkoztatsz?'}
                    {currentStep === 2 && 'Mekkora az éves bevételed?'}
                    {currentStep === 3 && 'Hogyan adózol jelenleg?'}
                    {currentStep === 4 && 'Milyen kiadásaid vannak?'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="px-6 sm:px-8 py-6 sm:py-8">{renderStep()}</div>

            {/* Actions */}
            <div className="px-6 sm:px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              {currentStep > 0 ? (
                <button
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors px-4 py-2.5 rounded-lg hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Vissza
                </button>
              ) : (
                <span />
              )}

              {currentStep < 4 ? (
                <button
                  onClick={next}
                  disabled={!isStepValid()}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F5FAD] hover:bg-[#2E75B6] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Tovább
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={!isStepValid() || isSubmitting}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1A7A4A] hover:bg-[#15643D] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Befejezés és Elemzés
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
