sap.ui.define([], function () {
	"use strict";

	return {
		// getDateFormat: function (sDate) {
		// 	if (sDate !== null && sDate !== undefined) {
		// 	  var date = new Date(sDate);
		// 	  var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		// 	  var formattedTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
		// 	  return formattedDate + " " + formattedTime;
		// 	} else {
		// 	  var defaultDate = new Date("0000", "00", "00", "00", "00");
		// 	  return defaultDate;
		// 	}
		//   },
		getDateFormat: function (sDate) {
			debugger;
			if (sDate !== null && sDate !== undefined) {
			  var date = new Date(sDate);
			  var options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
			  var formattedDateTime = date.toLocaleString('en-IN', options);
			  return formattedDateTime;
			} else {
			  var defaultDate = new Date("0000", "00", "00", "00", "00");
			  return defaultDate;
			}
		  },
		  
	};
});