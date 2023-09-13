sap.ui.define([], function () {
	"use strict";

	return {
		getDateFormat: function (sDate) {
			if (sDate !== null && sDate !== undefined) {
			  var date = new Date(sDate);
			  var options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
			  var formattedDateTime = date.toLocaleString('en-IN', options);
			  return formattedDateTime;
			} else {
			  var defaultDate = new Date("0000", "00", "00", "00", "00");
			  return defaultDate;
			}
		  },
	};
});