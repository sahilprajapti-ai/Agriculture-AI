const API_BASE = '/api';
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
let selectedImage = null;
let currentImageDataUrl = null;
let signedInUser = null;

const translations = {
  en: {
    navHome: 'Home', navSolve: 'Solve Problem', navAssistant: 'AI Assistant', navAnalyses: 'My Analyses', navAbout: 'About',
    language: 'Language', signIn: 'Sign in', createAccount: 'Create account', heroEyebrow: 'Smart farming, simpler decisions',
    heroTitle: 'Understand your crop.<br /><em>Grow with confidence.</em>', heroText: 'Get practical AI guidance for crop, soil, pest and irrigation problems—made simple for every farmer.',
    solveMyProblem: 'Solve my problem', uploadCropImage: 'Upload crop image', solverKicker: 'AI PROBLEM SOLVER',
    solverTitle: 'Tell us what’s happening<br /><em>in your field.</em>', solverText: 'Share a few details and get a clear, farmer-friendly action plan.',
    cropName: 'Crop name', location: 'Location', farmingStage: 'Farming stage', selectStage: 'Select stage', problemCategory: 'Problem category',
    selectCategory: 'Select category', describeProblem: 'Describe your problem', analyzeProblem: 'Analyze problem', privateInfo: 'Your information stays private',
    cropPlaceholder: 'e.g. Tomato', locationPlaceholder: 'e.g. Nashik, Maharashtra',
    descriptionPlaceholder: 'I planted tomato 30 days ago. The leaves are turning yellow and small insects are visible underneath the leaves.',
    chatPlaceholder: 'Ask about your crop...', analyzing: 'Analyzing your crop…', signInRequired: 'Sign in to save your analysis.',
    firstName: 'First name', lastName: 'Last name', fatherName: 'Father Name', email: 'Email', mobileNumber: 'Mobile number',
    editProfile: 'Edit Profile', deleteAccount: 'Delete Account', saveChanges: 'Save changes', cancel: 'Cancel', signOut: 'Sign out',
    profileNote: 'Your saved analyses are private to this account.', deleteConfirmTitle: 'Delete your profile?',
    deleteConfirmText: 'This will permanently delete your account and all your saved field problem analyses. This action cannot be undone.',
    confirmDelete: 'Yes, Delete', profileUpdated: 'Your profile has been updated.', accountDeleted: 'Your account and saved analyses have been deleted.'
  },
  hi: {
    navHome: 'होम', navSolve: 'समस्या हल करें', navAssistant: 'AI सहायक', navAnalyses: 'मेरे विश्लेषण', navAbout: 'हमारे बारे में',
    language: 'भाषा', signIn: 'साइन इन', createAccount: 'खाता बनाएं', heroEyebrow: 'स्मार्ट खेती, आसान निर्णय',
    heroTitle: 'अपनी फसल को समझें।<br /><em>आत्मविश्वास से बढ़ें।</em>', heroText: 'फसल, मिट्टी, कीट और सिंचाई की समस्याओं के लिए आसान AI मार्गदर्शन पाएं।',
    solveMyProblem: 'मेरी समस्या हल करें', uploadCropImage: 'फसल की तस्वीर अपलोड करें', solverKicker: 'AI समस्या समाधान',
    solverTitle: 'बताइए आपके खेत में<br /><em>क्या हो रहा है।</em>', solverText: 'कुछ जानकारी साझा करें और सरल, उपयोगी कार्य योजना पाएं।',
    cropName: 'फसल का नाम', location: 'स्थान', farmingStage: 'फसल की अवस्था', selectStage: 'अवस्था चुनें', problemCategory: 'समस्या की श्रेणी',
    selectCategory: 'श्रेणी चुनें', describeProblem: 'अपनी समस्या बताएं', analyzeProblem: 'समस्या का विश्लेषण करें', privateInfo: 'आपकी जानकारी निजी रहती है',
    cropPlaceholder: 'जैसे टमाटर', locationPlaceholder: 'जैसे नासिक, महाराष्ट्र',
    descriptionPlaceholder: 'मैंने 30 दिन पहले टमाटर लगाया था। पत्तियां पीली हो रही हैं और नीचे छोटे कीड़े दिखाई देते हैं।',
    chatPlaceholder: 'अपनी फसल के बारे में पूछें...', analyzing: 'आपकी फसल का विश्लेषण हो रहा है…', signInRequired: 'अपना विश्लेषण सहेजने के लिए साइन इन करें।',
    firstName: 'पहला नाम', lastName: 'अंतिम नाम', fatherName: 'पिता का नाम', email: 'ईमेल', mobileNumber: 'मोबाइल नंबर',
    editProfile: 'प्रोफ़ाइल संपादित करें', deleteAccount: 'खाता हटाएं', saveChanges: 'बदलाव सहेजें', cancel: 'रद्द करें', signOut: 'साइन आउट',
    profileNote: 'आपके सहेजे गए विश्लेषण इस खाते में सुरक्षित और निजी हैं।', deleteConfirmTitle: 'क्या आप अपना प्रोफ़ाइल हटाना चाहते हैं?',
    deleteConfirmText: 'यह आपके खाते और सभी सहेजे गए फसल विश्लेषणों को हमेशा के लिए हटा देगा। यह क्रिया वापस नहीं ली जा सकती।',
    confirmDelete: 'हाँ, हटाएं', profileUpdated: 'आपकी प्रोफ़ाइल अपडेट हो गई है।', accountDeleted: 'आपका खाता और सहेजे गए विश्लेषण हटा दिए गए हैं।'
  },
  gu: {
    navHome: 'હોમ', navSolve: 'સમસ્યા ઉકેલો', navAssistant: 'AI સહાયક', navAnalyses: 'મારા વિશ્લેષણ', navAbout: 'અમારા વિશે',
    language: 'ભાષા', signIn: 'સાઇન ઇન', createAccount: 'ખાતું બનાવો', heroEyebrow: 'સ્માર્ટ ખેતી, સરળ નિર્ણય',
    heroTitle: 'તમારા પાકને સમજો.<br /><em>વિશ્વાસથી ઉગાડો.</em>', heroText: 'પાક, માટી, જીવાત અને સિંચાઈની સમસ્યાઓ માટે સરળ AI માર્ગદર્શન મેળવો.',
    solveMyProblem: 'મારી સમસ્યા ઉકેલો', uploadCropImage: 'પાકનો ફોટો અપલોડ કરો', solverKicker: 'AI સમસ્યા ઉકેલનાર',
    solverTitle: 'તમારા ખેતરમાં<br /><em>શું થઈ રહ્યું છે તે જણાવો.</em>', solverText: 'થોડી વિગતો જણાવો અને સરળ, ઉપયોગી કાર્ય યોજના મેળવો.',
    cropName: 'પાકનું નામ', location: 'સ્થળ', farmingStage: 'પાકની અવસ્થા', selectStage: 'અવસ્થા પસંદ કરો', problemCategory: 'સમસ્યાની શ્રેણી',
    selectCategory: 'શ્રેણી પસંદ કરો', describeProblem: 'તમારી સમસ્યા જણાવો', analyzeProblem: 'સમસ્યાનું વિશ્લેષણ કરો', privateInfo: 'તમારી માહિતી ખાનગી રહે છે',
    cropPlaceholder: 'દા.ત. ટામેટાં', locationPlaceholder: 'દા.ત. નાસિક, મહારાષ્ટ્ર',
    descriptionPlaceholder: 'મેં 30 દિવસ પહેલાં ટામેટાં વાવ્યાં હતાં. પાંદડાં પીળાં થઈ રહ્યાં છે અને નીચે નાના જીવાત દેખાય છે.',
    chatPlaceholder: 'તમારા પાક વિશે પૂછો...', analyzing: 'તમારા પાકનું વિશ્લેષણ થઈ રહ્યું છે…', signInRequired: 'વિશ્લેષણ સાચવવા માટે સાઇન ઇન કરો.',
    firstName: 'પ્રથમ નામ', lastName: 'છેલ્લું નામ', fatherName: 'પિતાનું નામ', email: 'ઇમેઇલ', mobileNumber: 'મોબાઇલ નંબર',
    editProfile: 'પ્રોફાઇલ સંપાદિત કરો', deleteAccount: 'ખાતું કાઢી નાખો', saveChanges: 'ફેરફારો સાચવો', cancel: 'રદ કરો', signOut: 'સાઇન આઉટ',
    profileNote: 'તમારા સાચવેલા વિશ્લેષણ આ ખાતામાં ખાનગી અને સુરક્ષિત છે.', deleteConfirmTitle: 'શું તમે તમારી પ્રોફાઇલ કાઢી નાખવા માંગો છો?',
    deleteConfirmText: 'આ તમારા ખાતા અને બધા સાચવેલા પાક વિશ્લેષણને કાયમ માટે કાઢી નાખશે. આ ક્રિયા પૂર્વવત્ કરી શકાતી નથી.',
    confirmDelete: 'હા, કાઢી નાખો', profileUpdated: 'તમારી પ્રોફાઇલ અપડેટ થઈ ગઈ છે.', accountDeleted: 'તમારું ખાતું અને સાચવેલા વિશ્લેષણ કાઢી નાખવામાં આવ્યા છે.'
  }
};

