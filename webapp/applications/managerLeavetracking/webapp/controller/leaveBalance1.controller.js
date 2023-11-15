sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "vaspp/managerLeavetracking/utils/formatter",
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageToast, MessageBox) {
        "use strict";
        return Controller.extend("vaspp.managerLeavetracking.controller.leaveBalance1", {
            onInit: function () {
                var that = this;
                that.getCurrentDate();
                that.callDayLeave();
            },
            onPressWeekTracking: function () {
                this.getView().byId("_IDGenPage2").setTitle("Week Tracking");
                this.getView().byId("_IDGenPage2").setShowNavButton(true);
                this.getView().byId("dayTracking").setVisible(false);
                this.getView().byId("weekTracking").setVisible(true);
                this.getView().byId("leavesTracking").setVisible(false);
                this.getView().byId("_IDGenOverflowToolbar1").setVisible(false);
            },
            handleNavBack: function () {
                this.getView().byId("_IDGenPage2").setShowNavButton(false);
                 this.getView().byId("dayTracking").setVisible(true);
                 this.getView().byId("weekTracking").setVisible(false);
            },

            //week
            getCurrentDate: function () {
                var arr = [];
                var that = this;
                var today = new Date();
                that.getWorkingDates(today);

            },
            formatDates: function (today, count) {
                var that = this;
                var date = today.getDate() + count;
                var month = today.getMonth() + 1;
                //  var month1 = today.getMonth();
                var year = today.getFullYear();
                if (date < 10) {
                    date = "0" + date;
                }
                if (month < 10) {
                    month = "0" + month;
                }
                var result = date + "-" + month + "-" + year;
                var nextDate = today.getDate() + 1 + count;
                var nextFullDate = month + "-" + nextDate + "-" + year;
                //  var nextFullDate = new Date(year, month1, nextDate);
                nextFullDate = new Date(nextFullDate);
                that.day = nextFullDate.getDay();
                return result;
            },
            getWorkingDates: function (today) {
                var count = 0, that = this;
                that.day = today.getDay();
                that.date1 = ""; that.date2 = ""; that.date3 = ""; that.date4 = ""; that.date5 = "";
                while (that.date5 === "") {
                    if (that.day === 0 || that.day === 6) {
                        count++;
                        if (that.day === 0) {
                            that.day = 1;
                        } else if (that.day === 6) {
                            that.day = 0;
                        }
                    } else {
                        if (that.date1 === "") {
                            that.date1 = that.formatDates(today, count);
                            that.getView().byId("_IDGenLabel2").setText(that.date1);
                            count++;
                        } else if (that.date2 === "") {
                            that.date2 = that.formatDates(today, count);
                            that.getView().byId("_IDGenLabel3").setText(that.date2);
                            count++;
                        } else if (that.date3 === "") {
                            that.date3 = that.formatDates(today, count);
                            that.getView().byId("_IDGenLabel4").setText(that.date3);
                            count++;
                        } else if (that.date4 === "") {
                            that.date4 = that.formatDates(today, count);
                            that.getView().byId("_IDGenLabel5").setText(that.date4);
                            count++;
                        } else if (that.date5 === "") {
                            that.date5 = that.formatDates(today, count);
                            that.getView().byId("_IDGenLabel6").setText(that.date5);
                            count++;
                            that.getLeaveDetails();
                        }

                    }
                }
            },
            getLeaveDetails: function () {
                var arr = [];
                var that = this;
                var url = "/deswork/api/p-leaves?populate=*&filters[status][$eq]=Approved&filters[startDate][$eq]=" + that.date1;
                url = url + "&filters[startDate][$eq]=" + that.date2;
                url = url + "&filters[startDate][$eq]=" + that.date3;
                url = url + "&filters[startDate][$eq]=" + that.date4;
                url = url + "&filters[startDate][$eq]=" + that.date5;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        var data = response.data;
                        let requestedBy = {};
                        var arr = [];
                        for (let i = 0; i < data.length; i++) {
                            const id = data[i].attributes.requestedBy;
                            arr.push(id);
                            if (requestedBy.hasOwnProperty(id)) {
                                requestedBy[id].push(data[i]);
                            }
                            else {
                                requestedBy[id] = [];
                                requestedBy[id][0] = data[i];
                            }
                        }
                        arr = arr.filter(function (value, index, array) {
                            return array.indexOf(value) === index;
                        });
                        that.setWeekData(arr, requestedBy);
                    }
                });
            },
            setWeekData: function (arr, organizedByAge) {
                var obj = [], i = 0, j = 0, date1 = "No", date2 = "No", date3 = "No", date4 = "No", date5 = "No";
                var that = this;
                for (i = 0; i < arr.length; i++) {
                    for (j = 0; j < organizedByAge[arr[i]].length; j++) {
                        if (that.date1 === organizedByAge[arr[i]][j].attributes.startDate) {
                            date1 = "Yes";
                        } else if (that.date2 === organizedByAge[arr[i]][j].attributes.startDate) {
                            date2 = "Yes";
                        } else if (that.date3 === organizedByAge[arr[i]][j].attributes.startDate) {
                            date3 = "Yes";
                        } else if (that.date4 === organizedByAge[arr[i]][j].attributes.startDate) {
                            date4 = "Yes";
                        } else if (that.date5 === organizedByAge[arr[i]][j].attributes.startDate) {
                            date5 = "Yes";
                        }
                    }
                    obj.push({
                        "name": arr[i],
                        "date1": date1,
                        "date2": date2,
                        "date3": date3,
                        "date4": date4,
                        "date5": date5
                    });
                }
                var oModel2 = new sap.ui.model.json.JSONModel(obj);
                that.getView().setModel(oModel2, "weeLeaveTrack");
                that.getView().getModel("weeLeaveTrack").getData();
            },
            //week track end

            //Day Track start
            callDayLeave: function () {
                var arr = [];
                var that = this;
                var today = new Date();
                var date = today.getDate();
                var month = today.getMonth() + 1;
                var year = today.getFullYear();
                if (date < 10) {
                    date = "0" + date;
                }
                if (month < 10) {
                    month = "0" + month;
                }
                var result = date + "-" + month + "-" + year;
                //  that.getView().byId("_IDGenPage2").setTitle(result + " Leave tracking");
                var url = "/deswork/api/p-leaves?populate=*&filters[status][$eq]=Approved&filters[startDate][$eq]=" + result;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "dayLeaveTrack");
                    }
                });
            },
            //Day track End

         

        });
    });    