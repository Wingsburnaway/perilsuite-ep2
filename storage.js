/* Shared storage adapter. Default: localStorage (this device only).
   To point the same UI at a shared backend later, change only this file:
     - Keep the reviews shape: { [songId]: [ { user, score, notes, ts } ] }
     - Keep the stages shape:  { [songId]: [ { stage, done, user, ts } ] }
     - Implement getAll(), addReview(), getStages(), addStageCheck()
     - Set kind to "remote" and update label
   Do not reuse the Wings Burn Away Supabase project — that one is for a different band. */
(function (w) {
  const REV_KEY = "ps-ep2-reviews-v1";
  const STG_KEY = "ps-ep2-stages-v1";

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function now() { return new Date().toISOString(); }

  w.PSStorage = {
    kind: "local",
    label: "Saved on this device only — a shared band backend can be wired in later.",
    async getAll() { return load(REV_KEY); },
    async addReview(songId, user, score, notes) {
      const all = load(REV_KEY);
      const entry = { user, notes: String(notes || "").trim(), ts: now(),
        score: (score === 1 || score === 2 || score === 3) ? score : null };
      (all[songId] = all[songId] || []).push(entry);
      save(REV_KEY, all);
      return all[songId];
    },
    async getStages() { return load(STG_KEY); },
    async addStageCheck(songId, stage, done, user) {
      const all = load(STG_KEY);
      (all[songId] = all[songId] || []).push({ stage, done: !!done, user, ts: now() });
      save(STG_KEY, all);
      return all[songId];
    }
  };
})(window);