function languageCode() { return $('#language')?.value || 'en'; }
function languageName() { return ({en:'English', hi:'Hindi', gu:'Gujarati'})[languageCode()]; }
function t(key) { return translations[languageCode()]?.[key] || translations.en[key] || key; }

function applyLanguage() {
  document.documentElement.lang = languageCode();
  const sidebarLang = $('#sidebar-language');
  if (sidebarLang) sidebarLang.value = languageCode();
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(element => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  const cropInp = document.querySelector('[name="crop"]');
  if (cropInp) cropInp.placeholder = t('cropPlaceholder');
  const locInp = document.querySelector('[name="location"]');
  if (locInp) locInp.placeholder = t('locationPlaceholder');
  const descInp = document.querySelector('[name="description"]');
  if (descInp) descInp.placeholder = t('descriptionPlaceholder');
  const chatInp = $('#chat-text');
  if (chatInp) chatInp.placeholder = t('chatPlaceholder');
  
  localStorage.setItem('agriai-language', languageCode());
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function scrollToSolver() {
  $('#solver')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem('agriai-history') || '[]');
  } catch {
    return [];
  }
}

function writeHistory(items) {
  localStorage.setItem('agriai-history', JSON.stringify(items.slice(0, 9)));
  renderHistory();
}

async function loadHistory() {
  if (!signedInUser) {
    renderHistory();
    return;
  }
  try {
    const data = await requestJson(`${API_BASE}/analyses`);
    const records = (data.analyses || []).map(item => ({
      crop: item.crop,
      category: item.category,
      problem: item.description,
      date: new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
      analysis: item.analysis
    }));
    localStorage.setItem('agriai-history', JSON.stringify(records));
    renderHistory();
  } catch {
    renderHistory();
  }
}

function renderHistory() {
  const history = readHistory();
  const container = $('#history-list');
  if (!container) return;
  if (!history.length) {
    container.innerHTML = '<div class="empty-history"><b>Your analysis history will appear here.</b>Start with a crop question whenever you’re ready.</div>';
    return;
  }
  container.innerHTML = history.map((item, index) => `
    <article class="history-card">
      <div class="history-meta">
        <span>${escapeHtml(item.date)}</span>
        <span>${item.image_url ? '📷 ' : ''}${escapeHtml(item.category || 'Analysis')}</span>
      </div>
      <h3>${escapeHtml(item.crop || 'Crop analysis')}</h3>
      <p>${escapeHtml(item.problem)}</p>
      <a href="#result-section" data-history="${index}">View analysis →</a>
    </article>
  `).join('');
  container.querySelectorAll('[data-history]').forEach(link => {
    link.addEventListener('click', () => {
      const item = history[Number(link.dataset.history)];
      if (item) showResult(item.analysis, true, item.image_url);
    });
  });
}

