// ─── AWAAZ — Shared Utilities ───────────────────────────────────────────────

// Smart API base URL detection for dev/production
const API_BASE = (() => {
  // In production (any real domain), use relative path
  // This works on any domain: awaaz.in, example.com, subdomain.example.com, etc.
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api";
  }
  // In local development, use full localhost URL
  return "http://localhost:3000/api";
})();

// ─── THEME HELPERS ───────────────────────────────────────────────────────────
const Theme = {
  get: () => localStorage.getItem("awaaz_theme") || "dark",

  set: (theme) => {
    localStorage.setItem("awaaz_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  },

  toggle: () => {
    const current = Theme.get();
    const newTheme = current === "dark" ? "light" : "dark";
    Theme.set(newTheme);
    updateThemeButton();
  },

  init: () => {
    const theme = Theme.get();
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButton();
  },
};

const updateThemeButton = () => {
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    const theme = Theme.get();
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.title =
      theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme";
  }
};

// Initialize theme on page load
document.addEventListener("DOMContentLoaded", Theme.init);

// ─── LANGUAGE & INTERNATIONALIZATION ──────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    language: "English",
    languageShort: "EN",
    home: "Home",
    myComplaints: "My Complaints",
    admin: "Admin",
    logout: "Logout",
    logIn: "Log In",
    fileComplaint: "+ File Complaint",
    searchComplaints: "Search complaints",
    viewsCount: "views",
    filterBy: "Filter by",
    noComplaints: "No complaints found",
    complainantName: "Complainant Name",
    complaintType: "Complaint Type",
    culpritDesignation: "Culprit Designation",
    filed: "Filed",
    resolved: "Resolved",
    pending: "Pending",
    fileNewComplaint: "File a New Complaint",
    viewDetails: "View Details",
    searchResults: "Search Results",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    submit: "Submit",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    adminPanel: "Admin Panel",
    allComplaints: "All Complaints",
    pendingResolutions: "Pending Resolutions",
    deleteComplaint: "Delete Complaint",
    confirmDelete: "Are you sure?",
    doubleConfirmDelete:
      "This will permanently delete the complaint and all associated files. Click again to confirm.",
    resolve: "Resolve",
    rejectResolution: "Reject Resolution",
    backToHome: "Back to Home",
    section: "Section",
    tagName: "Tag",
    other: "Other",
    selectDesignation: "Select Designation",
    customDesignation: "Custom Designation",
    customComplaintType: "Custom Complaint Type",
    attachProofs: "Attach Proofs (Images/PDFs)",
    maxFileSize: "Max 5MB per file",
    yourEmail: "Your Email",
    emailPlaceholder: "you@example.com",
    pleaseLogIn: "Please log in to continue",
    enterPassword: "Enter your password",
    forgotPassword: "Forgot password?",
    signUp: "Sign Up",
    existingUser: "Already have an account?",
    newUser: "New to AWAAZ?",
    loginSuccess: "Login successful!",
    signUpSuccess: "Sign up successful!",
    errorOccurred: "An error occurred. Please try again.",
    // Home page
    totalComplaints: "Total Complaints",
    resolutionPending: "Resolution Pending",
    fileAComplaint: "File a Complaint",
    filter: "FILTER:",
    all: "All",
    tryDifferent: "Try a different filter or search term.",
    noComplaintsFound: "No complaints found",
    // Complaint form
    section01: "Section 01: Who is making this complaint?",
    section02: "Section 02: What is the nature of the complaint?",
    section03: "Section 03: Attach supporting evidence",
    section04: "Section 04: Request resolution",
    yourName: "Your Name",
    enterYourName: "Enter your full name",
    yourEmail: "Your Email",
    enterYourEmail: "your@email.com",
    designationOfCulprit: "Designation of the Culprit",
    chooseDesignation: "Choose designation...",
    ifOther: "If other, specify:",
    describeComplaint: "Describe your complaint in detail",
    uploadProofs: "Upload Proofs (Images/PDFs)",
    dragDropFiles: "Drag and drop files or click to browse",
    maxFile5MB: "Max 5MB per file, up to 10 files",
    requestResolution: "Request Resolution",
    requestDesc: "What action/resolution are you requesting?",
    uploadProof: "Upload supporting proof (optional)",
    fileAComplaint: "File a Complaint",
    filedSuccessfully: "Complaint filed successfully!",
    // Admin page
    adminLoginTitle: "Admin Login",
    adminSecretKey: "Secret Key",
    enterSecretKey: "Enter admin secret key",
    loginAsAdmin: "Login as Admin",
    adminDashboard: "Admin Dashboard",
    viewedTimes: "viewed",
    // Common
    yourComplaints: "Your Complaints",
    complaintDetails: "Complaint Details",
    // File complaint page labels
    fileComplaintTitle: "File a",
    fileComplaintTitleSpan: "Complaint",
    fileComplaintDesc:
      "Your complaint will be visible to everyone — publicly and permanently. You remain completely anonymous.",
    authRequiredTitle: "Account required to file a complaint.",
    authRequiredDesc:
      "You need a free anonymous account to submit. No personal info required — just pick a User ID and password.",
    createFreeAccount: "Create Free Account",
    alreadyHaveAccount: "Already have one? Log In",
    warningNote:
      "⚠️ Please note: Filing a false complaint is a serious matter. Ensure all information provided is truthful. All complaints are permanent and public. Proofs are mandatory — complaints without evidence will not be accepted.<br><br>🔒 Important: Do not share any sensitive personal information (bank details, passwords, medical records, addresses). Avoid sharing anything that could be used against you by powerful people. Upload redacted proofs.",
    section1Title: "01 — Culprit Information",
    section2Title: "02 — Type of Complaint",
    section3Title: "03 — Location: Where it happened (Optional)",
    section4Title: "04 — Your Statement",
    section5Title: "05 — Legal References (Optional)",
    section6Title: "06 — Evidence & Proofs",
    culpritDesignationLabel: "Culprit's Designation/Position",
    culpritDesignationHint:
      "Select the designation/position of the person. Don't write their name.",
    specifyDesignationLabel: "Specify the Designation",
    specifyDesignationHint:
      "Mention their position/designation, not their name.",
    selectAllTags: "Select all that apply",
    specifyComplaintType: "Please specify the type of complaint",
    cityLabel: "City",
    stateLabel: "State",
    describeLabel: "Describe what happened",
    describeHint: "Minimum 50 characters. Be as detailed as possible.",
    ipcLabel: "IPC Sections / Legal Terms / Articles",
    ipcHint: "Don't worry if you don't know — leave it blank.",
    uploadProofLabel:
      "Upload Proof Files (Make sure sensitive information is redacted)",
    fileDropText: "Click or drag to upload evidence",
    fileDropSub:
      "Images (JPG, PNG, WebP) and PDFs accepted • Max 15MB per file • Up to 8 files",
    uploadHint:
      "Upload screenshots, documents, photos, or any evidence that supports your complaint. At least 1 file is required.",
    beforeSubmit:
      "Before you submit: Your complaint will be immediately visible to everyone publicly. Your User ID is never shown — you remain anonymous. Make sure all information is accurate.",
    submitComplaintBtn: "Submit Complaint Publicly",
  },
  hi: {
    language: "हिन्दी",
    languageShort: "HI",
    home: "होम",
    myComplaints: "मेरी शिकायतें",
    admin: "प्रशासक",
    logout: "लॉग आउट",
    logIn: "लॉग इन करें",
    fileComplaint: "+ शिकायत दर्ज करें",
    searchComplaints: "शिकायतें खोजें",
    viewsCount: "दृश्य",
    filterBy: "द्वारा फ़िल्टर करें",
    noComplaints: "कोई शिकायत नहीं मिली",
    complainantName: "शिकायतकर्ता का नाम",
    complaintType: "शिकायत का प्रकार",
    culpritDesignation: "दोषी का पद",
    filed: "दर्ज की गई",
    resolved: "हल की गई",
    pending: "लंबित",
    fileNewComplaint: "नई शिकायत दर्ज करें",
    viewDetails: "विवरण देखें",
    searchResults: "खोज परिणाम",
    selectAll: "सभी चुनें",
    deselectAll: "सभी को हटाएं",
    submit: "प्रस्तुत करें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    save: "सहेजें",
    adminPanel: "व्यवस्थापक पैनल",
    allComplaints: "सभी शिकायतें",
    pendingResolutions: "लंबित समाधान",
    deleteComplaint: "शिकायत हटाएं",
    confirmDelete: "क्या आप निश्चित हैं?",
    doubleConfirmDelete:
      "यह शिकायत और सभी संबंधित फाइलों को स्थायी रूप से हटा देगा। पुष्टि करने के लिए फिर से क्लिक करें।",
    resolve: "हल करें",
    rejectResolution: "समाधान अस्वीकार करें",
    backToHome: "होम पर वापस जाएं",
    section: "अनुभाग",
    tagName: "टैग",
    other: "अन्य",
    selectDesignation: "पद चुनें",
    customDesignation: "कस्टम पद",
    customComplaintType: "कस्टम शिकायत प्रकार",
    attachProofs: "सबूत संलग्न करें (छवियां/PDF)",
    maxFileSize: "प्रति फाइल अधिकतम 5MB",
    yourEmail: "आपका ईमेल",
    emailPlaceholder: "you@example.com",
    pleaseLogIn: "जारी रखने के लिए कृपया लॉग इन करें",
    enterPassword: "अपना पासवर्ड दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    signUp: "साइन अप करें",
    existingUser: "पहले से खाता है?",
    newUser: "AWAAZ में नए हैं?",
    loginSuccess: "लॉगिन सफल!",
    signUpSuccess: "साइन अप सफल!",
    errorOccurred: "एक त्रुटि हुई। कृपया फिर से प्रयास करें।",
    // Home page
    totalComplaints: "कुल शिकायतें",
    resolutionPending: "समाधान लंबित",
    fileAComplaint: "शिकायत दर्ज करें",
    filter: "फ़िल्टर करें:",
    all: "सभी",
    tryDifferent: "एक अलग फ़िल्टर या खोज शब्द आजमाएं।",
    noComplaintsFound: "कोई शिकायत नहीं मिली",
    // Complaint form
    section01: "अनुभाग 01: यह शिकायत कौन दर्ज कर रहा है?",
    section02: "अनुभाग 02: शिकायत का स्वभाव क्या है?",
    section03: "अनुभाग 03: सहायक साक्ष्य संलग्न करें",
    section04: "अनुभाग 04: समाधान का अनुरोध करें",
    yourName: "आपका नाम",
    enterYourName: "अपना पूरा नाम दर्ज करें",
    yourEmail: "आपका ईमेल",
    enterYourEmail: "आपका@ईमेल.कॉम",
    designationOfCulprit: "दोषी का पद",
    chooseDesignation: "पद चुनें...",
    ifOther: "यदि अन्य है, तो निर्दिष्ट करें:",
    describeComplaint: "अपनी शिकायत का विस्तार से वर्णन करें",
    uploadProofs: "साक्ष्य अपलोड करें (छवियां/PDF)",
    dragDropFiles:
      "फाइलों को ड्रैग और ड्रॉप करें या ब्राउज़ करने के लिए क्लिक करें",
    maxFile5MB: "प्रति फाइल अधिकतम 5MB, 10 फाइलों तक",
    requestResolution: "समाधान का अनुरोध करें",
    requestDesc: "आप किस कार्रवाई/समाधान का अनुरोध कर रहे हैं?",
    uploadProof: "सहायक साक्ष्य अपलोड करें (वैकल्पिक)",
    fileAComplaint: "शिकायत दर्ज करें",
    filedSuccessfully: "शिकायत सफलतापूर्वक दर्ज हुई!",
    // Admin page
    adminLoginTitle: "प्रशासक लॉगिन",
    adminSecretKey: "गुप्त कुंजी",
    enterSecretKey: "प्रशासक गुप्त कुंजी दर्ज करें",
    loginAsAdmin: "प्रशासक के रूप में लॉगिन करें",
    adminDashboard: "प्रशासक डैशबोर्ड",
    viewedTimes: "दृश्य",
    // Common
    yourComplaints: "आपकी शिकायतें",
    complaintDetails: "शिकायत विवरण",
    // File complaint page labels
    fileComplaintTitle: "एक फाइल करें",
    fileComplaintTitleSpan: "शिकायत",
    fileComplaintDesc:
      "आपकी शिकायत सभी को दिखाई देगी — सार्वजनिक रूप से और स्थायी रूप से। आप पूरी तरह से गुमनाम रहते हैं।",
    authRequiredTitle: "शिकायत दर्ज करने के लिए खाते की आवश्यकता है।",
    authRequiredDesc:
      "आपको जमा करने के लिए एक मुफ्त गुमनाम खाता चाहिए। कोई व्यक्तिगत जानकारी की आवश्यकता नहीं — बस एक यूजर आईडी और पासवर्ड चुनें।",
    createFreeAccount: "मुफ्त खाता बनाएं",
    alreadyHaveAccount: "पहले से खाता है? लॉग इन करें",
    warningNote:
      "⚠️ कृपया नोट करें: झूठी शिकायत दर्ज करना एक गंभीर मामला है। सुनिश्चित करें कि प्रदान की गई सभी जानकारी सत्य है। सभी शिकायतें स्थायी और सार्वजनिक हैं। सबूत अनिवार्य हैं — सबूत के बिना शिकायतें स्वीकार नहीं की जाएंगी।<br><br>🔒 महत्वपूर्ण: कोई भी संवेदनशील व्यक्तिगत जानकारी (जैसे बैंक विवरण, पासवर्ड, मेडिकल रिकॉर्ड, पते) साझा न करें। ऐसी कोई जानकारी साझा करने से बचें जिसका दुरुपयोग प्रभावशाली लोग आपके खिलाफ कर सकते हैं। केवल संपादित (रेडैक्टेड) प्रमाण ही अपलोड करें।",
    section1Title: "01 — दोषी की जानकारी",
    section2Title: "02 — शिकायत का प्रकार",
    section3Title: "03 — स्थान: यह कहां हुआ (वैकल्पिक)",
    section4Title: "04 — आपका बयान",
    section5Title: "05 — कानूनी संदर्भ (वैकल्पिक)",
    section6Title: "06 — साक्ष्य और प्रमाण",
    culpritDesignationLabel: "दोषी का पद/स्थिति",
    culpritDesignationHint: "व्यक्ति के पद/स्थिति को चुनें। उनका नाम न लिखें।",
    specifyDesignationLabel: "पद निर्दिष्ट करें",
    specifyDesignationHint: "उनकी स्थिति/पद का उल्लेख करें, नाम नहीं।",
    selectAllTags: "सभी लागू विकल्प चुनें",
    specifyComplaintType: "शिकायत के प्रकार को निर्दिष्ट करें",
    cityLabel: "शहर",
    stateLabel: "राज्य",
    describeLabel: "क्या हुआ इसका वर्णन करें",
    describeHint: "कम से कम 50 वर्ण। जितना संभव हो विस्तार से बताएं।",
    ipcLabel: "आईपीसी अनुभाग / कानूनी शर्तें / अनुच्छेद",
    ipcHint: "चिंता न करें यदि आप नहीं जानते — इसे खाली छोड़ दें।",
    uploadProofLabel:
      "प्रमाण फाइलें अपलोड करें (सुनिश्चित करें कि संवेदनशील जानकारी को मुखौटा किया गया है)",
    fileDropText: "साक्ष्य अपलोड करने के लिए क्लिक या ड्रैग करें",
    fileDropSub:
      "छवियां (JPG, PNG, WebP) और PDF स्वीकार किए गए हैं • प्रति फाइल अधिकतम 15MB • 8 फाइलों तक",
    uploadHint:
      "स्क्रीनशॉट, दस्तावेज़, फ़ोटो या कोई भी साक्ष्य अपलोड करें जो आपकी शिकायत का समर्थन करता है। कम से कम 1 फाइल आवश्यक है।",
    beforeSubmit:
      "जमा करने से पहले: आपकी शिकायत तुरंत सभी के लिए सार्वजनिक रूप से दिखाई देगी। आपकी यूजर आईडी कभी नहीं दिखाई देगी — आप गुमनाम रहते हैं। सुनिश्चित करें कि सभी जानकारी सटीक है।",
    submitComplaintBtn: "शिकायत सार्वजनिक रूप से जमा करें",
  },
};

