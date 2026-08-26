const bcrypt = require('bcrypt');
const hashEnBase = '$2b$10$oqwJoxosdFiKTkvuYBu.texot8tOkgKn45eARnXDsu3qSVIZu/A1i'; // Celui que vous avez mis en BDD

bcrypt.compare('Mysql@123', hashEnBase).then(result => {
  console.log('Le mot de passe correspond ?', result); // doit afficher true
});