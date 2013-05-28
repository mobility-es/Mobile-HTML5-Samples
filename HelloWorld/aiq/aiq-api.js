/*! aiq-api-mock - v0.0.1-c26adb4 - 2013-05-28 */

/*global AIQ:true*/

var AIQ = AIQ || {};
AIQ.Core = AIQ.Core || {};

AIQ._applicationId = -1;

// check for DOM ready - then wait for applicationId to be set
(function() {

	function checkComplete() {
		
		if (document.readyState !== "complete") {
			// wait for DOM to load
			return setTimeout(checkComplete, 0);
		}
		
		var e = document.createEvent("Events");
		e.initEvent("aiq-ready", false, false);
		document.dispatchEvent(e);
	}

	checkComplete();

})();

/*global AIQ:true*/

if (!AIQ.Core.App) {

    AIQ.Core.App = {};

    // AIQ.Core.App.setTitle(title)
    AIQ.Core.App.setTitle = function (title) {
        document.title = title;
    };

    AIQ.Core.App.close = function() {
	// do nothing
    };

}

/*global AIQ:false, WO:false */
if (!AIQ.Core.Context) {
    AIQ.Core.Context = {};

    // AIQ.Core.Context.getGlobal(providerName[, settings])
    AIQ.Core.Context.getGlobal = function (providerName, settings) {
        // no callbacks - no getter
        if (!settings) {
            return;
        }

        var callbacks = {
            success: settings.success || function () { },
            failure: settings.failure || function () { }
        };

        var getContextDoc = function (contextType, callbacks) {
            AIQ.Core.DataSync.getDocuments(contextType, {
                success: function (docs) {
                    if (docs.length > 0 && providerName in docs[0]) {
                        callbacks.success(docs[0][providerName]);
                    }
                    else {
                        callbacks.failure();
                    }
                }
            });
        };

        getContextDoc("_clientcontext", {
            success: callbacks.success,
            failure: function () {
                getContextDoc("_backendcontext", callbacks);
            }
        });
    };

    // AIQ.Core.Context.getLocal(key[, settings])
    AIQ.Core.Context.getLocal = function (key, settings) {
        // no callbacks - no getter
        if (!settings) {
            return;
        }

        var callbacks = {
            success: settings.success || function () { },
            failure: settings.failure || function () { }
        };

        AIQ.Core.DataSync.getDocuments("_clientcontext", {
            success: function (docs) {
                if (docs.length > 0) {
                    var doc = docs[0];
                    if ("com.appearnetworks.aiq.apps" in doc) {
                        var appContext = doc["com.appearnetworks.aiq.apps"];
                        if (key in appContext) {
                            callbacks.success(appContext[key]);
                            return;
                        }
                    }
                }

                callbacks.failure();
            }
        });
    };

    // AIQ.Core.Context.getLocal(key, value[, settings])
    AIQ.Core.Context.setLocal = function (key, value, settings) {
        settings = settings || {};

        var callbacks = {
            success: settings.success || function () { },
            failure: settings.failure || function () { }
        };

        AIQ.Core.DataSync.getDocuments("_clientcontext", {
            success: function (docs) {
                var doc;
                if (docs.length > 0) {
                    doc = docs[0];
                    doc["com.appearnetworks.aiq.apps"] = doc["com.appearnetworks.aiq.apps"] || {};
                    doc["com.appearnetworks.aiq.apps"][key] = value;

                    AIQ.Core.DataSync.updateDocument(doc._id, doc, callbacks);
                }
                else {
                    doc = {};
                    doc["com.appearnetworks.aiq.apps"] = {};
                    doc["com.appearnetworks.aiq.apps"][key] = value;

                    AIQ.Core.DataSync.createDocument("_clientcontext", doc, callbacks);
                }
            }
        });
    };
}


