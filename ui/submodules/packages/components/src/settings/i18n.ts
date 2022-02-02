/* eslint-disable i18next/no-literal-string */
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import intervalPlural from "i18next-intervalplural-postprocessor";
import Backend from "i18next-xhr-backend";
import { DateTime } from "luxon";
import { initReactI18next } from "react-i18next";

const i18n = i18next.use(intervalPlural).use(Backend).use(LanguageDetector).use(initReactI18next);

i18n.init({
    ns: "main",
    defaultNS: "main",
    fallbackLng: "en",
    backend: {
        loadPath: `/translations/{{lng}}/{{ns}}.json`,
    },
    supportedLngs: ["en"],
});

i18n.services.formatter.add("relativeDate", (value, lng, options) => {
    if (value instanceof Date) {
        return DateTime.fromJSDate(value).toRelative({ locale: lng });
    }
    if (value instanceof DateTime) {
        return value.toRelative({ locale: lng });
    }
    return value;
});

export default i18n;