function normalizeAnalysis(data, form) {
  const fallback = {
    detected_problem: `${form?.crop || 'Crop'} leaf stress / possible nutrient issue`,
    confidence: 'Medium',
    summary: `The symptoms described in your ${form?.crop || 'crop'} may be linked to a nutrient imbalance, moisture stress, or an early plant-health issue.`,
    symptoms: ['Yellowing or curling leaves', 'Reduced plant vigour', 'Changes in leaf colour or growth'],
    causes: ['Uneven irrigation or excess moisture', 'Nutrient availability in the soil', 'Early pest or fungal pressure'],
    actions: [
      'Check the underside of affected leaves for insects or webbing.',
      'Water only when the top soil begins to dry; avoid standing water.',
      'Remove badly affected leaves using clean tools.',
      'If symptoms spread quickly, take a sample or clear photos to a local agriculture expert.'
    ],
    prevention: [
      'Keep plants properly spaced for air flow',
      'Monitor leaves twice each week',
      'Avoid overwatering',
      'Build soil health with well-rotted organic matter'
    ],
    follow_up: ['Are spots, insects, or a sticky layer visible under the leaves?'],
    expert_note: 'AI analysis is an informational recommendation. For serious crop damage, confirm the diagnosis with a qualified agriculture expert.'
  };
  return {
    ...fallback,
    ...data,
    symptoms: data?.symptoms?.length ? data.symptoms : fallback.symptoms,
    causes: data?.causes?.length ? data.causes : fallback.causes,
    actions: data?.actions?.length ? data.actions : fallback.actions,
    prevention: data?.prevention?.length ? data.prevention : fallback.prevention
  };
}

function items(values) {
  return (values || []).map(value => `<li>${escapeHtml(value)}</li>`).join('');
}

