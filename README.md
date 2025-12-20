
# 114 勞健保試算系統 (Taiwan Labor & Health Insurance Calculator 2025)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38b2ac.svg)

一款針對台灣 **114 年度 (2025 年)** 勞工保險、全民健康保險及勞工退休金新制設計的專業試算工具。提供直觀的介面，幫助雇主與勞工快速估算每月薪資成本與實領金額。
試算檔案來源使用[NKUST 114年勞健保試算表(https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://ohr.nkust.edu.tw/word/114_%25E5%258B%259E%25E5%2581%25A5%25E4%25BF%259D%25E8%25A9%25A6%25E7%25AE%2597%25E8%25A1%25A8.xlsx&ved=2ahUKEwjA0q-b5suRAxV9QPUHHcizDn8QFnoECBwQAQ&usg=AOvVaw0uiul5VQkktfUjzTDLokZ9)

## AI 工具
aistudio.google.com
就上傳下載的excel後使用下面的prompt指令

## 使用的Prompt
就簡單的下面三行，
1. 請將google driver裡的114_勞健保試算表做成可以線上計算的網頁系統，並可以儲存計算結果在google driver裡
2. 請加上級距及金額設定的功能，未來可以將新的級距及金額上傳或是貼上後更新
3. 產生github用的readme.md

## 佈署 Deploy
Github page有時會無法呈現正確的頁面，所以可以使用[cloudflare page](https://pages.cloudflare.com)來佈署。
主要加上wrangler.json檔案，內容如下，這樣build時就不會出錯。
{
  "name": "twinsurancecaculator",
  "compatibility_date": "2025-12-19",
  "assets": {
    "directory": "./dist"
  },
  "observability": {
    "enabled": true
  }
}
   
## 🌟 核心功能

- **精準試算**：自動對應 114 年度最新投保分級表（勞保最低 $28,590）。
- **三合一計算**：同時計算勞保、健保、勞退（雇主提撥及個人自提）。
- **動態級距設定**：支援手動輸入或大量貼上更新投保分級表與費率，因應未來法規變動。
- **數據視覺化**：透過圖表分析薪資結構與雇主額外負擔成本。
- **紀錄儲存**：可將計算結果儲存至歷史紀錄或模擬存檔至雲端試算表。
- **極致體驗**：基於 Tailwind CSS 的現代化響應式設計，支援手機與桌面端。

## 🛠 關鍵技術

- **前端框架**：React 19 (TypeScript)
- **樣式處理**：Tailwind CSS
- **圖表組件**：Recharts
- **圖示庫**：Lucide React
- **模組管理**：原生 ES Modules (via esm.sh)

## 📖 使用說明

1. **基本試算**：在左側「薪資設定」輸入月薪總額、眷屬人數及勞退自提比例，右側將即時顯示計算結果。
2. **存檔紀錄**：點擊「儲存至 Drive」可將目前計算結果加入下方歷史紀錄中。
3. **更新級距**：
   - 點擊右上角「齒輪圖示」開啟設定。
   - 在「費率參數」分頁可修改基本費率。
   - 在「分級表更新」分頁可直接貼上由 Excel 或網頁複製的數字級距（支援逗號、空白或換行分隔）。

## 📂 專案結構

```text
.
├── App.tsx                # 主要應用程式邏輯與介面
├── index.tsx              # React 進入點
├── constants.ts           # 114 年度預設費率與級距
├── types.ts               # TypeScript 介面定義
├── services/
│   └── insuranceCalculations.ts  # 核心計算邏輯
├── metadata.json          # 專案元數據
└── index.html             # HTML 模板
```

## ⚖️ 免責聲明

本系統計算結果僅供參考，實際扣繳金額應以勞工保險局、中央健康保險署及雇主發放之薪資單為準。

## 📄 授權協議

本專案採用 [MIT License](LICENSE) 授權。
