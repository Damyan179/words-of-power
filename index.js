const axios = require('axios');

axios.get('https://icanhazdadjoke.com/', {
  headers: {
    'Accept': 'application/json'
  }
})
.then((response) => {
  console.log('Here is a random dad joke:');
  console.log(response.data.joke);
})
.catch((error) => {
  console.error('Error fetching joke:', error.message);
});
