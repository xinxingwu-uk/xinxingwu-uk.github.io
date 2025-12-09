(function (D, W) {
  "use strict";

  const $id = function (s) { return D.getElementById(s); };
  const $all = function (s) {
    return Array.prototype.slice.call(D.querySelectorAll(s));
  };

  const v = $id("video");
  const k = $id("canvas"); 
  const x = k.getContext("2d");
  const b = $id("game-board");
  const z = $all(".cell"); 
  const r = $id("restart"); 


  const S = [];
  S[0] = Array(9).fill(null);
  S[1] = "X";
  S[2] = false;
  S[3] = -1;
  S[4] = null;

  const g = function (i) { return S[i]; };
  const s = function (i, v) { S[i] = v; };

  const WINS = "0,1,2|3,4,5|6,7,8|0,3,6|1,4,7|2,5,8|0,4,8|2,4,6"
    .split("|")
    .map(function (chunk) {
      return chunk.split(",").map(function (n) { return +n; });
    });

  function Ω() {
    const G = g(0); // grid
    for (let i = 0; i < WINS.length; i++) {
      const triplet = WINS[i];
      const a = triplet[0], b2 = triplet[1], c2 = triplet[2];
      const v0 = G[a];
      if (v0 && v0 === G[b2] && v0 === G[c2]) {
        alert(v0 + " wins!");
        s(2, true);
        return;
      }
    }

    if (G.indexOf(null) === -1) {
      alert("It's a tie!");
      s(2, true);
    }
  }


  function Ψ(i) {
    if (i < 0 || g(2)) return;
    const G = g(0);
    if (G[i]) return;

    const p = g(1);
    G[i] = p;
    z[i].textContent = p;
    z[i].style.color = p === "X" ? "#c00" : "#00f";

    Ω();

    s(1, p === "X" ? "O" : "X");
  }

  function ξ(px, py) {
    const rct = b.getBoundingClientRect();
    const dx = px - rct.left;
    const dy = py - rct.top;
    if (dx < 0 || dy < 0 || dx > rct.width || dy > rct.height) return -1;

    const col = (dx / (rct.width / 3)) | 0;
    const row = (dy / (rct.height / 3)) | 0;
    if (col < 0 || col > 2 || row < 0 || row > 2) return -1;

    return row * 3 + col;
  }

  function θ(idx) {
    if (idx < 0) {
      s(3, -1);
      s(4, null);
      return;
    }

    const now = Date.now();
    if (idx !== g(3)) {
      s(3, idx);
      s(4, now);
      return;
    }

    const t0 = g(4);
    if (!t0) {
      s(4, now);
      return;
    }

    if (now - t0 >= 1000) {
      Ψ(idx);
      s(3, -1);
      s(4, null);
    }
  }


  function ρ() {
    s(0, Array(9).fill(null));
    s(1, "X");
    s(2, false);
    s(3, -1);
    s(4, null);

    for (let i = 0; i < z.length; i++) {
      z[i].textContent = "";
      z[i].style.color = "black";
    }
  }


  r.addEventListener("click", ρ);


  const h = new Hands({
    locateFile: function (file) {
      return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
    }
  });

  h.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });


  h.onResults(function (res) {
    k.width = v.videoWidth || k.width;
    k.height = v.videoHeight || k.height;

    x.save();
    x.clearRect(0, 0, k.width, k.height);
    x.translate(k.width, 0);
    x.scale(-1, 1);

    if (!res || !res.multiHandLandmarks || !res.multiHandLandmarks.length) {
      x.restore();
      s(3, -1);
      s(4, null);
      return;
    }

    const lm = res.multiHandLandmarks[0][8];
    const px = lm.x * (v.videoWidth || k.width);
    const py = lm.y * (v.videoHeight || k.height);

    x.beginPath();
    x.arc(px, py, 10, 0, Math.PI * 2);
    x.fillStyle = "black";
    x.fill();
    x.restore();

    const cr = k.getBoundingClientRect();
    const lx = lm.x * k.width;
    const ly = lm.y * k.height;
    const sx = cr.left + lx * (cr.width / k.width);
    const sy = cr.top + ly * (cr.height / k.height);

    if (g(2)) {
      s(3, -1);
      s(4, null);
      return;
    }

    const idx = ξ(sx, sy);
    const G = g(0);

    if (idx < 0 || G[idx]) {
      θ(-1);
      return;
    }

    θ(idx);
  });

  const cam = new Camera(v, {
    onFrame: async function () {
      await h.send({ image: v });
    },
    width: 640,
    height: 480
  });

  cam.start();

})(document, window);
