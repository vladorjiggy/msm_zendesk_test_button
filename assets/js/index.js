$(function() {
  // ZAF Client initialisieren
  const client = ZAFClient.init();
  client.invoke('resize', { height: '110px' });

  // Variablen für URL und Ticket-Informationen
  let msm_url_live = '';
  let msm_url_localhost = '';
  let ticket_id = null;
  let parameters = null;

  // Lade Metadaten und Ticket-Informationen
  async function initializeApp() {
    try {
      const [metadata, ticketData] = await Promise.all([
        client.metadata(),
        client.get('ticket')
      ]);
      
      if (!metadata || !metadata.settings) {
        throw new Error('Keine Metadaten oder Einstellungen gefunden');
      }
      
      msm_url_live = metadata.settings['msm_url_live'] || '';
      msm_url_localhost = metadata.settings['msm_url_localhost'] || ''; 
      ticket_id = ticketData && ticketData.ticket ? ticketData.ticket.id : null;
      parameters = metadata.settings;
      
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Initialisieren der App:', error);
      client.invoke('notify', 'Fehler beim Laden der Daten: ' + error.message, 'error');
      return { success: false, error };
    }
  }

  // Daten abrufen und MSM öffnen
  async function getData(msm_url) {
    try {
      // Prüfe ob URL vorhanden ist
      if (!msm_url) {
        throw new Error('Keine gültige URL verfügbar');
      }
      
      // Initialisiere die App falls noch nicht geschehen
      if (!parameters) {
        const result = await initializeApp();
        if (!result.success) {
          return;
        }
      }
      
      const product_field = 'ticket.customField:custom_field_' + parameters.product_field;
      const lang_field = 'ticket.customField:custom_field_' + parameters.ilvy_language;
      const channel_field = 'ticket.customField:custom_field_' + parameters.channel;
      
      const [productData, langData, channelData] = await Promise.all([
        client.get(product_field),
        client.get(lang_field),
        client.get(channel_field)
      ]);
      
      // Daten aus den API-Antworten extrahieren
      let product = productData[product_field];
      const sprache = langData[lang_field] || '';
      const channel = channelData[channel_field] || '';
      
      if (!product) {
        client.invoke('notify', 'Wählen Sie zuerst ein Produkt', 'error');
        return;
      }
      
      // Hinweis: Diese Zeile sollte entfernt werden, wenn vuex umgesetzt wurde
      product = product !== "fritz-box" ? product : "";
      
      // URL zusammenbauen und im neuen Tab öffnen
      const url = `${msm_url}/${sprache}/${product}?ticket_id=${ticket_id}&channel=${channel}`;
      openInNewTab(url);
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      client.invoke('notify', `Fehler beim Abrufen der Daten: ${error.message}`, 'error');
    }
  }

  /**
   * Öffnet eine URL in einem neuen Browser-Tab
   * @param {string} url - Die zu öffnende URL
   */
  function openInNewTab(url) {
    if (!url) {
      console.error('Keine URL zum Öffnen angegeben');
      return;
    }
    window.open(url, '_blank');
  }

  // Initialisiere die App beim Laden
  initializeApp().catch(error => {
    console.error('Fehler bei der Initialisierung:', error);
  });

  // Event-Listener für Buttons
  document.getElementById("open_msm_live").addEventListener('click', () => getData(msm_url_live));
  document.getElementById("open_msm_localhost").addEventListener('click', () => getData(msm_url_localhost));
});