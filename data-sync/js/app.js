/* global AIQ:false, HW:true */

var HW = HW || {};

(function() {
    "use strict";

    HW.onAiqReady = function() {
        HW._isAiqReady = true;
        if (HW._isJqueryReady) {
            HW._ready();
        }
    };

    HW.onJqueryReady = function() {
        HW._isJqueryReady = true;
        if (HW._isAiqReady) {
            HW._ready();
        }
    };

    HW._ready = function() {
        $("#create").on("click", function() {
            HW._addVehicleDoc("HW.Vehicle", {
                "name": "A vehicle"
            });
        });

        $("#update").on("click", function() {
            HW._updateAllVehicleDocs("HW.Vehicle", {
                name: "Updated name"
            });
        });

        $("#delete").on("click", function() {
            HW._deleteLastVehicleDoc("HW.Vehicle");
        });

        HW._renderVehicles();
    };

    HW._addVehicleDoc = function(type, fields) {
        aiq.datasync.createDocument(type, fields, {
            success: function(doc) {
                // Document created, we synchronize with the platform
                aiq.datasync.synchronize();

                HW._renderVehicles();
            },
            failure: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._updateAllVehicleDocs = function(type, updatedFields) {
        aiq.datasync.getDocuments(type, {
            success: function(docs) {
                $.when.apply($, docs.map(function(doc) {
                    var defer = $.Deferred();
                    aiq.datasync.updateDocument(doc._id, updatedFields, {
                        success: defer.resolve,
                        failure: defer.reject
                    });
                    return defer.promise();
                })).done(function() {
                    // All documents are updated, we synchronize with the platform
                    aiq.datasync.synchronize();
                    
                    HW._renderVehicles();
                }).fail(function(error) {
                    HW._error(error.message);
                });
            },

            failure: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._deleteLastVehicleDoc = function(type) {
        aiq.datasync.getDocuments(type, {
            success: function(docs) {
                aiq.datasync.deleteDocument(docs[docs.length-1]._id, {
                    success: function() {
                        // Document deleted, we synchronize with the platform
                        aiq.datasync.synchronize();

                        HW._renderVehicles();
                    },
                    failure: function(arg) {
                        HW._error(arg.message);
                    }
                });
            },

            failure: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._renderVehicles = function() {
        var $list = $("#list");
        $list.empty();

        aiq.datasync.getDocuments("HW.Vehicle", {
            success: function(docs) {
                if (docs.length === 0) {
                    HW._error("No vehicle documents");
                } else {
                    $("#error").empty();
                    docs.forEach(function(doc) {
                        $list.append("<li>" + doc.name + "</li>");
                    });
                }
            },

            failure: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._error = function(message) {
        $("#error").html(message);
    }
}());
