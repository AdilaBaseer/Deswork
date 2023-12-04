sap.ui.define([], function () {
	"use strict";

	return {
		getTaskStatus: function (status,startDate,endDate,extended_end_date) {
            //debugger;
            var alteredStatus,date;
            var today = new Date().toISOString().slice(0, 10);
            if(endDate?date=endDate:date=extended_end_date)
            if(status==="Completed"){
                alteredStatus=status;
            }else if (startDate > today) {
                alteredStatus = "New";      
            } else if ((startDate <= today) && (today < date)) {
                alteredStatus = "In-Progress";
            }else if (today > date) {
                alteredStatus = "Delayed";      
            } else if(date=== today){
                alteredStatus=status;
            }
            return alteredStatus;
        },
		formatDate: function (startDate) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-YYYY"
			});
			var dateFormatted = dateFormat.format(new Date(startDate));
			return dateFormatted;
		}
		
	};
});