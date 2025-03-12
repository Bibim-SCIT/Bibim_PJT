const translateText = async (text, targetLang = "en") => {
    const apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        const response = await fetch(url, {
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
        console.error("번역 오류:", error);
        return null;
    }
};
