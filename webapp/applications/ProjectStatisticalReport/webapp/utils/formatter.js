sap.ui.define([], function () {
	"use strict";
	return {
		getStatus: function (status, startDate, estimatedEndDate, actualEndDate) {
			var alteredStatus, date;
			var today = new Date().toISOString().slice(0, 10);
			if(actualEndDate?date=actualEndDate:date=estimatedEndDate)
            if(status==="Completed"){
                alteredStatus=status;
            }else if (startDate > today) {
                alteredStatus = "New";      
            } else if ((startDate <= today) && (today < date)) {
                alteredStatus = "In-progress";
            }else if (today > date) {
                alteredStatus = "Delayed";      
            } else if(date=== today){
                alteredStatus=status;
            }
            return alteredStatus;
        },

		getStatusIndication: function (status, startDate, estimatedEndDate, actualEndDate) {
			var date;
			var today = new Date().toISOString().slice(0, 10);
			if (actualEndDate ? date = actualEndDate : date = estimatedEndDate)
				if (status === "Completed") {
					return "Success";
				}
			if (startDate > today) {
				return "None";
			} else if ((date) && (startDate > today) && (today < actualEndDate)) {
				return "Warning";
			} else if ((date) && (startDate > today) && (today = actualEndDate)) {
				return "Indication07";
			} else if ((date) && (startDate < today) && (today < actualEndDate)) {
				return "Error";
			} else if ((date) && (startDate <= today) && (today < estimatedEndDate)) {
				return "Warning";
			} else if ((date) && (startDate > today) && (today = actualEndDate)) {
				return "Indication07";
			} else if ((date) && (today > estimatedEndDate)) {
				return "Error";
			}
		
		},
        formattingDate: function (date) {
			if (date) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd-MM-yyyy", //"MM.dd.yyyy",
					UTC: true
				});
				return oDateFormat.format(new Date(date));
			}
		},
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
	};
});