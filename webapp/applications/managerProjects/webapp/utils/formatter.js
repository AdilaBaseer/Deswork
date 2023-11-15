sap.ui.define([], function () {
	"use strict";
	return {

		getDueDate: function (estimatedEndDate) {
			var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
			var firstDate = new Date();
			var secondDate = new Date(estimatedEndDate);
			var days = Math.round(Math.abs((secondDate.getTime() - firstDate.getTime()) / (oneDay)));
			if (days == 1){
				days = days + " day";
			}
			else{
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
		getStatus: function (status, startDate, estimatedEndDate, actualEndDate) {
			var alteredStatus, date;
			var today = new Date().toISOString().slice(0, 10);

		//	if (actualEndDate ? date = actualEndDate : date = estimatedEndDate)
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
		formattingType: function (type) {
			if (type === "Internal") {
				return "Non-Billable";
			  } else {
				return "Billable";
			  }
			
		},
		
		getPriority: function (status) {
			if (status == "High") return "Error";
			else if (status == "Low") return "Success";
			else if (status == "Medium") return "Warning";
			else return "None";
		},
        getCurrencyEB:function (estimated_budget, currencyCode) {
			estimated_budget=estimated_budget
			if (estimated_budget === undefined || estimated_budget === null) {
				return "";
			}
			const numericPart = parseFloat(estimated_budget.replace(/[^\d.]/g, ''));
		var currencyCode1 = estimated_budget.replace(/[^a-zA-Z]/g, '');
			// You can add more cases for other currencies as needed
			switch (currencyCode1) {
				// case "INR":
				// 	return estimated_budget + " ₹"; // Assuming ₹ is the symbol for INR
				// case "USD":
				// 	return "$" + estimated_budget;
				// case "EUR":
				// 	return "€" + estimated_budget;
				// default:
				// 	return estimated_budget;

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
		getCurrencyAB:function (actual_budget, currencyCode) {
			actual_budget=actual_budget
			if (actual_budget === undefined || actual_budget === null) {
				return "";
			}
			const numericPart = parseFloat(actual_budget.replace(/[^\d.]/g, ''));
		var currencyCode1 = actual_budget.replace(/[^a-zA-Z]/g, '');
			// You can add more cases for other currencies as needed
			switch (currencyCode1) {
				// case "INR":
				// 	return estimated_budget + " ₹"; // Assuming ₹ is the symbol for INR
				// case "USD":
				// 	return "$" + estimated_budget;
				// case "EUR":
				// 	return "€" + estimated_budget;
				// default:
				// 	return estimated_budget;

				case "INR":
					return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericPart);
				case "USD":
					return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(numericPart);
				case "EUR":
					return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(numericPart);
				default:
					return actual_budget;
			}

		},
		getRateCard:function (rate_card, currencyCode) {
			rate_card=rate_card
			if (rate_card === undefined || rate_card === null) {
				return "";
			}
			const numericPart = parseFloat(rate_card.replace(/[^\d.]/g, ''));
		var currencyCode1 = rate_card.replace(/[^a-zA-Z]/g, '');
			// You can add more cases for other currencies as needed
			switch (currencyCode1) {
				// case "INR":
				// 	return estimated_budget + " ₹"; // Assuming ₹ is the symbol for INR
				// case "USD":
				// 	return "$" + estimated_budget;
				// case "EUR":
				// 	return "€" + estimated_budget;
				// default:
				// 	return estimated_budget;

				case "INR":
					return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericPart);
				case "USD":
					return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(numericPart);
				case "EUR":
					return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(numericPart);
				default:
					return rate_card;
			}

		},
		getTaskStatus: function (status,startDate,endDate,extended_end_date) {
            //debugger;
            var alteredStatus,date;
            var today = new Date().toISOString().slice(0, 10);
            if(endDate?date=endDate:date=extended_end_date)
            if(status==="Completed"){
                alteredStatus=status;
            }else if (startDate > today) {
                alteredStatus = "New";      
            } else if ((startDate <= today) && (today < date)) {
                alteredStatus = "In-Progress";
            }else if (today > date) {
                alteredStatus = "Delayed";      
            } else if(date=== today){
                alteredStatus=status;
            }
            return alteredStatus;
        },

        getStatusIndication: function (status,startDate,estimatedEndDate,actualEndDate) {
            var date;
            var today = new Date().toISOString().slice(0, 10);
            if(actualEndDate?date=actualEndDate:date=estimatedEndDate)
            if (startDate === today) {
                return "None";      
            } else if ((date) && (startDate > today) && (today < actualEndDate)) {
                return "Warning";
            } else if ((date) && (startDate > today) && (today = actualEndDate)) {
                return "Indication07";
            }else if ((date) && (startDate < today) && (today < actualEndDate)) {
                return "Error";
            } else if ((date) && (startDate < today) && (today < estimatedEndDate)) {
                return "Warning";
            }else if ((date) && (startDate > today) && (today = actualEndDate)) {
                return "Indication07";              
            } else if ((date) && (today > estimatedEndDate)) {
                return "Error";    
            }
            if (status == "New") return "None";
            else if (status == "In-progress") return "Warning";
            else if (status == "Completed") return "Success";
            else if (status == "Delayed") return "Error";
            else if (status == "Archived") return "Indication07";
            else if (status == "Cancelled") return "Indication01";
            else return "None";
        },
	};
});