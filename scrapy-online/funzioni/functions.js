/* creare un midleware */
function calculateInverseAverageBid(assetName, assetsMap) {
  // Controlla se l'asset esiste nella mappa degli assets.
  if (assetsMap[assetName]) {
    // Ottieni i dati dell'asset.
    const assetData = assetsMap[assetName];
    // Inizializza una variabile per la somma totale delle offerte.
    let totalBid = 0;
    // Itera attraverso tutti i dati dell'asset.
    for (let i = 0; i < assetData.length; i++) {
      // Aggiungi l'offerta corrente al totale.
      totalBid += assetData[i].bid;
    }
    // Calcola e restituisci l'inverso della media delle offerte.
    return 1 / (totalBid / assetData.length);
  } else {
    // Se l'asset non esiste nella mappa degli assets, stampa un messaggio di errore e restituisci null.
    console.error(`Asset ${assetName} non trovato nella mappa degli assets.`);
    return null;
  }
}

module.exports = calculateInverseAverageBid;