/*global AIQ:false, WO:false */
if (!AIQ.Core.DataSync) {
    AIQ.Core.DataSync = {};
    AIQ.Core.DataSync.registeredCallbacks = [];
    AIQ.Core.DataSync.idCount = 0;

    // AIQ.Core.DataSync.getDocument(id[, settings])
    AIQ.Core.DataSync.getDocument = function (id, settings) {

        // return fake launchable document if requested
        if (id === AIQ._applicationId) {
            return settings.success( {name: 'Mock App name'} );
        }

        var document;
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : [];
        for (var i = 0; i < docs.length; i++) {
            if (docs[i]._id === id) {
                document = docs[i];
            }
        }

        setTimeout(function () {
            if(document)
                settings.success( document );
            else
                settings.failure();
        }, 500);
    };

    // AIQ.Core.DataSync.getAttachment(id, name[, settings])
    AIQ.Core.DataSync.getAttachment = function(id, name, settings) {
        var result = undefined;
	var store = localStorage['AIQ.Attachments'] ? JSON.parse(localStorage['AIQ.Attachments']) : {};
	var attachments = store[id];
	if (attachments !== undefined) {
	    var attachment = attachments[name];
	    if (attachment !== undefined) {
		result = {
		    name: name,
		    contentType: attachment.contentType,
		    resourceId: attachment.resourceId,
		    state: 'available'
		};
	    }
	}
        setTimeout(function() {
            if (result) {
                settings.success(result);
            } else if (settings.failure) {
                settings.failure();
            }
        }, 500);
    };

    // AIQ.Core.DataSync.getDocuments(type[, settings])
    AIQ.Core.DataSync.getDocuments = function (type, settings) {
        
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : [];

        var typedDocs = [];
        for (var i = 0; i < docs.length; i++) {
            if (docs[i]._type === type) {
                typedDocs.push( docs[i] );
            }
        }

        setTimeout(function () {
            settings.success( typedDocs );
        }, 500);
    };

    // AIQ.Core.DataSync.getAttachments(id[, settings])
    AIQ.Core.DataSync.getAttachments = function(id, settings) {
        var result = [];
	var store = localStorage['AIQ.Attachments'] ? JSON.parse(localStorage['AIQ.Attachments']) : {};
	var attachments = store[id];
	if (attachments !== undefined) {
	    for (var name in attachments) {
		result.push({
		    name: name,
		    contentType: attachments[name].contentType,
		    resourceId: attachments[name].resourceId,
		    state: 'available'
		});
	    }
	}
        setTimeout(function() {
            settings.success(result);
        }, 500);
    };

    // AIQ.Core.DataSync.createDocument(type, object[, settings])
    AIQ.Core.DataSync.createDocument = function (type, object, settings) {
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : [];

        if (! object.hasOwnProperty("_id")) {
            object._id = +new Date() + '-' + (++AIQ.Core.DataSync.idCount); // generate simple timestamp ID as string
        }
	object._type = type;
	object._rev = 0;
        docs.push( object );
        localStorage['AIQ.Documents'] = JSON.stringify( docs );
        AIQ.Core.DataSync.triggerDocumentEvent('document-created', type, object._id);
        
        if (settings !== undefined) {
            return settings.success( object );
        }
    };

    // AIQ.Core.DataSync.updateDocument(id, object[, settings])
    AIQ.Core.DataSync.updateDocument = function (id, object, settings) {
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : [];
        for (var i = 0; i < docs.length; i++) {
            if (docs[i]._id === id) {
		object._id = docs[i]._id;
		object._rev = docs[i]._rev;
		object._type = docs[i]._type;
		object._launchable = docs[i]._launchable;
                docs[i] = object;
                localStorage['AIQ.Documents'] = JSON.stringify( docs );
                AIQ.Core.DataSync.triggerDocumentEvent('document-updated', object._type, id);
                return settings.success( docs[i] );
            }
        }
        if (settings.failure) { settings.failure(); }
    };

    // AIQ.Core.DataSync.deleteDocument(id[, settings])
    AIQ.Core.DataSync.deleteDocument = function (id, settings) {
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : [];
        for (var i = 0; i < docs.length; i++) {
            if (docs[i]._id === id) {
                var type = docs[i]._type;
                docs.splice(i, 1);
                localStorage['AIQ.Documents'] = JSON.stringify( docs );
                AIQ.Core.DataSync.triggerDocumentEvent('document-deleted', type, id);
                return settings.success();
            }
        }
        if (settings.failure) { settings.failure(); }
    };

    // AIQ.Core.DataSync.deleteAttachment(id, name[, settings])
    AIQ.Core.DataSync.deleteAttachment = function(id, name, settings) {
        var docs = localStorage['AIQ.Documents'] ? JSON.parse(localStorage['AIQ.Documents']) : {};
        for (var i = 0; i < docs.length; i++) {
            if (docs[i]._id === id) {
                if (docs[i]._attachments[name] !== undefined) {
                    delete docs[i]._attachments[name];
                    localStorage['AIQ.Documents'] = JSON.stringify(docs);
                    return settings.success();
                }
            }
        }
        if (settings.failure) { settings.failure(); }
    };

    AIQ.Core.DataSync.synchronize = function () {
        setTimeout(function () {
            AIQ.Core.DataSync.triggerDocumentEvent('synchronization-complete');
        }, 1500);
    };
    

    var _events = {};
    var _documentEvents = {};
    var _attachmentEvents = {};

    var fireCallbacks = function(event, args) {
        for (var c in _events[event]) {
            _events[event][c]();
        }
    };
    
    var fireDocumentCallbacks = function(event, args) {
        var types = _documentEvents[event];
        if (types) {
            var local = (args._caller == AIQ._applicationId);
            var callbacks = types["__all__"];
            if (callbacks) {
                for (var c in callbacks) {
                    callbacks[c](args._id, local);
                }
            }
            callbacks = types[args._type];
            if (callbacks) {
                for (var c in callbacks) {
                    callbacks[c](args._id, local);
                }
            }
        }
    };

    var fireAttachmentCallbacks = function(event, args) {
        var ids = _attachmentEvents[event];
        if (ids) {
            var names = ids["__all__"];
            if (names) {
                var callbacks = names["__all__"];
                if (callbacks) {
                    for (var c in callbacks) {
                        callbacks[c](args._id, args._name);
                    }
                }
                callbacks = names[args._name];
                if (callbacks) {
                    for (var c in callbacks) {
                        callbacks[c](args._id, args._name);
                    }
                }
            }
        }
        
        var names = ids[args._id];
        if (names) {
            var callbacks = names["__all__"];
            if (callbacks) {
                for (var c in callbacks) {
                    callbacks[c](args._id, args._name);
                }
            }
            callbacks = names[args._name];
            if (callbacks) {
                for (var c in callbacks) {
                    callbacks[c](args._id, args._name);
                }
            }
        }
    };

    AIQ.Core.DataSync.triggerDocumentEvent = function (event, type, documentId) {
        fireDocumentCallbacks(event, {_type: type, _id: documentId, _caller: AIQ._applicationId});
    };

    AIQ.Core.DataSync.bindDocumentEvent = function(event, type, callback) {
        var types = _documentEvents[event];
        if (! types) {
            types = {};
            _documentEvents[event] = types;
        }
        if (! type) {
            type = "__all__";
        }
        var callbacks = types[type];
        if (! callbacks) {
            callbacks = [];
            types[type] = callbacks;
        }
        callbacks.push(callback);
    };

    AIQ.Core.DataSync.bindAttachmentEvent = function(event, documentId, name, callback) {
        var ids = _attachmentEvents[event];
        if (! ids) {
            ids = {};
            _attachmentEvents[event] = ids;
        }
        if (! id) {
            id = "__all__";
        }
        var names = ids[id];
        if (! names) {
            names = {};
            ids[id] = names;
        }
        if (! name) {
            name = "__all__";
        }
        var callbacks = names[name];
        if (! callbacks) {
            callbacks = [];
            names[name] = callbacks;
        }
        callbacks.push(callback);
    };

    AIQ.Core.DataSync.bindEvent = function(event, callback) {
        var callbacks = _events[event];
        if (! callbacks) {
            callbacks = [];
            _events[event] = callbacks;
        }
        callbacks.push(callback);
    };

    AIQ.Core.DataSync.unbind = function(callback) {
        for (var event in _events) {
            var callbacks = _events[event];
            var index;
            while ((index = callbacks.indexOf(callback)) > -1) {
                callbacks.splice(index, 1);
            }
            _events[event] = callbacks;
        }
        for (var event in _documentEvents) {
            for (var type in _documentEvents[event]) {
                var callbacks = _documentEvents[event][type];
                var index;
                while ((index = callbacks.indexOf(callback)) > -1) {
                    callbacks.splice(index, 1);
                }
                _documentEvents[event][type] = callbacks;
            }
        }
        for (var event in _attachmentEvents) {
            for (var id in _attachmentEvents[event]) {
                for (var name in _attachmentEvents[event][id]) {
                    var callbacks = _attachmentEvents[event][id][name];
                    var index;
                    while ((index = callbacks.indexOf(callback)) > -1) {
                        callbacks.splice(index, 1);
                    }
                    _attachmentEvents[event][id][name] = callbacks;
                }
            }
        }
    };

    AIQ.Core.DataSync.getConnectionStatus = function(callback) {
	callback(true);
    };
}


