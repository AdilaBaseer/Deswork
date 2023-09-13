sap.ui.define([], function () {
	"use strict";
	return {
		formatDate: function (date) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-YYYY"
			});
			var dateFormatted = dateFormat.format(new Date(date));
			return dateFormatted;
		}
	};
});
