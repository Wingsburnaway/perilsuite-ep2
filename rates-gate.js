/* Unlock encrypted rates & budget (window.PS_RATES_ENC).
   One AES-GCM content key is wrapped separately for AB and Rob, each wrap
   derived with PBKDF2-SHA-256 from that member's password. To point this at
   a server later, keep unlock() / getCached() / lock() and swap the payload. */
(function (w) {
  const CACHE = "ps-ep2-rates-session";
  const ALLOWED = { AB: true, Rob: true };

  function b64dec(s) {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function deriveWrapKey(password, salt, iterations) {
    const keyMat = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMat,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  w.PSRates = {
    canSee(user) { return !!ALLOWED[user]; },
    lock() {
      try { sessionStorage.removeItem(CACHE); } catch (e) {}
    },
    getCached() {
      try {
        const raw = sessionStorage.getItem(CACHE);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    async unlock(user, password) {
      if (!ALLOWED[user]) throw new Error("not authorized");
      const blob = w.PS_RATES_ENC;
      if (!blob || !blob.wraps || !blob.wraps[user]) throw new Error("missing payload");
      const wrap = blob.wraps[user];
      const wrapKey = await deriveWrapKey(
        String(password || "").toLowerCase(),
        b64dec(wrap.salt),
        blob.iterations || 210000
      );
      const contentKeyBytes = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64dec(wrap.iv) },
        wrapKey,
        b64dec(wrap.wrappedKey)
      );
      const contentKey = await crypto.subtle.importKey(
        "raw", contentKeyBytes, { name: "AES-GCM" }, false, ["decrypt"]
      );
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64dec(blob.iv) },
        contentKey,
        b64dec(blob.ciphertext)
      );
      const data = JSON.parse(new TextDecoder().decode(plain));
      try { sessionStorage.setItem(CACHE, JSON.stringify(data)); } catch (e) {}
      return data;
    }
  };
})(window);
