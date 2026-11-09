import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, type Lang, type TKey } from './translations';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<Ctx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => translations.en[k] ?? k,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang] = useState<Lang>('en');
  const setLangState = () => {};

  useEffect(() => {
    localStorage.setItem('emedia-lang', lang);
    document.documentElement.lang = lang === 'ss' ? 'ss' : 'en';
  }, [lang]);

  const t = (key: TKey) => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useT = () => useContext(LanguageContext);