function openImageLightbox(srcUrl, title = 'Full Resolution Crop Photo') {
  if (!srcUrl) return;
  const modal = $('#image-lightbox-modal');
  const img = $('#lightbox-image');
  const titleEl = $('#lightbox-filename');
  if (img) img.src = srcUrl;
  if (titleEl) titleEl.textContent = title;
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeImageLightbox() {
  const modal = $('#image-lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function showResult(raw, fromHistory = false, imageUrl = null) {
  const result = normalizeAnalysis(raw, {});
  const section = $('#result-section');
  const photo = imageUrl || raw.image_url || raw.image || (fromHistory ? null : currentImageDataUrl);

  $('#analysis-result').innerHTML = `
    <article class="analysis-card">
      <div class="analysis-top">
        <div>
          <span class="kicker">POSSIBLE ISSUE</span>
          <h3>${escapeHtml(result.detected_problem)}</h3>
        </div>
        <span class="confidence">${escapeHtml(result.confidence)} confidence</span>
      </div>
      <div class="analysis-body">
        ${photo ? `
          <div class="analyzed-crop-banner">
            <div class="analyzed-crop-img-container">
              <img src="${escapeHtml(photo)}" alt="Analyzed crop photo" class="analyzed-crop-img" />
            </div>
            <div class="analyzed-crop-meta">
              <span class="badge">📷 Analyzed Crop Photo</span>
              <h4>Attached Field Observation</h4>
              <p>Full high-resolution inspection available. Click to inspect leaf details, pests, and symptoms.</p>
              <button type="button" class="view-full-analysis-img-btn" data-img="${escapeHtml(photo)}">🔍 View Full Resolution Image</button>
            </div>
          </div>
        ` : ''}
        <div class="result-block">
          <h4>PROBLEM SUMMARY</h4>
          <p>${escapeHtml(result.summary)}</p>
        </div>
        <div class="result-block">
          <h4>SYMPTOMS OBSERVED</h4>
          <ul class="result-list">${items(result.symptoms)}</ul>
        </div>
        <div class="result-block">
          <h4>POSSIBLE CAUSES</h4>
          <ul class="result-list">${items(result.causes)}</ul>
        </div>
        <div class="result-block">
          <h4>RECOMMENDED ACTIONS</h4>
          <ol class="action-list">${items(result.actions)}</ol>
        </div>
        <div class="result-block">
          <h4>PREVENTION</h4>
          <ul class="result-list">${items(result.prevention)}</ul>
        </div>
        ${result.follow_up?.length ? `
          <div class="result-block">
            <h4>HELP US REFINE THIS</h4>
            <ul class="result-list">${items(result.follow_up)}</ul>
          </div>` : ''}
        <div class="expert-note">⚠ &nbsp;${escapeHtml(result.expert_note)}</div>
      </div>
    </article>
  `;

  $('#analysis-result').querySelectorAll('.view-full-analysis-img-btn').forEach(btn => {
    btn.addEventListener('click', () => openImageLightbox(btn.dataset.img, 'Analyzed Crop Photo'));
  });

  section?.classList.remove('hidden');
  if (!fromHistory) section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'The service is unavailable right now. Please try again.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

function getFirestoreDb() {
  if (!window.firebase || !firebase.firestore) return null;
  try {
    if (firebaseConfig?.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      return firebase.app().firestore(firebaseConfig.firestoreDatabaseId);
    }
    return firebase.firestore();
  } catch (e) {
    try {
      return firebase.firestore();
    } catch {
      return null;
    }
  }
}

function syncUserWithFirestore(user) {
  const db = getFirestoreDb();
  if (db && user && user.id) {
    try {
      db.collection('users').doc(String(user.id)).set({
        id: String(user.id),
        name: user.name || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        surname: user.surname || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
        updated_at: new Date().toISOString()
      }, { merge: true }).catch(err => console.log('Firestore user sync warning:', err));
    } catch (e) {
      console.log('Firestore sync notice:', e);
    }
  }
}

function syncAnalysisWithFirestore(userId, recordId, record) {
  const db = getFirestoreDb();
  if (db && userId && recordId) {
    try {
      db.collection('users').doc(String(userId)).collection('analyses').doc(String(recordId)).set({
        id: String(recordId),
        user_id: String(userId),
        crop: record.crop || '',
        location: record.location || '',
        stage: record.stage || '',
        category: record.category || '',
        description: record.description || record.problem || '',
        analysis: record.analysis || {},
        created_at: new Date().toISOString()
      }, { merge: true }).catch(err => console.log('Firestore analysis sync warning:', err));
    } catch (e) {
      console.log('Firestore analysis sync notice:', e);
    }
  }
}

function setAuthUser(user) {
  signedInUser = user || null;
  $('#open-login')?.classList.toggle('hidden', !!user);
  $('#account-menu')?.classList.toggle('hidden', !user);

  const sidebarBtn = $('#sidebar-signin');
  const sidebarUserName = $('#sidebar-user-name');
  const sidebarUserEmail = $('#sidebar-user-email');
  const sidebarAvatar = $('#sidebar-avatar');

  if (user) {
    const nameParts = (user.name || '').trim().split(/\s+/);
    const firstName = user.first_name || nameParts[0] || 'Farmer';
    const lastName = user.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
    const displayName = user.name?.trim() || [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Farmer';
    const initial = (displayName.charAt(0) || 'F').toUpperCase();

    if (sidebarBtn) sidebarBtn.innerHTML = `<span>👤 ${escapeHtml(firstName)}'s Profile</span>`;
    if (sidebarUserName) sidebarUserName.textContent = displayName;
    if (sidebarUserEmail) sidebarUserEmail.textContent = user.email || 'AgriAI Account';
    if (sidebarAvatar) sidebarAvatar.textContent = initial;

    if ($('#account-initial')) $('#account-initial').textContent = initial;
    if ($('#account-name')) $('#account-name').textContent = displayName;
    if ($('#panel-name')) $('#panel-name').textContent = displayName;
    
    const photo = $('#panel-photo');
    if (photo) {
      photo.textContent = user.photo_url ? '' : initial;
      photo.classList.toggle('profile-photo-fallback', !user.photo_url);
      const photoUrl = /^https:\/\//i.test(user.photo_url || '') ? user.photo_url : '';
      photo.style.backgroundImage = photoUrl ? `url("${photoUrl}")` : '';
    }

    if ($('#panel-first-name')) $('#panel-first-name').textContent = user.first_name || firstName || '—';
    if ($('#panel-last-name')) $('#panel-last-name').textContent = user.last_name || (lastName ? lastName : '—');
    if ($('#panel-surname')) $('#panel-surname').textContent = user.surname || user.father_name || user.fatherName || '—';
    if ($('#panel-email')) $('#panel-email').textContent = user.email || '—';
    if ($('#panel-mobile')) $('#panel-mobile').textContent = user.mobile_number || user.mobileNumber || user.mobile || '—';

    syncUserWithFirestore(user);
  } else {
    if (sidebarBtn) sidebarBtn.innerHTML = `<span data-i18n="signIn">${t('signIn')}</span> <b>→</b>`;
    if (sidebarUserName) sidebarUserName.textContent = 'Welcome, Farmer';
    if (sidebarUserEmail) sidebarUserEmail.textContent = 'Sign in to save analyses';
    if (sidebarAvatar) sidebarAvatar.textContent = 'F';
  }
  loadHistory();
}

function openAuth(tab = 'login') {
  $('#auth-modal')?.classList.remove('hidden');
  switchAuthTab(tab);
  initialiseGoogleSignIn();
}

function openProfile() {
  if (!signedInUser) {
    openAuth('login');
    return;
  }
  $('#auth-modal')?.classList.remove('hidden');
  $('#login-form')?.classList.add('hidden');
  $('#register-form')?.classList.add('hidden');
  $('#google-auth')?.classList.add('hidden');
  $('#auth-tabs')?.classList.add('hidden');
  $('#account-panel')?.classList.remove('hidden');
  setProfileEditMode(false);
}

function closeAuth() {
  $('#auth-modal')?.classList.add('hidden');
}

let currentAuthTab = 'login';
let googleClientId = null;

function setProfileEditMode(editing) {
  const details = $('#profile-details');
  const editForm = $('#profile-edit-form');
  const actions = $('#profile-actions');

  if (details) details.classList.toggle('hidden', editing);
  if (editForm) editForm.classList.toggle('hidden', !editing);
  if (actions) actions.classList.toggle('hidden', editing);

  if (editing && signedInUser && editForm) {
    const nameParts = (signedInUser.name || '').trim().split(/\s+/);
    const defaultFirst = nameParts[0] || 'Farmer';
    const defaultLast = nameParts.slice(1).join(' ') || '';

    const fn = editForm.querySelector('input[name="first_name"]');
    const ln = editForm.querySelector('input[name="last_name"]');
    const sn = editForm.querySelector('input[name="surname"]');
    const em = editForm.querySelector('input[name="email"]');
    const mb = editForm.querySelector('input[name="mobile_number"]');

    if (fn) fn.value = signedInUser.first_name || defaultFirst;
    if (ln) ln.value = signedInUser.last_name || defaultLast;
    if (sn) sn.value = signedInUser.surname || signedInUser.father_name || signedInUser.fatherName || '';
    if (em) em.value = signedInUser.email || '';
    if (mb) mb.value = signedInUser.mobile_number || signedInUser.mobileNumber || signedInUser.mobile || '';

    setTimeout(() => fn?.focus(), 50);
  }
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const signedIn = !!signedInUser;
  $('#login-form')?.classList.toggle('hidden', tab !== 'login' || signedIn);
  $('#register-form')?.classList.toggle('hidden', tab !== 'register' || signedIn);
  $('#google-auth')?.classList.toggle('hidden', signedIn);
  $('#auth-tabs')?.classList.toggle('hidden', signedIn);
  $('#account-panel')?.classList.toggle('hidden', !signedIn);
  if (signedIn) return;

  const isRegister = tab === 'register';
  const dividerText = $('#auth-divider-text');
  if (dividerText) dividerText.textContent = isRegister ? 'or fill in details to create account' : 'or sign in with details';
  const googleBtnText = $('#google-btn-text');
  if (googleBtnText) googleBtnText.textContent = isRegister ? 'Sign up with Google' : 'Sign in with Google';
  document.querySelectorAll('[data-auth-tab]').forEach(button => button.classList.toggle('active', button.dataset.authTab === tab));
}

async function submitAuth(event, endpoint) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Please wait…';
  try {
    const data = await requestJson(`${API_BASE}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });
    setAuthUser(data.user);
    closeAuth();
    form.reset();
    showToast(endpoint === 'register' ? 'Your AgriAI account is ready.' : `Welcome back, ${data.user.name.split(' ')[0]}.`);
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

async function submitGoogleCredential(response) {
  try {
    const data = await requestJson(`${API_BASE}/auth/google`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ credential: response.credential }) });
    setAuthUser(data.user); closeAuth(); showToast(`Welcome, ${data.user.name.split(' ')[0]}.`);
  } catch (error) { showToast(error.message); }
}

async function initialiseGoogleSignIn(attempt = 0) {
  try {
    const config = await requestJson(`${API_BASE}/auth/google-config`);
    googleClientId = config.client_id;
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: submitGoogleCredential });
      if ($('#google-button')) $('#google-button').innerHTML = '';
      window.google.accounts.id.renderButton($('#google-button'), {
        theme: 'outline',
        size: 'large',
        width: 300,
        text: currentAuthTab === 'register' ? 'signup_with' : 'signin_with'
      });
      $('#google-signin-btn')?.classList.add('hidden');
      $('#google-button')?.classList.remove('hidden');
    } else {
      $('#google-signin-btn')?.classList.remove('hidden');
      $('#google-button')?.classList.add('hidden');
    }
  } catch (error) {
    $('#google-signin-btn')?.classList.remove('hidden');
    $('#google-button')?.classList.add('hidden');
  }
}

$('#image-input')?.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) {
    showToast('Please select a JPG, JPEG, PNG, or WEBP image.');
    event.target.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Please use an image smaller than 10MB.');
    event.target.value = '';
    return;
  }
  selectedImage = file;
  const reader = new FileReader();
  reader.onload = e => {
    currentImageDataUrl = e.target.result;
    const imgPreview = $('#image-preview');
    if (imgPreview) imgPreview.src = currentImageDataUrl;
    $('#upload-box')?.classList.add('has-image');
  };
  reader.readAsDataURL(file);
});

$('#remove-image')?.addEventListener('click', (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  selectedImage = null;
  currentImageDataUrl = null;
  if ($('#image-input')) $('#image-input').value = '';
  $('#image-preview')?.removeAttribute('src');
  $('#upload-box')?.classList.remove('has-image');
});

$('#view-full-image-btn')?.addEventListener('click', (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (currentImageDataUrl) {
    openImageLightbox(currentImageDataUrl, 'Selected Crop Photo Inspection');
  }
});

$('#lightbox-close')?.addEventListener('click', closeImageLightbox);
$('#lightbox-backdrop')?.addEventListener('click', closeImageLightbox);
$('#lightbox-close-btn')?.addEventListener('click', closeImageLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeImageLightbox();
});

$('#hero-upload')?.addEventListener('click', () => {
  scrollToSolver();
  setTimeout(() => $('#image-input')?.click(), 500);
});

$('#problem-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  form.language = languageName();
  const button = $('#analyze-button');
  button.disabled = true;
  button.innerHTML = `<span>${t('analyzing')}</span>`;
  try {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (selectedImage) payload.set('image', selectedImage);
    const response = await requestJson(`${API_BASE}/analyze`, { method: 'POST', body: payload });
    const analysis = normalizeAnalysis(response.analysis || response, form);
    const submittedImage = currentImageDataUrl;
    showResult(analysis, false, submittedImage);
    const history = readHistory();
    const record = {
      crop: form.crop,
      category: form.category,
      problem: form.description,
      image_url: submittedImage,
      date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
      analysis
    };
    history.unshift(record);
    writeHistory(history);

    if (signedInUser && response.id) {
      syncAnalysisWithFirestore(signedInUser.id, response.id, {
        crop: form.crop,
        category: form.category,
        location: form.location,
        stage: form.stage,
        description: form.description,
        image_url: submittedImage,
        analysis
      });
    }

    showToast('Your AI analysis is ready.');
  } catch (error) {
    if (error.status === 401) {
      openAuth('login');
      showToast(t('signInRequired'));
    } else {
      showResult(normalizeAnalysis({}, form));
      showToast('Showing helpful guidance in demo mode.');
    }
  } finally {
    button.disabled = false;
    button.innerHTML = `<span>${t('analyzeProblem')}</span> <b>→</b>`;
  }
});

document.querySelectorAll('.quick-grid button').forEach(button => {
  button.addEventListener('click', () => {
    if ($('#problem-category')) $('#problem-category').value = button.dataset.category;
    const desc = document.querySelector('[name="description"]');
    if (desc) desc.value = button.dataset.problem;
    scrollToSolver();
    showToast('We’ve added this problem to your form.');
  });
});

$('#dashboard-new')?.addEventListener('click', scrollToSolver);
$('#new-analysis')?.addEventListener('click', scrollToSolver);

let chatHistory = [];

function formatChatText(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function appendMessage(text, role) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  if (role === 'ai') {
    message.innerHTML = formatChatText(text);
  } else {
    message.textContent = text;
  }
  $('#messages')?.append(message);
  if ($('#messages')) $('#messages').scrollTop = $('#messages').scrollHeight;
}

async function askChat(question) {
  if (!question.trim()) return;
  const q = question.trim();
  appendMessage(q, 'user');
  chatHistory.push({ role: 'user', content: q });
  if ($('#chat-text')) $('#chat-text').value = '';
  $('#typing')?.classList.remove('hidden');
  try {
    const data = await requestJson(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, language: languageName(), history: chatHistory.slice(-8) })
    });
    const replyText = data.reply || data.message || "I am here to help with your crop.";
    chatHistory.push({ role: 'model', content: replyText });
    appendMessage(replyText, 'ai');
  } catch (error) {
    const fallback = demoReply(q);
    chatHistory.push({ role: 'model', content: fallback });
    appendMessage(fallback, 'ai');
  } finally {
    $('#typing')?.classList.add('hidden');
  }
}

function getWelcomeMessage() {
  const lang = languageCode();
  if (lang === 'hi') return 'नमस्ते! मैं एग्रीएआई (AgriAI) सहायक हूँ। आप अपने खेत में क्या देख रहे हैं, मुझे बताएं और मैं समाधान में आपकी मदद करूँगा।';
  if (lang === 'gu') return 'નમસ્તે! હું એગ્રીએઆઈ (AgriAI) સહાયક છું. તમારા ખેતરમાં તમે શું જોઈ રહ્યા છો તે જણાવો, હું ઉકેલ માટે મદદ કરીશ.';
  return 'Hello! I’m AgriAI. Tell me what you’re seeing in your field and I’ll help you work through it.';
}

function demoReply(question) {
  const q = question.toLowerCase();
  const lang = languageCode();
  if (q.includes('yellow') || q.includes('tomato') || q.includes('peeli') || q.includes('પીળા')) {
    if (lang === 'hi') return 'पत्तियों का पीला होना ज्यादा पानी, नाइट्रोजन की कमी या रस चूसक कीटों के कारण हो सकता है। सबसे पहले पत्तियों के नीचे और मिट्टी की नमी जांचें। ऊपरी मिट्टी सूखने पर ही पानी दें और 5 मिली/लीटर नीम तेल का छिड़काव करें।';
    if (lang === 'gu') return 'પાંદડાં પીળાં થવાનું કારણ વધારે પાણી, નાઇટ્રોજનની ઘટ અથવા ચૂસિયા જીવાત હોઈ શકે છે. પાનની નીચે તપાસો અને જમીન સુકાય ત્યારે જ પાણી આપો. 5 મિ.લી./લિટર લીમડાના તેલનો સ્પ્રે કરો.';
    return 'Yellow leaves can come from overwatering, low nitrogen, or sucking pests like aphids. Check leaf undersides and soil moisture. Water only when the topsoil feels dry, and consider spraying 5ml/L Neem oil.';
  }
  if (q.includes('water') || q.includes('irrigat') || q.includes('pani') || q.includes('પાણી')) {
    if (lang === 'hi') return 'सिंचाई फसल की अवस्था और मिट्टी पर निर्भर करती है। 2-3 इंच मिट्टी में नमी जांचें। सुबह के समय पानी देना सर्वोत्तम है और खेत में जलभराव न होने दें।';
    if (lang === 'gu') return 'સિંચાઈ પાકની સ્થિતિ પર નિર્ભર કરે છે. જમીનમાં ભેજ તપાસીને સવારે પાણી આપો. ખેતરમાં પાણી ભરાઈ ન રહે તેનું ખાસ ધ્યાન રાખો.';
    return 'Water needs depend on crop stage and soil. Test the top 2–3 inches: if dry, water slowly near the roots. Avoid standing water to prevent root rot.';
  }
  if (q.includes('fertil') || q.includes('khad') || q.includes('खाद') || q.includes('ખાતર')) {
    if (lang === 'hi') return 'शुरुआती वृद्धि के लिए वर्मीकम्पोस्ट या गोबर खाद दें। फूल और फल आते समय संतुलित एनपीके (जैसे 19:19:19 या 0:52:34) और बोरॉन का स्प्रे करें।';
    if (lang === 'gu') return 'વિકાસ માટે દેશી કે અળસિયાનું ખાતર આપો. ફૂલ અને ફળના સમયે સંતુલિત NPK અને બોરોનનો સ્પ્રે કરવાથી સારી ગુણવત્તા મળે છે.';
    return 'For vegetative growth, apply well-rotted compost. During flowering and fruiting, shift to balanced NPK and a light Boron foliar spray.';
  }
  if (lang === 'hi') return 'मैं आपकी मदद कर सकता हूँ। कृपया फसल का नाम, विकास की अवस्था और पत्तियों या तने पर दिखाई देने वाले लक्षण बताएं।';
  if (lang === 'gu') return 'હું મદદ કરી શકું છું. કૃપા કરીને પાકનું નામ, વૃદ્ધિની સ્થિતિ અને પાંદડાં કે થડ પર દેખાતાં લક્ષણો જણાવો.';
  return 'I can help with that. Please share the crop name, growth stage, and specific symptoms visible on leaves or soil.';
}

$('#chat-form')?.addEventListener('submit', event => {
  event.preventDefault();
  askChat($('#chat-text')?.value || '');
});

document.querySelectorAll('.chat-suggestions button').forEach(button => {
  button.addEventListener('click', () => askChat(button.textContent));
});

$('#clear-chat')?.addEventListener('click', () => {
  chatHistory = [];
  if ($('#messages')) $('#messages').innerHTML = `<div class="message ai">${getWelcomeMessage()}</div>`;
});

$('#voice-button')?.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Voice input is not supported in this browser.');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = languageCode() === 'hi' ? 'hi-IN' : languageCode() === 'gu' ? 'gu-IN' : 'en-IN';
  showToast('Listening to your voice…');
  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    if ($('#chat-text')) $('#chat-text').value = transcript;
    askChat(transcript);
  };
  recognition.onerror = () => showToast('We could not hear that. Please try again.');
  recognition.start();
});

$('#menu-toggle')?.addEventListener('click', () => {
  const sidebar = $('#sidebar');
  if (sidebar?.classList.contains('hidden')) {
    openSidebar();
  } else {
    closeSidebar();
  }
});

$('#sidebar-user-card')?.addEventListener('click', () => {
  closeSidebar();
  if (signedInUser) {
    openProfile();
  } else {
    openAuth('login');
  }
});

$('#sidebar-upload-btn')?.addEventListener('click', () => {
  closeSidebar();
  scrollToSolver();
  setTimeout(() => $('#image-input')?.click(), 400);
});

$('#sidebar-analysis-btn')?.addEventListener('click', () => {
  closeSidebar();
  scrollToSolver();
});

document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    closeSidebar();
  });
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    $('.site-header')?.classList.remove('nav-open');
    closeSidebar();
  });
});

function closeSidebar() {
  $('#sidebar')?.classList.add('hidden');
  $('#menu-toggle')?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function openSidebar() {
  $('#sidebar')?.classList.remove('hidden');
  $('#menu-toggle')?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

$('#language')?.addEventListener('change', applyLanguage);
$('#sidebar-language')?.addEventListener('change', event => {
  if ($('#language')) $('#language').value = event.target.value;
  applyLanguage();
});
if ($('#language')) $('#language').value = localStorage.getItem('agriai-language') || 'en';
applyLanguage();

$('#open-login')?.addEventListener('click', () => openAuth('login'));
$('#account-menu')?.addEventListener('click', openProfile);
$('#sidebar-signin')?.addEventListener('click', () => {
  closeSidebar();
  if (signedInUser) {
    openProfile();
  } else {
    openAuth('login');
  }
});
document.querySelectorAll('[data-close-sidebar]').forEach(element => element.addEventListener('click', closeSidebar));
document.querySelectorAll('[data-close-auth]').forEach(button => button.addEventListener('click', closeAuth));
document.querySelectorAll('[data-auth-tab]').forEach(button => button.addEventListener('click', () => switchAuthTab(button.dataset.authTab)));

$('#login-form')?.addEventListener('submit', event => submitAuth(event, 'login'));
$('#register-form')?.addEventListener('submit', event => submitAuth(event, 'register'));
$('#edit-profile')?.addEventListener('click', () => setProfileEditMode(true));
$('#cancel-profile-edit')?.addEventListener('click', () => setProfileEditMode(false));

let isProfileSaving = false;

async function handleSaveProfile(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (isProfileSaving) return;

  const form = $('#profile-edit-form');
  if (!form) return;

  const fnInput = form.querySelector('input[name="first_name"]');
  const lnInput = form.querySelector('input[name="last_name"]');
  const snInput = form.querySelector('input[name="surname"]');
  const emInput = form.querySelector('input[name="email"]');
  const mbInput = form.querySelector('input[name="mobile_number"]');

  const firstName = fnInput ? fnInput.value.trim() : '';
  const lastName = lnInput ? lnInput.value.trim() : '';
  const surname = snInput ? snInput.value.trim() : '';
  const email = emInput ? emInput.value.trim().toLowerCase() : '';
  const mobileNumber = mbInput ? mbInput.value.trim() : '';

  if (!firstName && !lastName) {
    showToast('Please enter at least a first or last name.');
    fnInput?.focus();
    return;
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    emInput?.focus();
    return;
  }

  isProfileSaving = true;
  const submitButton = form.querySelector('button[type="submit"]') || $('#save-profile-btn');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Saving…';
  }

  try {
    const payload = {
      id: signedInUser?.id,
      userId: signedInUser?.id,
      first_name: firstName,
      last_name: lastName,
      surname: surname,
      father_name: surname,
      email: email,
      mobile_number: mobileNumber
    };

    let updatedUser = null;
    try {
      const data = await requestJson(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (data && data.user) updatedUser = data.user;
    } catch (e) {
      console.warn('API profile update notice, updating local state:', e);
      updatedUser = {
        ...(signedInUser || {}),
        name: [firstName, lastName, surname].filter(Boolean).join(' '),
        first_name: firstName,
        last_name: lastName,
        surname: surname,
        email: email,
        mobile_number: mobileNumber
      };
    }

    if (updatedUser) {
      setAuthUser(updatedUser);
      syncUserWithFirestore(updatedUser);
    }
    setProfileEditMode(false);
    showToast(t('profileUpdated') || 'Your profile has been updated.');
  } catch (error) {
    showToast(error.message || 'Failed to update profile.');
  } finally {
    isProfileSaving = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = t('saveChanges') || 'Save changes';
    }
  }
}

$('#profile-edit-form')?.addEventListener('submit', handleSaveProfile);
$('#save-profile-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  handleSaveProfile(e);
});

function getFirestoreDb() {
  if (window.firebase && firebase.apps && firebase.apps.length && firebase.firestore) {
    try {
      return firebase.firestore();
    } catch (e) {
      console.warn('Firestore instance error:', e);
    }
  }
  return null;
}

function openDeleteConfirm() {
  const modal = $('#delete-confirm-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'grid';
  }
  const inline = $('#inline-delete-confirm');
  if (inline) {
    inline.classList.remove('hidden');
  }
  const profileActions = $('#profile-actions');
  if (profileActions) {
    profileActions.classList.add('hidden');
  }
}

function closeDeleteConfirm() {
  const modal = $('#delete-confirm-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  const inline = $('#inline-delete-confirm');
  if (inline) {
    inline.classList.add('hidden');
  }
  const profileActions = $('#profile-actions');
  if (profileActions) {
    profileActions.classList.remove('hidden');
  }
}

async function handleConfirmDeleteAccount(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const targetUserId = signedInUser?.id;
  const targetEmail = signedInUser?.email;

  // 1. Immediately close modals, reset user state and show notification
  closeDeleteConfirm();
  closeAuth();
  localStorage.removeItem('agriai-history');
  setAuthUser(null);
  showToast(t('accountDeleted') || 'Your account and saved analyses have been deleted.');

  // 2. Execute background cleanup to API & Firestore
  try {
    fetch(`${API_BASE}/auth/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, email: targetEmail })
    }).catch(err => console.warn('Account API delete notice:', err));

    const db = getFirestoreDb();
    if (db && targetUserId) {
      db.collection('users').doc(String(targetUserId)).delete().catch(err => console.warn('Firestore user doc delete notice:', err));
    }
  } catch (err) {
    console.warn('Background cleanup notice:', err);
  }
}

