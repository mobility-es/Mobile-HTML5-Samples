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
        aiq.messaging.bind("message-delivered", {
            destination: "traffic-messages",
            callback: HW._onMessageDelivered
        });

        $("form").on("submit", HW._onFormSubmit);
    };

    HW._onMessageDelivered = function(id) {
        console.log("Message " + id + " has been delivered to destination traffic-messages");

        aiq.messaging.getMessageStatus(id, {
            success: function(status) {
                HW._error("Message status body: " + status.body);
            }
        });
    };

    HW._onFormSubmit = function(e) {
        // Prevent default form submit action
        e.preventDefault();

        aiq.messaging.sendMessage({
            payload: {"message": $("textarea").val()},
            destination: "traffic-messages"
        }, {
            success: function(status) {
                HW._error("Message " + status._id + " has been " + status.state);
            },
            failure: function(arg) {
                HW._error("Dispatch failed: " + arg.message);
            }
        });

    };

    HW._error = function(message) {
        $("#error").html(message);
    };
}());
