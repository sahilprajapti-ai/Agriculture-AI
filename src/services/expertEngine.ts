export function getDemoAnalysis(payload: {
  crop?: string;
  category?: string;
  stage?: string;
  location?: string;
  description?: string;
  language?: string;
}) {
  const crop = payload.crop || 'crop';
  const category = payload.category || 'plant health';
  const lang = (payload.language || 'English').toLowerCase();

  if (lang.includes('hi') || lang.includes('hindi')) {
    return {
      detected_problem: `${crop} में संभावित तनाव / ${category}`,
      confidence: 'मध्यम',
      summary: `विवरण के आधार पर, आपकी ${crop} फसल में पानी, पोषण, कीट या शुरुआती रोग की समस्या हो सकती है। यह एक उपयोगी शुरुआती सलाह है, पक्का निदान नहीं।`,
      symptoms: [
        'पत्तियों के रंग या आकार में बदलाव',
        'फसल की बढ़वार धीमी होना',
        'बताए गए दिखाई देने वाले लक्षण'
      ],
      causes: [
        'असमान सिंचाई या जल निकास की कमी',
        'मिट्टी में पोषक तत्वों की उपलब्धता',
        'कीट या फफूंद का शुरुआती प्रभाव'
      ],
      actions: [
        'सुबह प्रभावित पत्तियों को, खासकर नीचे की तरफ, ध्यान से देखें।',
        'पानी देने से पहले मिट्टी की नमी जांचें और पानी खड़ा न रहने दें।',
        'बहुत खराब पत्तियों को साफ औजार से हटाएं।',
        'लक्षण तेजी से बढ़ें तो स्थानीय कृषि विशेषज्ञ को साफ तस्वीरें दिखाएं।'
      ],
      prevention: [
        'हवा के आवागमन के लिए उचित दूरी रखें',
        'पत्तियों की नियमित जांच करें',
        'अधिक पानी देने से बचें',
        'सड़ी हुई जैविक खाद से मिट्टी सुधारें'
      ],
      follow_up: [
        'क्या पत्तियों के नीचे कीड़े, धब्बे, जाला या चिपचिपाहट दिखाई देती है?'
      ],
      expert_note: 'AI विश्लेषण केवल जानकारी के लिए है। गंभीर फसल क्षति में योग्य कृषि विशेषज्ञ से निदान की पुष्टि करें।'
    };
  }

  if (lang.includes('gu') || lang.includes('gujarati')) {
    return {
      detected_problem: `${crop} માં સંભવિત તણાવ / ${category}`,
      confidence: 'મધ્યમ',
      summary: `વર્ણનના આધારે, તમારા ${crop} પાકમાં પાણી, પોષક તત્વ, જીવાત અથવા શરૂઆતના રોગની સમસ્યા હોઈ શકે છે. આ ઉપયોગી પ્રારંભિક સલાહ છે, નિશ્ચિત નિદાન નથી.`,
      symptoms: [
        'પાંદડાંના રંગ અથવા આકારમાં ફેરફાર',
        'પાકની વૃદ્ધિ ધીમી થવી',
        'જણાવેલ દેખાતા લક્ષણો'
      ],
      causes: [
        'અસમાન સિંચાઈ અથવા નબળો પાણી નિકાલ',
        'માટીમાં પોષક તત્વોની ઉપલબ્ધતા',
        'જીવાત અથવા ફૂગનો પ્રારંભિક પ્રભાવ'
      ],
      actions: [
        'સવારે અસરગ્રસ્ત પાંદડાં, ખાસ કરીને નીચેની બાજુ, ધ્યાનથી તપાસો.',
        'પાણી આપતાં પહેલાં માટીની ભેજ તપાસો અને પાણી ભરાઈ ન રહેવા દો.',
        'ખૂબ ખરાબ પાંદડાં સ્વચ્છ સાધનથી દૂર કરો.',
        'લક્ષણો ઝડપથી ફેલાય તો સ્થાનિક કૃષિ નિષ્ણાતને સ્પષ્ટ ફોટા બતાવો.'
      ],
      prevention: [
        'હવાના પ્રવાહ માટે યોગ્ય અંતર રાખો',
        'પાંદડાંની નિયમિત તપાસ કરો',
        'વધારે પાણી આપવાનું ટાળો',
        'સડી ગયેલા જૈવિક પદાર્થથી માટી સુધારો'
      ],
      follow_up: [
        'શું પાંદડાંની નીચે જીવાત, ડાઘ, જાળું અથવા ચીકણાપણું દેખાય છે?'
      ],
      expert_note: 'AI વિશ્લેષણ માત્ર માહિતી માટે છે. પાકને ગંભીર નુકસાન હોય તો યોગ્ય કૃષિ નિષ્ણાત પાસેથી નિદાનની પુષ્ટિ કરો.'
    };
  }

  return {
    detected_problem: `Possible ${crop} stress / ${category}`,
    confidence: 'Medium',
    summary: `Based on the description, your ${crop} may be responding to a moisture, nutrient, pest, or early disease issue. This is a starting point—not a confirmed diagnosis.`,
    symptoms: [
      'Leaf colour or shape has changed',
      'Plant growth may be slower than expected',
      'Visible signs described by the farmer'
    ],
    causes: [
      'Uneven watering or poor drainage',
      'Nutrient availability in soil',
      'Early insect or fungal pressure'
    ],
    actions: [
      'Inspect affected leaves, especially underneath, in early morning.',
      'Check soil moisture before watering; avoid both dry stress and standing water.',
      'Remove severely damaged leaves with clean tools.',
      'If symptoms spread quickly, share clear photos with a qualified local agriculture expert.'
    ],
    prevention: [
      'Keep plants correctly spaced for air movement',
      'Check leaves regularly',
      'Use clean tools and avoid overwatering',
      'Improve soil with well-rotted organic material'
    ],
    follow_up: [
      'Can you see insects, spots, webbing, or a sticky layer under the leaves?'
    ],
    expert_note: 'AI analysis is an informational recommendation. For serious crop damage, confirm the diagnosis with a qualified agriculture expert.'
  };
}