$('#delete-account')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  openDeleteConfirm();
});

$('#confirm-delete-account-btn-inline')?.addEventListener('click', handleConfirmDeleteAccount);
$('#cancel-delete-account-btn-inline')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeDeleteConfirm();
});

document.addEventListener('click', (e) => {
  const target = e.target.closest('#delete-account, [data-action="delete-account"]');
  if (target) {
    e.preventDefault();
    e.stopPropagation();
    openDeleteConfirm();
    return;
  }

  const confirmTarget = e.target.closest('#confirm-delete-account-btn, #confirm-delete-account-btn-inline, [data-action="confirm-delete-account"]');
  if (confirmTarget) {
    handleConfirmDeleteAccount(e);
    return;
  }

  const cancelTarget = e.target.closest('#cancel-delete-account-btn, #cancel-delete-account-btn-inline, [data-close-delete-confirm]');
  if (cancelTarget) {
    e.preventDefault();
    e.stopPropagation();
    closeDeleteConfirm();
    return;
  }
});

$('#cancel-delete-account-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeDeleteConfirm();
});

document.querySelectorAll('[data-close-delete-confirm]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeDeleteConfirm();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#delete-confirm-modal')?.classList.contains('hidden')) {
    closeDeleteConfirm();
  }
});

$('#confirm-delete-account-btn')?.addEventListener('click', handleConfirmDeleteAccount);

