$(function() {

  const client = ZAFClient.init()
  client.invoke('resize', { height: '65px' });

  let msm_url_live, msm_url_localhost, ticket_id, product, parameters, sprache, channel

  Promise.all([
  client.metadata(),
  client.get('ticket')
  ]).then((data) => { 
    msm_url_live = data[0].settings['msm_url_live']
    msm_url_localhost = data[0].settings['msm_url_localhost'] 
    ticket_id = data[1]['ticket'].id
    parameters = data[0].settings  
  })

  function getData(msm_url){
    let product_field = 'ticket.customField:custom_field_' + parameters.product_field;
    let lang_field = 'ticket.customField:custom_field_' + parameters.ilvy_language;
    let channel_field = 'ticket.customField:custom_field_' + parameters.channel;
    Promise.all([
      client.get(product_field),
      client.get(lang_field),
      client.get(channel_field)
    ]).then((data) => {
      product = data[0][product_field]
      sprache = data[1][lang_field]
      channel = data[2][channel_field]
      if (product){
        product = data[0][product_field] != "fritz-box" ? data[0][product_field] : ""  // Zeile entfernen wenn vuex umgesetzt wurde
        openInNewTab(`${msm_url}/${sprache}/${product}?ticket_id=${ticket_id}&channel=${channel}`)
      }
      else{
        client.invoke('notify', 'Wählen Sie zuerst ein Produkt', 'error')
      }
    })
  }

  function openInNewTab(url) {
    window.open(url, '_blank')
  }
  document.getElementById("open_msm_live").addEventListener('click', () => getData(msm_url_live))
  //document.getElementById("open_msm_localhost").addEventListener('click', () => getData(msm_url_localhost))
})