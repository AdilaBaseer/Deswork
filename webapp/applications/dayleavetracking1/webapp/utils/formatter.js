sap.ui.define([], function () {
	"use strict";

	return {
		dateOne: function(startDate) {
			var that = this;
			var result = this.formatstartDate('0');
			var value = this.returnResult(result, startDate);
			return value;
		},
		dateTwo: function(startDate) {
			var that = this;
			var result = that.formatstartDate('1');
			var value = that.returnResult(result, startDate);
			return value;
		},
		dateThree: function(startDate) {
			var that = this;
			var result = that.formatstartDate('2');
			var value = that.returnResult(result, startDate);
			return value;
		},
		dateFour: function(startDate) {
			var that = this;
			var result = that.formatstartDate('3');
			var value = that.returnResult(result, startDate);
			return value;
		},
		dateFive: function(startDate) {
			var that = this;
			var result = that.formatstartDate('4');
			var value = that.returnResult(result, startDate);
			return value;
		},
		formatstartDate: function(count) {
			var today = new Date();
			count = parseInt(count);
			var date = today.getDate() + count;
			var month = today.getMonth() +  1;
			var year = today.getFullYear();
			if(date < 10) {
				date = "0" + date;
			}
			if(month) {
				month = "0" + month;
			}
			var result = date + "-" + month + "-" + year;
			return result;
		},
		returnResult: function(result, startDate) {
			if(result === startDate) {
				return "Yes";
			} else {
				return "No";
			}
		}
	};
});