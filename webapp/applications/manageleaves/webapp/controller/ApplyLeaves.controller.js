sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "VASPP/manageleaves/utils/formatter",
    "sap/m/UploadCollectionParameter"
    // "VASPP/manageleaves/util/utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, MessageBox, formatter, UploadCollectionParameter) {
        "use strict";
        return Controller.extend("VASPP.manageleaves.controller.ApplyLeaves", {
            formatter: formatter,
            onInit: function () {
                var that = this;
                that.getUserDetails();
                that.callBalanceLeave();
                that.callLeave();
                that.callHolidays();
                // that.getBatches();
                that.appliedDates = [];
                that.holidayDates = [];
                that.lastSelectedRangeDates = [];
                that.lastSelecetedDatesCount = 0; // Contains the count of successfully selected valid dates only

                that.calendar = that.getView().byId("calSelectLeaveDates");
                that.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(that.onObjectMatched, that);
                that.getUserHistoryBalanceDetails();
            },
            //Leave Apply
            getUserHistoryBalanceDetails: function () {
                var that = this;
                var url = 'deswork/api/users/me?populate=*';
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
                        that.callLeaveHistory(response.id);
                        that.callBalanceLeave(response.id);
                    }
                });
            },
            callLeaveHistory: function (userId) {
                var arr = [];
                var that = this;
                var url = '/deswork/api/p-leaves?populate=*&filters[requestedById][$eq]=' + that.loginId ;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var i;
                        for (i = 0; i < response.data.length; i++) {
                            if (parseInt(userId) === parseInt(response.data[i].attributes.requestedById)) {
                                arr.push(response.data[i]);
                            }
                        }
                        var oModel2 = new sap.ui.model.json.JSONModel(arr);
                        that.getView().setModel(oModel2, "leavehistory");
                    }
                });

            },
            callBalanceLeave: function (userId) {
                var arr = [];
                var that = this;
                that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[userId][$eq]=' + that.loginId ;
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
            deleteRow: function (oEvent) {
                var that = this;
                var oItem = oEvent.getParameter("listItem").getBindingContext("leavehistory").getProperty().id;
                var status = oEvent.getParameter("listItem").getBindingContext("leavehistory").getProperty().attributes.status;
                if (status === "Requested") {
                    MessageBox.confirm("Are you sure you want to Delete the Leave Request?", {
                        actions: ["Yes", "No"],
                        emphasizedAction: "Yes",
                        onClose: function (oEvent) {
                            if (oEvent == "Yes") {
                                $.ajax({
                                    url: "/deswork/api/p-leaves/" + oItem,
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    success: function (response) {
                                        response = JSON.parse(response);
                                        MessageBox.success("Leave Request has been deleted");
                                        var urlMe = 'deswork/api/users/me?populate=*';
                                        $.ajax({
                                            url: urlMe,
                                            method: "GET",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },

                                            success: function (response) {
                                                response = JSON.parse(response);
                                                var oModel = new sap.ui.model.json.JSONModel(response);
                                                that.getView().setModel(oModel, "userModel");
                                                that.callLeaveHistory(response.id);
                                            }
                                        });
                                    },
                                });
                            }
                        }
                    });
                } else {
                    MessageBox.error("You can only delete 'Requested' leaves");
                }
            },

            //Leave History
            onChange: function (oEvent) {
                var that = this;
                var oUploadCollection = oEvent.getSource();
                var file = oEvent.getParameter("item").getFileObject();
                that.fileName = oEvent.getParameter("item").getFileName();
                var reader = new FileReader();
                reader.onload = function (e) {
                    that.getView().mElementBindingContexts.Leaves.getObject().documents.push({
                        "FileName": that.fileName,
                        "FileContent": e.currentTarget.result
                    });
                };
                reader.readAsDataURL(file);
            },

            onStartUpload: function (oEvent) {
                var oUploadCollection = this.byId("UploadCollection");
                var oTextArea = this.byId("TextArea");
                var cFiles = oUploadCollection.getItems().length;
                var uploadInfo = cFiles + " file(s)";
                if (cFiles > 0) {
                    oUploadCollection.upload();
                    if (oTextArea.getValue().length === 0) {
                        uploadInfo = uploadInfo + " without notes";
                    } else {
                        uploadInfo = uploadInfo + " with notes";
                    }
                    MessageToast.show("Method Upload is called (" + uploadInfo + ")");
                    MessageBox.information("Uploaded " + uploadInfo);
                    oTextArea.setValue("");
                }
            },

            onBeforeUploadStarts: function (oEvent) {
                // Header Slug
                var oCustomerHeaderSlug = new UploadCollectionParameter({
                    name: "slug",
                    value: oEvent.getParameter("fileName")
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
                setTimeout(function () {
                    MessageToast.show("Event beforeUploadStarts triggered");
                }, 4000);
            },

            onUploadComplete: function (oEvent) {
                var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
                setTimeout(function () {
                    var oUploadCollection = this.byId("UploadCollection");
                    for (var i = 0; i < oUploadCollection.getItems().length; i++) {
                        if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
                            oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
                            break;
                        }
                    }
                    MessageToast.show("Event uploadComplete triggered");
                }.bind(this), 8000);
            },

            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));
                that.callBalanceLeave();
                that.callLeave();
            },

            collectAttachment: function (Event) {
                this.leaveRequestObject.attachments.push(Event.getParameter("files")[0]);
            },

            handleHistoryPress: function () {
                var that = this;  
                that.getUserHistoryBalanceDetails();
                // that.callLeaveHistory();
                // sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteAppliedLeaves");
                // this.getView().byId("applyleave").mProperties.title = "Leave History";
                this.getView().byId("applyleave").setTitle("Leave History");
                this.getView().byId("applyleave").setShowNavButton(true);
                this.getView().byId("applyleave").setShowFooter(false);
                this.getView().byId("_IDGenGrid1").setVisible(false);
                this.getView().byId("LRS4_FLX_TOP").setVisible(false);
                this.getView().byId("_IDGenTable1").setVisible(true);
                this.getView().byId("balanceLeaves").setVisible(false);
            },

            handleNavBack: function () {
                this.getView().byId("applyleave").setTitle("Leave Entry");
                this.getView().byId("applyleave").setShowNavButton(false);
                this.getView().byId("applyleave").setShowFooter(true);
                this.getView().byId("_IDGenGrid1").setVisible(true);
                this.getView().byId("LRS4_FLX_TOP").setVisible(true);
                this.getView().byId("_IDGenTable1").setVisible(false);
                this.getView().byId("balanceLeaves").setVisible(false);
            },

            handlebalancePress: function (userId) {
                //   callLeaveHistory: function (userId) {
                var arr = [];
                var that = this;
                var url = "/deswork/api/p-leaves?populate=*";
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var i;
                        for (i = 0; i < response.data.length; i++) {
                            if (parseInt(userId) === parseInt(response.data[i].attributes.requestedById)) {
                                arr.push(response.data[i]);
                            }
                        }
                        var oModel2 = new sap.ui.model.json.JSONModel(arr);
                        that.getView().setModel(oModel2, "leavehistory");
                    }
                });
                this.getView().byId("applyleave").setTitle("Leave Balance");
                this.getView().byId("applyleave").setShowNavButton(true);
                this.getView().byId("applyleave").setShowFooter(false);
                this.getView().byId("_IDGenGrid1").setVisible(false);
                this.getView().byId("LRS4_FLX_TOP").setVisible(false);
                this.getView().byId("_IDGenTable1").setVisible(false);
                this.getView().byId("balanceLeaves").setVisible(true);
            },

            handleDateSelection: function (evt) {
                var that = this;
                var applyLeaveThis = this;
                that.applyLeaveThis=applyLeaveThis;
                var oCalendar = evt.getSource(),
                    aSelectedDates = oCalendar.getSelectedDates();
                applyLeaveThis.calendar = oCalendar;

                // If a new date is selected
                if (aSelectedDates.length > applyLeaveThis.lastSelecetedDatesCount) {
                    var lastSelectedDate = aSelectedDates[aSelectedDates.length - 1].getStartDate(),
                        selectedLeaveType = applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey();

                    if (selectedLeaveType == "Select") {
                        oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        MessageToast.show("Please select leave type");
                        return;
                    }

                    //... Monitoring each date selection and guiding the user ...///
                    var isHalfDayLeave = applyLeaveThis.getView().byId("halfDayCheckBoxId").getSelected();
                    if (isHalfDayLeave && aSelectedDates.length > 1) {
                        oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        return;
                    } else {
                        var publicHolidaModel = this.getView().getModel("holidays").getData();
                        if (lastSelectedDate.getDay() == 0 || lastSelectedDate.getDay() == 6) {
                            MessageToast.show("It is not working Day..");
                            oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                            return;
                        }
                        else if (aSelectedDates) {
                            var datesArr = this.getRandomDates(aSelectedDates);
                            for (var i = 0; i < datesArr.length; i++) {
                                for (var j = 0; j < publicHolidaModel.length; j++) {
                                    var hol = publicHolidaModel[j].attributes.date;
                                    var monthh = publicHolidaModel[j].attributes.date.split("-")[1];
                                    var yearh = publicHolidaModel[j].attributes.date.split("-")[0];
                                    var dateh = publicHolidaModel[j].attributes.date.split("-")[2];
                                    var holidaySelected = dateh + '-' + monthh + '-' + yearh;

                                    if (holidaySelected === datesArr[i]) {
                                        MessageToast.show("It's a public holiday on " + holidaySelected + " ..");
                                        oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                                        return;
                                    } else { }
                                }
                            }
                        }

                    }
                }
            },

            applyLeave: function (oEvent) {
                var that = this;
                var endDate;
                var reslt = {}
                that.callLeave();
                // aSelectedDates = oCalendar.getSelectedDates();
                var data = that.getView().getModel().getData();
                var appliedOnObject = new Date();
                var appliedOnYear = appliedOnObject.getFullYear();
                var requestedBy = that.getView().getModel("userModel").getData().username;
                var requestedById = that.getView().getModel("userModel").getData().id;
                var datesSelected = that.calendar.getSelectedDates();
                var datesArr = that.getRandomDates(datesSelected);
                that.datesArr = datesArr;
                that.datelength = datesArr.length;
                if (datesArr.length === 0 && that.sd === "") {
                    MessageToast.show("Please Select Date to Apply for leave");
                    return;
                }
                var start_dateObject = that.calendar.getSelectedDates()[0].mProperties.startDate;
                var start_month = start_dateObject.getMonth() + 1;
                if (start_month < 10) {
                    start_month = "0" + start_month;
                }
                var start_date = start_dateObject.getDate();
                if (start_date < 10) {
                    start_date = "0" + start_date;
                }
                var start_year = start_dateObject.getFullYear();
                var startDate = start_date + "-" + start_month + "-" + start_year;
                var end_dateObject = that.byId("calSelectLeaveDates").getSelectedDates()[that.byId("calSelectLeaveDates").getSelectedDates().length - 1].getStartDate();
                var end_month = end_dateObject.getMonth() + 1;
                if (end_month < 10) {
                    end_month = "0" + end_month;
                }
                var end_date = end_dateObject.getDate();
                if (end_date < 10) {
                    end_date = "0" + end_date;
                }
                var end_year = end_dateObject.getFullYear();
                endDate = end_date + "-" + end_month + "-" + end_year;
                var days = that.calendar.getSelectedDates().length;
                data.days = days;
                that.getView().getModel("Leaves").getData().applied_leaves.push(data);
                that.getView().getModel("Leaves").updateBindings(true);
               var  selectedLeaveType = that.applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey();
                var leaveBalanceLeft = that.getLeaveBalanceLeft(that.getView().getModel("userModel").getData().p_balance_leaves, appliedOnYear);
                if (that.byId("calSelectLeaveDates").getSelectedDates().length === 0) {
                    MessageToast.show("Please Select Date to Apply for leave");
                    return;
                } else if ((selectedLeaveType !== "Unpaid Leave") && (parseInt(leaveBalanceLeft) < parseInt(days)) ){
                    MessageToast.show("Insufficient Leave Balance(You have " + leaveBalanceLeft + " leave balance)");
                    return; // Don't proceed if there are no enough balance leaves available
                } else {
                    var Err = that.ValidateApply();
                    if (Err == 0) {
                        var that = this;
                        var oPromises = [], b1 = {}, b2 = {}, i, j, k, l;
                        var batches1 = [], a, b, c;
                        var arr = that.arr;
                        var newArr = arr;
                        var arrl = newArr.length - 1;
                        for (var i = 0; i <= arrl;) {
                            a = arr[i];
                            b = arr[i + 1];
                            var cYY = arr[i].split("-")[2];
                            var cMM = arr[i].split("-")[1];
                            var cDd = arr[i].split("-")[0];
                            var cDD1 = ++cDd;
                            if (cDD1 < 10) {
                                var cDD = "0" + cDD1;
                            } else {
                                var cDD = cDD1;
                            }
                            c = cDD + '-' + cMM + '-' + cYY;
                            if (b == c) {
                                newArr = arr.shift();
                                batches1.push(a);
                            } else {

                                newArr = arr.shift();
                                batches1.push(a);
                                b1 = batches1[0];
                                k = batches1.length;
                                l = k - 1;
                                b2 = batches1[l];
                                var result = {
                                    "startDate": b1,
                                    "endDate": b2,
                                    "NoOfDays": k,
                                    "type": that.getView().byId("leaveTypeSelectId").getSelectedKey(),
                                    "status": "Requested",
                                    "reason": that.getView().byId("reasonId").getValue(),
                                    "halfDay": that.gethalfDay(),
                                    "leave_balance": that.getLeaveBalanceLeft(),
                                    "approvedBy": null,
                                    "requestedBy": requestedBy,
                                    "requestedById": requestedById
                                };

                                oPromises.push(that.applyLeaveNow(result, "noreset"));
                                batches1 = [];
                                if ((arr.length == 0)) {
                                    break;
                                }
                            }
                        }

                        Promise.all(oPromises).then(function () {
                            that.clearLeaveRequestControl();
                            MessageBox.success("Leave Applied");
                        });


                    }
                }
            },
            gethalfDay: function () {
                var that = this;

                var halfday = that.getView().byId("halfDayCheckBoxId").getProperty("selected");
                var datesSelected = that.calendar.getSelectedDates();
                var k = datesSelected.length;
                var halfDay;
                if (halfday == true) {
                    if (k == 1) {
                        halfDay = halfday;
                        return
                    } else {
                        that.getView().byId("halfDayCheckBoxId").setSelected(false);
                        MessageBox.error("Select one day to apply a half day leave");
                        return;
                    }

                } else {
                    halfDay = halfday;
                    return;
                }

            },

            getRandomDates: function (data) {
                var arr = [], temp = [], startDate;
                var that = this;
                if (data.length === 0) {
                    return [];
                }
                for (var i = 0; i < data.length; i++) {
                    var date = data[i].getProperty("startDate").getDate();
                    if (date < 10) {
                        date = "0" + date;
                    }
                    var month = data[i].getProperty("startDate").getMonth();
                    month = month + 1;
                    if (month < 10) {
                        month = "0" + month;
                    }
                    month = month.toString();
                    var year = data[i].getProperty("startDate").getFullYear();
                    startDate = date + "-" + month + "-" + year;
                    temp.push(month + "-" + date + "-" + year);
                    arr.push(startDate);

                }
                temp = that.sortDates(temp);
                that.temp = temp;
                arr = that.sortDates(arr);
                that.arr = arr;
                return arr;
            },


            sortDates: function (arr) {
                arr.sort(function (a, b) {
                    a = a.split('-').reverse().join('');
                    b = b.split('-').reverse().join('');
                    return a > b ? 1 : a < b ? -1 : 0;
                });
                return arr;
            },

            getLeaveBalanceLeft: function (data, year) {
                var data = this.getView().getModel("balanceleave").getData();
                data = data[0].attributes.balanceLeaves;
                return data;
            },

            applyLeaveNow: function (result, reset) {
                var that = this;
                var Err = this.ValidateApply();
                if (Err == 0) {
                    var updateUrl = '/deswork/api/p-leaves/';
                    $.ajax({
                        url: updateUrl,
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        }, data: JSON.stringify({
                            "data": result
                        }),
                        success: function (response) {
                           
                        },
                        error: function (error) {
                            MessageBox.success(error);
                        }
                    });
                }
                return Err;
            },

            ValidateApply: function () {
                var that = this;
                var Err = that.checkRepeatedDays();
                var thisView = this.getView();
                if (thisView.byId("reasonId").getValue() === "") {
                    thisView.byId("reasonId").setValueState("None");
                    Err++;
                    sap.m.MessageBox.error("Reason is Mandatory");
                }
                return Err;

            },

            checkRepeatedDays: function () {
                var that = this;
                var dateArr = [];
                // var id =that.getView().getModel("leave").getData().attributes.requestedById;
                var Err = 0;
                var appliedDate;
                var appliedOn = new Date();
                var appliedOnDate = new Date().getDate();
                var start_dateObject = that.calendar.getSelectedDates()[0].mProperties.startDate;
                var start_date = start_dateObject.getDate();
                var applied_month = appliedOn.getMonth() + 1;
                var applied_year = appliedOn.getFullYear();
                appliedDate = appliedOnDate + "-" + applied_month + "-" + applied_year;
                var attri = that.getView().getModel("leave").getData();
                var datesSelected = that.calendar.getSelectedDates();
                var datesArr = that.getRandomDates(datesSelected);
                if (applied_month < 10) {
                    applied_month = "0" + applied_month;
                }
                if (appliedOnDate < 10) {
                    appliedOnDate = "0" + appliedOnDate;
                }
                var start_dateObject = that.calendar.getSelectedDates()[0].mProperties.startDate;
                var start_month = start_dateObject.getMonth() + 1;
                if (start_month < 10) {
                    start_month = "0" + start_month;
                }
                var start_date = start_dateObject.getDate();
                if (start_date < 10) {
                    start_date = "0" + start_date;
                }
                var start_year = start_dateObject.getFullYear();
                var startDate = start_date + "-" + start_month + "-" + start_year;
                that.startDate = startDate;
                if ((applied_month === start_month) && (appliedOnDate > start_date)) {
                    sap.m.MessageBox.error("Cannot apply leave for past dates");
                    Err++;
                    return Err;
                } else if ((applied_year === start_year) && (applied_month > start_month)) {
                    sap.m.MessageBox.error("Cannot apply leave for past dates");
                    Err++;
                    return Err;
                } else if (startDate) {
                    var dates = [], noD;
                    for (var i = 0; i < attri.length; i++) {
                        var sd = attri[i].attributes.startDate;
                        var ed = attri[i].attributes.endDate;
                        var sdate = sd.slice(0, 2);
                        var edate = ed.slice(0, 2);
                        var smonth = sd.slice(3, 5);
                        var emonth = sd.slice(3, 5);
                        var syear = sd.slice(6, 10);
                        var eyear = sd.slice(6, 10);
                        if (syear == eyear && smonth == emonth && sdate == edate) {
                            noD = 1
                            dates.push(sd);
                            // return dates;
                        } else if ((syear <= eyear) && (smonth <= emonth) && (sdate < edate)) {
                            noD = edate - sdate;
                            for (var j = 0; j <= noD; j++) {
                                // dates.push(sd);
                                sdate = parseInt(sdate)
                                var ndate = sdate++;
                                var nd = new Date(syear, smonth, ndate);
                                var finalDate = nd.getDate();
                                if (finalDate < 10) {
                                    finalDate = "0" + finalDate;
                                }
                                var finalMonth = nd.getMonth();
                                finalMonth = finalMonth;
                                if (finalMonth < 10) {
                                    finalMonth = "0" + finalMonth;
                                }
                                finalMonth = finalMonth.toString();
                                var finalYear = nd.getFullYear();
                                var FD = finalDate + "-" + finalMonth + "-" + finalYear;
                                dates.push(FD);
                            }
                        } else if ((syear < eyear) && (smonth > emonth)) {
                            sdate = parseInt(sdate);
                            var noD1 = 31 - sdate;
                            noD = noD1 + edate;
                            for (var j = 0; j < noD; j++) {
                                sdate = parseInt(sdate)
                                var ndate = sdate + 1;
                                var nd = new Date(syear, smonth, ndate);
                                var finalDate = nd.getDate();
                                if (finalDate < 10) {
                                    finalDate = "0" + finalDate;
                                }
                                var finalMonth = nd.getMonth();
                                finalMonth = finalMonth;
                                if (finalMonth < 10) {
                                    finalMonth = "0" + finalMonth;
                                }
                                finalMonth = finalMonth.toString();
                                var finalYear = nd.getFullYear();
                                var FD = finalDate + "-" + finalMonth + "-" + finalYear;
                                dates.push(FD);
                            }
                        }
                    }

                    for (var k = 0; k < datesArr.length; k++) {
                        for (var m = 0; m < dates.length; m++) {
                            if (datesArr[k] === dates[m]) {
                                sap.m.MessageBox.error('Already leave is applied on ' + dates[m]);
                                Err++;
                                return Err;
                            }
                        }
                    }
                }
                return Err;
            },
            clearLeaveRequestControl: function () {
                var that = this;
                that.getView().byId("leaveTypeSelectId").setSelectedKey("Select");
                that.getView().byId("reasonId").setValue(""),
                    that.getView().byId("calSelectLeaveDates").removeAllSelectedDates();
                that.getView().byId("halfDayCheckBoxId").setSelected(false);
                //that.getView().byId("UploadCollection").removeAllItems();
            },

            getUserDetails: function () {
                var that = this;
                var url = 'deswork/api/users/me?populate=*';
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
                        that.callBalanceLeave(response.id);
                    }
                });
            },
            callBalanceLeave: function (id) {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[year][$eq]=';
                url = url + currentYear + '&filters[userId][$eq]=' + that.loginId;
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
            callHolidays: function () {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                $.ajax({
                    url: "deswork/api/p-holidays?filters[year][$eq]=" + currentYear,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "holidays");
                    }
                });
            },
            callLeave: function (id) {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
                 $.ajax({
                    url: "deswork/api/p-leaves?populate=*&filters[requestedById][$eq]=" + that.loginId,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "leave");
                    }
                });
            }
        });
    });
