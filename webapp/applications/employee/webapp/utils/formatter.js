sap.ui.define([], function () {
	"use strict";
	return {

		getDueDate: function (estimatedEndDate) {
			var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
			var firstDate = new Date();
			var secondDate = new Date(estimatedEndDate);
			//console.log(dueDate);
			// return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
			var days = Math.round(Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay)));
			if (days == 1){
				//days = days + " " + this.getView().getModel().getProperty("day");
				days = days + " day";
			}
			else{
				//days = days + " " + this.getView().getModel().getProperty("days");
				days = days + " days";
			}
			return days;
		},
		getCurrencyEB:function (estimated_budget, currencyCode) {
            estimated_budget=estimated_budget
            if (estimated_budget === undefined || estimated_budget === null) {
                return "";
            }
            const numericPart = parseFloat(estimated_budget.replace(/[^\d.]/g, ''));
        var currencyCode1 = estimated_budget.replace(/[^a-zA-Z]/g, '');
            switch (currencyCode1) {
            
                case "INR":
                    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericPart);
                case "USD":
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(numericPart);
                case "EUR":
                    return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(numericPart);
                default:
                    return estimated_budget;
            }
 
        },
		formattingDate: function (date) {
			if (date) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern:"dd-MM-yyyy", //"MM.dd.yyyy",
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

		getStatusForNodes: function (status) {
			if (status == "New") return "Neutral";
			else if (status == "In-Progress") return "Critical";
			else if (status == "Completed") {
				return "Positive";
			} else if (status == "Delayed") return "Negative";
			else return "Neutral";
		},
		getPriority: function (status) {
			if (status == "High") return "Error";
			else if (status == "Low") return "Success";
			else if (status == "Medium") return "Warning";
			else return "None";
		},
		getIconForLanes: function (status) {
			if (status == "New") return "sap-icon://order-status";
			else if (status == "In-Progress") return "sap-icon://in-progress";
			else if (status == "Completed") return "sap-icon://complete";
			else if (status == "Delayed") return "sap-icon://delayed";
			else return "sap-icon://begin";
		},
		getStatusForTimeline: function (status) {
			if (status == "New") return "None";
			else if (status == "In-Progress") return "Warning";
			else if (status == "Completed") return "sap-icon://complete";
			else if (status == "Delayed") return "Error";
			else return "sap-icon://begin";
		},
		test: function(data){
			console.log(data);
			return data;
		}
	};
});