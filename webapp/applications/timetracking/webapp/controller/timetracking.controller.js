sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "../utils/formatter",
  "sap/ui/core/date/UI5Date"
],

  /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */

  function (Controller, JSONModel, MessageBox, formatter, UI5Date) {
    "use strict";
    return Controller.extend("vaspp.timetracking.controller.timetracking", {

      formatter: formatter,

      onInit: function () {
        var that = this;
        that.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
        this.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        that.getUserDetails();
        that.getAppointmentDetails();
        that.getUserProject();
        that.checkRepeatedTime();
        // that.getUserTask();
        that.callHolidays();
      },



      getUserDetails: function () {
        var that = this;
        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
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
            for (var j = 0; j < response.p_appointments.length; j++) {
              response.p_appointments[j].startDate = UI5Date.getInstance(response.p_appointments[j].startDate);
              response.p_appointments[j].endDate = UI5Date.getInstance(response.p_appointments[j].endDate);
            }
            arr.push(response);
            oModel.setData(arr);
            that.getView().setModel(oModel);

          }
        });
      },

      //for select Task
      getUserTask: function (oEvent) {
        var that = this;
        var url = "deswork/api/p-tasks?populate=*&filters[users_permissions_user][id][$eq]=" + this.loginId;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mUserTasks");

          },
          error: function (res) {

          }

        });
      },
      onSelectProject: function (oEvent) {
        var that = this;
        this.projectid = oEvent.getParameter("selectedItem").mProperties.key;
        that.projectID = JSON.parse(this.projectid);
        this._AppointmentContext.getContent()[2].getContent()[5].setSelectedKey() === ""
        this._AppointmentContext.getContent()[2].getContent()[7].setSelectedKey() === ""
        var loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        //  var url: "deswork/api/p-tasks?populate[0]=p_sub_tasks&filters[users_permissions_user][id]=" + loginId + "&filters[p_project][id]=" +  that.projectID,
        $.ajax({
          url: "deswork/api/p-tasks?populate[0]=p_sub_tasks&filters[users_permissions_user][id]=" + loginId + "&filters[p_project][id]=" + that.projectID,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mUserTasks");

          },
          error: function (res) {
          }
        });
      },
      getUserProject: function (oEvent) {
        var that = this;
        var loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        $.ajax({
          url: "/deswork/api/p-projects?populate=*&filters[users_permissions_users][id]=" + loginId,
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);
            var theModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(theModel, "myproject");
            var oModel = that.getView().getModel("myproject");
          },
          error: function (res) {

          }
        });

      },

      onSelectTask: function (oEvent) {
        var that = this;
        this.taskid = oEvent.getParameter("selectedItem").mProperties.key;
        that.taskID = JSON.parse(this.taskid);
        this._AppointmentContext.getContent()[2].getContent()[7].setSelectedKey() === ""
        var url = "deswork/api/p-sub-tasks?populate=*&filters[p_task][id][$eq]=" + that.taskID;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mUserSubTask");
          },
          error: function (res) {

            //MessageBox.error(res + "Something went wroung");
          }
        });
      },
      //
      getAppointmentDetails: function () {
        var that = this;
        var url = "deswork/api/p-appointments?populate=*&filters[users_permissions_users][id]=" + this.loginId;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mAppointDetails");
          },
          error: function (res) {

            MessageBox.error(res + "Something went wroung");
          }
        });
      },

      //for Edit Name Select
      getAppointmentDetailsEdit: function () {
        var that = this;
        var url = "deswork/api/p-appointments/" + this.taskId + "?populate=*";
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mAppointDetails");
          },
          error: function (res) {

            MessageBox.error(res + "Something went wroung");
          }
        });
      },
      //
      onObjectMatched: function (oEvent) {
        var that = this;
        that.getView().setModel(new JSONModel({}));
      },

      handleAppointmentCreate: function (oEvent) {
        var that = this;
        if (!this._AddAppointment) {
          this._AddAppointment = sap.ui.xmlfragment("calid", "vaspp.timetracking.fragment.CreateAppointment", this);
          this.getView().addDependent(this._AddAppointment);
        }
        this._AddAppointment.open();
        //  }
      },

      handleAppointmentEdit: function (oEvent) {
        if (!this._EditAppointment) {
          this._EditAppointment = sap.ui.xmlfragment("caleditid", "vaspp.timetracking.fragment.EditAppointment", this);
          this.getView().addDependent(this._EditAppointment);
        }
        var mModel = new sap.ui.model.json.JSONModel(this.getView().getModel().getData());
        this._EditAppointment.setModel(mModel);
        this.getAppointmentDetailsEdit();
        var ch = this.getView().getModel("mAppointDetails").getData();
        // this._EditAppointment.getContent()[0].getContent()[1].setValue(ch.attributes.name);
        this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[1].setValue(ch.attributes.name)
        // this._EditAppointment.getContent()[0].getContent()[3].setValue(ch.attributes.description);
        this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[3].setValue(ch.attributes.description)
        // this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_tasks.data[0].id) ? this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_tasks.data[0].id) :"";
        // this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(ch.attributes.p_sub_tasks.data[0].id) ? this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_sub_tasks.data[0].id): null;
        if (ch.attributes.p_tasks.data.length > 0) {
          this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[5].setSelectedKey(ch.attributes.p_tasks.data[0].id);
        } else {
          this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[5].setSelectedKey(null);
        }
        if (ch.attributes.p_sub_tasks.data.length > 0) {
          this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[7].setValue(ch.attributes.name);
        } else {
          this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[7].setSelectedKey(null);
        }
        var startDate = UI5Date.getInstance(ch.attributes.startDate);
        var endDate = UI5Date.getInstance(ch.attributes.endDate)

        // this._EditAppointment.getContent()[0].getContent()[9].setValue(startDate).;
        this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[9].setDateValue(startDate).mProperties.value;
        this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[11].setDateValue(endDate).mProperties.value
        // this._EditAppointment.getContent()[0].getContent()[11].setValue(ch.attributes.endDate);
        this._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[13].setValue(ch.attributes.noOfHours);
        this._EditAppointment.open();
      },
      handleAppointmentEditA: function () {
        var that = this;
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[3].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[9].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[12].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[15].setVisible(true);

        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[5].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[11].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[14].setVisible(false);
      },
      handleAppointmentCancel: function () {
        var that = this;
        that.AppointmentInfo.close();
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setEditable(false);
      },
      handleAppointmentCancel1: function () {
        var that = this;
        that._EditAppointment.close();
        that.AppointmentInfo.close();
      },
      onSelectedEdit: function (oEvent) {

      },
      onSelectName: function (oEvent) {
        var that = this;
        that.cseltext = oEvent.getParameter("selectedItem").getProperty("key");
        // that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url: "deswork/api/p-appointments/" + that.cseltext + "?populate=*",
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);

            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");

            var check = that.getView().getModel("mCsfDetails").getData().attributes;
            that._EditAppointment.getContent()[0].getContent()[3].setValue(check.description);
            that._EditAppointment.getContent()[0].getContent()[5].setValue(check.startDate);
            that._EditAppointment.getContent()[0].getContent()[7].setValue(check.endDate);

          },
          error: function (res) {

            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      handleDialogEditSaveButton: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-appointments/" + that.taskId + "?populate=*",
          type: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            "data": {
              "users_permissions_users": that.loginId,
              "name": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[1].getValue(),
              "description": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[3].getValue(),
              "p_tasks": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[5].getSelectedKey() ? that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[5].getSelectedKey() : null,
              "p_sub_tasks": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[7].getSelectedKey() ? that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[7].getSelectedKey() : null,
              "startDate": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[9].getDateValue(),
              "endDate": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[11].getDateValue(),
              "noOfHours": that._EditAppointment.getContent()[0].mAggregations.items[0]._aElements[13].getValue(),
              "status": "Applied"
            }
          }),
          success: function (response) {
            var resValue = JSON.parse(response);

            if (resValue.error) {
              MessageBox.error(resValue.error.message);
            } else {
              that._EditAppointment.close();
              that.AppointmentInfo.close();
              that.getAppointmentDetails();
              MessageBox.success("Appointment Updated Successfully");
              that.getUserDetails();
              that.onInit();
              that.clearSaveEdit();
            }
          }
        });
      },
      clearSaveEdit: function () {
        var that = this;
        this._EditAppointment.getContent()[0].getContent()[1].setValue(),
          this._EditAppointment.getContent()[0].getContent()[3].setValue(),
          this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(),
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(),
          this._EditAppointment.getContent()[0].getContent()[9].setDateValue(),
          this._EditAppointment.getContent()[0].getContent()[11].setDateValue(),
          this._EditAppointment.getContent()[0].getContent()[13].setValue()
      },
      handleDialogEditSaveButtonA: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-appointments/" + that.DeleteAId + "?populate=*",
          type: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            "data": {
              "users_permissions_users": this.loginId,
              "name": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].getValue(),
              "description": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].getValue(),
              "startDate": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].getDateValue(),
              "endDate": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].getDateValue(),
            }
          }),
          success: function (response) {
            var resValue = JSON.parse(response);

            if (resValue.error) {
              //MessageBox.error(resValue.error.message);
            } else {
              that.AppointmentInfo.close();
              that.getAppointmentDetails();
              MessageBox.success("Updated Successfully");
              that.getUserDetails();
              that.onInit();
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setEditable(false);
            }
          }
        });
      },
      handleDialogEditCancelButton: function () {
        var that = this;
        that._EditAppointment.close();
        that.AppointmentInfo.close();
      },

      handleCreateChange: function (oEvent) {
        var that = this;
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var inputDate = new Date(startDate);
        var formattedDate = inputDate.toISOString().split('T')[0];

        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
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

            var totalHoursWorked = 0; // Variable to store total hours worked

            for (var j = 0; j < response.p_appointments.length; j++) {
              response.p_appointments[j].startDate = UI5Date.getInstance(response.p_appointments[j].startDate);
              response.p_appointments[j].endDate = UI5Date.getInstance(response.p_appointments[j].endDate);

              // Check if the startDate matches the formattedDate
              if (formattedDate === response.p_appointments[j].startDate.toISOString().split('T')[0]) {
                var startTime = response.p_appointments[j].startDate.getTime();
                var endTime = response.p_appointments[j].endDate.getTime();
                var duration = (endTime - startTime) / (1000 * 60 * 60);
                // Calculate duration in hours

                totalHoursWorked += duration; // Accumulate the duration

              }
            }
            this.totalHoursWorked = totalHoursWorked;
            if (totalHoursWorked >= 8) {
              MessageBox.error("8 hours exceeded");
              that._AddAppointment.close();
            }


            arr.push(response);
            oModel.setData(arr);
            that.getView().setModel(oModel);
          }
        });
      },


      handleCreateChange1: function (oEvent) {
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var endDate = this._AddAppointment.getContent()[0].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._AddAppointment.close();
        }
        else {
          this._AddAppointment.getContent()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
        }
      },
      handleCreateChangeEdit: function (oEvent) {
        var startDate = this._EditAppointment.getContent()[0].getItems()[0].getContent()[9].getDateValue()
        var endDate = this._EditAppointment.getContent()[0].getItems()[0].getContent()[11].getDateValue()
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._EditAppointment.close();
        }
        this._EditAppointment.getContent()[0].getItems()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
      },
      handleCreateChangeEdit1: function (oEvent) {
        var startDate = this._EditAppointment.getContent()[0].getItems()[0].getContent()[9].getDateValue()
        var endDate = this._EditAppointment.getContent()[0].getItems()[0].getContent()[11].getDateValue()
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._EditAppointment.close();
        }
        this._EditAppointment.getContent()[0].getItems()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
      },

      handleDialogSaveButton: function () {
        var that = this;
        var Err = this.ValidateCreateCust();
        if (Err == 0) {
          $.ajax({
            url: "/deswork/api/p-appointments?populate=*",
            type: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify({
              "data": {
                "users_permissions_users": this.loginId,
                "name": this._AddAppointment.getContent()[0].getContent()[1].getValue(),
                "description": this._AddAppointment.getContent()[0].getContent()[3].getValue(),
                "p_tasks": this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey() ? this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey() : null,
                "p_sub_tasks": this._AddAppointment.getContent()[0].getContent()[7].getSelectedKey() ? this._AddAppointment.getContent()[0].getContent()[7].getSelectedKey() : null,
                "startDate": this._AddAppointment.getContent()[0].getContent()[9].getDateValue(),
                "endDate": this._AddAppointment.getContent()[0].getContent()[11].getDateValue(),
                "noOfHours": this._AddAppointment.getContent()[0].getContent()[13].getValue()
              }
            }),
            success: function (response) {
              var resValue = JSON.parse(response);

              if (resValue.error) {
                MessageBox.error(resValue.error.message);
              } else {
                that._AddAppointment.close();
                that.getAppointmentDetails();
                MessageBox.success("Added Successfully");
                that.getUserDetails();
                that.onInit();
                that.clearSave();
              }
            }
          });
        }
        else {
          this.getView().setBusy(false);
          var text = "Mandatory Fields are Required";
          MessageBox.error(text);
        }
      },
      clearSave: function () {
        var that = this;
        this._AddAppointment.getContent()[0].getContent()[1].setValue(),
          this._AddAppointment.getContent()[0].getContent()[3].setValue(),
          this._AddAppointment.getContent()[0].getContent()[5].setSelectedKey(),
          this._AddAppointment.getContent()[0].getContent()[7].setSelectedKey(),
          this._AddAppointment.getContent()[0].getContent()[9].setDateValue(),
          this._AddAppointment.getContent()[0].getContent()[11].setDateValue(),
          this._AddAppointment.getContent()[0].getContent()[13].setValue()
      },
      handleDialogCancelButton: function () {
        var that = this;
        that.clearSave();
        that._AddAppointment.close();

      },
      handleAppointmentSelect: function (oEvent) {
        var that = this;
        if (!this.AppointmentInfo) {
          this.AppointmentInfo = sap.ui.xmlfragment("idaPPo", "vaspp.timetracking.fragment.AppointmentInfo", this);
          this.getView().addDependent(this.AppointmentInfo);
        }
        var bindingContext = oEvent.getParameter("appointment").getBindingContext();
        var taskData = bindingContext.getObject();
        that.SelectedId = taskData.id;
        var userInfo = bindingContext.getModel().oData[0].p_appointments;
        for (var i = 0; i < userInfo.length; i++) {
          if (taskData.id === userInfo[i].id) {
            var url = "deswork/api/p-appointments/" + userInfo[i].id + "?populate=*";
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
                // load this selected appointment before opening
                that.getAppointmentDetailsEdit();
                // Open the fragment using the byId function
                that.AppointmentInfo.open();
              },
              error: function (res) {

                // MessageBox.error(res + "Something went wrong");
              }
            });
          }
        }
      },

      //TO CHECK DATA VALIDATION
      ValidateCreateCust: function () {
        var Err = 0;
        if (this._AddAppointment.getContent()[0].getContent()[1].getValue() === "" || this._AddAppointment.getContent()[0].getContent()[1].getValue() == null) {
          Err++;
        }
        else {
          this._AddAppointment.getContent()[0].getContent()[1].setValueState("None");
        }
        if (this._AddAppointment.getContent()[0].getContent()[3].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[3].setValueState("None");
          Err++;
        }
        if (this._AddAppointment.getContent()[0].getContent()[9].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[9].setValueState("None");
          Err++;
        }
        if (this._AddAppointment.getContent()[0].getContent()[11].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[11].setValueState("None");
          Err++;
        }
        return Err;
      },

      checkRepeatedTime: function () {
        var that = this;
        that.getAppointmentDetailsEdit();
        //  that.getView().getModel("")
        var startDateTime = that.getView().getModel("mAppointDetails");
      },
      handleAppointmentDelete: function () {
        var that = this;
        //  this.taskData.id;
        that.SelectedId;
        MessageBox.confirm("Are you sure you want to Delete  ?", {
          actions: ["Yes", "No"],
          emphasizedAction: "Yes",
          onClose: function (evt) {
            if (evt == "Yes") {
              $.ajax({
                url: "/deswork/api/p-appointments/" + that.SelectedId + "?populate=*",
                type: "DELETE",
                success: function (response) {
                  var resValue = JSON.parse(response);

                  if (resValue.error) {
                    MessageBox.error(resValue.error.message);
                  } else {
                    that.AppointmentInfo.close();
                    that.getAppointmentDetails();
                    MessageBox.success("Deleted Successfully");
                    that.getUserDetails();
                    that.onInit();
                  }
                }
              })
            }
          }
        }
        );
      },
      timecalculation: function (oEvent) {
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var endDate = this._AddAppointment.getContent()[0].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        this._AddAppointment.getContent()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
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

      handleAppointmentAddWithContext: function (oEvent) {
        var that = this
        var selectedDate = oEvent.getParameters().startDate;
        var selectedDate1 = new Date(selectedDate);
        var today = new Date();
        var publicHolidaModel = this.getView().getModel("holidays").getData();
        if (!this._AppointmentContext) {
          this._AppointmentContext = sap.ui.xmlfragment("calid", "vaspp.timetracking.fragment.AppointmentWithContent", this);
          this.getView().addDependent(this._AppointmentContext);
        }
        if (selectedDate1.getDay() == 0 || selectedDate1.getDay() == 6) {
          MessageBox.error("It is not working Day.");
          return;
        } else if (selectedDate1) {
          for (var j = 0; j < publicHolidaModel.length; j++) {
            var hol = publicHolidaModel[j].attributes.date;
            var monthh = publicHolidaModel[j].attributes.date.split("-")[1];
            var yearh = publicHolidaModel[j].attributes.date.split("-")[0];
            var dateh = publicHolidaModel[j].attributes.date.split("-")[2];
            var holidaySelected = dateh + '-' + monthh + '-' + yearh;
            var dateSelected = selectedDate1.getDate();
            if (dateSelected < 10) {
              var dateSelected = '0' + dateSelected;
            } else {
              var dateSelected = dateSelected;
            }
            var monthSelected = selectedDate1.getMonth() + 1;
            if (monthSelected < 10) {
              var monthSelected = '0' + monthSelected;
            } else {
              var monthSelected = monthSelected;
            }
            var yearSelected = selectedDate1.getFullYear();
            var alteredDateSelected = dateSelected + '-' + monthSelected + '-' + yearSelected;

            if (holidaySelected === alteredDateSelected) {
              MessageBox.error("It's a public holiday on " + holidaySelected + " ..");
              return;
            }
          }
          if (today >= selectedDate1) {
            this._AppointmentContext.getContent()[2].getContent()[9].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[2].getContent()[9].setMaxDate(today);


            this._AppointmentContext.getContent()[2].getContent()[11].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[2].getContent()[11].setMaxDate(today);

            this._AppointmentContext.getContent()[3].getContent()[1].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[3].getContent()[1].setMaxDate(today);

            this._AppointmentContext.getContent()[5].getContent()[1].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[5].getContent()[1].setMaxDate(today);

            this._AppointmentContext.getContent()[5].getContent()[3].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[5].getContent()[3].setMaxDate(today);

            this._AppointmentContext.getContent()[4].getContent()[3].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[4].getContent()[3].setMaxDate(today);

            this._AppointmentContext.getContent()[4].getContent()[5].setDateValue(selectedDate1);
            this._AppointmentContext.getContent()[4].getContent()[5].setMaxDate(today);
            that._AppointmentContext.open();
          } else {
            MessageBox.error("Cannot Enter Appointment for Future Date.")
          }
        }

      },

      handleCreateChange3: function (oEvent) {
        var that = this;
        var newStartDate1 = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
        var newEndDate1 = new Date(startDate);
        var newStartDate = new Date(newStartDate1);
        var newEndDate = new Date(newEndDate1);


        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            // var arr = [];
            response = JSON.parse(response);
            for (var j = 0; j < response.p_appointments.length; j++) {
              var eStartDate1 = response.p_appointments[j].startDate;
              var eEndDate1 = response.p_appointments[j].endDate;
              var eStartDate = new Date(eStartDate1);
              var eEndDate = new Date(eEndDate1);
              if ((newStartDate >= eStartDate && newStartDate <= eEndDate) || (newEndDate >= eStartDate && newEndDate <= eEndDate)) {
                MessageBox.error("Collision: The selected date and time collide with an existing entry.");
                return;
              }
            }
          }
        });

        var startDate = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
        var endDate = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
        var formattedDate = inputDate.toISOString().split('T')[0];
        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
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

            var totalHoursWorked = 0; // Variable to store total hours worked

            for (var j = 0; j < response.p_appointments.length; j++) {
              response.p_appointments[j].startDate = UI5Date.getInstance(response.p_appointments[j].startDate);
              response.p_appointments[j].endDate = UI5Date.getInstance(response.p_appointments[j].endDate);

              // Check if the startDate matches the formattedDate
              if (formattedDate === response.p_appointments[j].startDate.toISOString().split('T')[0]) {
                var startTime = response.p_appointments[j].startDate.getTime();
                var endTime = response.p_appointments[j].endDate.getTime();
                var duration = (endTime - startTime) / (1000 * 60 * 60);
                // Calculate duration in hours

                totalHoursWorked += duration; // Accumulate the duration

              }
            }
            this.totalHoursWorked = totalHoursWorked;
            if (totalHoursWorked >= 8) {
              MessageBox.error("8 hours exceeded");
              that._AddAppointment.close();
            }


            arr.push(response);
            oModel.setData(arr);
            that.getView().setModel(oModel);
          }
        });
      },


      handleCreateChange4: function (oEvent) {
        var newStartDate1 = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
        var newEndDate1 = this._AppointmentContext.getContent()[2].getContent()[11].getDateValue();
        var newStartDate = new Date(newStartDate1);
        var newEndDate = new Date(newEndDate1);
        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            // var arr = [];
            response = JSON.parse(response);
            for (var j = 0; j < response.p_appointments.length; j++) {
              var eStartDate1 = response.p_appointments[j].startDate;
              var eEndDate1 = response.p_appointments[j].endDate;
              var eStartDate = new Date(eStartDate1);
              var eEndDate = new Date(eEndDate1);
              if ((newStartDate >= eStartDate && newStartDate <= eEndDate) || (newEndDate >= eStartDate && newEndDate <= eEndDate)) {
                MessageBox.error("Collision: The selected date and time collide with an existing entry.");
                return;
              }
            }
          }
        });

        var startDate = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
        var endDate = this._AppointmentContext.getContent()[2].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._AppointmentContext.close();
        }
        else {
          this._AppointmentContext.getContent()[2].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
        }
      },
      handleCreateChange5: function (oEvent) {
        var that = this;
        // // Assuming existingEntries is an array of existing date and time entries
        var newStartDate1 = this._AppointmentContext.getContent()[4].getContent()[3].getDateValue();
        var newEndDate1 = this._AppointmentContext.getContent()[4].getContent()[5].getDateValue();
        var newStartDate = new Date(newStartDate1);
        var newEndDate = new Date(newEndDate1);
        // if( newStartDate >= newEndDate){
        //   MessageBox.error("End time  is less than start time.");
        //   return
        // }
        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            // var arr = [];
            response = JSON.parse(response);
            for (var j = 0; j < response.p_appointments.length; j++) {
              var eStartDate1 = response.p_appointments[j].startDate;
              var eEndDate1 = response.p_appointments[j].endDate;
              var eStartDate = new Date(eStartDate1);
              var eEndDate = new Date(eEndDate1);
              if ((newStartDate >= eStartDate && newStartDate <= eEndDate) || (newEndDate >= eStartDate && newEndDate <= eEndDate)) {
                MessageBox.error("Collision: The selected date and time collide with an existing entry.");
                return;
              }
            }
          }
        });

        var startDate = this._AppointmentContext.getContent()[4].getContent()[3].getDateValue();
        var endDate = this._AppointmentContext.getContent()[4].getContent()[5].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._AppointmentContext.close();
        }
        else {
          this._AppointmentContext.getContent()[4].getContent()[7].setValue(hours + " hours " + minutes + " minutes");
        }
      },
      handleCreateChange6: function (oEvent) {
        var newStartDate1 = this._AppointmentContext.getContent()[5].getContent()[1].getDateValue();
        var newEndDate1 = this._AppointmentContext.getContent()[5].getContent()[3].getDateValue();
        var newStartDate = new Date(newStartDate1);
        var newEndDate = new Date(newEndDate1);
        // if( newStartDate >=newEndDate){
        //   MessageBox.error("End time  is less than start time.");
        //   return
        // }

        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            // var arr = [];
            response = JSON.parse(response);
            for (var j = 0; j < response.p_appointments.length; j++) {
              var eStartDate1 = response.p_appointments[j].startDate;
              var eEndDate1 = response.p_appointments[j].endDate;
              var eStartDate = new Date(eStartDate1);
              var eEndDate = new Date(eEndDate1);
              if ((newStartDate >= eStartDate && newStartDate <= eEndDate) || (newEndDate >= eStartDate && newEndDate <= eEndDate)) {
                MessageBox.error("Collision: The selected date and time collide with an existing entry.");
                return;
              }
            }
          }
        });
        var startDate = this._AppointmentContext.getContent()[5].getContent()[1].getDateValue();
        var endDate = this._AppointmentContext.getContent()[5].getContent()[3].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._AppointmentContext.close();
        }
        else {
          this._AppointmentContext.getContent()[5].getContent()[7].setValue(hours + " hours " + minutes + " minutes");
        }
      },
      handleAppDialogCancelButton: function () {
        var that = this;
        that.clearSave1();
        that._AppointmentContext.close();
      },
      onSelectChange: function (oEvent) {
        debugger
        var that = this;
        var oProjectForm = that._AppointmentContext.getContent()[2];
        var oOutOfOfficeForm = that._AppointmentContext.getContent()[3];
        var oInternalForm = that._AppointmentContext.getContent()[4];
        var oTraining = that._AppointmentContext.getContent()[5];
        that.SelectedButton = oEvent.getParameters().selectedItem.getKey();

        if (that.SelectedButton === "Projects") {
          oProjectForm.setVisible(true);
          oOutOfOfficeForm.setVisible(false);
          oInternalForm.setVisible(false);
          oTraining.setVisible(false);
        } else if (that.SelectedButton === "OutOfOffice") {
          oProjectForm.setVisible(false);
          oOutOfOfficeForm.setVisible(true);
          oInternalForm.setVisible(false);
          oTraining.setVisible(false);
        } else if (that.SelectedButton === "Internal") {

          oProjectForm.setVisible(false);
          oOutOfOfficeForm.setVisible(false);
          oInternalForm.setVisible(true);
          oTraining.setVisible(false);
        } else if (that.SelectedButton === "Training") {
          oProjectForm.setVisible(false);
          oOutOfOfficeForm.setVisible(false);
          oInternalForm.setVisible(false);
          oTraining.setVisible(true);
        }
      },
      clearSave1: function () {
        var that = this;
        var oProjectForm = that._AppointmentContext.getContent()[2];
        var oOutOfOfficeForm = that._AppointmentContext.getContent()[3];
        var oInternalForm = that._AppointmentContext.getContent()[4];
        var oTraining = that._AppointmentContext.getContent()[5];
        that._AppointmentContext.getContent()[1].setSelectedKey(),
          oProjectForm.setVisible(false);
        oOutOfOfficeForm.setVisible(false);
        oInternalForm.setVisible(false);
        oTraining.setVisible(false)
        that._AppointmentContext.close(),
        that._AppointmentContext.getContent()[2].getContent()[1].setSelectedKey() === "",
        that._AppointmentContext.getContent()[2].getContent()[3].setValue() === "",
        that._AppointmentContext.getContent()[2].getContent()[5].setSelectedKey() === "",
        that._AppointmentContext.getContent()[2].getContent()[7].setSelectedKey() === "",     
          that._AppointmentContext.getContent()[2].getContent()[9].setValue() === "",
          that._AppointmentContext.getContent()[2].getContent()[11].setValue() === "",
          that._AppointmentContext.getContent()[2].getContent()[13].setValue() === "",
          this._AppointmentContext.getContent()[3].getContent()[5].setValue() === "",
          this._AppointmentContext.getContent()[5].getContent()[5].setValue() === "",
          this._AppointmentContext.getContent()[5].getContent()[7].setValue() === "",
          that._AppointmentContext.getContent()[4].getContent()[1].setValue() === "",
          that._AppointmentContext.getContent()[4].getContent()[7].setValue() === "",


          oProjectForm.setVisible(false);
        oOutOfOfficeForm.setVisible(false);
        oInternalForm.setVisible(false);
        oTraining.setVisible(false)
        that._AppointmentContext.close(),

          that._AppointmentContext.getContent()[3].getContent()[1].setSelectedIndex(),
          oProjectForm.setVisible(false);
        oOutOfOfficeForm.setVisible(false);
        oInternalForm.setVisible(false);
        oTraining.setVisible(false)
        that._AppointmentContext.close(),

          that._AppointmentContext.getContent()[4].getContent()[1].setValue(),
          that._AppointmentContext.getContent()[4].getContent()[3].setValue(),
          oProjectForm.setVisible(false);
        oOutOfOfficeForm.setVisible(false);
        oInternalForm.setVisible(false);
        oTraining.setVisible(false)
        that._AppointmentContext.close(),
          that._AppointmentContext.getContent()[5].getContent()[1].setValue(),
          that._AppointmentContext.getContent()[5].getContent()[3].setValue(),
          oProjectForm.setVisible(false);
        oOutOfOfficeForm.setVisible(false);
        oInternalForm.setVisible(false);
        oTraining.setVisible(false)
        that._AppointmentContext.close()

      },
      onHalfDaySelect1: function () {
        var that = this;
        that.Selected = "FirstHalf Leave";
      },
      onHalfDaySelect2: function () {
        var that = this;
        that.Selected = "SecondHalf Leave";
      },
      handleAppDialogSaveButton: function () {
        var that = this;

        if (that.SelectedButton === "OutOfOffice") {
          var Err = that.validateCreateOutOfOffice();
          {
            if (Err == 0) {
              if (that.Selected === "FirstHalf Leave" ? "FirstHalf Leave" : "SecondHalf Leave ") {
                $.ajax({
                  url: "/deswork/api/p-appointments?populate=*",
                  type: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  data: JSON.stringify({
                    "data": {
                      "users_permissions_users": this.loginId,
                      "name": this._AppointmentContext.getContent()[1].getSelectedKey(),
                      "description": this._AppointmentContext.getContent()[3].getContent()[5].getValue(),
                      "startDate": this._AppointmentContext.getContent()[3].getContent()[1].getDateValue(),
                      "endDate": this._AppointmentContext.getContent()[3].getContent()[1].getDateValue(),
                      "halfDay": that.Selected,
                      "noOfHours": "04 Hours",
                      "status": "Applied"
                    }
                  }),
                  success: function (response) {
                    var resValue = JSON.parse(response);
                    if (resValue.error) {
                      MessageBox.error(resValue.error.message);
                    } else {

                      MessageBox.success("Added Successfully");
                      that._AppointmentContext.close();
                      that.getAppointmentDetails();
                      that.getUserDetails();
                      that.clearSave1();
                    }
                  }
                });
              }
            }
            else {
              MessageBox.error("Mandatory Fields are Required");
            }
          }

        }
        else if (that.SelectedButton === "Training") {
          var Err = that.validateCreateTraining();
          if (Err == 0) {
            var newStartDate1 = this._AppointmentContext.getContent()[5].getContent()[1].getDateValue();
            var newEndDate1 = this._AppointmentContext.getContent()[5].getContent()[3].getDateValue();
            var newStartDate = new Date(newStartDate1);
            var newEndDate = new Date(newEndDate1);
            if( newStartDate > newEndDate){
              MessageBox.error("End time  is less than start time.");
              return
            }else  if( newStartDate.getTime() === newEndDate.getTime()){
              MessageBox.error("Please select time.");
              return
            }else{
            $.ajax({
              url: "/deswork/api/p-appointments?populate=*",
              type: "POST",
              headers: {
                "Content-Type": "application/json"
              },

              data: JSON.stringify({
                "data": {
                  "users_permissions_users": this.loginId,
                  "name": this._AppointmentContext.getContent()[1].getSelectedKey(),
                  "description": this._AppointmentContext.getContent()[5].getContent()[5].getValue(),
                  "startDate": this._AppointmentContext.getContent()[5].getContent()[1].getDateValue(),
                  "endDate": this._AppointmentContext.getContent()[5].getContent()[3].getDateValue(),
                  "noOfHours": that._AppointmentContext.getContent()[5].getContent()[7].getValue(),
                  "status": "Applied"
                }
              }),
              success: function (response) {
                var resValue = JSON.parse(response);
                if (resValue.error) {
                  MessageBox.error(resValue.error.message);
                } else {
                  MessageBox.success("Added Successfully");
                  that._AppointmentContext.close();
                  that.getAppointmentDetails();
                  that.getUserDetails();
                  that.clearSave1();
                }
              }
            });
          }
          } else {
            MessageBox.error("Mandatory Fields are Required");
          }
        }
        else if (that.SelectedButton === "Internal") {
          var Err = that.validateCreateInternal();
          if (Err == 0) {
            var newStartDate1 = this._AppointmentContext.getContent()[4].getContent()[3].getDateValue();
        var newEndDate1 = this._AppointmentContext.getContent()[4].getContent()[5].getDateValue();
        var newStartDate = new Date(newStartDate1);
        var newEndDate = new Date(newEndDate1);
        if( newStartDate > newEndDate){
          MessageBox.error("End time  is less than start time.");
        }else  if( newStartDate.getTime() === newEndDate.getTime()){
          MessageBox.error("Please select time.");
          return
        }else{
            $.ajax({
              url: "/deswork/api/p-appointments?populate=*",
              type: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              data: JSON.stringify({
                "data": {
                  "users_permissions_users": this.loginId,
                  "name": this._AppointmentContext.getContent()[1].getSelectedKey(),
                  "description": that._AppointmentContext.getContent()[4].getContent()[1].getValue(),
                  "startDate": this._AppointmentContext.getContent()[4].getContent()[3].getDateValue(),
                  "endDate": this._AppointmentContext.getContent()[4].getContent()[5].getDateValue(),
                  "noOfHours": that._AppointmentContext.getContent()[4].getContent()[7].getValue(),
                  "status": "Applied"

                }
              }),
              success: function (response) {
                var resValue = JSON.parse(response);

                if (resValue.error) {
                  MessageBox.error(resValue.error.message);
                } else {
                  MessageBox.success("Added Successfully");
                  that._AppointmentContext.close();
                  that.getAppointmentDetails();
                  that.getUserDetails();
                  that.clearSave1();
                }
              }
            });
          }
          } else {
            MessageBox.error("Mandatory Fields are Required");
          }
        }
        else if (that.SelectedButton === "Projects") {
          var Err = that.validateCreateProjects();
          if (Err == 0) {
            var newStartDate1 = this._AppointmentContext.getContent()[2].getContent()[9].getDateValue();
            var newEndDate1 = this._AppointmentContext.getContent()[2].getContent()[11].getDateValue();
            var newStartDate = new Date(newStartDate1);
            var newEndDate = new Date(newEndDate1);
            if( newStartDate > newEndDate){
              MessageBox.error("End time of task is less than start time.");
              return
            }else  if( newStartDate.getTime() === newEndDate.getTime()){
              MessageBox.error("Please select time.");
              return
            }else{
            $.ajax({
              url: "/deswork/api/p-appointments?populate=*",
              type: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              data: JSON.stringify({
                "data": {
                  "users_permissions_users": this.loginId,
                  "name": this._AppointmentContext.getContent()[1].getSelectedKey(),
                  "description": this._AppointmentContext.getContent()[2].getContent()[3].getValue(),
                  "project_Information": this._AppointmentContext.getContent()[2].getContent()[3].getValue(),
                  // "p_projects":this._AppointmentContext.getContent()[2].getContent()[1].getSelectedKey()?this._AppointmentContext.getContent()[2].getContent()[1].getSelectedKey() : null,
                  "p_tasks": this._AppointmentContext.getContent()[2].getContent()[5].getSelectedKey() ? this._AppointmentContext.getContent()[2].getContent()[5].getSelectedKey() : null,
                  "p_sub_tasks": this._AppointmentContext.getContent()[2].getContent()[7].getSelectedKey() ? this._AppointmentContext.getContent()[2].getContent()[7].getSelectedKey() : null,
                  "startDate": this._AppointmentContext.getContent()[2].getContent()[9].getDateValue(),
                  "endDate": this._AppointmentContext.getContent()[2].getContent()[11].getDateValue(),
                  "noOfHours": that._AppointmentContext.getContent()[2].getContent()[13].getValue(),
                  "status": "Applied"

                }
              }),
              success: function (response) {
                var resValue = JSON.parse(response);
                that._AppointmentContext.close();
                that.getAppointmentDetails();
                MessageBox.success("Added Successfully"),
                  that.getUserDetails();
                that.clearSave1();

              }
            });
          }
          } else {
            MessageBox.error("Mandatory Fields are Required");
          }
        }
      },
      validateCreateOutOfOffice: function () {
        var Err = 0;
        if (this._AppointmentContext.getContent()[3].getContent()[1].getDateValue() === "" || this._AppointmentContext.getContent()[3].getContent()[1].getDateValue() == null) {
          Err++;
        }
        else {
          this._AppointmentContext.getContent()[3].getContent()[1].setValueState("None");
        }
        if (this._AppointmentContext.getContent()[3].getContent()[5].getValue() === "") {
          this._AppointmentContext.getContent()[3].getContent()[5].setValueState("None");
          Err++;
        }
        return Err;
      },
      validateCreateTraining: function () {
        var Err = 0;
        if (this._AppointmentContext.getContent()[5].getContent()[1].getDateValue() === "" || this._AppointmentContext.getContent()[5].getContent()[1].getDateValue() == null) {
          Err++;
        }
        else {
          this._AppointmentContext.getContent()[5].getContent()[1].setValueState("None");
        }
        if (this._AppointmentContext.getContent()[5].getContent()[3].getValue() === "") {
          this._AppointmentContext.getContent()[5].getContent()[3].setValueState("None");
          Err++;
        }
        if (this._AppointmentContext.getContent()[5].getContent()[5].getValue() === "") {
          this._AppointmentContext.getContent()[5].getContent()[5].setValueState("None");
          Err++;
        }
        return Err;
      },
      validateCreateInternal: function () {
        var Err = 0;
        if (this._AppointmentContext.getContent()[4].getContent()[3].getDateValue() === "" || this._AppointmentContext.getContent()[4].getContent()[3].getDateValue() == null) {
          Err++;
        }
        else {
          this._AppointmentContext.getContent()[4].getContent()[3].setValueState("None");
        }
        if (this._AppointmentContext.getContent()[4].getContent()[5].getValue() === "") {
          this._AppointmentContext.getContent()[4].getContent()[5].setValueState("None");
          Err++;
        }
        if (this._AppointmentContext.getContent()[4].getContent()[1].getValue() === "") {
          this._AppointmentContext.getContent()[4].getContent()[1].setValueState("None");
          Err++;
        }
        return Err;
      },
      validateCreateProjects: function () {
        var Err = 0;
        if (this._AppointmentContext.getContent()[2].getContent()[1].getSelectedKey() === "" || this._AppointmentContext.getContent()[2].getContent()[1].getSelectedKey() == null) {
          Err++;
        }
        else {
          this._AppointmentContext.getContent()[2].getContent()[1].setValueState("None");
        }
        if (this._AppointmentContext.getContent()[2].getContent()[5].getSelectedKey() === "") {
          this._AppointmentContext.getContent()[2].getContent()[5].setValueState("None");
          Err++;
        }
        if (this._AppointmentContext.getContent()[2].getContent()[9].getValue() === "") {
          this._AppointmentContext.getContent()[2].getContent()[9].setValueState("None");
          Err++;
        }
        if (this._AppointmentContext.getContent()[2].getContent()[11].getValue() === "") {
          this._AppointmentContext.getContent()[2].getContent()[11].setValueState("None");
          Err++;
        }
        return Err;
      },
      handleDateSelection: function (evt) {
        var that = this;
        var applyLeaveThis = this;
        that.applyLeaveThis = applyLeaveThis;
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
    });
  });    