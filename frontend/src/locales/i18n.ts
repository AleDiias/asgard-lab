import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./en/common.json";
import enAuth from "./en/auth.json";
import ptCommon from "./pt/common.json";
import ptAuth from "./pt/auth.json";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
      },
      pt: {
        common: ptCommon,
        auth: ptAuth,
      },
    },
    lng: "pt",
    fallbackLng: "en",
    ns: ["common", "auth"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

