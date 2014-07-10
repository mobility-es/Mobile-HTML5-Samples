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
        aiq.directcall.getResource({
            endpoint: "Vehicles",
            params: {
                "type": "UBV"
            },
            headers: {
                Accept: "application/json;q=1.0"
            }
        }, {
            success: function (vehicles) {
                HW._renderVehicles(vehicles);
            },
            failure: function (arg) {
                HW._error(arg.message);
            },
            error: function (arg) {
                HW._error("Network unreachable");
            }
        });
    };

    HW._renderVehicles = function(vehicles) {
        var $list = $("#list");
        $list.empty();

        $("#error").empty();
        vehicles.forEach(function(vehicle) {
            $list.append("<li>" + vehicle.id + "</li>");
        });
    };

    HW._error = function(message) {
        $("#error").html(message);
    }
}());
