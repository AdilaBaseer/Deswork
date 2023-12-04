sap.ui.define([], function () {
	"use strict";

	return {
		createdAt: function(date) {
			if(date) {
				var temp = date.substr(0,10);
				temp = temp.split("-");
				var result = temp[2] + "-" + temp[1] + "-" + temp[0];
				return result;
			} else {
				return date;
			}
		},
		getDate: function(NoOfDays){
			if (NoOfDays <= 1) {
				var days = NoOfDays + " day";
			}
			else {
				var days = NoOfDays + " days";
			}
			return days;
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