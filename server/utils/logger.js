const stamp = () => new Date().toISOString();
module.exports = {
  info: (...a) => console.log(`[${stamp()}] ℹ️ `, ...a),
  warn: (...a) => console.warn(`[${stamp()}] ⚠️`, ...a),
  error: (...a) => console.error(`[${stamp()}] ❌`, ...a)
};