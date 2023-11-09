sap.ui.define([

  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  '../utils/formatter',
  'sap/ui/export/Spreadsheet',
  'sap/ui/core/date/UI5Date',
  "sap/m/MessageToast"
],

  /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */

  function (Controller, JSONModel, MessageBox, formatter, Spreadsheet, UI5Date, MessageToast) {

    "use strict";
    return Controller.extend("vaspp.employeetimetracking.controller.employeetimetracking", {
      formatter: formatter,
      onInit: function () {
        var that = this;
        this.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
        that.getUserDetails();
      },
      convertToCSV: function (data) {
        const headers = Object.keys(data);
        const values = Object.values(data);
        const numRows = values.length > 0 ? values[0].length : 0;
        const csvRows = [];
        csvRows.push(headers.join(','));
        for (let i = 0; i < numRows; i++) {
          const rowData = values.map(value => value[i]);
          csvRows.push(rowData.join(','));
        }
        const csvString = csvRows.join('\n');
        return csvString;
      },
      downloadCSV: function (data, filename) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      onDownloadAppointments: function () {
        var that = this;
        $.ajax({
          url: "deswork/api/users?populate[0]=p_appointments.p_tasks",
          type: "GET",
          success: function (res) {
            var oUserData1 = JSON.parse(res);
            var theModel = new sap.ui.model.json.JSONModel(oUserData1);
            that.getView().setModel(theModel, "downloadModel");
          }
        });
        var oUserModel = that.getView().getModel("downloadModel");
        var oUserData = oUserModel.getData();
        var currYear = new Date();
        var Year = currYear.getFullYear();
        var month = currYear.getMonth();
        var Dates = currYear.getDay();
        var lastYear = Year - 1;
        var billingDateFrom = new Date(lastYear, "03", "01");
        var billingDateTo = new Date(Year, "02", "31");
        oUserData.forEach(function (user) {
          var userAppointmentsData = {};
          var username = user.username;
          var userId = user.id;
          var userAppointments = user.p_appointments || [];
          if (userAppointments.length > 0) {
            userAppointments.forEach(function (appointment) {
              var appointmentStartDate1 = appointment.startDate;
              var appointmentStartDate = new Date(appointmentStartDate1);
              var appointmentYear = appointmentStartDate.getFullYear();
              var appointmentMonth = appointmentStartDate.getMonth();
              if ((billingDateTo >= appointmentStartDate >= billingDateFrom)) {
                if (!userAppointmentsData[userId]) {
                  userAppointmentsData[userId] = {
                    'Title': [],
                    'Description': [],
                    'Task': [],
                    'Start Date': [],
                    'End Date': [],
                    'Hours Taken': [],
                    'Status': []
                  };
                }
                userAppointmentsData[userId]['Title'].push(appointment.name);
                userAppointmentsData[userId]['Description'].push(appointment.description);
                if ((appointment.p_tasks.length > 0) && (appointment.p_tasks[0].name)) {
                  userAppointmentsData[userId]['Task'].push(appointment.p_tasks[0].name);
                }
                userAppointmentsData[userId]['Start Date'].push(appointment.startDate);
                userAppointmentsData[userId]['End Date'].push(appointment.endDate);
                userAppointmentsData[userId]['Hours Taken'].push(appointment.noOfHours);
                userAppointmentsData[userId]['Status'].push(appointment.status);
              } else if ((Year === appointmentYear) && ("2" < appointmentMonth)) {
                if (!userAppointmentsData[userId]) {
                  userAppointmentsData[userId] = {
                    'Title': [],
                    'Description': [],
                    'Task': [],
                    'Start Date': [],
                    'End Date': [],
                    'Hours Taken': [],
                    'Status': []
                  };
                }
                userAppointmentsData[userId]['Title'].push(appointment.name);
                userAppointmentsData[userId]['Description'].push(appointment.description);
                if ((appointment.p_tasks.length > 0) && (appointment.p_tasks[0].name)) {
                  userAppointmentsData[userId]['Task'].push(appointment.p_tasks[0].name);
                }
                userAppointmentsData[userId]['Start Date'].push(appointment.startDate);
                userAppointmentsData[userId]['End Date'].push(appointment.endDate);
                userAppointmentsData[userId]['Hours Taken'].push(appointment.noOfHours);
                userAppointmentsData[userId]['Status'].push(appointment.status);
              } else if ((Year === appointmentYear) && ("2" >= appointmentMonth)) {
                if (!userAppointmentsData[userId]) {
                  userAppointmentsData[userId] = {
                    'Title': [],
                    'Description': [],
                    'Task': [],
                    'Start Date': [],
                    'End Date': [],
                    'Hours Taken': [],
                    'Status': []
                  };
                }
                userAppointmentsData[userId]['Title'].push(appointment.name);
                userAppointmentsData[userId]['Description'].push(appointment.description);
                if ((appointment.p_tasks.length > 0) && (appointment.p_tasks[0].name)) {
                  userAppointmentsData[userId]['Task'].push(appointment.p_tasks[0].name);
                }
                userAppointmentsData[userId]['Start Date'].push(appointment.startDate);
                userAppointmentsData[userId]['End Date'].push(appointment.endDate);
                userAppointmentsData[userId]['Hours Taken'].push(appointment.noOfHours);
                userAppointmentsData[userId]['Status'].push(appointment.status);
              }
            });
            var userData = userAppointmentsData[userId];
            var userAppointmentsCSVData = this.convertToCSV(userData);
            var fileName = username + '_Appointments.csv';
            this.downloadCSV(userAppointmentsCSVData, fileName);
          }
        }, this);
      },
      getUserDetails: function () {
        var that = this;
        that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        $.ajax({
          url: "deswork/api/users?populate[0]=p_tasks&populate[1]=p_appointments'&filters[id]=" + that.loginId,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var theModel2 = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(theModel2, "managerDownloadModel");
            var role = response[0].designation;
            that.role = role;
            if (that.role == "Manager") {
              $.ajax({
                url: "/deswork/api/p-projects?populate=*&filters[users_permissions_users][id]=" + that.loginId,
                type: "GET",
                success: function (res) {
                  var response = JSON.parse(res);
                  var theModel = new sap.ui.model.json.JSONModel(response.data);
                  that.getView().setModel(theModel, "projectModel");
                  var projects = that.getView().getModel("projectModel").getData();
                  var peopleUnderPrjctManager = [], peopleUnderPrjctManager1 = [];
                  for (var i = 0; i < projects.length; i++) {
                    var projectDatalength = projects[i].attributes.users_permissions_users.data.length;
                    for (var j = 0; j < projectDatalength; j++) {
                      peopleUnderPrjctManager1.push(projects[i].attributes.users_permissions_users.data[j].id);
                    }
                    // Convert the array to a Set to remove duplicates
                    var uniqueNumbers = new Set(peopleUnderPrjctManager1);

                    // Convert the Set back to an array
                    var peopleUnderPrjctManager = Array.from(uniqueNumbers);
                    var peopleUnderPrjctManagerL = peopleUnderPrjctManager.length;
                    $.ajax({
                      url: 'deswork/api/users?populate[0]=p_tasks&populate[1]=p_appointments',
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      success: function (response) {
                        var response = JSON.parse(response);
                        // var response1 = response.data;
                        var usersLength = response.length;
                        var oModel1 = new sap.ui.model.json.JSONModel();
                        var oModel = new sap.ui.model.json.JSONModel();
                        var data = [];
                        for (var k = 0; k < usersLength; k++) {
                          var id = response[k].id;
                          var roles = response[k].designation;
                          for (var m = 0; m < peopleUnderPrjctManagerL; m++) {
                            if ((id === peopleUnderPrjctManager[m]) && (roles !== "Manager") && (roles !== "HR") && (roles !== "SuperAdmin")) {
                              data.push(response[k]);
                            }
                          }
                        }
                        for (var n = 0; n < data.length; n++) {
                          for (var p = 0; p < data[n].p_appointments.length; p++) {
                            data[n].p_appointments[p].startDate = UI5Date.getInstance(data[n].p_appointments[p].startDate);
                            data[n].p_appointments[p].endDate = UI5Date.getInstance(data[n].p_appointments[p].endDate);
                          }
                        }
                        oModel.setData(data);
                        that.getView().setModel(oModel);
                      }
                    });
                  }
                }
              });
            } else {
              var url = 'deswork/api/users?populate[0]=p_tasks&populate[1]=p_appointments';
              $.ajax({
                url: url,
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                },
                success: function (response) {
                  var arr = [];
                  response = JSON.parse(response);
                  var oModel = new sap.ui.model.json.JSONModel();
                  for (var i = 0; i < response.length; i++) {
                    for (var k = 0; k < response[i].p_appointments.length; k++) {
                      response[i].p_appointments[k].startDate = UI5Date.getInstance(response[i].p_appointments[k].startDate);
                      response[i].p_appointments[k].endDate = UI5Date.getInstance(response[i].p_appointments[k].endDate);
                    }
                  }
                  oModel.setData(response);
                  that.getView().setModel(oModel);
                }
              });
            }
          }
        });

      },
      onObjectMatched: function (oEvent) {
        var that = this;
        that.getView().setModel(new JSONModel({}));
        
      },
      handleAppointmentSelect: function (oEvent) {
        var that = this;
        if (!this.AppointmentInfo) {
          this.AppointmentInfo = sap.ui.xmlfragment("vaspp.employeetimetracking.fragment.AppointmentInformation", this);
          this.getView().addDependent(this.AppointmentInfo);
        }
        var bindingContext = oEvent.getParameter("appointment").getBindingContext();
        var taskData = bindingContext.getObject();
        var url = "deswork/api/p-appointments/" + taskData.id + "?populate=*";
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mAppointDetails");
            var mAppointDetails = that.getView().getModel("mAppointDetails");
            var p_tasks = null;
            var p_sub_tasks = null;
            if (mAppointDetails && mAppointDetails.getData() && mAppointDetails.getData().attributes && mAppointDetails.getData().attributes.p_tasks && mAppointDetails.getData().attributes.p_tasks.data && mAppointDetails.getData().attributes.p_tasks.data.length > 0 && mAppointDetails.getData().attributes.p_tasks.data[0].attributes.name) {
              p_tasks = mAppointDetails.getData().attributes.p_tasks.data[0].attributes.name;
            }
            if (mAppointDetails && mAppointDetails.getData() && mAppointDetails.getData().attributes && mAppointDetails.getData().attributes.p_sub_tasks && mAppointDetails.getData().attributes.p_sub_tasks.data && mAppointDetails.getData().attributes.p_sub_tasks.data.length > 0 && mAppointDetails.getData().attributes.p_sub_tasks.data[0].attributes.name) {
              p_sub_tasks = mAppointDetails.getData().attributes.p_sub_tasks.data[0].attributes.name;
            }
            that.taskId = taskData.id;
            var taskName = taskData.name;
            var taskDescription = taskData.description;
            var startDate = taskData.startDate;
            var endDate = taskData.endDate;
            var noOfHours = taskData.noOfHours;
            var Comment = taskData.Comment;
            var status = taskData.status;
            var taskModel = new sap.ui.model.json.JSONModel();
            taskModel.setData({
              id: that.taskId,
              name: taskName,
              description: taskDescription,
              startDate: startDate,
              endDate: endDate,
              noOfHours: noOfHours,
              p_tasks: p_tasks,
              p_sub_tasks: p_sub_tasks,
              Comment: Comment,
              status: status
            });
            that.getView().setModel(taskModel, "taskModel");
            that.AppointmentInfo.open();
          },
          error: function (res) {
            console.log(res);
          }
        });
      },
      handleSelectionFinish: function (oEvent) {
        var aSelectedKeys = oEvent.getSource().getSelectedKeys();
        this.byId("PC1").setBuiltInViews(aSelectedKeys);
      },
      handleAppointmentCancel: function () {
        var that = this;
        that.AppointmentInfo.close();
      },
      handleAppointmentApprove: function (oEvent) {
        //oEvent
        var that = this;
        this.Appointid = oEvent.getSource().getModel("taskModel").oData.id;
        that.AppointmentStatus = {
          Comment: this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[24].getValue(),
          status: "Approved"
        }
        MessageBox.confirm("Are you sure you want to Approve ?", {
          actions: ["Yes", "No"],
          emphasizedAction: "Yes",
          onClose: function (evt) {
            if (evt == "Yes") {
              $.ajax({
                url: "/deswork/api/p-appointments/" + that.Appointid,
                type: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                data: JSON.stringify({
                  data: that.AppointmentStatus,
                }),
                success: function (res) {
                  var getValues = JSON.parse(res);
                  if (getValues.error) {
                    MessageBox.error(getValues.error.message);
                  } else {
                    that.AppointmentInfo.close();
                    MessageToast.show("Time sheet has been Approved!");
                    that.getUserDetails();
                    // that.AppointmentInfo.close();

                  }
                },
              });
            }
          }
        }

        )

      },
      handleAppointmentReject: function (oEvent) {
        // if (!this.Comment) {
        //   this.Comment = sap.ui.xmlfragment("vaspp.employeetimetracking.fragment.Comment", this);
        //   this.getView().addDependent(this.Comment);
        //   that.Comment.open();
        // }


        var that = this;
        this.Appointid = oEvent.getSource().getModel("taskModel").oData.id;
        that.updatedProject = {
          Comment: this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[24].getValue(),
          status: "Rejected"
          // type:"Type03"
        }
        MessageBox.confirm("Are you sure you want to Reject  ?", {
          actions: ["Yes", "No"],
          emphasizedAction: "Yes",
          onClose: function (evt) {
            if (evt == "Yes") {
              $.ajax({
                url: "/deswork/api/p-appointments/" + that.Appointid,
                type: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                data: JSON.stringify({
                  data: that.updatedProject,
                }),
                success: function (res) {
                  var getValues = JSON.parse(res);
                  if (getValues.error) {
                    MessageBox.error(getValues.error.message);
                  } else {
                    that.AppointmentInfo.close();
                    MessageToast.show("Time sheet has been Rejected!");
                    that.getUserDetails();

                  }
                },
              });
            }
          }
        }
        )
      },

    });

  });
