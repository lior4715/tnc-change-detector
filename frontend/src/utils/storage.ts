export interface TermsData {
    raw: string;
    summary: string;
  }
  
  // Save both the raw and summarized T&C for a given domain
  export function saveTerms(domain: string, raw: string, summary: string) {
    chrome.storage.local.set({ [domain]: { raw, summary } }, () => {
      console.log(`✅ Saved raw + summary for ${domain}`);
    });
  }
  
  // Retrieve the stored version for a domain
  export function getTerms(domain: string): Promise<TermsData | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([domain], (result) => {
        resolve(result[domain] || null);
      });
    });
  }
  
  // Optional: clear all saved T&C data
  export function clearStorage() {
    chrome.storage.local.clear(() => {
      console.log("🧹 Cleared all stored T&C versions");
    });
  }
  