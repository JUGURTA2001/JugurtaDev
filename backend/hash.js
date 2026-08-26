// gen-hash.js
const bcrypt = require('bcrypt');
const password = 'Mysql@123';
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash à copier :', hash);
});

