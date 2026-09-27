var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var PORT = Number(process.env.PORT) || 5173;
var SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://pdxyqlxbucoghoetyzmv.supabase.co";
var SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeHlxbHhidWNvZ2hvZXR5em12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MjMyODAsImV4cCI6MjA1NDk5OTI4MH0.HlFAMTnjM-Uxlxu_VbhmZt_6dLgYsVyGRy_lu1foASc";
var cachedGeminiApiKey;
var cachedGeminiModel = "gemini-1.5-flash";
var SUPABASE_SECRET_KEY = process.env.VITE_SUPABASE_SECRET_KEY;
var supabaseAdmin = SUPABASE_SECRET_KEY ? (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
async function loadGeminiApiKeyFromSupabase(authToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return process.env.GEMINI_API_KEY || null;
  try {
    const client = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: authToken ? { headers: { Authorization: authToken } } : {}
    });
    const { data, error } = await client.from("ai_provider_settings").select("api_key_encrypted, config, provider_id").ilike("provider_id", "%gemini%").eq("is_active", true).limit(1).maybeSingle();
    const apiKey = data?.api_key_encrypted || process.env.GEMINI_API_KEY || null;
    cachedGeminiApiKey = apiKey;
    if (data?.config && typeof data.config === "object" && data.config.model) {
      cachedGeminiModel = data.config.model;
    }
    return apiKey;
  } catch (err) {
    console.warn("Failed to load Gemini API key from ai_provider_settings:", err);
    return process.env.GEMINI_API_KEY || null;
  }
}
var SAMPLE_INVOICE_PRESETS = {
  electronics_gst: {
    supplierName: "Silicon Tech Distribution Pvt Ltd",
    supplierGstin: "27AABCS1429B1ZX",
    supplierPhone: "+91 98201 55432",
    supplierEmail: "billing@silicontech.in",
    supplierAddress: "Plot 42, MIDC Electronic Zone, Andheri East, Mumbai, Maharashtra - 400093",
    invoiceNo: "ST-2026/8842",
    invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 864e5).toISOString().split("T")[0],
    countryCode: "IN",
    currency: "\u20B9",
    currencyCode: "INR",
    taxRegime: "india_gst",
    isGstInclusive: false,
    isInterState: false,
    items: [
      {
        productName: "POS Thermal Receipt Printer 80mm USB+LAN",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "84433200",
        qty: 4,
        unitPrice: 4200,
        discountRate: 5,
        discountType: "percentage",
        taxRate: 18,
        gstRate: 18,
        batchNo: "PRN-2026-B1"
      },
      {
        productName: "Omnidirectional 2D Barcode Scanner Stand",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "84719000",
        qty: 6,
        unitPrice: 2850,
        discountRate: 150,
        discountType: "amount",
        taxRate: 18,
        gstRate: 18,
        batchNo: "SCN-8840"
      },
      {
        productName: "Heavy Duty Metal Cash Drawer 5-Bill 8-Coin",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "83030000",
        qty: 3,
        unitPrice: 3100,
        discountRate: 8,
        discountType: "percentage",
        taxRate: 18,
        gstRate: 18,
        batchNo: "DRW-5501"
      }
    ],
    billDiscountType: "percentage",
    billDiscountRate: 0,
    notes: "Standard GST tax invoice with line item trade discounts.",
    ocrConfidence: 0.98
  },
  us_hardware_sales_tax: {
    supplierName: "Pacific Retail Systems Inc.",
    supplierGstin: "EIN-94-3829104",
    supplierPhone: "+1 (415) 890-4412",
    supplierEmail: "orders@pacificretailsys.com",
    supplierAddress: "850 Market Street, Suite 400, San Francisco, CA 94102, USA",
    invoiceNo: "PRS-INV-9921",
    invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
    countryCode: "US",
    currency: "$",
    currencyCode: "USD",
    taxRegime: "us_sales_tax",
    isGstInclusive: false,
    isInterState: false,
    items: [
      {
        productName: "Touch Screen All-in-One POS Terminal i5 16GB",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "8471.41",
        qty: 2,
        unitPrice: 750,
        discountRate: 50,
        discountType: "amount",
        taxRate: 8.625,
        gstRate: 8.625,
        batchNo: "POS-US-991"
      },
      {
        productName: "Customer Display Pole 10.1 inch IPS Screen",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "8528.52",
        qty: 2,
        unitPrice: 180,
        discountRate: 5,
        discountType: "percentage",
        taxRate: 8.625,
        gstRate: 8.625,
        batchNo: "DSP-772"
      }
    ],
    billDiscountType: "amount",
    billDiscountAmount: 40,
    notes: "Commercial trade discount for wholesale purchase.",
    ocrConfidence: 0.96
  },
  uae_vat_wholesale: {
    supplierName: "Gulf Retail Equipment Trading LLC",
    supplierGstin: "TRN-100293847500003",
    supplierPhone: "+971 4 398 7654",
    supplierEmail: "sales@gulfretaille.ae",
    supplierAddress: "Warehouse 14, Al Quoz Industrial Area 3, Dubai, UAE",
    invoiceNo: "GRE-AE-4102",
    invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 864e5).toISOString().split("T")[0],
    countryCode: "AE",
    currency: "AED",
    currencyCode: "AED",
    taxRegime: "uae_vat",
    isGstInclusive: false,
    isInterState: false,
    items: [
      {
        productName: "Thermal Paper Rolls 80x80mm (Box of 50)",
        categoryName: "General Merchandise",
        hsnCode: "481190",
        qty: 10,
        unitPrice: 85,
        discountRate: 10,
        discountType: "percentage",
        taxRate: 5,
        gstRate: 5,
        batchNo: "PPR-2026-AE"
      },
      {
        productName: "Wireless Bluetooth Barcode Scanner 2D",
        categoryName: "POS Hardware & Electronics",
        hsnCode: "847190",
        qty: 5,
        unitPrice: 220,
        discountRate: 20,
        discountType: "amount",
        taxRate: 5,
        gstRate: 5,
        batchNo: "WSC-331"
      }
    ],
    billDiscountType: "percentage",
    billDiscountRate: 2.5,
    notes: "UAE Federal Tax Authority compliant VAT Tax Invoice.",
    ocrConfidence: 0.97
  },
  uk_apparel_vat: {
    supplierName: "Meridian Apparel & Footwear Wholesalers Ltd",
    supplierGstin: "GB 923 8841 09",
    supplierPhone: "+44 20 7946 0912",
    supplierEmail: "accounts@meridianapparel.co.uk",
    supplierAddress: "Unit 7, Regent Business Park, Birmingham, B7 4BG, United Kingdom",
    invoiceNo: "UK-PUR-5582",
    invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0],
    countryCode: "GB",
    currency: "\xA3",
    currencyCode: "GBP",
    taxRegime: "uk_vat",
    isGstInclusive: true,
    // MRP / Inclusive mode
    isInterState: false,
    items: [
      {
        productName: "Ergonomic Orthopedic Safety Work Boots",
        categoryName: "Footwear & Shoes",
        hsnCode: "64034000",
        qty: 12,
        unitPrice: 45,
        discountRate: 5,
        discountType: "percentage",
        taxRate: 20,
        gstRate: 20,
        batchNo: "BOOT-UK-01"
      },
      {
        productName: "Industrial Protective Workwear Uniform Pack",
        categoryName: "Apparel & Garments",
        hsnCode: "62113300",
        qty: 8,
        unitPrice: 32,
        discountRate: 2,
        discountType: "amount",
        taxRate: 20,
        gstRate: 20,
        batchNo: "UNI-UK-88"
      }
    ],
    billDiscountType: "amount",
    billDiscountAmount: 25,
    notes: "VAT-inclusive invoice with prompt settlement terms.",
    ocrConfidence: 0.95
  }
};
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", async (req, res) => {
    const geminiKey = await loadGeminiApiKeyFromSupabase(req.headers.authorization) || process.env.GEMINI_API_KEY;
    res.json({
      status: "ok",
      hasGeminiApiKey: Boolean(geminiKey),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/ocr-purchase", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", textInput, sampleType } = req.body;
      if (sampleType && SAMPLE_INVOICE_PRESETS[sampleType]) {
        const preset = { ...SAMPLE_INVOICE_PRESETS[sampleType] };
        preset.invoiceDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        return res.json({
          success: true,
          source: "preset",
          data: preset,
          message: "Sample invoice loaded successfully with complete tax and discount structure."
        });
      }
      const geminiKey = await loadGeminiApiKeyFromSupabase(req.headers.authorization);
      const client = geminiKey ? new import_genai.GoogleGenAI({ apiKey: geminiKey }) : null;
      if (client && (imageBase64 || textInput)) {
        const systemPrompt = `You are an expert AI Document OCR & Accounting Data Parser specialized in Purchase Invoices, Vendor Bills, Tax Invoices, and Commercial Receipts across multiple countries (India GST, US Sales Tax, UAE VAT, UK VAT, Canada GST/HST, Australia GST, Singapore GST, Saudi VAT, EU VAT).

Analyze the provided invoice document or image with extreme precision and return ONLY valid, parseable JSON matching the following schema without markdown formatting or code fences:

{
  "supplierName": string (Vendor or Supplier Business Name),
  "supplierGstin": string (Tax ID, GSTIN, TRN, EIN, VAT Number or empty string),
  "supplierPan": string (PAN number if present in India, or empty string),
  "supplierPhone": string (Contact mobile/phone or empty string),
  "supplierEmail": string (Contact email or empty string),
  "contactPerson": string (Name of contact person if mentioned, or empty string),
  "supplierAddress": string (Street address or empty string),
  "supplierCity": string (City or empty string),
  "supplierState": string (State/Province or empty string),
  "supplierPincode": string (Pincode/Zip or empty string),
  "supplierType": string (Supplier business type if mentioned, or empty string),
  "invoiceNo": string (Invoice/Bill number, generate a realistic one like PUR-2026-XXXX if missing),
  "invoiceDate": string (Format: YYYY-MM-DD),
  "dueDate": string (Format: YYYY-MM-DD or empty),
  "countryCode": string ("IN" | "US" | "AE" | "GB" | "CA" | "AU" | "SG" | "SA" | "DE" | "FR" | "GLOBAL"),
  "currency": string (Symbol e.g. "\u20B9", "$", "\u20AC", "\xA3", "AED", "CA$", "A$", "S$", "SAR"),
  "currencyCode": string ("INR" | "USD" | "EUR" | "GBP" | "AED" | "CAD" | "AUD" | "SGD" | "SAR"),
  "taxRegime": string ("india_gst" | "us_sales_tax" | "uae_vat" | "uk_vat" | "canada_gst_hst" | "australia_gst" | "singapore_gst" | "saudi_vat" | "eu_vat" | "global_flat"),
  "isGstInclusive": boolean (true if prices are inclusive of tax/MRP, false if tax is added on top),
  "isInterState": boolean (true if inter-state/IGST or cross-border, false if local/intra-state),
  "items": [
    {
      "productName": string (Item name/description),
      "categoryName": string (Appropriate category e.g. "POS Hardware & Electronics", "Footwear & Shoes", "Apparel & Garments", "FMCG & Groceries", "Pharma & Healthcare", "Raw Materials & Leather", "General Merchandise"),
      "hsnCode": string (HSN/SAC or SKU or code),
      "qty": number (Quantity, default 1),
      "unitPrice": number (Price per unit before item discount),
      "discountRate": number (Discount percentage or flat amount on this item, 0 if none),
      "discountType": "percentage" | "amount",
      "taxRate": number (Applicable tax rate percentage e.g. 0, 5, 12, 18, 20, 28),
      "gstRate": number (Same as taxRate),
      "batchNo": string (Batch or Lot number if listed, else empty)
    }
  ],
  "billDiscountType": "percentage" | "amount",
  "billDiscountRate": number (Document/Bill-level discount rate or percentage, 0 if none),
  "billDiscountAmount": number (Document/Bill-level discount amount in currency, 0 if none),
  "notes": string (Any payment terms, remarks, or scanned memo),
  "ocrConfidence": number (Confidence score between 0.85 and 0.99)
}

Rules:
1. Ensure numerical values (qty, unitPrice, discountRate, taxRate) are parsed as clean floats/numbers.
2. If tax is not explicitly broken down per item, detect the national standard rate for that country (e.g. 18% for India, 5% for UAE, 20% for UK, 8.25% for US, 10% for Australia).
3. CRITICAL ANTI-DUPLICATION RULE FOR DISCOUNTS: Never duplicate the same discount across both line items and bill summary. If the invoice has a single overall discount at the footer/subtotal level (e.g. "Trade Discount -\u20B9596" or "5% Discount on Bill"), record it ONLY in billDiscountAmount or billDiscountRate, and set each item's discountRate to 0. Only assign discountRate to an individual line item if that item has its own distinct line-item discount column.
4. Output STRICT JSON only.`;
        let contents = [];
        if (imageBase64) {
          const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
          contents = [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: systemPrompt
            }
          ];
        } else {
          contents = [
            {
              text: `${systemPrompt}

Invoice Raw Text / Data:
${textInput}`
            }
          ];
        }
        let parsedData = null;
        let modelUsed = null;
        let lastError = null;
        const GEMINI_MODEL = process.env.GEMINI_MODEL || cachedGeminiModel;
        const modelName = GEMINI_MODEL;
        try {
          const configBase = {
            temperature: 0.1,
            responseMimeType: "application/json"
          };
          const response = await client.models.generateContent({
            model: modelName,
            contents,
            config: configBase
          });
          const rawText = response.text || "";
          let parseFailed = false;
          try {
            parsedData = JSON.parse(rawText);
          } catch {
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/({[\s\S]*})/);
            if (jsonMatch) {
              try {
                parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              } catch {
                parseFailed = true;
              }
            } else {
              parseFailed = true;
            }
          }
          if (parseFailed) {
            throw new Error("OCR data received but could not be parsed.");
          }
          if (parsedData) {
            const itemsArray = parsedData.items || parsedData.products || parsedData.lineItems || [];
            parsedData.items = Array.isArray(itemsArray) ? itemsArray : [];
          }
          if (parsedData && parsedData.items && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
            modelUsed = modelName;
            return res.json({
              success: true,
              source: `gemini-ocr (${modelName})`,
              modelUsed: modelName,
              data: parsedData,
              message: `Invoice from ${parsedData.supplierName || "supplier"} parsed by Gemini ${modelName.includes("2.5") ? "2.5 Flash" : modelName} OCR \u2014 ${parsedData.items.length} line item(s) extracted.`
            });
          } else if (parsedData) {
            modelUsed = modelName;
            return res.json({
              success: true,
              source: `gemini-ocr (${modelName})`,
              modelUsed: modelName,
              data: parsedData,
              message: `Purchase bill scanned successfully, but 0 product rows were detected.`
            });
          }
        } catch (modelErr) {
          lastError = modelErr;
          console.warn(`Model ${modelName} encountered issue:`, modelErr?.message || modelErr);
        }
        if (lastError) {
          console.error("Gemini vision API failed:", lastError.message || lastError);
          return res.status(500).json({
            success: false,
            error: lastError.message || "Gemini Vision API failed to extract bill data. Please try a clearer image.",
            source: "gemini-ocr"
          });
        }
      } else if (!client) {
        console.warn("No Gemini API Key found. Returning mock data so UI can be tested.");
        const preset = { ...SAMPLE_INVOICE_PRESETS["electronics_gst"] };
        preset.supplierName = "[MOCK - NO API KEY] " + preset.supplierName;
        preset.invoiceDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        return res.json({
          success: true,
          source: "preset",
          data: preset,
          message: "MOCK DATA: No Gemini API Key configured. Returned sample invoice data for testing."
        });
      }
      return res.status(500).json({
        success: false,
        error: "OCR extraction failed unexpectedly.",
        source: "system"
      });
    } catch (err) {
      console.error("OCR Purchase parsing safe handler:", err);
      const safeData = {
        supplierName: "",
        supplierGstin: "",
        supplierPhone: "",
        supplierEmail: "",
        supplierAddress: "",
        invoiceNo: `PUR-${Date.now().toString().slice(-6)}`,
        invoiceDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 15 * 864e5).toISOString().split("T")[0],
        countryCode: "IN",
        currency: "\u20B9",
        currencyCode: "INR",
        taxRegime: "india_gst",
        isGstInclusive: false,
        isInterState: false,
        items: [],
        billDiscountType: "percentage",
        billDiscountRate: 0,
        billDiscountAmount: 0,
        notes: "Scanned document ready for line-item verification.",
        ocrConfidence: 0
      };
      res.json({
        success: true,
        source: "safe-recovery",
        data: safeData,
        message: "Document ready for line-item verification."
      });
    }
  });
  app.post("/api/admin/create-user", import_express.default.json(), async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Server not configured with Service Role key" });
    }
    const { email, password, name, role, companyId, status } = req.body;
    if (!email || !companyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const normalizedRole = (role || "staff").toLowerCase().trim();
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || "TempAuth#2024!",
        email_confirm: true,
        user_metadata: {
          display_name: name || email.split("@")[0],
          role: normalizedRole
        }
      });
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
      const newUserId = authData.user.id;
      const { error: authUserErr } = await supabaseAdmin.from("auth_users").upsert({
        id: newUserId,
        display_name: name || email.split("@")[0],
        email,
        company_id: companyId,
        role: normalizedRole,
        status: status || "active"
      }, { onConflict: "id", ignoreDuplicates: false });
      if (authUserErr) {
        console.error("[ADMIN API] auth_users insert failed, deleting orphan Auth user:", newUserId);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return res.status(400).json({ error: "Failed to create auth_users record: " + authUserErr.message });
      }
      const { error: compErr } = await supabaseAdmin.from("company_users").upsert({
        company_id: companyId,
        user_id: newUserId,
        role: normalizedRole,
        status: status || "active",
        email,
        display_name: name || email.split("@")[0]
      }, { onConflict: "user_id, company_id" });
      if (compErr) {
        console.error("[ADMIN API] company_users insert failed, deleting orphan Auth user:", newUserId);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return res.status(400).json({ error: "Failed to assign company membership: " + compErr.message });
      }
      return res.json({ success: true, userId: newUserId });
    } catch (e) {
      console.error("Error in /api/admin/create-user:", e);
      return res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/admin/update-user/:id", import_express.default.json(), async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Server not configured with Service Role key" });
    }
    const userId = req.params.id;
    const { name, role, status } = req.body;
    const normalizedRole = role ? role.toLowerCase().trim() : void 0;
    try {
      const userMetaUpdate = {};
      if (name) userMetaUpdate.display_name = name;
      if (normalizedRole) userMetaUpdate.role = normalizedRole;
      if (Object.keys(userMetaUpdate).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: userMetaUpdate
        });
        if (authError) {
          if (authError.message.includes("User not found")) {
            console.warn(`[API] User ${userId} not found in Supabase Auth, skipping auth update but proceeding with table updates.`);
          } else {
            return res.status(400).json({ error: authError.message });
          }
        }
      }
      const authUserUpdates = {};
      if (name) authUserUpdates.display_name = name;
      if (normalizedRole) authUserUpdates.role = normalizedRole;
      if (status) authUserUpdates.status = status;
      if (Object.keys(authUserUpdates).length > 0) {
        await supabaseAdmin.from("auth_users").update(authUserUpdates).eq("id", userId);
      }
      const compUserUpdates = {};
      if (name) compUserUpdates.display_name = name;
      if (normalizedRole) compUserUpdates.role = normalizedRole;
      if (status) compUserUpdates.status = status;
      if (Object.keys(compUserUpdates).length > 0) {
        await supabaseAdmin.from("company_users").update(compUserUpdates).eq("user_id", userId);
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Error in /api/admin/update-user:", e);
      return res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/admin/delete-user/:id", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Server not configured with Service Role key" });
    }
    const userId = req.params.id;
    try {
      await supabaseAdmin.from("company_users").delete().eq("user_id", userId);
      await supabaseAdmin.from("auth_users").delete().eq("id", userId);
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) return res.status(400).json({ error: authError.message });
      return res.json({ success: true });
    } catch (e) {
      console.error("Error in /api/admin/delete-user:", e);
      return res.status(500).json({ error: e.message });
    }
  });
  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`POS Profit Backend & OCR Server running on http://0.0.0.0:${PORT}`);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true" ? { server: httpServer } : false,
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
