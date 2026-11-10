// Charts for the robot arm page. All values in g and cm, torque in g·cm.
function armCharts(d) {
  const C = { text: "#c7d3e6", dim: "#5f7598", grid: "rgba(142,163,196,0.12)", blue: "#4da3ff", gray: "#8ea3c4", red: "#ff6b6b", orange: "#ff9a3d" };
  Chart.defaults.color = C.dim;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.color = C.text;

  const axes = (x, y, extra = {}) => ({
    x: { title: { display: true, text: x, color: C.dim }, grid: { color: C.grid }, ticks: { color: C.dim }, ...extra.x },
    y: { title: { display: true, text: y, color: C.dim }, grid: { color: C.grid }, ticks: { color: C.dim }, beginAtZero: true, ...extra.y }
  });
  const hline = (v, label, color, dash) => ({ label, data: null, _h: v, borderColor: color, borderDash: dash, borderWidth: 1.5, pointRadius: 0, fill: false });
  const withLines = (labels, sets) => sets.map((s) => (s._h !== undefined ? { ...s, data: labels.map(() => s._h) } : s));
  const torqueAt = (L, end) => 2 * d.density * L * L + (d.elbowServo + 2 * end) * L;

  // 1. torque vs link length
  {
    const L = []; for (let x = 3; x <= 14.01; x += 0.5) L.push(+x.toFixed(1));
    const sets = withLines(L, [
      { label: "with " + d.payload + " g payload", data: L.map((x) => torqueAt(x, d.endMass + d.payload)), borderColor: C.blue, backgroundColor: C.blue, borderWidth: 2.5, pointRadius: 0, tension: 0.3 },
      { label: "no payload", data: L.map((x) => torqueAt(x, d.endMass)), borderColor: C.gray, backgroundColor: C.gray, borderWidth: 2, pointRadius: 0, tension: 0.3 },
      hline(d.limit, "working limit", C.red, [6, 4]),
      hline(d.stall, "stall", C.red, [])
    ]);
    new Chart(document.getElementById("c-length"), { type: "line", data: { labels: L, datasets: sets },
      options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${Math.round(c.parsed.y)} g·cm` } } },
        scales: axes("link length L, cm", "torque, g·cm") } });
  }

  // 2. contribution of each element
  {
    const parts = d.parts.map(([n, m, r]) => [n, m * r]);
    new Chart(document.getElementById("c-split"), { type: "bar",
      data: { labels: parts.map((p) => p[0]), datasets: [{ data: parts.map((p) => p[1]), backgroundColor: parts.map((p) => (/Gripper|Payload/.test(p[0]) ? C.orange : C.blue)), borderRadius: 6, maxBarThickness: 26 }] },
      options: { indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${Math.round(c.parsed.x)} g·cm` } } },
        scales: axes("torque, g·cm", "", { y: { grid: { display: false }, ticks: { color: C.text } } }) } });
  }

  // 3. torque vs arm angle
  {
    const full = d.parts.reduce((s, [, m, r]) => s + m * r, 0);
    const empty = d.parts.filter((p) => p[0] !== "Payload").reduce((s, [, m, r]) => s + m * r, 0);
    const A = []; for (let a = 0; a <= 90; a += 5) A.push(a);
    const cos = (a) => Math.cos((a * Math.PI) / 180);
    const sets = withLines(A, [
      { label: "with payload", data: A.map((a) => full * cos(a)), borderColor: C.blue, backgroundColor: C.blue, borderWidth: 2.5, pointRadius: 0, tension: 0.3 },
      { label: "no payload", data: A.map((a) => empty * cos(a)), borderColor: C.gray, backgroundColor: C.gray, borderWidth: 2, pointRadius: 0, tension: 0.3 },
      hline(d.limit, "working limit", C.red, [6, 4])
    ]);
    new Chart(document.getElementById("c-angle"), { type: "line", data: { labels: A, datasets: sets },
      options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${Math.round(c.parsed.y)} g·cm` } } },
        scales: axes("arm angle above horizontal, °", "torque, g·cm") } });
  }

  // 4. payload margin
  {
    const reach = d.L1 + d.L2;
    const base = d.parts.filter((p) => p[0] !== "Payload").reduce((s, [, m, r]) => s + m * r, 0);
    const P = []; for (let p = 0; p <= 60; p += 5) P.push(p);
    const maxP = (d.limit - base) / reach;
    const sets = withLines(P, [
      { label: "shoulder torque", data: P.map((p) => base + p * reach), borderColor: C.blue, backgroundColor: "rgba(77,163,255,0.12)", fill: true, borderWidth: 2.5, pointRadius: 0 },
      hline(d.limit, "working limit", C.red, [6, 4])
    ]);
    new Chart(document.getElementById("c-payload"), { type: "line", data: { labels: P, datasets: sets },
      options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        plugins: { title: { display: true, text: `max payload at full reach ≈ ${Math.floor(maxP)} g`, color: C.text, align: "start", font: { weight: "500" } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${Math.round(c.parsed.y)} g·cm` } } },
        scales: axes("payload, g", "torque, g·cm") } });
  }
}
