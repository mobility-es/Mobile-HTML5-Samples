/* global AIQ:false, HW:true */

var HW = HW || {};

(function() {
    "use strict";
    
    HW.aiqReady = function() {
        AIQ.Core.DataSync.getDocuments("HW.Vehicle", {
            
            success: function(docs) {
                if (docs.length === 0) {
                    this.error({
                        message: "No documents to display"
                    });
                } else {
                    var fragment = document.createDocumentFragment();
                    var list = document.getElementById("list");
                    docs.forEach(function(doc) {
                        var entry = document.createElement("li");
                        entry.innerHTML = doc.name;
                        fragment.appendChild(entry);
                    });
                    list.appendChild(fragment);
                }
            },
            
            error: function(arg) {
                var error = document.getElementById("error");
                error.innerHTML = arg.message;
            }
        });
    };
}());
