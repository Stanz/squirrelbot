const axios = require('axios')

module.exports = function(apiKey) {
  let client = {};
  const config = {
    headers: {
      'X-Mashape-Key': apiKey,
      'Accept': 'application/json'
    }
  }

  client.searchCard = function(text) {
    return axios.get('https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + encodeURIComponent(text), config).then(function(response) {
      return response.data
    },function(err) {
      if (err.response && err.response.status == 404) {
        return []
      }
      throw err
    })
  }

  return client;
}