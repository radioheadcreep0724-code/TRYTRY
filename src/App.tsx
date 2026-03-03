import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  User, 
  Building2, 
  Package, 
  Calculator, 
  ChevronDown,
  FileText,
  X,
  Search,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  SalesRep, 
  Vendor, 
  Product, 
  QuoteItem, 
  TaxType, 
  DiscountType 
} from "./types";
import { 
  MOCK_SALES_REPS, 
  MOCK_VENDORS, 
  MOCK_PRODUCTS 
} from "./constants";

/**
 * Utility to merge tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // --- State ---
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep>(MOCK_SALES_REPS[0]);
  const [vendor, setVendor] = useState<Partial<Vendor>>({});
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [taxType, setTaxType] = useState<TaxType>("exclusive");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isPreview, setIsPreview] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Calculations ---
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return Math.round(subtotal * (discountValue / 100));
    }
    return discountValue;
  }, [subtotal, discountType, discountValue]);

  const amountAfterDiscount = subtotal - discountAmount;

  const taxAmount = useMemo(() => {
    if (taxType === "exclusive") {
      return Math.round(amountAfterDiscount * 0.05);
    }
    return 0;
  }, [amountAfterDiscount, taxType]);

  const total = useMemo(() => {
    if (taxType === "inclusive") return amountAfterDiscount;
    return amountAfterDiscount + taxAmount;
  }, [amountAfterDiscount, taxAmount, taxType]);

  // --- Handlers ---
  const addItem = (product: Product) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      specification: product.specification,
      price: product.defaultPrice,
      quantity: 1,
    };
    setItems([...items, newItem]);
    setIsProductModalOpen(false);
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportPDF = async () => {
    if (!pdfRef.current) return;
    
    const element = pdfRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`報價單_${vendor.companyName || "未命名"}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- UI Components ---
  return (
    <div className={cn(
      "min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-32 transition-colors duration-300",
      isDarkMode && "dark"
    )}>
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 px-4 py-3 flex justify-between items-center shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">行銷報價快手</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50"
          >
            {isPreview ? "返回編輯" : "預覽 PDF"}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Step 1: Sales Rep */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <User className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider">業務員資訊</h2>
          </div>
          <div className="relative">
            <select 
              value={selectedSalesRep.id}
              onChange={(e) => setSelectedSalesRep(MOCK_SALES_REPS.find(s => s.id === e.target.value)!)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-colors"
            >
              {MOCK_SALES_REPS.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </section>

        {/* Step 2: Vendor */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Building2 className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider">客戶資訊</h2>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-4 transition-colors">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">搜尋現有客戶</label>
              <select 
                onChange={(e) => {
                  const v = MOCK_VENDORS.find(v => v.id === e.target.value);
                  if (v) setVendor(v);
                }}
                className="w-full border-b border-stone-100 dark:border-stone-800 bg-transparent py-2 outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="" className="dark:bg-stone-900">-- 選擇現有客戶 --</option>
                {MOCK_VENDORS.map(v => (
                  <option key={v.id} value={v.id} className="dark:bg-stone-900">{v.companyName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">公司名稱</label>
                <input 
                  type="text" 
                  value={vendor.companyName || ""}
                  onChange={(e) => setVendor({...vendor, companyName: e.target.value})}
                  placeholder="必填"
                  className="w-full border-b border-stone-100 dark:border-stone-800 bg-transparent py-1 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">統一編號</label>
                <input 
                  type="text" 
                  value={vendor.taxId || ""}
                  onChange={(e) => setVendor({...vendor, taxId: e.target.value})}
                  className="w-full border-b border-stone-100 dark:border-stone-800 bg-transparent py-1 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Items */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Package className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider">報價明細</h2>
            </div>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg"
            >
              <Plus className="w-3 h-3" /> 新增品項
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-stone-100 dark:bg-stone-900/50 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center">
                <p className="text-stone-400 text-sm italic">尚無報價品項，請點擊新增</p>
              </div>
            ) : (
              items.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id} 
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <input 
                        className="w-full font-bold text-stone-800 dark:text-stone-100 bg-transparent outline-none border-b border-transparent focus:border-stone-100 dark:focus:border-stone-800"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      />
                      <textarea 
                        className="w-full text-xs text-stone-500 dark:text-stone-400 mt-1 bg-transparent outline-none resize-none h-12"
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, { specification: e.target.value })}
                      />
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-stone-300 dark:text-stone-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-50 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">數量</label>
                      <div className="flex items-center border border-stone-100 dark:border-stone-800 rounded-lg">
                        <button 
                          onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="px-2 py-1 text-stone-400"
                        >-</button>
                        <span className="px-2 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                          className="px-2 py-1 text-stone-400"
                        >+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase">單價</label>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-stone-400 text-xs">$</span>
                        <input 
                          type="number"
                          className="w-20 text-right font-mono font-bold bg-transparent outline-none"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 opacity-20"></div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Step 4: Summary & Settings */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Calculator className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider">交易條件</h2>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-6 transition-colors">
            {/* Tax Settings */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase">稅額設定</label>
              <div className="flex p-1 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                {(["none", "exclusive", "inclusive"] as TaxType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTaxType(t)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      taxType === t ? "bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-sm" : "text-stone-400"
                    }`}
                  >
                    {t === "none" ? "不計稅" : t === "exclusive" ? "外加 5%" : "已含稅"}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Settings */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-stone-400 uppercase">折扣設定</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDiscountType("percentage")}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${discountType === "percentage" ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}
                  >%</button>
                  <button 
                    onClick={() => setDiscountType("amount")}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${discountType === "amount" ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}
                  >$</button>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl px-4 py-2 text-right font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                  {discountType === "percentage" ? "折扣趴數" : "折讓金額"}
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">小計</span>
                <span className="font-mono">${subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">折扣 ({discountType === "percentage" ? `${discountValue}%` : "金額"})</span>
                  <span className="font-mono text-red-500">-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              {taxType === "exclusive" && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">營業稅 (5%)</span>
                  <span className="font-mono">${taxAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-colors">
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase">總計金額</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            <span className="text-sm mr-1">$</span>
            {total.toLocaleString()}
          </p>
        </div>
        <button 
          onClick={() => setIsPreview(true)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-200 dark:shadow-none"
        >
          <Download className="w-5 h-5" /> 匯出 PDF
        </button>
      </div>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">選擇商品</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="搜尋品名或規格..." 
                  className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {MOCK_PRODUCTS.map(product => (
                  <button 
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="w-full text-left p-4 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-stone-800 dark:text-stone-100">{product.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{product.specification}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${product.defaultPrice.toLocaleString()}</p>
                      <Plus className="w-4 h-4 text-emerald-300 ml-auto mt-1 group-hover:text-emerald-500" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Preview Modal (Full Screen Overlay) */}
      <AnimatePresence>
        {isPreview && (
          <div className="fixed inset-0 z-[60] bg-stone-900 overflow-y-auto">
            <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
              <div className="w-full max-w-4xl flex justify-between items-center mb-6 text-white">
                <h2 className="text-xl font-bold">報價單預覽</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsPreview(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    關閉
                  </button>
                  <button 
                    onClick={exportPDF}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 下載 PDF
                  </button>
                </div>
              </div>

              {/* A4 Template Container - Fixed Light Theme for Print */}
              <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[20mm] text-stone-900" ref={pdfRef}>
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-stone-900 pb-8 mb-8">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter text-stone-900 mb-2">QUOTATION</h1>
                    <p className="text-sm text-stone-500">報價單號：QT-{new Date().getTime().toString().slice(-8)}</p>
                    <p className="text-sm text-stone-500">報價日期：{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-stone-900 text-white px-4 py-2 inline-block font-bold text-xl mb-4">
                      MARKETING CO.
                    </div>
                    <p className="text-xs font-bold">行銷顧問股份有限公司</p>
                    <p className="text-xs">統編：88888888</p>
                    <p className="text-xs">地址：台北市信義區忠孝東路五段 1 號</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-1">客戶資訊 Client</h3>
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{vendor.companyName || "---"}</p>
                      <p className="text-sm">統編：{vendor.taxId || "---"}</p>
                      <p className="text-sm">聯絡人：{vendor.contactPerson || "---"}</p>
                      <p className="text-sm">電話：{vendor.phone || "---"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-1">業務資訊 Sales</h3>
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{selectedSalesRep.name}</p>
                      <p className="text-sm">Email：{selectedSalesRep.email}</p>
                      <p className="text-sm">電話：{selectedSalesRep.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-12">
                  <thead>
                    <tr className="bg-stone-50 text-left">
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">項目 Description</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center">數量 Qty</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">單價 Price</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">小計 Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-4">
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-stone-400 mt-1 whitespace-pre-wrap">{item.specification}</p>
                        </td>
                        <td className="py-4 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-4 px-4 text-right font-mono">${item.price.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold">${(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-400">小計 Subtotal</span>
                      <span className="font-mono">${subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-400">折扣 Discount</span>
                        <span className="font-mono text-red-500">-${discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxType === "exclusive" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-400">營業稅 Tax (5%)</span>
                        <span className="font-mono">${taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-stone-900">
                      <span className="font-black text-lg">總計 TOTAL</span>
                      <span className="font-mono font-black text-2xl text-emerald-700">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Signature */}
                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-stone-100">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">備註 Notes</h3>
                    <ul className="text-[10px] text-stone-400 space-y-1 list-disc pl-4">
                      <li>本報價單有效期限為 30 天。</li>
                      <li>確認報價後請簽名回傳，以利後續作業。</li>
                      <li>付款條件：簽約後預付 30%，結案後支付尾款。</li>
                    </ul>
                  </div>
                  <div className="border-2 border-stone-100 rounded-xl p-6 flex flex-col justify-between min-h-[120px]">
                    <p className="text-[10px] font-bold text-stone-400 uppercase text-center">客戶簽名回傳區塊 Signature</p>
                    <div className="border-b border-stone-200 w-full mt-auto"></div>
                    <p className="text-[10px] text-stone-300 text-right mt-1">日期 Date: ____ / ____ / ____</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-content, #pdf-content * {
            visibility: visible;
          }
          #pdf-content {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