/*global AIQ:false, WO:false */
if (!AIQ.Core.Direct) {
    AIQ.Core.Direct = {};

    AIQ.Core.Direct.call = function(args, settings) {
        settings = settings || {};
        if ((args) && (args.endpoint)) {
            // if method is not specified, API orders us to fall back to GET
            args.method = args.method || "get";
            $.ajax({
                url: args.endpoint + '.' + args.method.toLowerCase(),
                dataType: "json",
                async: true,
                cache: false
            }).done(function(data, textStatus, jqXHR) {
                if (data.errorCode) {
                    // simplest case, errorCode is present in the root
                    if (settings.failure) {
                        settings.failure(data.errorCode);
                    }
                } else {
                    var result = {};
                    if (args.params) {
                        // evaluate mock cases one by one and check which one
                        // matches given params
                        for (var i = 0; i < data.length; i++) {
                            var doc = data[i];
                            var matches = true;
                            for (var param in doc) {
                                if (param !== "data") {
                                    // adding empty strings to the values will ensure
                                    // that calling match doesn't crash the app
                                    var value = "" + args.params[param];
                                    var match = value.match("" + doc[param]);
                                    if ((! match)            ||
                                        (match.length !== 1) || // direct matches only
                                        (match[0] !== value)) {
                                        matches = false;
                                        break;
                                    }
                                }
                            }
                            if (matches) {
                                // if data is not present, you're the one to blame
                                // for the empty response
                                result = doc.data;
                                break;
                            }
                        }
                    } else {
                        // in case no params were specified, let's return the
                        // whole response
                        result = data;
                    }
                    
                    // do we have a forced error code in the response?
                    if (result.errorCode) {
                        if (settings.failure) {
                            settings.failure(result.errorCode);
                        }
                    } else if (settings.success) {
                        settings.success(result);
                    }
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 200) {
                    // document was found but there was a parse error in the
                    // JSON file, let's raise an error
                    if (settings.error) {
                        settings.error({
                            message: errorThrown
                        });
                    }
                } else if (settings.failure) {
                    settings.failure(jqXHR.status);
                }
            });
        } else if (settings.failure) {
            settings.failure(-1);
        }
    };
    
}


