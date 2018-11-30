const $=require("jquery");
require("bootstrap");
const JSEncrypt=require("jsencrypt").JSEncrypt;
const PouchDB=require("pouchdb");
const Vue=require("vue/dist/vue.js")

// ----------------------------------------------- Settings
var local_docs_db_name = "secrets";
var local_users_db_name = "users";
var remote_docs_db_url = "http://localhost:5984/secrets";
var remote_users_db_url = "http://localhost:5984/users";
// -----------------------------------------------/Settings

var username = false;
var privkey  = false;
var keys    = false;

var docs_db = new PouchDB(local_docs_db_name);
var users_db = new PouchDB(local_users_db_name);

var doc_details = new Vue({
  el: '#doc-details',
  data: {
    title: "",
    content: ""
  },
});

var docs = new Vue({
  el: '#doc-list',
  data: {
    items: [],
  },
  methods: {
    show_details: function(doc) {
      doc_details.title = doc.title;
      doc_details.content = privkey.decrypt(doc.content[username]);
    }
  }
});

var loadKeys = new Promise(function(resolve, reject) {
  if (keys) {
    resolve(keys);
  } else {
    users_db.allDocs({
      include_docs: true
    }).then(function(response){
      keys = {};
      response.rows.forEach(function(r){
        var k = r.doc['key'].join("\n");
        var c = new JSEncrypt();
        c.setPublicKey(k);
        keys[r.doc['_id']] = c;
      });
      resolve(keys);
    }).catch(function(err) {
      console.log("There was an error loading the users: " + err);
      reject(err);
    });
  }
});

function db_sync() {
  var opts = {
    live: true,
    retry: true
  }
  var docs_db_sync = docs_db.sync(remote_docs_db_url, opts
  ).on('change', function(info) {
    console.log("docs_db_sync change: " + info);
  }).on('paused', function(err) {
    console.log("docs_db_sync paused: " + err);
  }).on('active', function() {
    console.log("docs_db_sync active: ");
  }).on('denied', function(err) {
    console.log("docs_db_sync denied: " + err);
  }).on('complete', function(info) {
    console.log("docs_db_sync complete: " + info);
  }).on('error', function(err) {
    console.log("docs_db_sync error: " + err);
  });

  var users_db_sync = users_db.sync(remote_users_db_url, opts
  ).on('change', function(info) {
    console.log("users_db_sync change: " + info);
  }).on('paused', function(err) {
    console.log("users_db_sync paused: " + err);
  }).on('active', function() {
    console.log("users_db_sync active: ");
  }).on('denied', function(err) {
    console.log("users_db_sync denied: " + err);
  }).on('complete', function(info) {
    console.log("users_db_sync complete: " + info);
  }).on('error', function(err) {
    console.log("users_db_sync error: " + err);
  });
}

// This is supposed to show a nicer notification than a standard alert popup
function notification(text, type="warning", duration=10) {
  // messageDom = $('')
  // messageDom.content(text)
  console.log(text)
}

// Load the documents from the database into the vue model so they get dieplayed
function documentsIndex() {
  docs_db.allDocs({
    include_docs: true
  }).then(function(response){
    response.rows.forEach(function(r){
      docs.items.push(r.doc)
    });
  }).catch(function(err){
    console.log("There were an issue loading the documents from the database:" + err);
  });
}

// Create a new document and save it into the DB
// TODO content should be encrypted and key should be absent
function documentCreate(title, text) {
  console.debug("documentCreate 1");
  loadKeys.then(function(keys){
    console.log("documentCreate 2");
    content = {}
    for (var u in keys) {
      var v = keys[u].encrypt(text);
      content[u] = v;
    }
    var doc = {
      _id: title,
      title: title,
      content: content
    }
    docs_db.put(doc).then(function(response) {
      notification("Document succesfully created");
      console.debug("Document succesfully created")
      clearDocumentForm();
      docs.items.push(doc);
    }).catch(function(err) {
      notification("Could no create the Document. Probably one is already present.")
      console.debug("Could no create the Document. Probably one is already present.")
    });
  })
}

// Initialise a sync with the remote server
function sync() {
  // TODO
}

// There was some form or error syncing
function syncError() {
  syncDom.setAttribute('data-sync-state', 'error');
}

function clearDocumentForm() {
  console.log("clearDocumentForm called");
  var form = $("#new-item-form");
  form.find('input[name="title"]').val("");
  form.find('textarea[name="content"]').val("");
}

// This is called upon submission of the new document form
function createDocumentHandler(event){
  console.debug("createDocumentHandler");
  event.stopPropagation();
  event.preventDefault();
  var form=$(event.target);
  var titleDom   = form.find('input[name="title"]');
  var contentDom = form.find('textarea[name="content"]');
  var title   = titleDom.val();
  var content = contentDom.val();
  // TODO: add validation
  documentCreate(title, content);
}

// This is called upon submission of the new user form
// Stores username and private key in the browser memory 
// Stores username and public key in the remote sorage
function setupUserHandler(event){
  console.debug("setupUserHandler");
  event.stopPropagation();
  event.preventDefault();

  var form=$(event.target);
  var usernameDom   = form.find('input[name="username"]');
  var privkeyDom = form.find('textarea[name="privkey"]');
  var pubkeyDom = form.find('textarea[name="pubkey"]');
  var myusername = usernameDom.val();
  var myprivkey = privkeyDom.val();
  var mypubkey  = pubkeyDom.val();

  var user = {
    "_id": myusername,
    "key": mypubkey.split("\n")
  }
  users_db.put(user).then(function(response) {
    notification("User Succesfully created");
    // store private user's info into local storage
    localStorage.setItem("username", myusername);
    localStorage.setItem("privkey", myprivkey);

    setupUser();

    $("#usersetupModal").modal('hide');
    form.find('input[name="username"]').val("");
    form.find('textarea[name="privkey"]').val("");
    form.find('textarea[name="pubkey"]').val("");
  }).catch(function(err) {
    // TODO
    console.debug("Could noy create the User. Probably one is already present.")
  });
}

function addEventListeners() {
  $("#new-item-form").on('submit', createDocumentHandler);
  $("#usersetup-form").on('submit', setupUserHandler);
}

// Set username and privkey for current user from browser internal storage.
// If no info is found, shows a modal windows where the user can enter his data
function setupUser() {
  username = localStorage.getItem("username");
  if (!username) {
    $('#usersetupModal').modal('show');
  } else {
    privkey = new JSEncrypt();
    privkey.setPrivateKey(localStorage.getItem("privkey"));
    // TODO
    console.debug("Write the username in the gui somewhere...");
  }
}

$(document).ready(function(){
  db_sync();
  addEventListeners();
  setupUser();
  documentsIndex();
})