sap.ui.define([], function () {
	"use strict";

	return {
		formatDate: function (date) {
			var arr = date.split("-");
			var result = arr[2] + "-" + arr[1] + "-" + arr[0];
			return result;
		},
		getExperience: function (doj, noOfExperience) {
			var experience = noOfExperience
			var DOJ = new Date(doj);
			var today = new Date();
			var years = Math.floor(experience);
			var months = (experience - years) ;
			if(months>.11){
				months=months*10;
			}else{
				months=months*100;
			}
			var yearsDiff = today.getFullYear() - DOJ.getFullYear();
			var monthsDiff = today.getMonth() - DOJ.getMonth();
			if (monthsDiff < 0) {
				yearsDiff--;
				monthsDiff += 12;
			}

			// Add monthsDiff to months and yearsDiff to years
			months += monthsDiff;
			years += yearsDiff;

			if(years>1){
				var year=years+" years";
			}else{
				year=years+" year"
			}
			if(months>1){
				var month=months+" months";
			}else{
				month=months+" month"
			}
			var decimalYears = year +"  "+ month
			// var decimalYears = year + (months / 12);

			return decimalYears;
		}




		// console.log(`Difference: ${dateDifference.years} years and ${dateDifference.months} months`);


	};
});