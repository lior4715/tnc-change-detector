import { useState, useEffect } from "react";
import { getTerms, saveTerms } from "./utils/storage";

function App() {
  const [domain, setDomain] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [hasOldVersion, setHasOldVersion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;

      try {
        const domainName = new URL(url).hostname.replace("www.", "");
        setDomain(domainName);

        // Check if we already have stored T&C for it
        getTerms(domainName).then((data) => setHasOldVersion(!!data));
      } catch (err) {
        console.error("Could not parse URL:", err);
      }
    });
  }, []);

const summarize = async () => {
  setLoading(true);
  const res = await fetch("http://127.0.0.1:8000/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, text }),
  });
  const data = await res.json();
  saveTerms(domain, text, data.summary);

  setHasOldVersion(true);

  console.log("🧠 Summary received:", data.summary);

  // 🟢 Send to content script to show on webpage
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id)
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "showSummary",
        summary: data.summary,
      }, () => console.log("📤 Message sent to content script"));
  });
  setLoading(false);
};

  const compare = async () => {
    const existing = await getTerms(domain);

    if (!existing) {
      alert("No previous version found. Please summarize first.");
      return;
    }

    // Local quick check (avoid redundant API call)
    if (existing.raw === text) {
      setResult("No changes detected - same as last version.");
      
      // ADD THIS - Show in overlay:
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id)
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showSummary",
            summary: "No changes detected – same as last version."
          });
      });
      
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, text }),
    });

    const data = await res.json();
    const newSummary = data.summary || "";
    setResult(data.analysis || "Changes found – new summary:\n\n" + newSummary);
    saveTerms(domain, text, newSummary);
    
    // ADD THIS - Show comparison in overlay:
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id)
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showSummary",
          summary: data.analysis || "Changes found – new summary:\n\n" + newSummary
        });
    });
  };
  /*const compare = async () => {
    const existing = await getTerms(domain);

    

    if (!existing) {
      alert("No previous version found. Please summarize first.");
      return;
    }

    // Local quick check (avoid redundant API call)
    if (existing.raw === text) {
      setResult("No changes detected — same as last version.");
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id)
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showSummary",
            summary: noChangeMsg
          });
      });
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, text }),
    });

    const data = await res.json();
    const newSummary = data.summary || "";
    setResult(data.analysis || "Changes found — new summary:\n\n" + newSummary);
    saveTerms(domain, text, newSummary);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id)
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showSummary",
          summary: analysis
        });
    });
  };*/

  return (
    <div style={{ padding: 15, width: 320, fontFamily: "sans-serif" }}>
      <h3>T&C Change Detector</h3>

      <div
    style={{
    background: "#f2f2f2",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "10px",
    color: "#333",
    textAlign: "center",
    wordBreak: "break-all"
  }}
>
  🌐 {domain || "Detecting site..."}
</div>

      <textarea
        placeholder="Paste T&C text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {!hasOldVersion ? (
      <button onClick={summarize}>Summarize</button>
      ) : (
      <button onClick={compare}>Compare</button>
  )}

      {result && (
        <pre style={{ marginTop: 15, fontSize: 13, whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}
    </div>
  );
}

export default App;
