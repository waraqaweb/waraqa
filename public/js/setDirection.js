// Set language and direction dynamically based on user language
const userLang = navigator.language || navigator.userLanguage;
document.documentElement.lang = userLang.startsWith('ar') ? 'ar' : 'en';
document.documentElement.dir = userLang.startsWith('ar') ? 'rtl' : 'ltr';
