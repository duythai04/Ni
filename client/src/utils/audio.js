import { toast } from "sonner";

let activeUtterance = null;
let requestId = 0;

/**
 * Lấy danh sách giọng đọc.
 * Một số trình duyệt tải danh sách này bất đồng bộ.
 */
function getAvailableVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

/**
 * Tìm giọng đọc tiếng Nhật.
 */
function findJapaneseVoice(voices) {
  const japaneseVoices = voices.filter(
    voice => voice.lang?.toLowerCase().startsWith("ja")
  );

  if (japaneseVoices.length === 0) {
    return null;
  }

  // Ưu tiên giọng ja-JP nếu có
  const japaneseJP = japaneseVoices.find(
    voice => voice.lang.toLowerCase() === "ja-jp"
  );

  if (japaneseJP) {
    return japaneseJP;
  }

  // Ưu tiên giọng Japanese mặc định,
  // tránh tự động chọn các biến thể hiệu ứng
  const standardJapanese = japaneseVoices.find(
    voice => voice.name === "Japanese"
  );

  return standardJapanese || japaneseVoices[0];
}

/**
 * Đợi trình duyệt tải danh sách giọng đọc.
 */
function waitForVoices(timeout = 1500) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const existingVoices = synth.getVoices();

    if (existingVoices.length > 0) {
      resolve(existingVoices);
      return;
    }

    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;

      synth.removeEventListener?.("voiceschanged", handleVoicesChanged);

      clearTimeout(timer);

      resolve(synth.getVoices());
    };

    const handleVoicesChanged = () => {
      finish();
    };

    synth.addEventListener?.("voiceschanged", handleVoicesChanged);

    const timer = setTimeout(finish, timeout);
  });
}

/**
 * Phát âm tiếng Nhật.
 *
 * @param {string} text - Chữ, từ hoặc câu tiếng Nhật.
 * @param {number} rate - Tốc độ đọc.
 */
export async function playJapaneseAudio(text, rate = 0.85) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    toast.error("Trình duyệt không hỗ trợ chức năng phát âm.");
    return;
  }

  const content = String(text ?? "").trim();

  if (!content) {
    toast.warning("Không có nội dung để phát âm.");
    return;
  }

  const synth = window.speechSynthesis;

  // Đánh dấu yêu cầu mới nhất
  const currentRequestId = ++requestId;

  // Dừng âm thanh trước đó
  synth.cancel();
  activeUtterance = null;

  try {
    const voices = await waitForVoices();

    // Nếu người dùng đã nhấn phát âm khác thì bỏ qua
    if (currentRequestId !== requestId) {
      return;
    }

    const japaneseVoice = findJapaneseVoice(voices);

    if (!japaneseVoice) {
      console.warn(
        "[Japanese TTS] Không tìm thấy giọng tiếng Nhật.",
        voices.map((voice) => ({
          name: voice.name,
          lang: voice.lang,
        })),
      );

      toast.error(
        "Không tìm thấy giọng đọc tiếng Nhật. Hãy kiểm tra giọng TTS trên trình duyệt hoặc hệ điều hành.",
      );

      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);

    utterance.lang = "ja-JP";
    utterance.voice = japaneseVoice;

    // Giới hạn tốc độ đọc hợp lệ
    utterance.rate = Math.max(0.1, Math.min(10, Number(rate) || 0.85));

    utterance.pitch = 1;
    utterance.volume = 1;

    activeUtterance = utterance;

    utterance.onstart = () => {
      console.log("[Japanese TTS] Đang đọc:", content);
    };

    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
    };

    utterance.onerror = (event) => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }

      // Khi nhấn nút phát âm khác, âm thanh cũ bị hủy.
      // Đây không phải lỗi cần thông báo.
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }

      console.error("[Japanese TTS] Lỗi phát âm:", event.error);

      toast.error(`Không thể phát âm tiếng Nhật: ${event.error}`);
    };

    synth.speak(utterance);
  } catch (error) {
    console.error("[Japanese TTS] Unexpected error:", error);

    toast.error("Đã xảy ra lỗi khi phát âm tiếng Nhật.");
  }
}

/**
 * Dừng phát âm.
 */
export function stopJapaneseAudio() {
  requestId += 1;

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  activeUtterance = null;
}

/**
 * Kiểm tra danh sách giọng đọc tiếng Nhật.
 */
export function getJapaneseVoices() {
  return getAvailableVoices().filter((voice) =>
    voice.lang?.toLowerCase().startsWith("ja"),
  );
}
