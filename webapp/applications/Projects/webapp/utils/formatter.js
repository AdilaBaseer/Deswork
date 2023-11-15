sap.ui.define([], function () {
	"use strict";
	return {
		getDueDate: function (estimatedEndDate,status) {
			var that = this;
			var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
			var firstDate = new Date();
			var secondDate = new Date(estimatedEndDate);
			var days = Math.round(Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay)));
			// var days=parseInt(day);
			if (status === "Completed") {
				days = ""
			}
			else {
				if (days == 1) {
					days = days + " day";
				}
				else {
					days = days + " days";
				}
			}
			return days;
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
		formattingType: function (type) {
			if (type === "Internal") {
				return "Non-Billable";
			} else {
				return "Billable";
			}
		},
		formattingCurrency:function (estimated_budget) {
			estimated_budget=estimated_budget + "INR";
				return estimated_budget;

		},
	
		getPriority: function (status) {
			if (status == "High") return "Error";
			else if (status == "Low") return "Success";
			else if (status == "Medium") return "Warning";
			else return "None";
		},
		getStatus: function (status, startDate, estimatedEndDate, actualEndDate) {
			var alteredStatus, date;
			var today = new Date().toISOString().slice(0, 10);

		//	if (actualEndDate ? date = actualEndDate : date = estimatedEndDate)
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
			// if (status == "New") return "None";
			// else if (status == "In-progress") return "Warning";
			// else if (status == "Completed") return "Success";
			// else if (status == "Delayed") return "Error";
			// else if (status == "Archived") return "Indication07";
			// else if (status == "Cancelled") return "Indication01";
			// else return "None";
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