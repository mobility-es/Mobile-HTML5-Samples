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
        $('#create').on('click', function() {
            HW._addVehicleDoc("HW.Vehicle", {
                "name": "A vehicle"
            });
        });

        $('#update').on('click', function() {
            HW._updateAllVehicleDocs("HW.Vehicle", {
                name: "Updated name"
            });
        });

        $('#delete').on('click', function() {
            HW._deleteLastVehicleDoc("HW.Vehicle");
        });

        HW._renderVehicles();
    };

    HW._addVehicleDoc = function(type, fields) {
        aiq.storage.createDocument(type, fields, {
            success: function(doc) {
                HW._renderVehicles();
            },
            error: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._updateAllVehicleDocs = function(type, updatedFields) {
        aiq.storage.getDocuments(type, {
            success: function(docs) {
                var updatedCount = 0;
                docs.forEach(function(doc) {
                    aiq.storage.updateDocument(doc._id, updatedFields, {
                        success: function(doc) {
                            updatedCount++;
                            if (updatedCount === docs.length) {
                                HW._renderVehicles();
                            }
                        },
                        error: function(arg) {
                            HW._error(arg.message);
                        }
                    });
                });
            },

            error: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._deleteLastVehicleDoc = function(type) {
        aiq.storage.getDocuments(type, {
            success: function(docs) {
                aiq.storage.deleteDocument(docs[docs.length-1]._id, {
                    success: function() {
                        HW._renderVehicles();
                    },
                    error: function(arg) {
                        HW._error(arg.message);
                    }
                });
            },

            error: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._renderVehicles = function() {
        var $list = $('#list');
        $list.empty();

        aiq.storage.getDocuments("HW.Vehicle", {
            success: function(docs) {
                if (docs.length === 0) {
                    HW._error("No vehicle documents");
                } else {
                    $('#error').empty();
                    docs.forEach(function(doc) {
                        $list.append('<li>' + doc.name + '</li>');
                    });
                }
            },

            error: function(arg) {
                HW._error(arg.message);
            }
        });
    };

    HW._error = function(message) {
        $('#error').html(message);
    }
}());