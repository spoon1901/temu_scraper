document.getElementById('copy').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: extractTemuDataPhased
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        if (data.message) {
          alert(data.message);
          return;
        }
        const tsv = [data.sellerName, data.sellerID, data.productNumber, data.businessName, data.productURL].join('\t');
        const output = document.getElementById('output');
        output.value = tsv;
        output.select();
        document.execCommand('copy');
      }
    });
  });
});

function extractTemuDataPhased() {
  const phaseKey = '__temu_data__';
  let stored = sessionStorage.getItem(phaseKey);
  let phaseData = stored ? JSON.parse(stored) : {};

  const currentURL = window.location.href;

  if (!phaseData.productNumber || !phaseData.sellerID || !phaseData.productURL) {
    const productMatch = currentURL.match(/-g-(\d+)\.html/);
    const productNumber = productMatch ? productMatch[1] : '';
    const sellerLink = Array.from(document.querySelectorAll('a[href*="-m-"]')).find(a => a.href.includes('-m-'));
    let sellerID = '';
    if (sellerLink) {
      const match = sellerLink.href.match(/-m-(\d+)\.html/);
      sellerID = match ? match[1] : '';
    }
    const productURL = currentURL;
    sessionStorage.setItem(phaseKey, JSON.stringify({ productNumber, sellerID, productURL }));
    return { message: 'Step 1 complete. Now go to the seller profile page and click Extract again.' };
  }

  if (!phaseData.sellerName) {
    const nameEl = document.querySelector('h1.PX7EseE2');
    const sellerName = nameEl ? nameEl.textContent.trim() : '';
    if (!sellerName || sellerName.length < 2) {
      return { message: 'Seller Name not found yet. Make sure you are on the seller profile page.' };
    }
    phaseData.sellerName = sellerName;
    sessionStorage.setItem(phaseKey, JSON.stringify(phaseData));
    return { message: 'Step 2 complete. Now click the info ⓘ button on the seller profile and click Extract again.' };
  }

  if (!phaseData.businessName) {
    const labels = Array.from(document.querySelectorAll('div, span, p'));
    const businessLabel = labels.find(el => el.textContent.trim() === 'Business Name');
    if (businessLabel) {
      const businessNameEl = businessLabel.nextElementSibling;
      if (businessNameEl) {
        phaseData.businessName = businessNameEl.textContent.trim();
        sessionStorage.removeItem(phaseKey);
        return phaseData;
      }
    }
    return { message: 'Business Name not found yet. Make sure the info modal is open.' };
  }

  return { message: 'All steps already completed. Reload page to start over if needed.' };
}