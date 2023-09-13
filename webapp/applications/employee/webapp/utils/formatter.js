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
		getStatus: function (status) {
			if (status == "New") return "None";
			else if (status == "In-progress") return "Warning";
			else if (status == "Completed") return "Success";
			else if (status == "Delayed") return "Error";
			else if (status == "Archived") return "Indication07";
			else if (status == "Cancelled") return "Indication01";
			else return "None";
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