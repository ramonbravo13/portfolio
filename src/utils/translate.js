/**
 * Automatically translates text from one language to another using the free Google Translate API endpoint.
 * Note: This is an undocumented public endpoint used for simple translations.
 * 
 * @param {string} text - The text to translate.
 * @param {string} sourceLang - Source language code (e.g., 'es'). Default is 'es'.
 * @param {string} targetLang - Target language code (e.g., 'en'). Default is 'en'.
 * @returns {Promise<string>} The translated text.
 */
export async function autoTranslate(text, sourceLang = 'es', targetLang = 'en') {
  if (!text || text.trim() === '') return '';
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // The API returns an array where data[0] contains the translation segments
    // data[0][i][0] contains the translated text for segment i
    let translatedText = '';
    if (data && data[0]) {
      data[0].forEach(segment => {
        if (segment[0]) {
          translatedText += segment[0];
        }
      });
    }
    
    return translatedText;
  } catch (error) {
    console.error("Error auto-translating text:", error);
    return '';
  }
}
