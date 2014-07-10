// Always subclass aiq.app.Model for App models
TD.TrainType = aiq.app.Model.sub();

// Configure Name (1:1 mapping of Document type) and attributes (Document format)
TD.TrainType.configure("TD.TrainType",
    "name",
    "defectCodes",
    "trainParts"
);
