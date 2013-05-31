// Always subclass AIQ.app.model for App models
TD.Train = AIQ.app.model.sub();

// Configure Name (1:1 mapping of Document type) and attributes (Document format)
TD.Train.configure("TD.Train",
    "trainNumber",
    "trainType"
);

TD.Train.extend({
    comparator: function (left, right) {
        return left.trainNumber - right.trainNumber;
    },

    findByAttributeSorted: function (field, value) {
        return this.findAllByAttribute(field, value).sort(this.comparator);
    }
});