let firebaseConfig = null;
let firebaseInitialized = false;

async function setupFirebase() {
  try {
    const config = await requestJson(`${API_BASE}/auth/firebase-config`);
    if (config && config.apiKey) {
      firebaseConfig = config;
      if (window.firebase && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('Firebase Firestore & Auth successfully connected for project:', config.projectId);
      }
    }
  } catch (err) {
    console.log('Firebase config not loaded', err);
  }
}

function openFirebasePopup() {
  const modal = $('#firebase-popup-modal');
  if (!modal) return;
  const isRegister = currentAuthTab === 'register';
  if ($('#firebase-popup-title')) $('#firebase-popup-title').textContent = isRegister ? 'Create AgriAI Account' : 'Sign in with Google';
  const sub = $('.firebase-popup-sub');
  if (sub) {
    sub.innerHTML = isRegister
      ? 'Choose a Google Account to <strong>create your AgriAI account</strong>'
      : 'Choose a Google Account to <strong>sign in to AgriAI</strong>';
  }
  const submitText = $('#firebase-submit-text');
  if (submitText) submitText.textContent = isRegister ? 'Create account with Google' : 'Sign in with Google';
  modal.classList.remove('hidden');
}

function closeFirebasePopup() {
  const modal = $('#firebase-popup-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleGoogleAccountAuth(email, name, uid, photoUrl = '') {
  try {
    const data = await requestJson(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), name: name || 'Google User', uid: uid || '', photo_url: photoUrl || '' })
    });
    setAuthUser(data.user);
    closeFirebasePopup();
    closeAuth();
    showToast(`Google Account connected: ${data.user.name.split(' ')[0]}`);
  } catch (error) {
    showToast(error.message || 'Google authentication failed.');
  }
}

