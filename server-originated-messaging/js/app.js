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
        HW._renderTrafficMessages();
    };

    HW._renderTrafficMessages = function() {
        var $list = $('#list');
        $list.empty();

        // Getting all server-originated messages of type "TrafficMessage"
        aiq.messaging.getMessages("TrafficMessage", {
            success: function(messages) {
                if (messages.length === 0) {
                    HW._error("No traffic messages");
                } else {
                    $('#error').empty();
                    messages.forEach(function(message) {
                        $list.append('<li data-id="' + message._id + '">' + JSON.stringify(message.payload) + '</li>');
                    });

                    HW._listenToClicksOnList();
                }
            },
            error: function(arg) {
                HW._error("Error occurred: " + arg.message);
            }
        });
    };

    HW._listenToClicksOnList = function() {
        $('li').on('click', HW._onMessageClick);
    };

    HW._onMessageClick = function(e) {
        var $target = $(e.currentTarget);
        var messageId = $target.data('id');

        // Mark clicked server-originated message as read
        aiq.messaging.markMessageAsRead(
            messageId, {
                success: function(message) {
                    alert("Message '" + messageId + "' read.");
                },
                failure: function() {
                    HW._error("Message does not exist");
                },
                error: function(arg) {
                    HW._error("Error occurred: " + arg.message);
                }
            });
    };

    HW._error = function(message) {
        $('#error').html(message);
    };
}());
