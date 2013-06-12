/**
 * Report damage view (step 6 - Confirmation)
 */
aiq.app.Controller.sub({
    events: {
        'click #report-new': 'onReportNewDamage',
        'click #back-home': 'onBackHome'
    },

    init: function () {
    },

    render: function (params) {
        this.renderTemplate();

        // If we don't navigate to another page, we should always end this render function with "return this"
        return this;
    },

    onReportNewDamage: function (e) {
        TD.MyReport = {
            trainNumber: TD.MyReport.trainNumber
        };

        TD.TrainDefectImage.cleanupOrphaned();

        this.navigate("/ReportDamage-TrainPart");
    },

    onBackHome: function (e) {
        delete TD.MyReport;

        // We don't need to cleanup orphaned images here, since it's taken care of in the home controller

        this.navigate("/");
    }
}).registerAs("/ReportDamage-Confirmation", 'ReportDamage-Confirmation.tmpl');
