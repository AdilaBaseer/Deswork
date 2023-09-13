sap.ui.define([], function () {
	"use strict";

	return {
		formatDate: function(date) {
			var arr = date.split("-");
			var result = arr[2] + "-" + arr[1] + "-" + arr[0];
			return result;
		}
	};
});