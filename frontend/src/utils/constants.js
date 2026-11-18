export const FABRICS = [
  {
    name: 'Tussar Silk',
    nameHi: 'टसर सिल्क',
    blurb: 'Earthy gold with a natural slub, woven in Bhagalpur.',
    blurbHi: 'भागलपुर में बुना, प्राकृतिक सुनहरे रेशे वाला टसर।',
    care: 'Dry clean',
    careHi: 'ड्राई क्लीन',
  },
  {
    name: 'Bhagalpuri Silk',
    nameHi: 'भागलपुरी सिल्क',
    blurb: 'Sturdy, glossy silk made for long hours at the ghat.',
    blurbHi: 'घाट पर घंटों के लिए बना मज़बूत, चमकदार रेशम।',
    care: 'Dry clean',
    careHi: 'ड्राई क्लीन',
  },
  {
    name: 'Cotton',
    nameHi: 'कॉटन',
    blurb: 'Breathable handloom that keeps you cool through the fast.',
    blurbHi: 'व्रत में भी ठंडक देने वाला साँस लेता हथकरघा।',
    care: 'Hand wash',
    careHi: 'हाथ से धोएँ',
  },
  {
    name: 'Banarasi',
    nameHi: 'बनारसी',
    blurb: 'Zari, sunbursts and heirloom weight for the big evenings.',
    blurbHi: 'ज़री, सूरज की किरणें और विरासत का वज़न — बड़ी शामों के लिए।',
    care: 'Dry clean',
    careHi: 'ड्राई क्लीन',
  },
  {
    name: 'Madhubani Print',
    nameHi: 'मधुबनी प्रिंट',
    blurb: 'Mithila art — sun, soop and diya — on soft fabric.',
    blurbHi: 'मिथिला की कला — सूरज, सूप और दीया — मुलायम कपड़े पर।',
    care: 'Gentle wash',
    careHi: 'कोमल धुलाई',
  },
  {
    name: 'Georgette',
    nameHi: 'जॉर्जेट',
    blurb: 'Light, flowy drapes for the dawn arghya.',
    blurbHi: 'भोर के अर्घ्य के लिए हल्की, बहती साड़ियाँ।',
    care: 'Dry clean',
    careHi: 'ड्राई क्लीन',
  },
];

export const CHHATH_DAYS = [
  {
    name: 'Nahay Khay',
    nameHi: 'नहाय खाय',
    numeral: '01',
    blurb: 'The ritual bath and the first pure meal — kaddu-bhaat, rice and chana dal.',
    blurbHi: 'स्नान और पहला शुद्ध भोजन — कद्दू-भात, चावल और चना दाल।',
  },
  {
    name: 'Kharna',
    nameHi: 'खरना',
    numeral: '02',
    blurb: 'A day-long fast broken with rasiao-kheer and roti after sunset.',
    blurbHi: 'पूरे दिन का व्रत, सूर्यास्त के बाद रसियाव-खीर और रोटी से खुलता है।',
  },
  {
    name: 'Sandhya Arghya',
    nameHi: 'संध्या अर्घ्य',
    numeral: '03',
    blurb: 'The evening offering to the setting sun, standing in water with the soop.',
    blurbHi: 'डूबते सूरज को जल में खड़े होकर सूप के साथ अर्घ्य।',
  },
  {
    name: 'Usha Arghya',
    nameHi: 'उषा अर्घ्य',
    numeral: '04',
    blurb: 'The dawn offering to the rising sun, and the fast is finally broken.',
    blurbHi: 'उगते सूरज को अर्घ्य, और व्रत का समापन।',
  },
];

export const COLORS = [
  { name: 'Yellow', nameHi: 'पीला', hex: '#F5C518' },
  { name: 'Marigold', nameHi: 'गेंदा', hex: '#F2A93B' },
  { name: 'Orange', nameHi: 'नारंगी', hex: '#EF7B2D' },
  { name: 'Saffron', nameHi: 'केसरिया', hex: '#F47B20' },
  { name: 'Red', nameHi: 'लाल', hex: '#C8342B' },
  { name: 'Maroon', nameHi: 'मैरून', hex: '#7B1E24' },
  { name: 'Pink', nameHi: 'गुलाबी', hex: '#D4557A' },
  { name: 'Green', nameHi: 'हरा', hex: '#2F7E5B' },
];

export const ORDER_STATUS = {
  placed: {
    label: 'Placed',
    labelHi: 'ऑर्डर मिला',
    description: 'We have received your order.',
    descriptionHi: 'हमें आपका ऑर्डर मिल गया है।',
    chip: 'bg-sun-100 text-sindoor-700 border-sun-300',
  },
  confirmed: {
    label: 'Confirmed',
    labelHi: 'पुष्टि हुई',
    description: 'Order confirmed and being prepared.',
    descriptionHi: 'ऑर्डर की पुष्टि हो गई, तैयारी शुरू है।',
    chip: 'bg-flame-50 text-flame-700 border-flame-200',
  },
  packed: {
    label: 'Packed',
    labelHi: 'पैक हुआ',
    description: 'Wrapped in muslin and packed with care.',
    descriptionHi: 'मलमल में लपेटकर सावधानी से पैक किया गया।',
    chip: 'bg-flame-100 text-flame-700 border-flame-300',
  },
  shipped: {
    label: 'Shipped',
    labelHi: 'भेज दिया',
    description: 'On its way to your city.',
    descriptionHi: 'आपके शहर की ओर रवाना।',
    chip: 'bg-sun-100 text-bamboo-800 border-sun-400',
  },
  delivered: {
    label: 'Delivered',
    labelHi: 'पहुँच गया',
    description: 'Delivered. Jai Chhathi Maiya.',
    descriptionHi: 'ऑर्डर पहुँच गया। जय छठी मैया।',
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    labelHi: 'रद्द',
    description: 'This order was cancelled.',
    descriptionHi: 'यह ऑर्डर रद्द कर दिया गया।',
    chip: 'bg-stone-100 text-stone-600 border-stone-300',
  },
};

export const STATUS_FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

export const PRICE_BANDS = [
  { label: 'Under ₹500', labelHi: '₹500 से कम', min: '', max: 500 },
  { label: '₹500 – ₹1,500', labelHi: '₹500 – ₹1,500', min: 500, max: 1500 },
  { label: '₹1,500 – ₹3,000', labelHi: '₹1,500 – ₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000 – ₹6,000', labelHi: '₹3,000 – ₹6,000', min: 3000, max: 6000 },
  { label: 'Above ₹6,000', labelHi: '₹6,000 से ऊपर', min: 6000, max: '' },
];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured', labelHi: 'चुनिंदा' },
  { value: 'newest', label: 'Newest first', labelHi: 'सबसे नया पहले' },
  { value: 'price-asc', label: 'Price: low to high', labelHi: 'कीमत: कम से ज़्यादा' },
  { value: 'price-desc', label: 'Price: high to low', labelHi: 'कीमत: ज़्यादा से कम' },
  { value: 'rating', label: 'Best rated', labelHi: 'सबसे बेहतर रेटिंग' },
];
