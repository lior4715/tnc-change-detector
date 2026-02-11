import { useEffect, useState } from "react";
import "./App.css";
import { getTerms, saveTerms } from "./utils/storage";

function App() {
  const [domain, setDomain] = useState("");
  const [text, setText] = useState("");
  const [hasOldVersion, setHasOldVersion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;

      try {
        const domainName = new URL(url).hostname.replace("www.", "");
        setDomain(domainName);
        getTerms(domainName).then((data) => setHasOldVersion(!!data));
      } catch (err) {
        console.error("Could not parse URL:", err);
      }
    });
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  const openModal = (title: string, body: string) => {
    setModalTitle(title);
    setModalBody(body);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const summarize = async () => {
    if (!text.trim()) {
      openModal("Missing Input", "Please paste T&C text before summarizing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, text }),
      });

      const data = await res.json();
      const summary = data.summary || "No summary returned.";
      saveTerms(domain, text, summary);
      setHasOldVersion(true);
      openModal("Summary", summary);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showSummary",
            summary,
          });
        }
      });
    } catch (error) {
      console.error("Summarize failed:", error);
      openModal("Error", "Could not summarize right now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const compare = async () => {
    if (!text.trim()) {
      openModal("Missing Input", "Please paste T&C text before comparing.");
      return;
    }

    const existing = await getTerms(domain);
    if (!existing) {
      openModal("No Previous Version", "Please summarize first.");
      return;
    }

    if (existing.raw === text) {
      const noChangeMsg = "No changes detected - same as last version.";
      openModal("Comparison Result", noChangeMsg);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showSummary",
            summary: noChangeMsg,
          });
        }
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, text }),
      });

      const data = await res.json();
      const newSummary = data.summary || "";
      const output = data.analysis || `Changes found - new summary:\n\n${newSummary}`;
      saveTerms(domain, text, newSummary);
      openModal("Comparison Result", output);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showSummary",
            summary: output,
          });
        }
      });
    } catch (error) {
      console.error("Compare failed:", error);
      openModal("Error", "Could not compare right now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-shell">
      <h3 className="app-title">T&C Change Detector</h3>

      <div className="domain-pill">
        <span className="domain-icon" aria-hidden="true">
          o
        </span>
        <span>{domain || "Detecting site..."}</span>
      </div>

      <textarea
        className="input-text"
        placeholder="Paste T&C text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
      />

      {!hasOldVersion ? (
        <button className="primary-btn" onClick={summarize} disabled={loading}>
          {loading ? "Summarizing..." : "Summarize"}
        </button>
      ) : (
        <button className="primary-btn" onClick={compare} disabled={loading}>
          {loading ? "Comparing..." : "Compare"}
        </button>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalTitle}</h4>
              <button className="icon-btn" onClick={closeModal} aria-label="Close modal">
                x
              </button>
            </div>
            <pre className="modal-body">{modalBody}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