export function expertAgriReply(message: string, language = 'English'): string {
  const msg = message.toLowerCase();
  const lang = language.toLowerCase();

  // Detect greetings
  if (['hello', 'hi', 'namaste', 'hey', 'kem cho', 'namaskar', 'help'].some(g => msg.includes(g))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return 'नमस्ते! मैं एग्रीएआई (AgriAI) सहायक हूँ। आपकी फसल, मिट्टी, कीट, सिंचाई या खाद से जुड़े किसी भी सवाल में मैं आपकी मदद कर सकता हूँ। आप किस फसल के बारे में जानना चाहते हैं?';
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return 'નમસ્તે! હું એગ્રીએઆઈ (AgriAI) સહાયક છું. તમારા પાક, માટી, જીવાત, સિંચાઈ અથવા ખાતર સંબંધિત કોઈપણ પ્રશ્નમાં હું તમને મદદ કરી શકું છું. તમે કયા પાક વિશે જાણવા માંગો છો?';
    }
    return 'Hello! I am your AgriAI Assistant. I can help you with crop health, yellow leaves, pests, irrigation schedules, fertilizer choices, and soil care. Which crop would you like advice on today?';
  }

  // Detect yellow leaves / chlorosis
  if (['yellow', 'peeli', 'peela', 'chlorosis', 'पीली', 'पीला', 'પીળા', 'પીળું'].some(k => msg.includes(k))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return (
        'पत्तियों का पीला पड़ना आमतौर पर 3 मुख्य कारणों से होता है:\n\n' +
        '1. **पानी का असंतुलन:** ज्यादा पानी या जलभराव से जड़ें सांस नहीं ले पातीं। ऊपरी 2-3 इंच मिट्टी सूखने पर ही पानी दें।\n' +
        '2. **नाइट्रोजन की कमी:** अगर पुरानी (निचली) पत्तियां पहले पीली हो रही हैं, तो फसल में नाइट्रोजन की कमी हो सकती है। अच्छी तरह सड़ी हुई गोबर की खाद या संतुलित यूरिया/एनपीके का संतुलित प्रयोग करें।\n' +
        '3. **चूसक कीट:** पत्तियों के नीचे बारीकी से देखें। सफेद मक्खी, एफिड्स (माहू) या थ्रिप्स रस चूसकर पत्तियां पीली कर देते हैं। लक्षण दिखते ही 5 मिली/लीटर नीम का तेल का छिड़काव करें।\n\n' +
        'सुझाव: बहुत खराब पत्तियों को हटा दें ताकि संक्रमण न फैले।'
      );
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return (
        'પાંદડાં પીળાં થવાના મુખ્ય 3 કારણો હોઈ શકે છે:\n\n' +
        '1. **વધારે પાણી:** જમીનમાં પાણી ભરાઈ રહેવાથી મૂળ સડવા લાગે છે. ઉપરની 2-3 ઇંચ માટી સુકાય ત્યારે જ પાણી આપો.\n' +
        '2. **નાઇટ્રોજનની ઉણપ:** નીચેનાં જૂનાં પાંદડાં પહેલાં પીળાં થાય તો નાઇટ્રોજનની ઘટ હોઈ શકે છે. સારી રીતે કોહવાયેલું છાણિયું ખાતર અથવા સંતુલિત NPK આપો.\n' +
        '3. **ચૂસિયા જીવાત:** પાંદડાંની નીચે તપાસો. મોલો-મશી, સફેદ માખી કે થ્રિપ્સ રસ ચૂસતા હોય તો 5 મિ.લી./લીટર લીમડાના તેલનો (Neem oil) છંટકાવ કરો.\n\n' +
        'સલાહ: ખૂબ ખરાબ થયેલાં પાંદડાં કાપીને દૂર કરો.'
      );
    }
    return (
      'Yellowing leaves are usually caused by one of three common issues:\n\n' +
      '• **Water Imbalance:** Overwatering or poor drainage suffocates roots. Check the soil 2–3 inches deep—only water when the topsoil feels dry.\n' +
      '• **Nutrient Deficiency (Nitrogen/Iron):** If older bottom leaves turn yellow first, nitrogen is often low. If new top leaves turn yellow with green veins, it indicates iron deficiency. Apply well-rotted compost or balanced NPK.\n' +
      '• **Sucking Pests:** Check underneath the leaves in morning light for aphids, whiteflies, or spider mites. A spray of 5ml/L cold-pressed Neem oil is a safe first step.\n\n' +
      'Tip: Remove badly damaged yellow leaves to preserve plant energy.'
    );
  }

  // Detect water / irrigation
  if (['water', 'irrigat', 'pani', 'dry', 'soil moisture', 'पानी', 'सिंचाई', 'પાણી', 'સિંચાઈ'].some(k => msg.includes(k))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return (
        'फसल में सही सिंचाई के लिए कुछ महत्वपूर्ण नियम:\n\n' +
        '• **फिंगर टेस्ट करें:** मिट्टी में 2-3 इंच अंगुली डालकर देखें। अगर मिट्टी नम है तो पानी न दें।\n' +
        '• **सुबह का समय सबसे अच्छा:** सुबह जल्दी सिंचाई करने से पानी का वाष्पीकरण कम होता है और फफूंद का खतरा घटता है।\n' +
        '• **ड्रिप सिंचाई:** ड्रिप या बूंद-बूंद सिंचाई से 40-50% पानी की बचत होती है और जड़ों को सीधा पानी मिलता है।\n' +
        '• **जल निकास:** खेत में कभी भी पानी खड़ा न रहने दें, इससे जड़ गलन (Root Rot) की समस्या होती है।'
      );
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return (
        'પાકમાં યોગ્ય સિંચાઈ માટે જરૂરી સલાહ:\n\n' +
        '• **ભેજ તપાસો:** જમીનમાં 2-3 ઇંચ આંગળી નાખી ભેજ ચકાસો. ભેજ હોય તો પાણી ન આપો.\n' +
        '• **સવારે પાણી આપો:** વહેલી સવારે સિંચાઈ કરવાથી ફૂગ રોગો ઘટે છે અને પાણીનો બગાડ અટકે છે.\n' +
        '• **ટપક પદ્ધતિ (Drip):** ટપક સિંચાઈથી મૂળિયાં પાસે સીધું પાણી પહોંચે છે અને પાક સ્વસ્થ રહે છે.\n' +
        '• **પાણીનો નિકાલ:** ખેતરમાં પાણી ભરાઈ ન રહેવું જોઈએ, નહીં તો મૂળ સડવાનો રોગ થાય છે.'
      );
    }
    return (
      'Best practices for watering and irrigation:\n\n' +
      '• **Perform the Finger Test:** Insert your finger 2–3 inches into the root zone. If it feels moist, wait before watering again.\n' +
      '• **Water Early Morning:** Morning watering allows foliage to dry quickly, substantially reducing fungal and mildew risks.\n' +
      '• **Deep, Infrequent Watering:** Water deeply near root zones rather than frequent light surface sprinkling to encourage deeper, stronger roots.\n' +
      '• **Ensure Drainage:** Never allow standing water around stems, which triggers fungal root rot and damping-off.'
    );
  }

  // Detect fertilizer / nutrients
  if (['fertiliz', 'khad', 'npk', 'urea', 'dap', 'nutrient', 'compost', 'खाद', 'उर्वरक', 'ખાતર', 'પોષક'].some(k => msg.includes(k))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return (
        'फसल पोषण और खाद प्रबंधन के लिए उपयोगी सुझाव:\n\n' +
        '• **शुरुआती अवस्था (शाकाहारी वृद्धि):** फसल को नाइट्रोजन की अधिक आवश्यकता होती है। वर्मीकम्पोस्ट या सड़ी गोबर खाद सर्वोत्तम है।\n' +
        '• **फूल और फल आने पर:** फॉस्फोरस और पोटाश (जैसे NPK 13:0:45 या 0:52:34) की जरूरत होती है ताकि फूल न झड़ें और फल का आकार अच्छा बने।\n' +
        '• **सूक्ष्म पोषक तत्व:** जिंक (Zinc) और बोरॉन (Boron) का स्प्रे फसल की चमक और पैदावार बढ़ाता है।\n' +
        '• **मिट्टी परीक्षण:** स्थानीय कृषि विज्ञान केंद्र (KVK) से मिट्टी की जांच करवाकर आवश्यकतानुसार ही खाद डालें।'
      );
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return (
        'પાક પોષણ અને ખાતર વ્યવસ્થાપન માટે અગત્યની બાબતો:\n\n' +
        '• **શરૂઆતનો વિકાસ:** વર્મીકમ્પોસ્ટ (અળસિયાનું ખાતર) અથવા જૂનું દેશી ખાતર જમીનમાં આપો.\n' +
        '• **ફૂલ અને ફળ સમયે:** ફોસ્ફરસ અને પોટાશયુક્ત સંતુલિત ખાતર આપો જેથી ફળનો સારો વિકાસ થાય.\n' +
        '• **સૂક્ષ્મ તત્ત્વો:** ઝિંક અને બોરોનનો સ્પ્રે કરવાથી ફૂલ ખરતાં અટકે છે અને ઉપજ વધે છે.\n' +
        '• **જમીન ચકાસણી:** સ્થાનિક લેબોરેટરીમાં જમીન પરીક્ષણ કરાવીને જ ખાતરની માત્રા નક્કી કરો.'
      );
    }
    return (
      'Recommended fertilizer and nutrient guidelines:\n\n' +
      '• **Vegetative Stage:** Plants require nitrogen for vigorous leafy growth. Apply well-composted farmyard manure or vermicompost.\n' +
      '• **Flowering & Fruiting Stage:** Shift focus toward Phosphorus and Potassium (such as balanced NPK 19:19:19 or 0:52:34) to strengthen blooms and fruit quality.\n' +
      '• **Micronutrients:** Foliar sprays of Zinc and Boron (1–2g/L) help prevent flower drop and fruit cracking.\n' +
      '• **Soil Health:** Avoid excessive chemical fertilizers; always balance with organic matter to sustain beneficial soil microbes.'
    );
  }

  // Detect pest / insect attack
  if (['pest', 'insect', 'worm', 'keeda', 'aphid', 'mite', 'caterpillar', 'borer', 'कीट', 'कीड़ा', 'इल्ली', 'જીવાત', 'ઈયળ', 'માખી'].some(k => msg.includes(k))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return (
        'कीट नियंत्रण के लिए त्वरित और सुरक्षित कदम:\n\n' +
        '1. **लक्षण पहचानें:** क्या पत्तियों में छेद हैं (इल्ली/सुंडी) या पत्तियां मुड़ रही हैं (रस चूसक कीट)?\n' +
        '2. **नीम तेल का स्प्रे:** 5 मिली नीम का तेल + 1 मिली तरल साबुन प्रति लीटर पानी में मिलाकर सुबह या शाम स्प्रे करें।\n' +
        '3. **पीले व नीले स्टिकी ट्रैप:** सफेद मक्खी, थ्रिप्स और माहू को आकर्षित करने के लिए प्रति एकड़ 6-8 चिपचिपे ट्रैप लगाएं।\n' +
        '4. **सावधानी:** बिना कीट की सही पहचान के तेज रासायनिक कीटनाशकों का अंधाधुंध छिड़काव न करें, यह मित्र कीटों को भी मार देता है।'
      );
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return (
        'જીવાત નિયંત્રણ માટે ત્વરિત અને સલામત પગલાં:\n\n' +
        '1. **લક્ષણ ઓળખો:** પાંદડાં કોતરેલાં છે (ઈયળ) કે પાન સંકોચાઈ ગયાં છે (ચૂસિયા પ્રકારની જીવાત)?\n' +
        '2. **લીમડાનું તેલ:** 1 લિટર પાણીમાં 5 મિ.લી. લીંબોળીનું તેલ મેળવી સવારે અથવા સાંજે છંટકાવ કરો.\n' +
        '3. **પીળા-વાદળી સ્ટીકી ટ્રેપ:** સફેદ માખી અને થ્રિપ્સ નિયંત્રણ માટે ખેતરમાં સ્ટીકી ટ્રેપ લગાવો.\n' +
        '4. **સાવચેતી:** જીવાતની સાચી ઓળખ વગર વધુ પડતી ઝેરી દવાઓ ન છાંટો.'
      );
    }
    return (
      'Immediate and safe pest management steps:\n\n' +
      '1. **Identify the Type:** Are leaves being chewed (caterpillars/beetles) or are they curled and sticky (sucking pests like aphids, whiteflies, thrips)?\n' +
      '2. **Neem Oil Spray:** Mix 5ml cold-pressed Neem oil with a few drops of mild soap in 1 liter of water. Spray thoroughly on leaf undersides.\n' +
      '3. **Sticky Traps:** Install yellow and blue sticky traps (6–8 per acre) to monitor and capture flying pests early.\n' +
      '4. **Field Hygiene:** Remove severely infested shoots and weeds that serve as alternate hosts.'
    );
  }

  // Detect fungus / spots / disease
  if (['spot', 'fung', 'blight', 'mildew', 'rot', 'धब्बा', 'फफूंद', 'झुलसा', 'ગૂગ', 'ડાઘ', 'સડો'].some(k => msg.includes(k))) {
    if (lang.includes('hi') || lang.includes('hindi')) {
      return (
        'फसल में फफूंद और पत्तियों पर धब्बों के लिए उपचार:\n\n' +
        '• **प्रभावित पत्तियां हटाएं:** जिन पत्तियों पर भूरे या काले धब्बे हैं, उन्हें साफ कैंची से काटकर खेत से दूर नष्ट करें।\n' +
        '• **हवा और धूप:** पौधों के बीच उचित दूरी रखें ताकि पत्तियों में हवा लगे और नमी जल्दी सूखे।\n' +
        '• **जैविक नियंत्रण:** ट्राइकोडर्मा (Trichoderma viride) 5 ग्राम प्रति लीटर या कॉपर ऑक्सीक्लोराइड 2.5 ग्राम प्रति लीटर का छिड़काव करें।\n' +
        '• **सिंचाई सावधानी:** पत्तियों के ऊपर से पानी डालने से बचें, पानी केवल जड़ों के पास दें।'
      );
    }
    if (lang.includes('gu') || lang.includes('gujarati')) {
      return (
        'પાકમાં ફૂગ અને પાન પરના ડાઘ માટેના ઉપાય:\n\n' +
        '• **અસરગ્રસ્ત પાન દૂર કરો:** કાળા કે કથ્થઈ ડાઘવાળાં પાંદડાં કાપીને ખેતર બહાર નષ્ટ કરો.\n' +
        '• **હવાની અવરજવર:** છોડ વચ્ચે યોગ્ય અંતર રાખો જેથી ભેજ જમા ન થાય.\n' +
        '• **ફૂગનાશક નિયંત્રણ:** ટ્રાઇકોડર્મા અથવા કોપર ઓક્સિક્લોરાઇડનો યોગ્ય માત્રામાં છંટકાવ કરો.\n' +
        '• **સિંચાઈ:** પાંદડાં ભીનાં ન થાય તે રીતે માત્ર થડ પાસે પાણી આપો.'
      );
    }
    return (
      'Recommended fungal disease steps:\n\n' +
      '• **Sanitation:** Remove and dispose of spotted leaves with clean pruners away from the field.\n' +
      '• **Air Circulation:** Maintain healthy spacing between plants to lower leaf moisture.\n' +
      '• **Bio-Fungicide:** Consider applying Trichoderma viride (5g/L) or a mild copper oxychloride spray.\n' +
      '• **Watering Technique:** Direct irrigation at the soil base, avoiding wet leaf canopies.'
    );
  }

  // Default helpful response
  if (lang.includes('hi') || lang.includes('hindi')) {
    return 'मैं आपकी मदद कर सकता हूँ। कृपया फसल का नाम, विकास की अवस्था और पत्तियों या मिट्टी पर दिखने वाले मुख्य लक्षण साझा करें।';
  }
  if (lang.includes('gu') || lang.includes('gujarati')) {
    return 'હું તમને મદદ કરવા તૈયાર છું. કૃપા કરીને તમારા પાકનું નામ, વૃદ્ધિની સ્થિતિ અને પાંદડાં કે જમીન પર દેખાતાં લક્ષણો જણાવો.';
  }
  return 'I am here to help you solve field challenges. Please provide the crop name, growth stage, and the specific symptoms observed on leaves, roots, or soil.';
}
