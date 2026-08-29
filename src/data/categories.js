export const categories = [
  {
    id: 'all',
    name: 'كل الألعاب',
    nameEn: 'All Toys',
    icon: 'Sparkles',
    color: 'from-amber-400 to-orange-500',
    count: 27,
    description: 'استكشف تشكيلتنا الشاملة من أفضل الألعاب المختارة بعناية لأحبائنا الصغار'
  },
  {
    id: 'educational',
    name: 'تعليمية وذكاء STEM',
    nameEn: 'Educational & STEM',
    icon: 'Brain',
    color: 'from-blue-500 to-indigo-600',
    count: 6,
    description: 'تجارب علمية، روبوتات ذكية، وألغاز لتنمية مهارات التفكير والابتكار'
  },
  {
    id: 'building',
    name: 'مكعبات وبناء',
    nameEn: 'Building & Blocks',
    icon: 'Boxes',
    color: 'from-emerald-400 to-teal-600',
    count: 5,
    description: 'أطقم بناء، ليغو، وهياكل معمارية تنمي الخيال والصبر والتركيز'
  },
  {
    id: 'rc-electronic',
    name: 'تحكم عن بعد وروبوتات',
    nameEn: 'RC & Robotics',
    icon: 'Cpu',
    color: 'from-purple-500 to-violet-700',
    count: 4,
    description: 'سيارات دريفت، طائرات درون، وروبوتات تفاعلية تتحدث وتتحرك'
  },
  {
    id: 'dolls-figures',
    name: 'دمى وشخصيات أبطال',
    nameEn: 'Dolls & Action Figures',
    icon: 'HeartHandshake',
    color: 'from-pink-400 to-rose-600',
    count: 6,
    description: 'شخصيات أبطال خارقين، دمى لطيفة، وبيوت دمى خيالية'
  },
  {
    id: 'board-games',
    name: 'ألعاب عائلية ولوحية',
    nameEn: 'Board Games & Puzzles',
    icon: 'Dices',
    color: 'from-amber-500 to-red-500',
    count: 3,
    description: 'أوقات مرح وتنافس وتواصل أسري ممتع لجميع أفراد العائلة'
  },
  {
    id: 'outdoor',
    name: 'حركية وخارجية',
    nameEn: 'Outdoor & Ride-ons',
    icon: 'Bike',
    color: 'from-cyan-400 to-blue-600',
    count: 4,
    description: 'سكوترات، سيارات كهربائية، ومعدات رياضية لصحة ونشاط دائم'
  },
  {
    id: 'infant',
    name: 'الرضع والطفولة المبكرة',
    nameEn: 'Baby & Toddler',
    icon: 'Baby',
    color: 'from-lime-400 to-emerald-600',
    count: 3,
    description: 'ألعاب آمنة 100% خالية من المواد الضارة لتحفيز الحواس والحركة'
  },
  {
    id: 'arts-crafts',
    name: 'فنون وإبداع وصلصال',
    nameEn: 'Arts & Crafts',
    icon: 'Palette',
    color: 'from-fuchsia-500 to-pink-600',
    count: 4,
    description: 'ألوان سحرية، صلصال طبيعي، وأدوات تصميم تفجر إبداع طفلك'
  }
];

export const ageGroups = [
  { id: 'all', label: 'جميع الأعمار', icon: '👶👦👧' },
  { id: '0-2', label: '0 - سنتين (مواليد ورضع)', icon: '🍼', description: 'تطوير حسي وحركي آمن' },
  { id: '3-5', label: '3 - 5 سنوات (ما قبل المدرسة)', icon: '🧸', description: 'خيال، إبداع، واستكشاف' },
  { id: '6-8', label: '6 - 8 سنوات (بداية المدرسة)', icon: '🚀', description: 'مغامرة وتفكير وبناء' },
  { id: '9-12', label: '9 - 12 سنة (مهارات متقدمة)', icon: '🎮', description: 'تحدي، روبوتات، وتنافس' },
  { id: '12+', label: '12+ سنة (مراهقين وكبار)', icon: '🧩', description: 'نماذج معقدة وألعاب ذكاء' },
];

export const currencies = {
  EGP: { symbol: 'ج.م', rate: 1.0, name: 'جنيه مصري' }
};
