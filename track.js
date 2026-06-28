// Vaybchess analytics + premium access (shared across pages).
// Reuses the existing chess-game-aba31 Firebase Realtime DB.
(function(){
  var firebaseConfig = {
    apiKey: "AIzaSyBIrGRKHuQWlEbZPyqxsvl1dOZfmlbAd-A",
    authDomain: "chess-game-aba31.firebaseapp.com",
    databaseURL: "https://chess-game-aba31-default-rtdb.firebaseio.com",
    projectId: "chess-game-aba31",
    storageBucket: "chess-game-aba31.firebasestorage.app",
    messagingSenderId: "635585858149",
    appId: "1:635585858149:web:e536d0689c39c7eb2fd48c",
    measurementId: "G-F27NDY55MD"
  };

  function db(){
    if(typeof firebase === 'undefined') return null;
    try{
      if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
      return firebase.database();
    }catch(e){ return null; }
  }

  function tgUser(){
    var tg = window.Telegram && window.Telegram.WebApp;
    return (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || null;
  }

  // Track a page/game visit. game: 'chess'|'checkers'|'puzzles'|'home'
  window.vaybTrack = function(game){
    var u = tgUser(); if(!u || !u.id) return;
    var d = db(); if(!d) return;
    var id = String(u.id);
    var now = Date.now();
    var uref = d.ref('users/' + id);
    uref.once('value', function(snap){
      var exists = snap.exists();
      var upd = {
        id: id,
        name: u.first_name || '',
        username: u.username || '',
        lang: u.language_code || '',
        lastSeen: now
      };
      if(!exists) upd.firstSeen = now;
      uref.update(upd);
    });
    uref.child('usage/' + game).transaction(function(v){ return (v || 0) + 1; });
    d.ref('stats/' + game).transaction(function(v){ return (v || 0) + 1; });
  };

  // Read premium flag for current Telegram user. cb(boolean).
  window.vaybGetPremium = function(cb){
    var u = tgUser(); if(!u || !u.id){ cb(false); return; }
    var d = db(); if(!d){ cb(false); return; }
    d.ref('users/' + String(u.id) + '/premium').once('value', function(snap){
      cb(snap.val() === true);
    });
  };
})();
