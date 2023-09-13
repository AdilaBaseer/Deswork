sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "vaspp/dayleavetracking/utils/formatter",
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageToast, MessageBox) {

        "use strict";
        return Controller.extend("vaspp.dayleavetracking.controller.leaveBalance", {
            onInit: function () {
                var that = this;
                that.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(that.onObjectMatched, that);
                that.callBalanceLeave();
                that.getUserDetails();
                //WEEK
                that.getCurrentDate();
                //Day
                that.callDayLeave();

            },
            onPressDayTracking: function () {
                this.getView().byId("_IDGenPage2").setTitle("Day Tracking");
                this.getView().byId("_IDGenPage2").setShowNavButton(true);
                this.getView().byId("dayTracking").setVisible(true);
                this.getView().byId("weekTracking").setVisible(false);
                this.getView().byId("leavesTracking").setVisible(false);
                this.getView().byId("_IDGenOverflowToolbar1").setVisible(false);
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
                this.getView().byId("_IDGenPage2").setTitle("Leave Balance");
                this.getView().byId("_IDGenPage2").setShowNavButton(false);
                this.getView().byId("leavesTracking").setVisible(true);
                this.getView().byId("_IDGenOverflowToolbar1").setVisible(true);
                this.getView().byId("dayTracking").setVisible(false);
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
                if (month) {
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
                        //that.getView().setModel(oModel2, "dayLeaveTrack");
                        //that.getView().getModel("dayLeaveTrack").getData();
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
            //week end
            //Day leave
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
                if (month) {
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
            //Day End
            callBalanceLeave: function () {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[year]][$eq]=' + currentYear;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "balanceleave");
                    }
                });
            },
            // onPressWeekTracking: function() {
            //     sap.ui.core.UIComponent.getRouterFor(this).navTo("weekLeave");
            // },
            // onPressDayTracking: function() {
            //     sap.ui.core.UIComponent.getRouterFor(this).navTo("dayLeave");
            // },
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));
                var object = {
                    "editable": false,
                    "editButton": true
                };
                var oModel = new sap.ui.model.json.JSONModel(object);
                that.getView().setModel(oModel, "editableModel");
            },
            onPressLeaveBalance: function () {
                var that = this;
                var date = new Date();
                // var currentYear = date.getFullYear();
                var currentYear = new Date("2024", "03", "01").getFullYear();
                var currentYear1 = new Date("2024", "03", "01");
                var currentMonth = currentYear1.getMonth();
                // currentMonth = currentMonth + 1;
                if (currentMonth === 3) {
                    var data = that.getView().getModel("userModel").getData();
                   
                    that.compareAndPostLeaveBalance(data, currentYear);
                } else {
                    MessageBox.error("You can't revise current financial year holidays");
                }
            },
            getUserDetails: function () {
                var that = this;
                var url = 'deswork/api/users?filters[confirmed][$eq]=true';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel = new sap.ui.model.json.JSONModel(response);
                        that.getView().setModel(oModel, "userModel");
                    }
                });
            },
            compareAndPostLeaveBalance: function (userData, currYear) {
                var that = this;
                var url = '/deswork/api/p-balance-leaves?populate=*';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "balanceleaveMD");
                        that.balanceleaveMD = that.getView().getModel("balanceleaveMD").getData();
                        if (that.balanceleaveMD.length > 0) {

                            // MessageBox.show("Delete the Leave-Balance")
                            var url = '/deswork/api/p-balance-leaves?populate=*';
                            var batchSize = 50; // Number of records to delete in each batch

                            // Function to delete balance leave records by ID
                            function deleteBalanceLeaveById(BLid) {
                                return $.ajax({
                                    type: "DELETE",
                                    url: "/deswork/api/p-balance-leaves/" + BLid
                                });
                            }

                            // Recursive function to delete a batch of balance leave records
                            function deleteBalanceLeavesBatch(balanceleaveMD, startIndex) {
                                var endIndex = Math.min(startIndex + batchSize, balanceleaveMD.length);

                                if (startIndex < endIndex) {
                                    var promises = [];

                                    for (var i = startIndex; i < endIndex; i++) {
                                        var BLid = balanceleaveMD[i].id;
                                        promises.push(deleteBalanceLeaveById(BLid));
                                    }

                                    $.when.apply($, promises).then(function () {
                                        deleteBalanceLeavesBatch(balanceleaveMD, endIndex);
                                    });
                                } else {
                                    // Check if there are more pages of data to delete
                                    if (endIndex < balanceleaveMD.length) {
                                        deleteAllBalanceLeavesRecursive(balanceleaveMD, endIndex);
                                    } else {
                                        // All records deleted
                                        console.log("All balance leave records deleted successfully.");
                                        that.callBalanceLeave();

                                        var url = 'deswork/api/p-balance-leaves?populate=*';
                                        $.ajax({
                                            url: url,
                                            method: "GET",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            success: function (response) {
                                                response = JSON.parse(response);
                                                var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                                                that.getView().setModel(oModel2, "balanceleave");
                                                $.ajax({
                                                    url: url,
                                                    method: "GET",
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    },
                                                    success: function (response) {
                                                        response = JSON.parse(response);
                                                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                                                        that.getView().setModel(oModel2, "balanceleaveMD");
                                                        var balanceleaveMD = that.getView().getModel("balanceleaveMD").getData();
                    
                                                        // Start the deletion process
                                                        deleteBalanceLeavesBatch(balanceleaveMD, 0);
                    
                                                        for (i = 0; i < userData.length; i++) {
                                                            var settings = {
                                                                "url": "/deswork/api/p-balance-leaves",
                                                                "method": "POST",
                                                                "timeout": 0,
                                                                "headers": {
                                                                    "Content-Type": "application/json"
                                                                },
                                                                "data": JSON.stringify({
                                                                    "data": {
                                                                        "year": currYear,
                                                                        "defaultLeaves": 20,
                                                                        //  "carryForwardLeaves": carryForwardLeaves,
                                                                        "balanceLeaves": 20,
                                                                        "sickLeaves": 0,
                                                                        "paidLeaves": 0,
                                                                        "unPaidLeaves": 0,
                                                                        "userId": userData[i].id,
                                                                        "userName": userData[i].firstName + " " + userData[i].lastName
                                                                    }
                                                                }),
                                                            };
                    
                                                            $.ajax(settings).done(function (response) {
                                                                response = JSON.parse(response);
                                                                if (response.error) {
                                                                    MessageBox.error(response.error.message);
                                                                }
                                                                else {
                                                                    //   MessageBox.show("1nd Time")
                                                                    that.callBalanceLeave();
                    
                                                                    var url = 'deswork/api/p-balance-leaves?populate=*';
                                                                    $.ajax({
                                                                        url: url,
                                                                        method: "GET",
                                                                        headers: {
                                                                            "Content-Type": "application/json"
                                                                        },
                                                                        success: function (response) {
                                                                            response = JSON.parse(response);
                                                                            var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                                                                            that.getView().setModel(oModel2, "balanceleave");
                                                                        }
                                                                    });
                    
                                                                }
                                                            });
                    
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            }

                           
                        }
                        else {
                            // MessageBox.show("2nd Time")
                            var i = 0;
                            for (i = 0; i < userData.length; i++) {
                                var settings = {
                                    "url": "/deswork/api/p-balance-leaves",
                                    "method": "POST",
                                    "timeout": 0,
                                    "headers": {
                                        "Content-Type": "application/json"
                                    },
                                    "data": JSON.stringify({
                                        "data": {
                                            "year": currYear,
                                            "defaultLeaves": 20,
                                            //  "carryForwardLeaves": carryForwardLeaves,
                                            "balanceLeaves": 20,
                                            "sickLeaves": 0,
                                            "paidLeaves": 0,
                                            "unPaidLeaves": 0,
                                            "userId": userData[i].id,
                                            "userName": userData[i].firstName + " " + userData[i].lastName
                                        }
                                    }),
                                };

                                $.ajax(settings).done(function (response) {
                                    response = JSON.parse(response);
                                    if (response.error) {
                                        MessageBox.error(response.error.message);
                                    }
                                    else {
                                        that.callBalanceLeave();

                                        var url = 'deswork/api/p-balance-leaves?populate=*';
                                        $.ajax({
                                            url: url,
                                            method: "GET",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            success: function (response) {
                                                response = JSON.parse(response);
                                                var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                                                that.getView().setModel(oModel2, "balanceleave");
                                            }
                                        });

                                    }
                                });

                            }
                        }

                    }
                });
            },


            onEditleaves: function () {
                var that = this;
                that.editableMode(true, false);
            },
            onDeleteleaves: function (evt) {
                var that = this;
                that.editableMode(true, false);
                var data = that.getIndexData(evt);
                that.deleteEntry(data.id, evt);
            },
            onCancelleaves: function () {
                var that = this;
                that.callBalanceLeave();
                that.editableMode(false, true);
                that.removeDuplicates();
            },
            onSaveleaves: function (evt) {
                var that = this;
                that.editableMode(false, true);
                that.removeDuplicates();
                var data = this.getIndexData(evt);
                that.dataUpdated(data.attributes, data.id);
            },
            editableMode: function (val1, val2) {
                var that = this;
                var data = that.getView().getModel("editableModel").getData();
                data.editable = val1;
                data.editButton = val2;
                that.getView().getModel("editableModel").setData(data);
            },
            dataUpdated: function (data, id) {
                var that = this;
                if (id === 0) {
                    var type = "POST";
                    var url = "/deswork/api/p-balance-leaves";
                    var mode = "created";
                } else {
                    type = "PUT";
                    url = "/deswork/api/p-balance-leaves/" + id;
                    mode = "updated"
                }
                var settings = {
                    "url": url,
                    "method": type,
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        "data": {
                            "year": parseInt(data.year),
                            "defaultLeaves": parseFloat(data.defaultLeaves),
                            "carryForwardLeaves": parseFloat(data.carryForwardLeaves),
                            "balanceLeaves": data.defaultLeaves + data.carryForwardLeaves - data.sickLeaves - data.paidLeaves,
                            "sickLeaves": parseFloat(data.sickLeaves),
                            "paidLeaves": parseFloat(data.paidLeaves),
                            "unPaidLeaves": parseFloat(data.unPaidLeaves),
                            "userId": data.userId,
                            "userName": data.userName
                        }
                    }),
                };

                $.ajax(settings).done(function (response) {
                    response = JSON.parse(response);
                    if (response.error) {
                        MessageBox.error(response.error.message);
                    } else {
                        MessageBox.success("Leave balance " + mode + " successfully");
                    }
                });
            },
            onAddleaves: function () {
                var that = this;
                that.data = "";
                that.removeDuplicates();
                var currYear = new Date();
                currYear = currYear.getFullYear();
                var data = that.getView().getModel("balanceleave").getData();
                var obj =
                {
                    "id": 0,
                    "attributes": {
                        "year": currYear,
                        "defaultLeaves": 20,
                        "carryForwardLeaves": 0,
                        "balanceLeaves": 20,
                        "sickLeaves": 0,
                        "paidLeaves": 0,
                        "unPaidLeaves": 0,
                        "userId": 0,
                        "userName": ""
                    },

                };
                data.push(obj);
                that.getView().getModel("balanceleave").setData(data);
                that.data = that.getView().getModel("balanceleave").getData();
                that.onEditleaves(true, false);
            },
            removeDuplicates: function () {
                var that = this;
                var data = that.getView().getModel("balanceleave").getData();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].attributes.userName === "") {
                        data.splice(i, 1);
                    }
                }
                that.getView().getModel("balanceleave").setData(data);
            },
            onSelectUserId: function (evt) {
                var selectedItem = evt.getParameters().selectedItem.getProperty("text");
                var data = this.getIndexData(evt);
                data.attributes.userName = selectedItem;
            },
            getIndexData: function (evt) {
                var that = this;
                var path = evt.getSource().getBindingContext("balanceleave").getPath();
                path = path.replace("/", "");
                var data;
                path = parseInt(path);
                if (that.data) {
                    data = that.data;
                } else {
                    data = that.getView().getModel("balanceleave").getData();
                }
                data = data[path];
                return data;
            },

            deleteEntry: function (id, evt) {
                var that = this;
                that.editableMode(false, true);
                MessageBox.confirm("Are you sure you want to Delete?", {
                    actions: ["Yes", "No"],
                    emphasizedAction: "Yes",
                    onClose: function (oEvent) {
                        if (oEvent == "Yes") {
                            $.ajax({
                                url: "deswork/api/p-balance-leaves/" + id,
                                type: "DELETE",
                                success: function (res) {
                                    MessageBox.success("Deleted!");
                                    that.deleteFromModel(evt);
                                },
                                error: function (err) {
                                    reject(err.responseText);
                                },
                            });
                        }
                    }
                });
            },
            deleteFromModel: function (evt) {
                var that = this;
                var path = evt.getSource().getBindingContext("balanceleave").getPath();
                path = path.replace("/", "");
                var data;
                path = parseInt(path);
                if (that.data) {
                    data = that.data;
                } else {
                    data = that.getView().getModel("balanceleave").getData();
                }
                data.splice(path, 1);
                that.getView().getModel("balanceleave").setData(data);
            },
            CheckData: function (id) {
                var url = 'deswork/api/p-balance-leaves/' + id;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        if (response.data.length === 0) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                });
            }
        });
    });    