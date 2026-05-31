/**
 * FinanceAgent.js
 * Modulo dedicato alla logica pura di calcolo matematico del portafoglio.
 * Opera con rigore matematico ed esclude record a zero, subtotali o record ambigui.
 */

export const FinanceAgent = {
  /**
   * Valida l'integrità di un singolo strumento finanziario.
   * Riconosce ed esclude record ambigui, subtotali e record a zero.
   * @param {Object} item 
   * @param {Array} logs Array in cui salvare il percorso di calcolo
   * @returns {boolean}
   */
  validate: (item, logs = []) => {
    if (!item) {
      logs.push("⚠️ Rilevato record nullo o indefinito. Escluso.");
      return false;
    }

    const nome = item.nome || "";
    
    // Controllo se il record rappresenta un subtotale o totale
    if (
      nome.toLowerCase().includes("totale") || 
      nome.toLowerCase().includes("subtotale") || 
      nome.toLowerCase().includes("summary")
    ) {
      logs.push(`⚠️ Ho escluso la riga "${nome}" (ID: ${item.id}) perché è un subtotale o totale di riepilogo.`);
      return false;
    }

    // Controllo se il valore è nullo o vuoto
    if (item.valore === undefined || item.valore === null) {
      logs.push(`⚠️ Ho escluso il record "${nome}" (ID: ${item.id}) perché privo di valore attuale.`);
      return false;
    }

    // Controllo se il valore attuale è zero (rimborsato)
    if (parseFloat(item.valore) === 0) {
      logs.push(`ℹ️ Ho escluso la riga "${nome}" (ID: ${item.id}) perché il valore attuale è zero (rimborsato/dismesso).`);
      return false;
    }

    // Controllo se i valori monetari sono numeri validi
    if (isNaN(item.investito) || isNaN(item.valore)) {
      logs.push(`⚠️ Ho escluso il record "${nome}" (ID: ${item.id}) per ambiguità nei dati numerici (NaN).`);
      return false;
    }

    if (item.investito < 0 || item.valore < 0) {
      logs.push(`⚠️ Ho escluso the record "${nome}" (ID: ${item.id}) perché presenta valori monetari negativi.`);
      return false;
    }

    return true;
  },

  /**
   * Processa la lista grezza dei titoli effettuando il filtraggio e il calcolo delle plusvalenze.
   * Applica la normalizzazione del capitale residuo per i titoli parzialmente rimborsati.
   * @param {Array} data Lista grezza di titoli
   * @returns {Object} { active, logs, errors }
   */
  process: (data) => {
    const logs = [];
    const errors = [];
    const active = [];

    logs.push("🚀 FinanceAgent: Avvio calcoli ed elaborazione dei dati di portafoglio...");

    if (!Array.isArray(data)) {
      logs.push("❌ Errore critico: I dati in ingresso non sono in formato Array.");
      return { active: [], logs, errors: ["I dati in ingresso devono essere un array."] };
    }

    data.forEach(item => {
      const isValid = FinanceAgent.validate(item, logs);
      if (!isValid) return;

      // Calcolo capitale investito residuo per rimborsi parziali
      const investitoOriginale = item.investitoOriginale !== undefined ? item.investitoOriginale : item.investito;
      let investitoResiduo = investitoOriginale;
      if (item.quoteOriginali && item.quote !== null && item.quoteOriginali > 0) {
        const quoteAttuali = item.quote;
        const quoteOriginali = item.quoteOriginali;
        const ratio = quoteAttuali / quoteOriginali;
        investitoResiduo = investitoOriginale * ratio;
        
        // Arrotondamento al centesimo preciso per coerenza contabile italiana
        investitoResiduo = Math.round((investitoResiduo + Number.EPSILON) * 100) / 100;

        logs.push(`🔄 Titolo ID ${item.id} ("${item.nome}"): Rilevato rimborso parziale. Quote attuali/originali: ${quoteAttuali}/${quoteOriginali}. Capitale investito residuo ricalcolato: € ${investitoResiduo.toFixed(2)}.`);
      }

      // Calcolo plusvalenza e rendimento percentuale
      const plus = Math.round((item.valore - investitoResiduo + Number.EPSILON) * 100) / 100;
      const pct = investitoResiduo > 0 ? (plus / investitoResiduo) * 100 : 0;

      active.push({
        ...item,
        investitoOriginale,
        investito: investitoResiduo,
        plus,
        pct
      });
    });

    logs.push(`✅ FinanceAgent: Elaborazione completata con successo. Titoli attivi: ${active.length}/${data.length}.`);
    return { active, logs, errors };
  }
};
