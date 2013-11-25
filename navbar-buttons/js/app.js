/* global AIQ:false, HW:true */

var HW = HW || {};

(function() {
    "use strict";
    
    HW.aiqReady = function() {
        aiq.client.navbar.addButton({
            image: 'img/first.png',
            label: 'First',
            onClick: function(button) {
                alert('First button clicked');
            }
        }, {
            success: function(first) {
                aiq.client.navbar.addButton({
                    image: 'img/second.png',
                    label: 'Second',
                    onClick: function(button) {
                        alert('Second button clicked');
                    }
                }, {
                    success: function(second) {
                        alert("All buttons created");
                    }
                });
            }
        });
    };
}());
