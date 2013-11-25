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
        $('#camera').on('click', function() {
            HW._capture('camera')
        });

        $('#library').on('click', function() {
            HW._capture('library')
        });
    };

    HW._capture = function(source) {
        aiq.imaging.capture({
            source: source,
            success: function(descriptor) {
                HW._addImage(descriptor.resourceUrl);
            },
            failure: function(arg) {
                if(arg.cancel) {
                    HW._error("User cancelled.");
                }
                else {
                    HW._error(arg.message);
                }
            }
        });
    };

    HW._addImage = function(resourceUrl) {
        $("#list").append('<li><img src="' + resourceUrl + '"></li>');
    };

    HW._error = function(message) {
        $('#error').html(message);
    }
}());