const Lang = {
  get: () => localStorage.getItem("awaaz_lang") || "en",

  set: (lang) => {
    if (TRANSLATIONS[lang]) {
      localStorage.setItem("awaaz_lang", lang);
      window.location.reload();
    }
  },

  init: () => {
    const lang = Lang.get();
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  },
};

const i18n = (key) => {
  const lang = Lang.get();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"]?.[key] || key;
};

const i18nTag = (value) => {
  const lang = Lang.get();
  const tagTranslations = {
    en: {
      harassment: "🔴 Harassment",
      fraud: "💸 Fraud",
      "sexual-harassment": "⚠️ Sexual Harassment",
      "domestic-violence": "🏠 Domestic Violence",
      cybercrime: "💻 Cybercrime",
      "bribery-corruption": "💰 Bribery / Corruption",
      "police-negligence": "👮 Police Negligence",
      "land-dispute": "🏗️ Land Dispute",
      "financial-fraud": "🏦 Financial Fraud",
      "workplace-abuse": "💼 Workplace Abuse",
      "child-abuse": "🛡️ Child Abuse",
      "human-trafficking": "⛓️ Human Trafficking",
      "medical-negligence": "🏥 Medical Negligence",
      other: "📋 Other",
    },
    hi: {
      harassment: "🔴 उत्पीड़न",
      fraud: "💸 धोखाधड़ी",
      "sexual-harassment": "⚠️ यौन उत्पीड़न",
      "domestic-violence": "🏠 घरेलू हिंसा",
      cybercrime: "💻 साइबर अपराध",
      "bribery-corruption": "💰 रिश्वत / भ्रष्टाचार",
      "police-negligence": "👮 पुलिस की लापरवाही",
      "land-dispute": "🏗️ भूमि विवाद",
      "financial-fraud": "🏦 वित्तीय धोखाधड़ी",
      "workplace-abuse": "💼 कार्यस्थल दुर्व्यवहार",
      "child-abuse": "🛡️ बाल शोषण",
      "human-trafficking": "⛓️ मानव तस्करी",
      "medical-negligence": "🏥 चिकित्सा लापरवाही",
      other: "📋 अन्य",
    },
  };
  return (
    tagTranslations[lang]?.[value] || tagTranslations["en"]?.[value] || value
  );
};

