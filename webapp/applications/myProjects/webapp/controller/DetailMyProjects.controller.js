sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "VASPP/myProjects/utils/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter"
  ],
  function (
    JSONModel, Controller,
    formatter,
    MessageBox,
    FilterOperator,
    Filter,
    exportLibrary,
    Spreadsheet,
    MessageToast
  ) {
    "use strict";
    return Controller.extend("VASPP.myProjects.controller.DetailMyProjects", {
      formatter: formatter,
      onInit: function () {
        if (!this.oAddTaskInfo) {
          this.oAddTaskInfo = sap.ui.xmlfragment(
            // "idFragmentT123",
            "VASPP.myProjects.fragment.RegisteraddTask",
            this
          );
          this.getView().addDependent(this.oAddTaskInfo);
        }
        var oExitButton = this.getView().byId("exitFullScreenBtn"),
          oEnterButton = this.getView().byId("enterFullScreenBtn");
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter
          .getRoute("detailMyProjects")
          .attachPatternMatched(this._onObjectMatched, this);
        [oExitButton, oEnterButton].forEach(function (oButton) {
          oButton.addEventDelegate({
            onAfterRendering: function () {
              if (this.bFocusFullScreenButton) {
                this.bFocusFullScreenButton = false;
                oButton.focus();
              }
            }.bind(this),
          });
        }, this);
      },

      handleFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
        this.oRouter.navTo("detailMyProjects", { layout: sNextLayout, product: this.id });
      },

      handleExitFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
        this.oRouter.navTo("detailMyProjects", { layout: sNextLayout, product: this.id });
      },
      //CLOSE
      handleClose: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/closeColumn"
        );
        this.oRouter.navTo("masterMyProjects", { layout: sNextLayout });
      },

      //OBJECT MATCHED

      _onObjectMatched: function (oEvent) {

        var that = this;
        if (typeof oEvent == "number") {
          this.id = oEvent;
        } else {
          this.id = oEvent.getParameter("arguments").product;
        }

        var options = {};
        $.get(
          "/deswork/api/p-projects/" +
          this.id +
          "?populate[0]=p_customer&populate[1]=p_vendors&populate[2]=p_tasks.users_permissions_user&populate[3]=p_project_teams.users_permissions_users&populate[4]=p_milestones&populate[5]=Users&populate[6]=m_time_entries",
          options,
          function (response) {

            response = JSON.parse(response);
            var oModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(oModel, "myproject");
            that.csf();
            that.mcsfsDetails();
            // that.subTasks();
            that.getTeamMemberdetails();
            that.csfForFragment();
          }
        );
      },
    
      csf: function () {
        var that = this;
        $.ajax({
          url: "deswork/api/p-tasks?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            //
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mcsf");
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      mcsfsDetails: function () {
        var that = this;
        that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        $.ajax({
          url: "deswork/api/p-tasks?populate[0]=p_sub_tasks&filters[users_permissions_user][id]=" + that.loginId + "&filters[p_project][id]=" + that.id,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            //
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            var taskLength = that.getView().getModel("mCsfDetails").getData();
            var finalCsfSet = [];
            for (var i = 0; i < taskLength.length; i++) {
              var task = taskLength[i].attributes;
              var subTasks = task.p_sub_tasks.data;

              if (subTasks) {
                task.p_sub_tasks = [];
                for (var j = 0; j < subTasks.length; j++) {
                  var subTask = subTasks[j].attributes;
                  subTask.id = subTasks[j].id;
                  task.p_sub_tasks.push(subTask);
                }
              }

              finalCsfSet.push(task);
            }

            var appointmentsdata = new sap.ui.model.json.JSONModel(finalCsfSet);
            that.getView().setModel(appointmentsdata, "appointmentsdata");
            that.getView().getModel("mCsfDetails").updateBindings(true);
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },

      addTaskDailog: function () {
        var that = this;
        this.editTask = false;
        this.oAddTaskInfo.setModel(
          new sap.ui.model.json.JSONModel({}),
          "mTasks"
        );
        var data = that.getView().getModel("Fragmentcsf").getData();
        if (data.length != "0") {
          this.oAddTaskInfo.open();
        } else {
          sap.m.MessageBox.information("There is no available subtask for time extension.");
        }
      },
      onSaveTaskDialog: function (oEv) {
        var that = this;
        var Err = this.ValidateCreateCust();
        if (Err == 0) {
          var subtaskStartDate = new Date(this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].getValue());
          var subtaskEndDate = new Date(this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].getValue());
          var extendedEndDate = new Date(this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].getValue());

          if (extendedEndDate < subtaskStartDate) {
            MessageBox.error("Extended date cannot be less than the subtask start date.");
          } else {
            that.oAddTask = {
              extended_end_date: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].getValue(),
              status: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].getSelectedKey(),
              p_task_reason: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].getValue(),
              p_approver_status: "Requested"
            };
              $.ajax({
                url: "deswork/api/p-sub-tasks/" + that.selectedSubtask + "?populate=*",
                type: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                data: JSON.stringify({
                  data: that.oAddTask,
                }),
                success: function (res) {
                  var getValues = JSON.parse(res);
                  if (getValues.error) {
                    MessageBox.error(getValues.error.message);
                  } else {
                    that.oAddTaskInfo.close();
                    MessageToast.show("Time Extension Requested Successfully!");
                    that.id;
                    that.parId = that.id;
                    that.parIds = JSON.parse(that.parId);
                    that._onObjectMatched(that.parIds);
                    that.getView().getModel().updateBindings(true);
                    that.clearTask();
                  }
                },
              });
            // }
          }
        } else {
          MessageBox.error("Please fill the mandatory fields");
        }
      },
      onPress: function (oEvent) {
        var that = this;
        that.selectedIdTask = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url:
            "/deswork/api/p-sub-tasks?populate=*&filters[p_task][id][$eq]=" + that.selectedIdTask,
          type: "GET",
          success: function (res) {
            var csrfDetails = JSON.parse(res);
            var csrfDetails1 = csrfDetails.data;
            var subtasks=[];
            if (csrfDetails.error) {
              MessageBox.error(
                csrfDetails.error.message + "Something went wrong!"
              );
            } else {
              csrfDetails1.forEach(function(csrfDetail){
              var pApproverStatus = csrfDetail.attributes.p_approver_status;
              if(pApproverStatus !== "Requested" && pApproverStatus !== "Approved"){
                subtasks.push(csrfDetail);
              }
              });
              var mmModel = new sap.ui.model.json.JSONModel(subtasks);
              that.oAddTaskInfo.setModel(mmModel, "csfmodel");
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setSelectedKey("");
              that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].getSelectedKey();
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue("");
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue("");
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValue("");
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setSelectedKey("");
              that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setValue("");
            }
          },
        });
      },
      onSelectSubtask: function () {
        //   that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        var that = this;
        that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].getSelectedKey();
        $.ajax({
          url: "deswork/api/p-sub-tasks/" + that.selectedSubtask + "?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            // that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            var taskData = that.getView().getModel("mCsfDetails").getData();
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue(taskData.attributes.startDate);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(taskData.attributes.endDate);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValue(taskData.attributes.extended_end_date);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setSelectedKey(taskData.attributes.status);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setValue(taskData.attributes.p_task_reason);
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      ValidateCreateCust: function () {
        var Err = 0;
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedKey() === "" ||
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedKey() == null) {
          Err++;
        }
        else {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].setValueState("None");
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedKey() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].getSelectedKey() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].getValue() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].getValue() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].getValue() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].getSelectedKey() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setValueState("None");
          Err++;
        }
        if (this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].getValue() === "") {
          this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setValueState("None");
          Err++;
        }
        return Err;
      },

      clearTask: function () {
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].setSelectedKey("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setSelectedKey("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValue("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setSelectedKey("");
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setValue("");
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setSelectedKey();
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].setValue();
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].getValue();
      },

      onCloseTaskDialog: function () {
        var that = this;
        that.oAddTaskInfo.close();
        that.clearTask();

      },
      csfForFragment: function () {
        var that = this;
        that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        $.ajax({
          url: "deswork/api/p-tasks?populate[0]=p_sub_tasks&filters[users_permissions_user][id]=" + that.loginId + "&filters[p_project][id]=" + that.id,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res); 
            var taskslistLength = response.data.length;
            var taskslist = response.data;
            // var tasks=taskslist.data;
            var finalCsfSet = [];
            for (var i = 0; i < taskslistLength; i++) {
              var task = taskslist [i].attributes;
              var subTaskLength=task.p_sub_tasks.data.length;
              var subTasks = task.p_sub_tasks.data;
              // task.p_sub_tasks = [];
              var subTask=[]
              subTasks.forEach(function(subtsk){
                var subTaskpApproverStatus =subtsk.attributes.p_approver_status;;
                if (subTaskpApproverStatus !== "Requested" && subTaskpApproverStatus !== "Approved") {
                  subTask.push(subTasks);        
                }
                
              });  
              if (subTask.length >= "1") {
                finalCsfSet.push(taskslist[i]);
              }               
            }
            var appointmentsdata = new sap.ui.model.json.JSONModel(finalCsfSet);
            that.getView().setModel(appointmentsdata, "Fragmentcsf");
            that.getView().getModel("mCsfDetails").updateBindings(true);
          },
          error:function(){
MessageBox.error(error);
          }
        });
       },
      onSaveTaskDialog1: function (oEv) {
        var that = this;
        var Err = this.ValidateCreateCust1();
        if (Err == 0) {
          that.oAddTask = {
            extended_end_date: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].getValue(),
            status: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].getSelectedKey(),
            p_task_reason: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].getValue(),
            p_approver_status: "Requested"
          }
          $.ajax({
            url: "deswork/api/p-sub-tasks/" + that.selectedSubtask + "?populate=*",
            type: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              data: that.oAddTask,
            }),
            success: function (res) {
              var getValues = JSON.parse(res);
              if (getValues.error) {
                MessageBox.error(getValues.error.message);
              } else {
                that.oAddTaskInfo.close();
                MessageToast.show("Time Extension Requested Successfully!");
                that.id;
                that.parId = that.id;
                that.parIds = JSON.parse(that.parId);
                that._onObjectMatched(that.parIds);
                that.getView().getModel().updateBindings(true);
                that.clearTask();
              }
            },
          })
        }
        else {
          this.getView().setBusy(false);
          var text = "Mandatory Fields are Required";
          MessageBox.error(text);
        }
      },
      getTeamMemberdetails: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-project-teams?populate=*&filters[p_project][id]=" + that.id,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mTeamMember");
          },
          error: function (res) {
          }
        });
      },
    });
  }
);
