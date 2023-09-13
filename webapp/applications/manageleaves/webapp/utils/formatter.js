sap.ui.define([], function () {
	"use strict";
	return {
		formatStatus: function (statusValue) {
			if (statusValue === 1)
				return "Approved";
			else if (statusValue === 2)
				return "Rejected";
			else if (statusValue === 3)
				return "Cancelled";
			else if (statusValue === 4)
				return "Applied";
			else return "";
		},
		
		formatStatusColor: function (satus) {
			if (satus === "Approved")
				return "Success";
			else if (satus === "Rejected")
				return "Error";
			else if (satus === "Cancelled")
				return "Warning";
			else if (satus === "Applied")
				return "None";
			else return "None";

		},

		formatActionBtn: function (status, startDt) {
			if(status && startDt) {
				var showActionBtn = true;
				var currentDate = new Date().toJSON().split("T")[0];
				var startDate = startDt.split("T")[0];
				if ((currentDate > startDate) && status === "Approved") {
					showActionBtn = false;
				} else {
					showActionBtn = true;
				}
	
				if (showActionBtn) {
					if (status === "Approved")
						return true;
					else if (status === "Rejected")
						return false;
					else if (status === "Cancelled")
						return false;
					else if (status === "Applied")
						return true;
					else return false;
				} else
					return false;
			} else
				return false;
		},

		remainingLeave: function (totlLeaves, tkenVacLeaves) {
			var totalLeaves = parseFloat(totlLeaves);
			var takenVacLeaves = parseFloat(tkenVacLeaves);
			if (isNaN(takenVacLeaves)) {
				return "";
			} else if (takenVacLeaves > totalLeaves) {
				return "0";
			} else {
				return totalLeaves - takenVacLeaves;
			}
			//return totalLeaves - takenVacLeaves;
		},

		formatDate: function (date) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-YYYY"
			});
			var dateFormatted = dateFormat.format(new Date(date));
			return dateFormatted;
		}
	};
});
