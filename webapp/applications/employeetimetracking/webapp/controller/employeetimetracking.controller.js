sap.ui.define([

  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  '../utils/formatter',
  'sap/ui/core/date/UI5Date',
  "sap/m/MessageToast"
],

  /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */

  function (Controller, JSONModel, MessageBox, formatter, UI5Date,MessageToast) {

    "use strict";
    return Controller.extend("vaspp.employeetimetracking.controller.employeetimetracking", {
      formatter: formatter,
      onInit: function () {
        var that = this;
        this.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
        that.getUserDetails();
      },
      getUserDetails: function () {
        var that = this;
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
          Comment: this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[24].getValue() ,
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
                    this.onInit();
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
                    this.onInit();
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
