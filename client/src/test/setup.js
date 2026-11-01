import '@testing-library/jest-dom';

// Mock Web Speech API
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  };
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
}
