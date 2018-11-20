
jslibs := jquery pouchdb pouchdb.find popper bootstrap vue jsencrypt
jsfiles := $(patsubst %,dist/%.js,$(jslibs))

cssfiles := dist/bootstrap.css 

all: $(jsfiles) $(cssfiles)
	# python 3:
	python3 -m http.server
	# python 2:
	# python -m SimpleHTTPServer

install: $(cssfiles)

dist/jsencrypt.js:
	curl -o $@ http://travistidwell.com/jsencrypt/bin/jsencrypt.js

dist/jquery.js:
	curl -o $@  https://code.jquery.com/jquery-3.3.1.slim.min.js

dist/pouchdb.js:
	curl -o $@ https://cdn.jsdelivr.net/npm/pouchdb@6.4.3/dist/pouchdb.js		               
dist/pouchdb.find.js:
	# curl -o $@ https://cdn.jsdelivr.net/npm/pouchdb-find/lib/index.js
	curl -o $@ https://raw.githubusercontent.com/nolanlawson/pouchdb-find/master/dist/pouchdb.find.min.js
dist/popper.js:
	curl -o $@ https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js
dist/bootstrap.js:
	curl -o $@ https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js
dist/vue.js:
	curl -o $@ https://cdn.jsdelivr.net/npm/vue/dist/vue.js
dist/bootstrap.css:
	curl -o $@ https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css

# js/jquery.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js
# js/pouchdb.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/pouchdb/lib/index.min.js
# js/pouchdb.find.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/pouchdb-find/lib/index.min.js
# js/popper.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/popper/index.min.js
# js/bootstrap.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.min.js
# js/vue.min.js:
# 	curl -o $@ https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js
