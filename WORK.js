const loader = {
  version: () => "1.1.0",
  
  config() {
    return {
      crashChance: 0.0001,      // 0.01% chance per tick to fail
      progressIncrement: 1.2,   // Max speed of progress
      updateInterval: 60,       // Refresh rate in ms
      colors: {
        low: "#e74c3c",         // Red (0-30%)
        mid: "#f39c12",         // Orange (31-80%)
        high: "#2ecc71"         // Green (81-100%)
      },
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    };
  },

  html() {
    // 1. Clear any existing intervals
    if (window.myLoader) clearInterval(window.myLoader);
    
    // 2. Cache DOM elements
    const fill = document.getElementById("loader-fill");
    const text = document.getElementById("loader-text");
    if (!fill || !text) return console.error("Loader elements not found!");

    const cfg = this.config();
    let progress = 0;
    let frameIdx = 0;

    window.myLoader = setInterval(() => {
      // --- CRASH LOGIC ---
      if (Math.random() < cfg.crashChance) {
        clearInterval(window.myLoader);
        fill.style.backgroundColor = "#000";
        fill.style.width = "100%";
        text.style.color = "#ff4444";
        text.innerText = "CRITICAL SYSTEM FAILURE";
        return;
      }

      // --- PROGRESS LOGIC ---
      progress += Math.random() * cfg.progressIncrement;
      let current = Math.min(progress, 100);

      // --- COLOR SELECTION ---
      let currentColor = cfg.colors.mid;
      if (current < 30) currentColor = cfg.colors.low;
      if (current > 80) currentColor = cfg.colors.high;

      // --- DOM UPDATE ---
      // Stretches the width precisely
      fill.style.width = `${current}%`;
      fill.style.backgroundColor = currentColor;
      
      // Update text with precision and spinner
      const spinner = cfg.frames[frameIdx % cfg.frames.length];
      text.innerText = `${spinner} ${current.toFixed(2)}%`;

      frameIdx++;

      // --- COMPLETION ---
      if (current >= 100) {
        clearInterval(window.myLoader);
        fill.style.width = "100%";
        fill.style.backgroundColor = cfg.colors.high;
        text.innerText = "100% COMPLETE ✅";
      }
    }, cfg.updateInterval); 
  },
      async stream(url) {
    if (window.myLoader) clearInterval(window.myLoader);
    
    const fill = document.getElementById("loader-fill");
    const text = document.getElementById("loader-text");
    const cfg = this.config();
    const chunks = [];

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      // 1. Get size and Content-Type for the final Blob
      const total = parseInt(response.headers.get('content-length'), 10) || 0;
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const reader = response.body.getReader();
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;
        
        // Handle cases where total might be 0 (unknown size)
        const current = total ? Math.min((loaded / total) * 100, 100) : 0;
        const color = current < 30 ? cfg.colors.low : (current > 80 ? cfg.colors.high : cfg.colors.mid);

        fill.style.width = total ? `${current}%` : '100%'; // Full bar if size unknown
        fill.style.backgroundColor = color;
        
        // UI: Show MB progress regardless of whether percentage is known
        const progressLabel = total ? `${current.toFixed(2)}%` : 'Downloading...';
        text.innerText = `📂 ${progressLabel} (${(loaded / 1048576).toFixed(1)} MB)`;
      }

      fill.style.width = "100%";
      fill.style.backgroundColor = cfg.colors.high;
      text.innerText = "FILE DOWNLOADED ✅";

      // 2. Return Blob with the original content type
      return new Blob(chunks, { type: contentType });

    } catch (err) {
      fill.style.backgroundColor = "black";
      text.innerText = "DOWNLOAD FAILED";
      console.error("Network Error:", err);
      return null;
    }
  }
};