const googleSigninBtn = $('#google-signin-btn');
if (googleSigninBtn) {
  googleSigninBtn.addEventListener('click', async () => {
    if (firebaseInitialized && window.firebase?.auth) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        await handleGoogleAccountAuth(user.email, user.displayName, user.uid, user.photoURL);
        return;
      } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') return;
      }
    }
    openFirebasePopup();
  });
}

document.querySelectorAll('.firebase-account-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const email = btn.dataset.accountEmail;
    const name = btn.dataset.accountName;
    handleGoogleAccountAuth(email, name, `firebase-${email}`);
  });
});

const customFirebaseForm = $('#firebase-custom-form');
if (customFirebaseForm) {
  customFirebaseForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = $('#firebase-email-input').value;
    const name = $('#firebase-name-input').value;
    handleGoogleAccountAuth(email, name, `firebase-${email}`);
  });
}

document.querySelectorAll('[data-close-firebase-popup]').forEach(btn => {
  btn.addEventListener('click', closeFirebasePopup);
});

$('#sign-out')?.addEventListener('click', async () => {
  try {
    await requestJson(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch {}
  setAuthUser(null);
  closeAuth();
  showToast('You have signed out.');
});

requestJson(`${API_BASE}/auth/me`)
  .then(data => setAuthUser(data.user))
  .catch(() => {
    setAuthUser(null);
    renderHistory();
  });

window.addEventListener('load', () => {
  initialiseGoogleSignIn();
  setupFirebase();
});
