/**
 * Report damage view (step 5 - Summary)
 */
aiq.Plugin.iScroll.Controller.sub({

    events: {
        'click a[role="finish"]': "onFinishClicked"
    },

    init: function () {
        TD.TrainDefectReport.bind("create", this.proxy(this.onReportCreated));
    },

    destroy: function() {
        // Unbind all Spine and AIQ bindings here
        TD.TrainDefectReport.unbind();

        // Calling parent
        this.constructor.__super__.destroy.apply(this, arguments);
    },

    render: function () {
        //retrieve temporary report containing user data
        if (TD.MyReport) {
            this.renderTemplate({
                report: TD.MyReport
            });

            this.createScroller();

            // If we don't navigate to another page, we should always end this render function with "return this"
            return this;
        }
        else {  // Something went wrong
            console.log("Error: temporary report is missing");
            this.navigate("/");
        }
    },

    onFinishClicked: function (e) {
        //set missing Train Defect fields
        TD.MyReport.defectDateTime = new Date().getTime();

        //request for AIQ context to retrieve full name; create Train Defect document from the temporary report object
        // Cf. https://docs.appeariq.com/display/AIQDEV/Context for documentation on the Context API
        aiq.client.getCurrentUser({
            success: function (user) {
                TD.MyReport.reportedBy = user.fullName;
                new TD.TrainDefectReport(TD.MyReport).save();
            },
            failure: function () {
                new TD.TrainDefectReport(TD.MyReport).save();
            }
        });
    },

    onReportCreated: function (reportDoc) {
        this.navigate("/ReportDamage-Confirmation");
    }
}).registerAs("/ReportDamage-Summary", 'ReportDamage-Summary.tmpl');
