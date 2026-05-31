/**
 * UIAgent.js
 * Modulo dedicato alla gestione dei componenti di presentazione e usabilità.
 * Espone metodi per la renderizzazione delle tabelle e la gestione degli stati di caricamento.
 */

import React from 'react';

export const UIAgent = {
  /**
   * Renderizza uno spinner / loader visivo per accompagnare le operazioni dell'Agente Finanziario.
   * @param {boolean} active 
   * @param {string} message 
   * @returns {JSX.Element|null}
   */
  showLoader: (active, message = "Elaborazione dati in corso...") => {
    if (!active) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 17, 23, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          borderTopColor: '#6c63ff',
          width: '32px',
          height: '32px'
        }} />
        <p style={{ fontWeight: '600', fontSize: '15px', color: '#ffffff', fontFamily: 'sans-serif' }}>
          {message}
        </p>
      </div>
    );
  },

  /**
   * Renderizza la tabella dei titoli per la vista desktop con spaziatura premium.
   * @param {Object} props { filteredTitoli, fmtEUR, badges, handleAICall }
   * @returns {JSX.Element}
   */
  renderTable: ({ filteredTitoli, fmtEUR, badges, handleAICall }) => {
    return (
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '16px' }}>Nome</th>
              <th style={{ padding: '16px' }}>ISIN</th>
              <th style={{ padding: '16px' }}>Asset</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Quote</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Investito</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Valore</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Plus €</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Plus %</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>AI</th>
            </tr>
          </thead>
          <tbody>
            {filteredTitoli.map(t => {
              const isLoss = t.plus < 0;
              const isTop = badges.topIds.includes(t.id);
              const isWorst = badges.worstIds.includes(t.id);

              return (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: isLoss ? 'rgba(248, 113, 113, 0.03)' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <td style={{ padding: '16px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        display: 'inline-block',
                        backgroundColor: t.banca === "BPER" ? "var(--bper)" : t.banca === "Mediolanum" ? "var(--med)" : "var(--poste)"
                      }} />
                      <span>{t.nome}</span>
                      {isTop && <span style={{ backgroundColor: 'var(--green)', color: '#000', fontSize: '9px', fontWeight: '800', padding: '1px 4px', borderRadius: '3px', marginLeft: '6px' }}>▲ TOP</span>}
                      {isWorst && <span style={{ backgroundColor: 'var(--red)', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '1px 4px', borderRadius: '3px', marginLeft: '6px' }}>▼ PEGGIORE</span>}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{t.isin || '—'}</td>
                  <td style={{ padding: '16px' }}>{t.asset}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>{t.quote !== null ? t.quote.toLocaleString("it-IT", { maximumFractionDigits: 3 }) : '—'}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500' }}>{fmtEUR(t.investito)}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>{fmtEUR(t.valore)}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: t.plus >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {t.plus >= 0 ? '+' : ''}{fmtEUR(t.plus)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: t.plus >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {t.plus >= 0 ? '+' : ''}{t.pct.toFixed(2)}%
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {t.asset !== "Liquidità" ? (
                      <button
                        onClick={() => handleAICall("singolo", t)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                        title="Analizza con AI"
                      >
                        📊
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
};