// Initialize language on page load
document.addEventListener("DOMContentLoaded", Lang.init);

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem("awaaz_token"),
  getUser: () => {
    const u = localStorage.getItem("awaaz_user");
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn: () => !!localStorage.getItem("awaaz_token"),
  isAdmin: () => {
    const u = Auth.getUser();
    return u && u.isAdmin;
  },
  save: (token, user) => {
    localStorage.setItem("awaaz_token", token);
    localStorage.setItem("awaaz_user", JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem("awaaz_token");
    localStorage.removeItem("awaaz_user");
    window.location.href = "/pages/index.html";
  },
};

// ─── API FETCH WRAPPER ────────────────────────────────────────────────────────
const api = async (endpoint, options = {}) => {
  const headers = { ...options.headers };
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${data.message || "Something went wrong"}`);
  }
  return data;
};

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
const Toast = (() => {
  let container = null;

  const init = () => {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
  };

  const show = (type, title, message, duration = 4000) => {
    init();
    const icons = { success: "✅", error: "🚨", warning: "⚠️", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || "ℹ️"}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ""}
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideOut 0.25s ease forwards";
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  return {
    success: (title, msg) => show("success", title, msg),
    error: (title, msg) => show("error", title, msg),
    warning: (title, msg) => show("warning", title, msg),
    info: (title, msg) => show("info", title, msg),
  };
})();

// ─── PASSWORD VISIBILITY TOGGLE ───────────────────────────────────────────────
const togglePasswordVisibility = (button) => {
  const input = button.parentElement.querySelector(
    'input[type="password"], input[type="text"]',
  );
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "👁️";
    button.setAttribute("aria-label", "Hide password");
  } else {
    input.type = "password";
    button.textContent = "👁️‍🗨️";
    button.setAttribute("aria-label", "Show password");
  }
};

// ─── TAG CONFIG ───────────────────────────────────────────────────────────────
const TAGS = [
  { value: "harassment", label: "🔴 Harassment" },
  { value: "fraud", label: "💸 Fraud" },
  { value: "sexual-harassment", label: "⚠️ Sexual Harassment" },
  { value: "domestic-violence", label: "🏠 Domestic Violence" },
  { value: "cybercrime", label: "💻 Cybercrime" },
  { value: "bribery-corruption", label: "💰 Bribery / Corruption" },
  { value: "police-negligence", label: "👮 Police Negligence" },
  { value: "land-dispute", label: "🏗️ Land Dispute" },
  { value: "financial-fraud", label: "🏦 Financial Fraud" },
  { value: "workplace-abuse", label: "💼 Workplace Abuse" },
  { value: "child-abuse", label: "🛡️ Child Abuse" },
  { value: "human-trafficking", label: "⛓️ Human Trafficking" },
  { value: "medical-negligence", label: "🏥 Medical Negligence" },
  { value: "other", label: "📋 Other" },
];

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
};

const truncate = (str, n) =>
  str && str.length > n ? str.slice(0, n) + "..." : str;

const tagLabel = (value) => {
  const t = TAGS.find((t) => t.value === value);
  return t ? t.label : value;
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// ─── HEADER RENDER ────────────────────────────────────────────────────────────
const renderHeader = (activePage = "") => {
  const user = Auth.getUser();
  const headerEl = document.getElementById("site-header");
  if (!headerEl) return;

  headerEl.innerHTML = `
    <div class="header-inner">
      <a href="/pages/index.html" class="logo">
        <div class="logo-mark">A</div>
        <div class="logo-text">AWAAZ<span>.</span></div>
        <div class="logo-lang">${i18n("language")}</div>
      </a>

      <nav class="header-nav">
        <a href="/pages/index.html" class="nav-link ${activePage === "home" ? "active" : ""}">${i18n("home")}</a>
        <a href="/pages/about.html" class="nav-link ${activePage === "about" ? "active" : ""}">About</a>
        ${
          user
            ? `
          <a href="/pages/my-complaints.html" class="nav-link ${activePage === "my" ? "active" : ""}">${i18n("myComplaints")}</a>
          ${user.isAdmin ? `<a href="/pages/admin.html" class="nav-link ${activePage === "admin" ? "active" : ""}">${i18n("admin")}</a>` : ""}
          <div class="user-badge">
            <div class="user-badge-dot"></div>
            <span class="user-badge-id">${user.userId}</span>
          </div>
          <button class="nav-btn secondary" onclick="Auth.logout()">${i18n("logout")}</button>
        `
            : `
          <a href="/pages/admin.html" class="nav-link ${activePage === "admin" ? "active" : ""}">🔐 ${i18n("admin")}</a>
          <button class="nav-btn secondary" onclick="openAuthModal('login')">${i18n("logIn")}</button>
        `
        }
        <div class="lang-selector">
          <button class="lang-btn" id="lang-btn" onclick="toggleLangMenu()" title="Change Language">${Lang.get().toUpperCase()}</button>
          <div class="lang-menu" id="lang-menu" style="display: none;">
            <button onclick="changeLang('en')" class="lang-option ${Lang.get() === "en" ? "active" : ""}">🇬🇧 English</button>
            <button onclick="changeLang('hi')" class="lang-option ${Lang.get() === "hi" ? "active" : ""}">🇮🇳 हिन्दी</button>
          </div>
        </div>
        <button class="theme-toggle-btn" id="theme-toggle-btn" onclick="Theme.toggle()" title="Toggle Theme"></button>
        <a href="/pages/file-complaint.html" class="nav-btn">${i18n("fileComplaint")}</a>
      </nav>
    </div>
  `;

  // Update theme button after rendering
  setTimeout(() => updateThemeButton(), 0);
};

const renderFooter = () => {
  const footerEl = document.getElementById("site-footer");
  if (!footerEl) return;

  footerEl.innerHTML = `
    <div class="footer-inner">
      <div>
        <div class="footer-logo">AWAAZ<span>.</span></div>
        <div class="footer-tagline">"Silence is not golden when injustice screams."</div>
      </div>
      <div class="footer-note">
        AWAAZ enables anonymous sharing of real-world experiences to raise awareness. Content reflects personal perspectives, is moderated, and not independently verified. We are independent of any government authority.
      </div>
    </div>
  `;
};

const toggleLangMenu = () => {
  const menu = document.getElementById("lang-menu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
};

const changeLang = (lang) => {
  const menu = document.getElementById("lang-menu");
  if (menu) {
    menu.style.display = "none";
  }
  Lang.set(lang);
};

// Close language menu when clicking outside
document.addEventListener("click", (e) => {
  const langSelector = document.querySelector(".lang-selector");
  if (langSelector && !langSelector.contains(e.target)) {
    const menu = document.getElementById("lang-menu");
    if (menu) menu.style.display = "none";
  }
});

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
const openAuthModal = (mode = "login") => {
  const existing = document.getElementById("auth-modal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "auth-modal";

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" onclick="document.getElementById('auth-modal').remove()">×</button>
      <div id="auth-modal-content"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add("open"), 10);

  renderAuthForm(mode);
};

const renderAuthForm = (mode) => {
  const content = document.getElementById("auth-modal-content");
  if (!content) return;

  const isLogin = mode === "login";

  content.innerHTML = `
    <div class="modal-title">${isLogin ? "Log In" : "Create Account"}</div>
    <div class="modal-sub">
      ${
        isLogin
          ? "Enter your User ID and password to continue."
          : 'Choose a unique ID and password. <strong style="color:var(--accent)">No personal info needed.</strong>'
      }
    </div>

    <div class="form-group">
      <label class="form-label">User ID <span class="required">*</span></label>
      <input class="form-input" id="auth-userid" type="text" placeholder="e.g. anonymous_warrior" autocomplete="username">
      <div class="form-hint">Letters, numbers, underscores only. Min 4 characters.</div>
    </div>

    <div class="form-group">
      <label class="form-label">Password <span class="required">*</span></label>
      <div class="password-wrapper">
        <input class="form-input" id="auth-password" type="password" placeholder="Min 6 characters" autocomplete="${isLogin ? "current-password" : "new-password"}">
        <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility(this)" aria-label="Show password">👁️‍🗨️</button>
      </div>
    </div>

    <button class="btn btn-primary btn-full" id="auth-submit-btn" onclick="submitAuth('${mode}')">
      <span class="spinner" id="auth-spinner"></span>
      ${isLogin ? "Log In" : "Create Account"}
    </button>

    <div style="text-align:center; margin-top:16px; font-size:13px; color:var(--text-muted)">
      ${
        isLogin
          ? `Don't have an account? <a href="#" onclick="renderAuthForm('register'); return false;" style="color:var(--accent)">Create one</a>`
          : `Already have an account? <a href="#" onclick="renderAuthForm('login'); return false;" style="color:var(--accent)">Log in</a>`
      }
    </div>
  `;

  document.getElementById("auth-userid").focus();

  // Enter key support
  overlay.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitAuth(mode);
    });
  });
};

const submitAuth = async (mode) => {
  const userId = document.getElementById("auth-userid")?.value.trim();
  const password = document.getElementById("auth-password")?.value;
  const btn = document.getElementById("auth-submit-btn");
  const spinner = document.getElementById("auth-spinner");

  if (!userId || !password) {
    Toast.error("Missing fields", "Please fill in all fields.");
    return;
  }

  btn.disabled = true;
  if (spinner) spinner.style.display = "block";

  try {
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const data = await api(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });

    Auth.save(data.token, data.user);
    document.getElementById("auth-modal")?.remove();
    Toast.success("Welcome!", data.user.userId);

    // Re-render header & redirect if needed
    renderHeader();
    setTimeout(() => {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      if (redirect) window.location.href = redirect;
      else window.location.reload();
    }, 800);
  } catch (err) {
    Toast.error("Failed", err.message);
    btn.disabled = false;
    if (spinner) spinner.style.display = "none";
  }
};

// Close modal on overlay click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("auth-modal");
  if (modal && e.target === modal) modal.remove();
});