/*global AIQ:true*/

if (!AIQ.Core.Display) {

    AIQ.Core.Display = {};

    // AIQ.Core.Display.setOrientation(orientation)
    AIQ.Core.Display.setOrientation = function (orientation) {
	// do nothing
    };

}

/*global AIQ:true*/

if (!AIQ.Core.Imaging) {

    AIQ.Core.Imaging = {};
    AIQ.Core.Imaging.idCount = 0;

    // AIQ.Core.Imaging.getImage(id[, settings])
    AIQ.Core.Imaging.getImage = function (id, settings) {
        AIQ.Core.DataSync.getDocument(id, {
            success: function(doc) {
                var store = localStorage['AIQ.Attachments'] ?
                    JSON.parse(localStorage['AIQ.Attachments']) :
                    {};
                var attachments = store[id];
                if (attachments === undefined) {
                    attachments = {};
                }
                var count = 0;
                for (var name in attachments) {
                    count++;
                }
                var name = 'content_' + count + '.png';
                var resourceId = 'css/assets/picture' + (count % 2 + 1) + '.png';
                var attachment = {
                    contentType: 'image/png',
                    resourceId: resourceId
                };
                attachments[name] = attachment;
                store[id] = attachments;
                localStorage['AIQ.Attachments'] = JSON.stringify(store);
                settings.success({
                    name: name,
                    contentType: 'image/png',
                    state: 'available',
                    resourceId: resourceId
                });
            },
            failure: function() {
                if (settings.failure) {
                    settings.failure({ cancel: false });
                }
            },
            error: function(arg) {
                if (settings.error) {
                    settings.error(arg);
                }
            }
        });
    };

}

