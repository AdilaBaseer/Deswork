sap.ui.define([], function () {
	"use strict";

	return {
		formattingDate: function (date) {
			
    if (date) {
		
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern:"dd-MM-yyyy", //"MM.dd.yyyy",
                    UTC: true
                });
                return oDateFormat.format(new Date(date));

            }

        }
	};
});