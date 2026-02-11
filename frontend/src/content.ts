// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log("✅ content script loaded 1");
//   if (msg.action === "showSummary" && msg.summary) {
//     showOverlay(msg.summary);
//   }
// });

// function showOverlay(summary: string) {
//   // Remove existing overlay if it exists
//   const existing = document.getElementById("tnc-overlay");
//   if (existing) existing.remove();

//   // Create backdrop
//   const backdrop = document.createElement("div");
//   console.log("✅ content script loaded 2");

//   backdrop.id = "tnc-overlay";
//   Object.assign(backdrop.style, {
//     position: "fixed",
//     top: "0",
//     left: "0",
//     width: "100vw",
//     height: "100vh",
//     background: "rgba(0,0,0,0.6)",
//     zIndex: "999999",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   });

//   // Create content box
//   const box = document.createElement("div");
//   Object.assign(box.style, {
//     background: "white",
//     color: "black",
//     padding: "20px",
//     borderRadius: "10px",
//     width: "60%",
//     maxHeight: "70%",
//     overflowY: "auto",
//     boxShadow: "0 0 20px rgba(0,0,0,0.3)",
//     fontFamily: "sans-serif",
//   });
//   box.innerHTML = `<h2>T&C Summary</h2><p style="white-space:pre-wrap">${summary}</p>`;

//   // Close on click outside
//   backdrop.addEventListener("click", (e) => {
//     if (e.target === backdrop) backdrop.remove();
//   });

//   backdrop.appendChild(box);
//   document.body.appendChild(backdrop);
// }

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("✅ content script loaded 1");
  if (msg.action === "showSummary" && msg.summary) {
    showOverlay(msg.summary);
  }
});

function showOverlay(summary: string) {
  // Remove existing overlay if it exists
  const existing = document.getElementById("tnc-overlay");
  if (existing) existing.remove();

  // Create backdrop
  const backdrop = document.createElement("div");
  console.log("✅ content script loaded 2");

  backdrop.id = "tnc-overlay";
  Object.assign(backdrop.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.7)",
    zIndex: "999999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.2s ease-out",
  });

  // Create content box
  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
    color: "#1a1a1a",
    padding: "0",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    animation: "slideUp 0.3s ease-out",
  });

  // Parse and format the summary
  const formattedContent = formatSummary(summary);
  
  box.innerHTML = `
    <div style="
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 16px 16px 0 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 10;
    ">
      <h2 style="
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.5px;
      ">📋 Terms & Conditions Summary</h2>
      <p style="
        margin: 8px 0 0 0;
        opacity: 0.9;
        font-size: 14px;
        font-weight: 400;
      ">AI-generated overview of key points</p>
    </div>
    
    <div style="padding: 32px; line-height: 1.7;">
      ${formattedContent}
    </div>
    
    <div style="
      position: sticky;
      bottom: 0;
      background: linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.95));
      padding: 16px 32px;
      border-radius: 0 0 16px 16px;
      border-top: 1px solid rgba(0,0,0,0.06);
      text-align: center;
      backdrop-filter: blur(10px);
    ">
      <button id="tnc-close-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      ">
        Close
      </button>
    </div>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    #tnc-close-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    #tnc-close-btn:active {
      transform: translateY(0);
    }
    #tnc-overlay::-webkit-scrollbar {
      width: 8px;
    }
    #tnc-overlay::-webkit-scrollbar-track {
      background: transparent;
    }
    #tnc-overlay::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.2);
      border-radius: 4px;
    }
    #tnc-overlay::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(style);

  // Close on click outside
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.style.animation = "fadeOut 0.2s ease-out";
      setTimeout(() => backdrop.remove(), 200);
    }
  });

  // Close button
  const closeBtn = box.querySelector("#tnc-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      backdrop.style.animation = "fadeOut 0.2s ease-out";
      setTimeout(() => backdrop.remove(), 200);
    });
  }

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
}

function formatSummary(summary: string): string {
  // Split into lines
  const lines = summary.split('\n');
  let html = '';
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // Check if line starts with bullet point markers
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)/);
    
    if (bulletMatch) {
      if (!inList) {
        html += '<ul style="margin: 16px 0; padding-left: 24px;">';
        inList = true;
      }
      const content = processBoldText(bulletMatch[1]);
      html += `<li style="margin: 12px 0; color: #2d3748; font-size: 15px;">${content}</li>`;
    } else if (numberedMatch) {
      if (inList && html.includes('<ul')) {
        html += '</ul>';
        html += '<ol style="margin: 16px 0; padding-left: 24px;">';
      } else if (!inList) {
        html += '<ol style="margin: 16px 0; padding-left: 24px;">';
        inList = true;
      }
      const content = processBoldText(numberedMatch[1]);
      html += `<li style="margin: 12px 0; color: #2d3748; font-size: 15px;">${content}</li>`;
    } else {
      if (inList) {
        html += inList && html.includes('<ul') ? '</ul>' : '</ol>';
        inList = false;
      }
      
      // Check if it's a header (all caps, or ends with colon, or is short and looks like a title)
      const isHeader = line.length < 50 && (
        line === line.toUpperCase() || 
        line.endsWith(':') ||
        /^[A-Z][^.!?]*$/.test(line)
      );
      
      if (isHeader) {
        const headerText = line.replace(/:$/, '');
        html += `<h3 style="
          color: #667eea;
          font-size: 17px;
          font-weight: 600;
          margin: 24px 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        ">${processBoldText(headerText)}</h3>`;
      } else {
        html += `<p style="
          margin: 12px 0;
          color: #4a5568;
          font-size: 15px;
          line-height: 1.7;
        ">${processBoldText(line)}</p>`;
      }
    }
  }

  if (inList) {
    html += inList && html.includes('<ul') ? '</ul>' : '</ol>';
  }

  return html || `<p style="color: #4a5568; font-size: 15px;">${processBoldText(summary)}</p>`;
}

function processBoldText(text: string): string {
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #1a1a1a; font-weight: 600;">$1</strong>');
}