// 1. Declare variables at the TOP level so everyone can see them
let GlitchJS; 
let fail = false;

try {
    // If you are in a browser, GlitchJS should be loaded via <script src="...">
    // If you're using a bundler, require works, but GlitchJS must be assigned to the outer variable
    GlitchJS = require("/libs/GlitchJS");
} catch (e) {
    console.error("GlitchJS doesn't Exist in this Path.");
    fail = true; // FIX: No 'let' here, so it updates the top-level variable
}

const AccessGate = {
    check() {
        if (fail) return false;
        // Check if GlitchJS exists and has the method
        return !!(GlitchJS && typeof GlitchJS.isExist === 'function');
    },

    getHardwareID() {
        // We use optional chaining (?.) so the code doesn't crash if GlitchJS is missing
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + "x" + screen.height,
            new Date().getTimezoneOffset(),
            this._getCanvasFingerprint(),
            GlitchJS?.capabilities?.() || 'no-glitch-cap',
            GlitchJS?.deviceInfo?.() || 'no-glitch-dev'
        ];
        return components.join('###');
    },

    _getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillText("GlitchJS-Offline", 2, 2);
            return canvas.toDataURL();
        } catch (e) {
            return 'no-canvas';
        }
    },

    async sendRequest() {
        if (fail) {
            console.error("Request aborted: Dependencies missing.");
            return;
        }

        try {
            const hwid = this.getHardwareID();
            const response = await fetch("https://ultracipher.antiparental378.workers.dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: hwid })
            });

            const result = await response.json();
            console.log("Returned Hash:", result.hash);
            return result.hash;
        } catch (error) {
            console.error("API Error:", error);
        }
    }
};

// EXECUTION
if (AccessGate.check()) {
    AccessGate.sendRequest();
} else {
    console.warn("AccessGate check failed. Script stopped.");
}