/*global AIQ:true*/

if (!AIQ.External) {
    AIQ.External = {};
}

if (!AIQ.External.Maps) {

    AIQ.External.Maps = {};

    // AIQ.External.Maps.open(settings)
    AIQ.External.Maps.open = function(settings) {
	// do nothing
    };

}

/*global AIQ:true*/

if (!AIQ.Core.Messaging) {
    AIQ.Core.Messaging = {};

    // AIQ.Core.Messaging.getMessages(type[, settings])
    AIQ.Core.Messaging.getMessages = function (type, settings) {
        var messages = localStorage['AIQ.Messages'] ? JSON.parse(localStorage['AIQ.Messages']) : [];
        var typedMessages = [];
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].type === type) {
                typedMessages.push(messages[i]);
            }
        }

        setTimeout(function () {
            settings.success(typedMessages);
        }, 500);
    };

    // AIQ.Core.Messaging.markMessageAsRead(id[, settings])
    AIQ.Core.Messaging.markMessageAsRead = function (id, settings) {
        var messages = localStorage['AIQ.Messages'] ? JSON.parse(localStorage['AIQ.Messages']) : [];
        for (var i = 0; i < messages.length; i++) {
            if (messages[i]._id === id) {
                messages[i].read = true;
                localStorage['AIQ.Messages'] = JSON.stringify(messages);

                return settings.success(messages[i]);
            }
        }
        if (settings.failure) {
            settings.failure();
        }
    };

    var _messageEvents = {};

    // AIQ.Core.Messaging.bindMessageEvent(event, type[, callback])
    AIQ.Core.Messaging.bindMessageEvent = function (event, type, callback) {
        var messageTypes = _messageEvents[event];
        if (!messageTypes) {
            _messageEvents[event] = messageTypes = {};
        }
        if (!type) {
            type = "__all__";
        }
        var callbacks = messageTypes[type];
        if (!callbacks) {
            messageTypes[type] = callbacks = [];
        }
        callbacks.push(callback);
    };

    // AIQ.Core.Messaging.unbind([callback])
    AIQ.Core.Messaging.unbind = function (callback) {
        for (var event in _messageEvents) {
            for (var type in _messageEvents[event]) {
                var callbacks = _messageEvents[event][type];

                for(var index; (index = callbacks.indexOf(callback)) > -1; /* */) {
                    callbacks.splice(index, 1);
                }

                _messageEvents[event][type] = callbacks;
            }
        }
    };
}
