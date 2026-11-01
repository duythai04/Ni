import { toast } from 'sonner';

/**
 * Japanese Text-to-Speech using the Web Speech API
 * @param {string} text - Japanese character, word, or sentence to pronounce
 * @param {number} rate - Speech rate (0.8 - 1.0)
 */
export function playJapaneseAudio(text, rate = 0.85) {
  if (!('speechSynthesis' in window)) {
    toast.error('Trình duyệt của bạn không hỗ trợ tính năng phát âm Web Speech API.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find(
    (v) => v.lang.startsWith('ja') || v.lang.includes('JP') || v.name.toLowerCase().includes('japanese')
  );

  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  utterance.onerror = (e) => {
    console.warn('Audio playback error:', e);
  };

  window.speechSynthesis.speak(utterance);
}
