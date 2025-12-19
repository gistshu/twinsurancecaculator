
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  Save, 
  History, 
  Trash2, 
  LayoutDashboard, 
  Info, 
  CloudUpload,
  CheckCircle2,
  Settings,
  X,
  Upload,
  RefreshCcw,
  SlidersHorizontal,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { calculateInsurance } from './services/insuranceCalculations';
import { CalculationInput, CalculationResult, SavedCalculation, InsuranceSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const App: React.FC = () => {
  // --- States ---
  const [input, setInput] = useState<CalculationInput>({
    salary: 45000,
    dependents: 0,
    pensionRate: 0
  });
  const [settings, setSettings] = useState<InsuranceSettings>(DEFAULT_SETTINGS);
  const [savedRecords, setSavedRecords] = useState<SavedCalculation[]>([]);
  const [label, setLabel] = useState<string>('我的 114 薪資試算');
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rates' | 'tiers'>('rates');
  
  // Settings Temporary States (for pasting)
  const [pastedLaborTiers, setPastedLaborTiers] = useState('');
  const [pastedHealthTiers, setPastedHealthTiers] = useState('');

  // --- Effects & Logic ---
  
  // Initial load
  useEffect(() => {
    const storedHistory = localStorage.getItem('labor_calc_history');
    if (storedHistory) {
      try { setSavedRecords(JSON.parse(storedHistory)); } catch (e) { console.error(e); }
    }
    
    const storedSettings = localStorage.getItem('insurance_settings');
    if (storedSettings) {
      try { 
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        setPastedLaborTiers(parsed.laborTiers.join(', '));
        setPastedHealthTiers(parsed.healthTiers.join(', '));
      } catch (e) { console.error(e); }
    } else {
      setPastedLaborTiers(DEFAULT_SETTINGS.laborTiers.join(', '));
      setPastedHealthTiers(DEFAULT_SETTINGS.healthTiers.join(', '));
    }
  }, []);

  const results = useMemo(() => calculateInsurance(input, settings), [input, settings]);

  const handleSaveSettings = () => {
    const parseTiers = (str: string) => str.split(/[,|\s|\n]+/).map(v => Number(v.trim())).filter(v => !isNaN(v) && v > 0).sort((a, b) => a - b);
    
    const newSettings: InsuranceSettings = {
      ...settings,
      laborTiers: parseTiers(pastedLaborTiers),
      healthTiers: parseTiers(pastedHealthTiers)
    };

    setSettings(newSettings);
    localStorage.setItem('insurance_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  const resetSettings = () => {
    if (confirm('確定要恢復預設的 114 年度級距嗎？')) {
      setSettings(DEFAULT_SETTINGS);
      setPastedLaborTiers(DEFAULT_SETTINGS.laborTiers.join(', '));
      setPastedHealthTiers(DEFAULT_SETTINGS.healthTiers.join(', '));
      localStorage.removeItem('insurance_settings');
    }
  };

  const handleSaveToDrive = useCallback(() => {
    if (!results) return;
    setIsSaving(true);
    setTimeout(() => {
      const newRecord: SavedCalculation = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        input: { ...input },
        ...results,
        label: label || `試算 - ${new Date().toLocaleDateString()}`
      };
      const updated = [newRecord, ...savedRecords];
      setSavedRecords(updated);
      localStorage.setItem('labor_calc_history', JSON.stringify(updated));
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 1200);
  }, [results, input, label, savedRecords]);

  const removeRecord = (id: string) => {
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    localStorage.setItem('labor_calc_history', JSON.stringify(updated));
  };

  // Chart Data
  const chartData = results ? [
    { name: '實領薪資', value: results.summary.netPay, fill: '#3b82f6' },
    { name: '勞保自付', value: results.laborInsurance.employee, fill: '#ef4444' },
    { name: '健保自付', value: results.healthInsurance.employee, fill: '#f59e0b' },
    { name: '勞退自提', value: results.laborPension.employeeVoluntary, fill: '#10b981' },
  ] : [];

  const employerChartData = results ? [
    { name: '勞保公提', value: results.laborInsurance.employer },
    { name: '健保公提', value: results.healthInsurance.employer },
    { name: '勞退公提', value: results.laborPension.employer },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">勞健保試算</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Professional Calculator</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title="參數設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSaveToDrive}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
                isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-white"></div> : <CloudUpload className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSaving ? '儲存中...' : '儲存至 Drive'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {showSaveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 mr-3" />
            <span className="font-medium">計算結果已成功存檔！</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6 text-slate-800">
                <SlidersHorizontal className="w-5 h-5" />
                <h2 className="text-lg font-bold">薪資設定</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">試算標籤</label>
                  <input 
                    type="text" 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="輸入標籤識別此紀錄"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">月薪總額 (TWD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={input.salary}
                      onChange={(e) => setInput({ ...input, salary: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">眷屬人數</label>
                    <select 
                      value={input.dependents}
                      onChange={(e) => setInput({ ...input, dependents: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} 人</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">勞退自提</label>
                    <select 
                      value={input.pensionRate}
                      onChange={(e) => setInput({ ...input, pensionRate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}%</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 text-slate-800">
                  <History className="w-5 h-5" />
                  <h2 className="text-lg font-bold">歷史紀錄</h2>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{savedRecords.length} ITEMS</span>
              </div>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {savedRecords.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-10" />
                    <p className="text-sm">尚無存檔紀錄</p>
                  </div>
                ) : (
                  savedRecords.map(record => (
                    <div key={record.id} className="group p-3 border border-slate-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/50 transition-all cursor-default">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-sm truncate max-w-[140px]">{record.label}</span>
                        <button 
                          onClick={() => removeRecord(record.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span className="font-medium font-mono">${record.input.salary.toLocaleString()}</span>
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">每月應扣總額</span>
                <span className="text-3xl font-black text-rose-500">${results.summary.totalEmployeeDeduction.toLocaleString()}</span>
                <div className="mt-3 flex space-x-1">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full opacity-50"></div>
                </div>
              </div>
              
              <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-200 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">每月實領薪資</span>
                <span className="text-3xl font-black text-white">${results.summary.netPay.toLocaleString()}</span>
                <div className="mt-3 w-8 h-1 bg-white/30 rounded-full"></div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">公司總支出</span>
                <span className="text-3xl font-black text-slate-800">${results.summary.totalEmployerCost.toLocaleString()}</span>
                <div className="mt-3 flex -space-x-1">
                  {[1,2,3].map(i => <div key={i} className="w-3 h-3 bg-slate-100 border-2 border-white rounded-full"></div>)}
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Breakdown */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="text-lg font-black mb-8 flex items-center">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-xs">A</div>
                  個人自付細項
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center group">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">勞工保險費</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Labor Insurance</span>
                    </div>
                    <span className="text-lg font-black text-slate-700 group-hover:text-blue-600 transition-colors">${results.laborInsurance.employee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">健康保險費</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Health Insurance</span>
                    </div>
                    <span className="text-lg font-black text-slate-700 group-hover:text-blue-600 transition-colors">${results.healthInsurance.employee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">勞退自願提繳</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Voluntary Pension</span>
                    </div>
                    <span className="text-lg font-black text-slate-700 group-hover:text-blue-600 transition-colors">${results.laborPension.employeeVoluntary.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-baseline">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Deduction</span>
                  <span className="text-2xl font-black text-rose-500">${results.summary.totalEmployeeDeduction.toLocaleString()}</span>
                </div>
              </div>

              {/* Employer Breakdown */}
              <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                <h3 className="text-lg font-black mb-8 flex items-center text-white">
                  <div className="w-6 h-6 bg-white/10 text-white rounded-lg flex items-center justify-center mr-3 text-xs">B</div>
                  雇主負擔細項
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">勞保公司提撥 (70%)</span>
                    <span className="text-lg font-bold text-slate-200">${results.laborInsurance.employer.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">健保公司提撥 (60%)</span>
                    <span className="text-lg font-bold text-slate-200">${results.healthInsurance.employer.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-400">勞工退休金 (6%)</span>
                    <span className="text-lg font-bold text-slate-200">${results.laborPension.employer.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Extra Cost</span>
                  <span className="text-2xl font-black text-emerald-400">${(results.summary.totalEmployerCost - input.salary).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800">支出分析可視化</h3>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">實領</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">扣繳</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} formatter={(v) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">參數級距設定</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex border-b border-slate-100 bg-slate-50/50 px-8">
              <button 
                onClick={() => setActiveTab('rates')}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'rates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                費率參數
              </button>
              <button 
                onClick={() => setActiveTab('tiers')}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'tiers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                分級表更新
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeTab === 'rates' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">勞保總費率</label>
                    <input 
                      type="number" step="0.0001" 
                      value={settings.laborRate} 
                      onChange={(e) => setSettings({...settings, laborRate: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">目前包含 11% 普通 + 1% 就業</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">健保總費率</label>
                    <input 
                      type="number" step="0.0001" 
                      value={settings.healthRate} 
                      onChange={(e) => setSettings({...settings, healthRate: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="col-span-2 p-4 bg-amber-50 rounded-2xl flex items-start space-x-3 border border-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      修改費率參數會立即影響計算結果。若不確定各項分擔比例，請參閱勞保局及健保署最新公告。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">勞保投保分級 (由小到大，逗號隔開)</label>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Input / Paste</span>
                    </div>
                    <textarea 
                      value={pastedLaborTiers}
                      onChange={(e) => setPastedLaborTiers(e.target.value)}
                      className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm leading-relaxed"
                      placeholder="例如: 28590, 29700, 30300..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">健保投保分級 (由小到大，逗號隔開)</label>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Input / Paste</span>
                    </div>
                    <textarea 
                      value={pastedHealthTiers}
                      onChange={(e) => setPastedHealthTiers(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm leading-relaxed"
                      placeholder="例如: 28590, 29700, 30300..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={resetSettings}
                className="flex items-center space-x-2 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">恢復預設</span>
              </button>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>套用並存檔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">© 2025 Labor Insurance System</p>
          <div className="flex justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="h-6 w-px bg-slate-300"></div>
             <span className="text-[10px] font-black text-slate-500">114 年度勞健保法規對應</span>
             <div className="h-6 w-px bg-slate-300"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
