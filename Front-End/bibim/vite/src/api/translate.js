const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
console.log("구글키", API_KEY);
const TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

export const translateText = async (text, targetLang = "en") => {
    try {
        const response = await fetch(TRANSLATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: "text",
            }),
        });

        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error("번역 실패:", error);
        return null;
    }
};
