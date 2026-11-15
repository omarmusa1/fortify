const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};
const SIMILAR = /[O0Il1]/g;

// Cryptographically secure random integer in [0, max) with no modulo bias.
function secureInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % max;
}

function buildPools(opts) {
  const pools = [];
  for (const key of Object.keys(SETS)) {
    if (!opts[key]) continue;
    let chars = SETS[key];
    if (opts.similar) chars = chars.replace(SIMILAR, "");
    if (chars) pools.push(chars);
  }
  return pools;
}

function generatePassword(length, opts) {
  const pools = buildPools(opts);
  if (pools.length === 0) return null;
  const all = pools.join("");
  // Guarantee at least one character from every selected set.
  const chars = pools.map(p => p[secureInt(p.length)]);
  while (chars.length < length) chars.push(all[secureInt(all.length)]);
  // Fisher-Yates shuffle so the guaranteed characters are not at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join("");
}

function entropyBits(length, poolSize) {
  return length * Math.log2(poolSize);
}

function strengthLevel(bits) {
  if (bits < 40) return { n: 1, label: "Weak", color: "#ff4d4d" };
  if (bits < 60) return { n: 2, label: "Fair", color: "#ff9f43" };
  if (bits < 80) return { n: 3, label: "Good", color: "#f1d84a" };
  if (bits < 100) return { n: 4, label: "Strong", color: "#7be04a" };
  return { n: 5, label: "Very strong", color: "#19e07a" };
}

if (typeof module !== "undefined") {
  module.exports = { generatePassword, buildPools, entropyBits, strengthLevel };
}

if (typeof document !== "undefined") {
  const $ = id => document.getElementById(id);
  const out = $("password"), len = $("length");

  function readOptions() {
    return {
      lower: $("lower").checked, upper: $("upper").checked,
      numbers: $("numbers").checked, symbols: $("symbols").checked,
      similar: $("similar").checked,
    };
  }

  function render() {
    $("lengthValue").textContent = len.value;
    const opts = readOptions();
    const pools = buildPools(opts);
    if (pools.length === 0) {
      $("error").textContent = "Select at least one character type.";
      out.value = "";
      paint({ n: 0, label: "-", color: "#232b35" }, 0);
      return;
    }
    $("error").textContent = "";
    const length = Number(len.value);
    out.value = generatePassword(length, opts);
    const bits = entropyBits(length, pools.join("").length);
    paint(strengthLevel(bits), bits);
  }

  function paint(level, bits) {
    $("strengthText").textContent = level.label;
    $("strengthText").style.color = level.color;
    [...$("bars").children].forEach((bar, i) => {
      bar.style.background = i < level.n ? level.color : "";
    });
    $("entropy").textContent = bits ? `~${Math.round(bits)} bits of entropy` : "";
  }

  $("generate").addEventListener("click", render);
  document.querySelectorAll(".toggle input").forEach(el => el.addEventListener("change", render));
  len.addEventListener("input", render);

  $("copy").addEventListener("click", async () => {
    if (!out.value) return;
    try {
      await navigator.clipboard.writeText(out.value);
      $("copyLabel").textContent = "Copied!";
    } catch {
      out.select();
      document.execCommand("copy");
      $("copyLabel").textContent = "Copied!";
    }
    setTimeout(() => { $("copyLabel").textContent = "Copy"; }, 1500);
  });

  render();
}
