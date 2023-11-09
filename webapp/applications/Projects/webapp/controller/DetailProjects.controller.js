sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "VASPP/Projects/utils/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter"
  ],
  function (
    JSONModel,
    Controller,
    formatter,
    MessageBox,
    FilterOperator,
    Filter,
    exportLibrary,
    Spreadsheet,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("VASPP.Projects.controller.DetailProjects", {
      formatter: formatter,
      onInit: function () {
        var that = this;
        if (!that.oAddSubTaskInfo) {
          that.oAddSubTaskInfo = sap.ui.xmlfragment(
            "VASPP.Projects.fragment.RegisteraddSubTask", that
          );
          that.getView().addDependent(that.oAddSubTaskInfo);
        }
        if (!that.oEditSubTaskInfo) {
          that.oEditSubTaskInfo = sap.ui.xmlfragment(
           "VASPP.Projects.fragment.EditSubTask",
            that
          );
          that.getView().addDependent(that.oEditSubTaskInfo);
        }
        //Other
        var oExitButton = that.getView().byId("exitFullScreenBtn"),
          oEnterButton = that.getView().byId("enterFullScreenBtn");
        that.oRouter = that.getOwnerComponent().getRouter();
        that.oModel = that.getOwnerComponent().getModel();
        that.oRouter
          .getRoute("detailProjects")
          .attachPatternMatched(that._onObjectMatched, that);
        [oExitButton, oEnterButton].forEach(function (oButton) {
          oButton.addEventDelegate({
            onAfterRendering: function () {
              if (that.bFocusFullScreenButton) {
                that.bFocusFullScreenButton = false;
                oButton.focus();
              }
            }.bind(that),
          });
        }, that);
        if (!that.oAddTeamMember) {
          that.oAddTeamMember = sap.ui.xmlfragment(
            "idFragmentTM",
            "VASPP.Projects.fragment.RegisterTeamMember",
            that
          );
          that.getView().addDependent(that.oAddTeamMember);
        }
      },
      handleFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
        this.oRouter.navTo("detailProjects", { layout: sNextLayout, product: this.id });
      },
      handleExitFullScreen: function () {
        this.bFocusFullScreenButton = true;
        var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
        this.oRouter.navTo("detailProjects", { layout: sNextLayout, product: this.id });
      },

      //CLOSE
      handleClose: function () {
        var that = this;
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/closeColumn"
        );
        this.oRouter.navTo("masterProjects", { layout: sNextLayout });
      },

      //OBJECT MATCHED

      _onObjectMatched: function (oEvent) {
        //  debugger;
        var that = this;
        if (typeof oEvent == "number") {
          this.id = oEvent;
        } else {
          this.id = oEvent.getParameter("arguments").product;
        }
        that.getEffort();
        var options = {};
        $.get(
          "/deswork/api/p-projects/" +
          this.id +
          "?populate[0]=p_customer&populate[1]=p_vendors&populate[2]=p_tasks.users_permissions_user&populate[3]=p_project_teams.users_permissions_user&populate[4]=Users&populate[5]=m_time_entries&populate[6]=p_time_estimations&populate[7]=users_permissions_users&populate[8]=p_documents",
          options,
          function (response) {
            response = JSON.parse(response);
            var oModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(oModel, "mprojects");
            var data = that.getView().getModel("mprojects").getData();
            var estimatedBudget = data.attributes.estimated_budget.split(" RUPEES")[0];
            data.attributes.estimated_budget = estimatedBudget;
            var actualBudget = data.attributes.actual_budget.split(" RUPEES")[0];
            data.attributes.actual_budget = actualBudget;
            that.getView().getModel("mprojects").updateBindings("true");

            // that.projectsDetails();
            // that.getEffort();
            //   that.getVendorDetails();
            //tree Table
            that.mCsfData();
            that.Subcsf();
            //
            that.getNameforTeam();
            that.getNameforTask();
            that.csf();
            that.getCustomerDetails();
            that.getTeamMemberdetails();
            //table
            that.mcsfsDetails();
            // //tree Table
            // that.mCsfData();
            // that.Subcsf();

          }
        );
      },


      mCsfData: function () {
        var that = this;

        $.ajax({
          url: "/deswork/api/p-tasks?populate[0]=p_sub_tasks&populate[1]=users_permissions_user&filters[p_project][id]=" + that.id,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            var taskLength = that.getView().getModel("mCsfDetails").getData();
            var finalCsfSet = [];

            for (var i = 0; i < taskLength.length; i++) {
              var task = taskLength[i].attributes;
              task.id = taskLength[i].id;
              var subTasks = task.p_sub_tasks.data;

              if (subTasks) {
                task.p_sub_tasks = [];
                for (var j = 0; j < subTasks.length; j++) {
                  var subTask = subTasks[j].attributes;
                  subTask.id = subTasks[j].id;
                  task.p_sub_tasks.push(subTask);
                }
              }

              // Convert users_permissions_user array to an object
              var usersPermissionsUser = task.users_permissions_user.data;
              if (usersPermissionsUser) {
                task.users_permissions_user = usersPermissionsUser.attributes;
                task.users_permissions_user.id = usersPermissionsUser.id;
                task.users_permissions_user.appPermission = permission;
                //task.users_permissions_user.firstName = usersPermissionsUser.firstName;

              }
              // Convert users_permissions_user array to an object
              var usersPermissionsUser = task.users_permissions_user;
              if (usersPermissionsUser) {
                task.users_permissions_user = undefined;
                for (var k = 0; k < usersPermissionsUser.length; k++) {
                  var permission = usersPermissionsUser[k].attributes;
                  permission.id = usersPermissionsUser[k].id;
                  task.users_permissions_user[permission.appPermission] = permission;
                  //  task.users_permissions_user.attributes.firstName 
                  // task.users_permissions_user =[];

                }
                // Assuming the user's first name is available as a property in the users_permissions_user object
                var userFirstName = usersPermissionsUser.firstName;
                task.firstName = userFirstName;
              }

              finalCsfSet.push(task);
            }

            var csfData = new sap.ui.model.json.JSONModel(finalCsfSet);
            that.getView().setModel(csfData, "csfData");
            that.getView().getModel("mCsfDetails").updateBindings(true);
            // that.tableExpand();
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },


      // Event handler for file deletion
      onFileDeleted: function (event) {
        var that = this;
        var file = event.getParameter("item");
        var documentId = event.getParameter("item").getBindingContext("mprojects").getObject().id;
        file.data("documentId", documentId);
        var projectId = event.getParameter("item").getBindingContext("mprojects").oModel.oData.id
        var documentId = file.data("documentId");

        if (documentId) {

          $.ajax({
            url: "/deswork/api/p-projects/" + projectId,
            type: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            success: function (res) {
              var getValues = JSON.parse(res);
              if (getValues.error) {
                MessageBox.error(getValues.error.message);
              } else {
                $.ajax({
                  url: "/deswork/api/p-projects/" + projectId,
                  type: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  success: function (res) {
                    var getValues = JSON.parse(res);
                    if (getValues.error) {
                      MessageBox.error(getValues.error.message);
                    } else {
                      MessageToast.show("Attachments Deleted Successfully!");
                      that.getView().getModel("mprojects").updateBindings(true);
                      that.getView().getModel("mprojects").refresh();

                    }
                  },
                });
                MessageToast.show("Attachments Deleted Successfully!");
                that.getView().getModel("mprojects").updateBindings(true);
                that.getView().getModel("mprojects").refresh();

              }
            },
          });

        }
      },

      //projectsDetails -milestone
      mcsfsDetails: function () {
        var that = this;
        $.ajax({
          // not working check later
          url: "/deswork/api/p-tasks?populate=*&filters[p_project][id]=" + that.id,
          // url: "/deswork/api/p-tasks?populate=*" ,
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            //that.mDclDetails();
            //	that.getView().setBusy(false);
          },
          error: function (res) {
            MessageBox.error(res + "Something went wroung");
          }
        });
      },




      //EDIT PROJECTS

      onEditProjects: function (oEvent) {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
       
          if (EditModel.status === "Completed") {
          MessageToast.show("Completed Projects can't be Edited")
        }
        else {
          var customerEdit = that.getView().getModel("mprojects").getData()
            .attributes.p_customer.data;
          if (!this.oAddProjectDialog1) {
            this.oAddProjectDialog1 = sap.ui.xmlfragment(
              "idfragm",
              "VASPP.Projects.view.Register",
              this
            );
            this.getView().addDependent(this.oAddProjectDialog1);
          }
          this.oAddProjectDialog1
          .getContent()[0]
          .getItems()[0]
          .getContent()[15].setVisible(true);
          this.oAddProjectDialog1
          .getContent()[0]
          .getItems()[0]
          .getContent()[16].setVisible(true);
        // that.dynamicStatus=;
          if (EditModel.p_customer.data === null) {
           that.idCusto= this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[18]
              .setSelectedKey("");
          }
          else{
            that.idCusto=this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[18].setSelectedKey(EditModel.p_customer.data.id);
          }
          var data = {
            name: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[2]
              .setValue(EditModel.name),
            description: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[4]
              .setValue(EditModel.description),
            type: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[6]
              .setSelectedKey(EditModel.type),
            startDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[8]
              .setValue(EditModel.startDate),
            estimatedEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[10]
              .setValue(EditModel.estimatedEndDate),
            actualEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[12]
              .setEditable(true),
            actualEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[12]
              .setValue(EditModel.actualEndDate),
            priority: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[14]
              .setSelectedKey(EditModel.priority),
            
            // status: this.oAddProjectDialog1
            //   .getContent()[0]
            //   .getItems()[0]
            //   .getContent()[16]
            //   .setSelectedKey(EditModel.status),
          
            p_customer: that.idCusto ,
            estimated_budget: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[20].getItems()[0]
              .setValue(EditModel.estimated_budget.split(" ")[0]) + this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[20].getItems()[1].setSelectedKey(EditModel.estimated_budget.split(" ")[1]),
            actual_budget: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[22].getItems()[0].setEditable(true) + " " +
              this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[22].getItems()[1].setEditable(true),

            // actual_budget: this.oAddProjectDialog1
            //   .getContent()[0]
            //   .getItems()[0]
            //   .getContent()[22].getItems()[0].setValue(EditModel.actual_budget.split(" ")[0]) + " " +
            //   this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[22].getItems()[1].setSelectedKey(EditModel.actual_budget.split(" ")[1])



            // if (rateCard1 && rateCard1.includes(" ")) {
            //     var splitRateCard = rateCard1.split(" ");
            //     actualBudgetInput.setValue(splitRateCard[0]);
            //     currencySelectAc.setSelectedKey(splitRateCard[1]);
            // } else {
            //     actualBudgetInput.setValue(""); // Set to empty string if actual_budget is null or doesn't have the format
            //     currencySelectAc.setSelectedKey(""); // Set to empty string if actual_budget is null or doesn't have the format
            // }

          };
          var currencySelect = this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[20].getItems()[1];
          var rateCard = EditModel.estimated_budget;
          var selectedCurrency = rateCard.split(" ")[1]; // Assuming the rate_card is in the format "rate currency"
          currencySelect.setSelectedKey(selectedCurrency);

          var actualBudgetInput = this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[22].getItems()[0];
          var currencySelectAc = this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[22].getItems()[1];
          var rateCard1 = EditModel.actual_budget;

          //     var currencySelectAc = this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[22].getItems()[1];
          if (rateCard1 && rateCard1.includes(" ")) {
            var splitRateCard = rateCard1.split(" ");
            actualBudgetInput.setValue(splitRateCard[0]);
            currencySelectAc.setSelectedKey(splitRateCard[1]);
            // var selectedCurrency = rateCard1.split(" ")[1]; // Assuming the rate_card is in the format "rate currency"
            // currencySelectAc.setSelectedKey(selectedCurrency);
          } else {
            actualBudgetInput.setValue("");
            currencySelectAc.setSelectedKey(""); // Set to empty string if actual_budget is null or doesn't have the format
          }

          // this.getView().setModel(new JSONModel(data));

          this.oAddProjectDialog1.setModel(new sap.ui.model.json.JSONModel(data));

          this.getView().getModel("mprojects").updateBindings(true);
          this.oAddProjectDialog1.open();
        }
      },

      //ON SAVE EDITED PROJECT

      onStatusStart: function (oEvent) {
        var that = this;
        that.statusstartdate = oEvent.getParameters().value;
      },
      
      onStatusEnd: function (oEvent) {
        var that = this;
        that.statusenddate = oEvent.getParameters().value;
        var today = new Date().toISOString().slice(0, 10);
  
        if (that.statusstartdate <= today && that.statusenddate >= today) {
          //that.projectStatus.attributes.status = "In-progress";
          this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[16]
              .setSelectedKey("In-progress")
        } else if (that.statusstartdate > today) {
          this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[16]
              .setSelectedKey("New")
        }
      },
      onSaveProject: function (oEv) {
        var that = this;
      
        var Err = this.ValidateEditProject();
        if (Err == 0) {
          that.updatedProject = {
            name: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[2]
              .getValue(),
            description: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[4]
              .getValue(),
            type: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[6]
              .getSelectedKey(),
            startDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[8]
              .getValue(),
            estimatedEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[10]
              .getValue(),
            actualEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[12]
              .getValue() ? this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[12]
                .getValue() : null,
            priority: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[14]
              .getSelectedKey(),
            // effort: this.oAddProjectDialog1
            //   .getContent()[0]
            //   .getItems()[0]
            //   .getContent()[14]
            //   .getValue(),
            status: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[16]
              .getSelectedKey(),
            p_customer: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[18]
              .getSelectedKey() ? this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[18]
                .getSelectedKey() : null,
            estimated_budget: this.oAddProjectDialog1.getContent()[0].getItems()[0].getContent()[20].getItems()[0].getValue() + " " +
              this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[20].getItems()[1]
                .getSelectedKey(),
            actual_budget: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[22].getItems()[0].getValue() + " " + this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[22].getItems()[1].getSelectedKey(),
            // ? this.oAddProjectDialog1
            //     .getContent()[0]
            //     .getItems()[0]
            //     .getContent()[22].getItems()[0]
            //     .getValue() : null,
          }
          $.ajax({
            url: "/deswork/api/p-projects/" + that.id + "?populate=*",
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
                that.handleClose();
                that.oAddProjectDialog1.close();
                // that.getOwnerComponent().getRouter().navTo();
                MessageBox.success("Project Updated Successfully");
                that._onObjectMatched(that.id);

                that.onInit();
                that.getView().getModel("mprojects").updateBindings(true);


                that.getView().getModel("mprojects").updateBindings(true);
                that.getView().getModel().updateBindings(true);

              }
            },
          });
        }
        else {
          this.getView().setBusy(false);
          var text = "Mandatory Fields are Required";
          MessageBox.error(text);
        }
      },

      // PROJECT EDITNG VALIDATION

      ValidateEditProject: function () {
        var Err = 0;
        var thisView = this.oAddProjectDialog1;
        // thisView.getContent()[0].getItems()[0].getContent()[14].setValue("0");
        if (thisView.getContent()[0].getItems()[0].getContent()[2].getValue() === "" || thisView.getContent()[0].getItems()[0].getContent()[2].getValue() == null) {
          Err++;
        }
        else {
          thisView.getContent()[0].getItems()[0].getContent()[2].setValueState("None");
        }

        if (thisView.getContent()[0].getItems()[0].getContent()[4].getValue() === "") {
          thisView.getContent()[0].getItems()[0].getContent()[4].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[0].getItems()[0].getContent()[6].getSelectedKey() === "") {
          thisView.getContent()[0].getItems()[0].getContent()[6].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[0].getItems()[0].getContent()[8].getValue() === "") {
          thisView.getContent()[0].getItems()[0].getContent()[8].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[0].getItems()[0].getContent()[10].getValue() === "") {
          thisView.getContent()[0].getItems()[0].getContent()[10].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[0].getItems()[0].getContent()[14].getSelectedKey() === "") {
          thisView.getContent()[0].getItems()[0].getContent()[14].setValueState("None");
          Err++;
        }
        // if (thisView.getContent()[0].getItems()[0].getContent()[16].getSelectedKey() === "") {
        //   thisView.getContent()[0].getItems()[0].getContent()[16].setValueState("None");
        //   Err++;
        // }
        // if (thisView.getContent()[0].getItems()[0].getContent()[18].getSelectedKey() === "") {
        //   thisView.getContent()[0].getItems()[0].getContent()[18].setValueState("None");
        //   Err++;
        // }
        // if (thisView.getContent()[0].getItems()[0].getContent()[20].getValue() === "") {
        //   thisView.getContent()[0].getItems()[0].getContent()[20].setValueState("None");
        //   Err++;
        // }
        return Err;
      },
      closeProjectDialog: function () {
        this.oAddProjectDialog1.close();
      },

      //DELETE PROJECT DETAILS
      OnDeleteProjects: function (evt) {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show("Completed Projects can't be Edited")
        }
        else {
          var teamArray = [];
          that.updateTeamData = {
            "p_project_teams": teamArray ,
            "p_tasks": teamArray
          };
          MessageBox.confirm("Are you sure you want to Delete  ?", {
            actions: ["Yes", "No"],
            emphasizedAction: "Yes",
            onClose: function (evt) {
              if (evt == "Yes") {
                $.ajax({
                  type: "DELETE",
                  url: "/deswork/api/p-projects/" + that.id,
                  data: JSON.stringify({
                    "data": that.updateTeamData
                  }),
                  success: function (response) {
                    var resv = JSON.parse(response);
                    if (resv.error) {
                      MessageBox.error(resv.error.message);
                    } else {
                      MessageBox.success("Project has been deleted");
                      that.handleClose();
                      that._onObjectMatched(that.id);
                      that.getView().getModel().updateBindings(true);
                      that.onInit();

                    }
                  },
                });
              }
            },
          });
        }
      },
      //CUSTOMER DETAILS
      getCustomerDetails: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-customers",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var theModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(theModel, "customerInfo");
            //that.getTeamMemberdetails();
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          },
        });
      },



      //TEAM MEMBER DETAILS Updated : Anusha

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
      //user for team member and task
      getNameforTeam: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/users?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var theModel = new sap.ui.model.json.JSONModel(response);
            that.getView().setModel(theModel, "pUsers");
            //that.getTeamMemberdetails();
          },
          error: function (res) {
          },
        });
      },
      addTeamMember: function () {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show(" can't edit task for Completed Projects ")
        }
        else {
          var TeamMemberModel = new JSONModel(
            this.getView().getModel("pUsers").getData()
          );

          this.oAddTeamMember.setModel(TeamMemberModel);
          this.oAddTeamMember.open();
        }
      },

      onSelectedTeam: function (oEvent) {
        //from here
        var that = this;
        that.p_role_team = oEvent.getParameters().selectedItem.mProperties.text;
        //till here
        if (!this.selectUser) {
          this.selectUser = sap.ui.xmlfragment(this.getView().getId(), "VASPP.Projects.fragment.selectUser", this);
          //  this.selectUser.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
          this.getView().addDependent(this.selectUser);
        }

        let userModel = this.getView().getModel("pUsers").getData();
        var filteredUsers = [];
        if (that.p_role_team === "Associate Developer") {
          // for (var i = 0; i < userModel.length; i++) {
          //   var user = userModel[i];
          //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
          //     filteredUsers.push(user);
          //   }
          // }
          for (var i = 0; i < userModel.length; i++) {
            var user = userModel[i];
            for (var j = 0; j < user.p_team_role_users.length; j++) {
              if (user.p_team_role_users[j].roleName === that.p_role_team) {
                filteredUsers.push(user);
                break; // Break out of the inner loop if the "Tester" role is found
              }
            }
          }
        }
        else if (that.p_role_team === "Senior Developer") {
          // for (var i = 0; i < userModel.length; i++) {
          //   var user = userModel[i];
          //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
          //     filteredUsers.push(user);
          //   }
          // }
          for (var i = 0; i < userModel.length; i++) {
            var user = userModel[i];
            for (var j = 0; j < user.p_team_role_users.length; j++) {
              if (user.p_team_role_users[j].roleName === that.p_role_team) {
                filteredUsers.push(user);
                break; // Break out of the inner loop if the "Tester" role is found
              }
            }
          }
        }
        // else if (that.p_role_team === "Tester") {
        //   for (var i = 0; i < userModel.length; i++) {
        //     var user = userModel[i];
        //     if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
        //       filteredUsers.push(user);
        //     }
        //   }
        // }
        else if (that.p_role_team === "Tester") {
          for (var i = 0; i < userModel.length; i++) {
            var user = userModel[i];
            for (var j = 0; j < user.p_team_role_users.length; j++) {
              if (user.p_team_role_users[j].roleName === that.p_role_team) {
                filteredUsers.push(user);
                break; // Break out of the inner loop if the "Tester" role is found
              }
            }
          }
        }
        else if (that.p_role_team === "Project Manager") {
          // for (var i = 0; i < userModel.length; i++) {
          //   var user = userModel[i];
          //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
          //     filteredUsers.push(user);
          //   }
          // }
          for (var i = 0; i < userModel.length; i++) {
            var user = userModel[i];
            for (var j = 0; j < user.p_team_role_users.length; j++) {
              if (user.p_team_role_users[j].roleName === that.p_role_team) {
                filteredUsers.push(user);
                break; // Break out of the inner loop if the "Tester" role is found
              }
            }
          }
        }
        else if (that.p_role_team === "Architect") {
          for (var i = 0; i < userModel.length; i++) {
            var user = userModel[i];
            for (var j = 0; j < user.p_team_role_users.length; j++) {
              if (user.p_team_role_users[j].roleName === that.p_role_team) {
                filteredUsers.push(user);
                break; 
              }
            }
          }
        }
        this.selectUser.setModel(new sap.ui.model.json.JSONModel(filteredUsers));
        this.selectUser.open();
      },

      onSelectUser: function (evt) {
        var that = this;
        // var that = this;
        that.ProjectId = this.getView().getModel("mprojects").getData();
        var Project = this.getView().getModel("mprojects").getData().id;
        that.participants = [];
        that.userManagment = [];
        var aSelectedItems = evt.getParameter("selectedItems");
        aSelectedItems.forEach(function (item) {
          var bindingContext = item.getBindingContext();
          var userObject = bindingContext.getObject();
          that.participants.push(userObject);
          that.userManagment.push(userObject.id);
        });
        that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[3].setValue(that.participants[0].firstName);
        that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[5].setValue(that.participants[0].rate_card);
      },
      onSaveTeamMemberDialogs: function (oEvent) {
        var that = this;
        that.oNewAppointment = {
          users_permissions_user: that.userManagment,
          p_project: [that.ProjectId.id],
          p_team_role: that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[1].getSelectedKey(),
        };
        $.ajax({
          url: "/deswork/api/p-project-teams?populate=*",
          type: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          data: JSON.stringify({
            "data": that.oNewAppointment
          }),
          success: function (res) {
            var getValues = JSON.parse(res);
            if (getValues.error) {
              MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
            } else {

              MessageToast.show("Team Member Added successfully!");
              that.Jid = JSON.parse(that.id)
              that._onObjectMatched(that.Jid);
              that.getView().getModel().updateBindings(true);
              that.oAddTeamMember.close();

              $.ajax({
                url: "/deswork/api/p-project-teams?populate[0]=p_project&filters[p_project][id][$eq]=" + that.ProjectId.id + "&populate[1]=users_permissions_user",
                type: "GET",
                success: function (res) {
                  var response = JSON.parse(res);
                  var theModel = new sap.ui.model.json.JSONModel(response.data);
                  that.getView().setModel(theModel, "mTeamMembers");
                  var teamusers = that.getView().getModel("mTeamMembers").getData();
                  var newUsers = [];
                  for (var i = 0; i < teamusers.length; i++) {
                    newUsers.push(teamusers[i].attributes.users_permissions_user.data.id);
                  }
                  $.ajax({
                    url: "/deswork/api/p-projects/" + that.ProjectId.id + "?populate=*",
                    type: "PUT",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                      "data": {
                        "users_permissions_users": newUsers
                      }
                    }),
                    success: function (response) {
                      var resValue = JSON.parse(response);
                      if (resValue.error) {
                        MessageBox.error(resValue.error.message);
                      } else {

                        that._onObjectMatched(that.id);
                      }
                    }
                  });
                },
                error: function (res) {
                  MessageBox.error(res + "Something went wrong");
                },
              });



            }
          }
        });

      },

      TeamMemberCancelPress: function () {
        this.oAddTeamMember.close();
      },

      deleteTeamMemberDailog: function (evt) {

        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show(" can't Delete task for Completed Projects ")
        }
        else {
          var table = this.getView().byId("suppliersTable3b");
          var selectedItems = table.getSelectedItems();

          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to remove the selected TeamMember?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    var deletePromises = [];

                    selectedItems.forEach(function (item) {
                      var path = item.getBindingContextPath();
                      var itemId = table
                        .getModel("mTeamMember")
                        .getProperty(path).id;

                      deletePromises.push(
                        new Promise(function (resolve, reject) {
                          $.ajax({
                            url: "/deswork/api/p-project-teams/" + itemId,
                            type: "DELETE",
                            success: function (res) {
                              resolve(res);
                            },
                            error: function (err) {
                              reject(err.responseText);
                            },
                          });
                        })
                      );
                    });

                    Promise.all(deletePromises)
                      .then(function () {
                        // Handle success
                        MessageToast.show("Team Member Deleted Successfully!");
                        // that.selectedObjectRaci(that.sObjectId);
                        //   that._onObjectMatched(that.id);
                        that.Jid = JSON.parse(that.id)
                        that._onObjectMatched(that.Jid);
                        that.getView().getModel().updateBindings(true);
                        that.getView().getModel("mTeamMember").updateBindings(true);
                        that.getView().getModel("mTeamMember").refresh();
                        that.getView().getModel("mprojects").refresh();

                        that
                          .getView()
                          .getModel("mprojects")
                          .updateBindings(true);
                        $.ajax({
                          url: "/deswork/api/p-project-teams?populate[0]=p_project&filters[p_project][id][$eq]=" + that.ProjectId.id + "&populate[1]=users_permissions_user",
                          type: "GET",
                          success: function (res) {
                            var response = JSON.parse(res);
                            var theModel = new sap.ui.model.json.JSONModel(response.data);
                            that.getView().setModel(theModel, "mTeamMembers");
                            var teamusers = that.getView().getModel("mTeamMembers").getData();
                            var newUsers = [];
                            for (var i = 0; i < teamusers.length; i++) {
                              newUsers.push(teamusers[i].attributes.users_permissions_user.data.id);
                            }
                            $.ajax({
                              url: "/deswork/api/p-projects/" + that.ProjectId.id + "?populate=*",
                              type: "PUT",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              data: JSON.stringify({
                                "data": {
                                  "users_permissions_users": newUsers
                                }
                              }),
                              success: function (response) {
                                var resValue = JSON.parse(response);
                                if (resValue.error) {
                                  MessageBox.error(resValue.error.message);
                                } else {
                                  // that._onObjectMatched(that.id);
                                  that.Jid = JSON.parse(that.id)
                                  that._onObjectMatched(that.Jid);
                                }
                              }
                            });
                          },
                          error: function (res) {
                            MessageBox.error(res + "Something went wrong");
                          },
                        });
                      })
                      .catch(function (error) {
                        // Handle error
                        MessageBox.error(error);
                      });
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        }
      },
      onCloseTeamDialog: function () {
			var thisView = this.oAddTeamMember;
      thisView.getContent()[0].getItems()[0].getContent()[1].setSelectedKey() === ""
			thisView.getContent()[0].getItems()[0].getContent()[3].setValue() === "" 	
			thisView.getContent()[0].getItems()[0].getContent()[5].setValue() === "" 	
        this.oAddTeamMember.close();
      },



      //TASK DETAILS UPDATED : ANU

      //TASK DELETE ADD
      getTaskDetails: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-tasks?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var taskData = [];
            that.mcsrfLength = response.data.length;
            response.data.forEach(function (teamDetails) {
              if (teamDetails.attributes.p_project.data === null) {
              } else {
                if (teamDetails.attributes.p_project.data.id == that.id) {
                  taskData.push(teamDetails);
                }
              }
            });
            var theModel = new sap.ui.model.json.JSONModel(taskData);
            that.getView().setModel(theModel, "mTasks");
          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          },
        });
      },

      getNameforTask: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-projects/" + that.id + "?populate[0]=users_permissions_users",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var teamMembers = response.data.attributes.users_permissions_users.data;
            var userDetails = [];

            // Iterate over teamMembers and retrieve user details
            for (var i = 0; i < teamMembers.length; i++) {
              var id = teamMembers[i].id;
              var firstName = teamMembers[i].attributes.firstName;
              var lastName = teamMembers[i].attributes.lastName;
              //  var email = teamMembers[i].attributes.email;

              // Create an object with user details
              var user = {
                id: id,
                firstName: firstName,
                lastName: lastName,
                //  email: email
              };

              // Push user details to the userDetails array
              userDetails.push(user);
            }

            var theModel = new sap.ui.model.json.JSONModel(userDetails);
            that.getView().setModel(theModel, "pTeams");

            // Access the model data
            var modelData = that.getView().getModel("pTeams").getData();

          },
          error: function (res) {

          },
        });
      },

      onCloseSubTaskDialog: function () {
        this.oAddSubTaskInfo.close();
      },
      // addTaskDailog: function () {
      //   this.editTask = false;
      //   this.oAddTaskInfo.setModel(
      //     new sap.ui.model.json.JSONModel({}),
      //     "mTasks"
      //   );
      //   this.oAddTaskInfo.open();
      // },

      addSubTaskDailog: function () {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show(" can't add task for Completed Projects ")
        }
        else {
          this.oAddSubTaskInfo.setModel(
            new sap.ui.model.json.JSONModel({}),
            "mSubTasks"
          );
          this.oAddSubTaskInfo.open();
        }
      },
      onSaveSubTaskDialog: function (oEv) {
        var that = this;
        var Err = this.ValidateAddSubTask();
        if (Err == 0) {
          that.addCSFPayload = {
            "name": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[1]
              .getValue(),
            "startDate": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[3]
              .getValue(),
            "endDate": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[5]
              .getValue(),
            "status": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[7]
              .getSelectedKey(),
            "p_task": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[9]
              .getSelectedKey(),
            //   "p_project": [projectData.id],
          };
          $.post(
            //  "/deswork/api/p-tasks?populate=*",
            "/deswork/api/p-sub-tasks?populate=*",
            {
              data: that.addCSFPayload
            },
            function (response) {
              var resValue = JSON.parse(response);

              if (resValue.error) {
                MessageBox.error(resValue.error.message);
              } else {
                MessageToast.show("Task Added successfully!");
                // that.projectsDetails();
                that._onObjectMatched(that.id);
                that.getView().getModel().updateBindings(true);

                that.oAddSubTaskInfo.close();
              }
            })

        }
        else {
          this.getView().setBusy(false);
          var text = "Mandatory Fields are Required";
          MessageBox.error(text);
        }

      },

      //VALIDATING ADD SUB-TASK

      ValidateAddSubTask: function () {
        var Err = 0;
        var thisView = this.oAddSubTaskInfo;
        if (thisView.getContent()[2].getContent()[1].getSelectedKey() === "" || thisView.getContent()[2].getContent()[1].getSelectedKey() == null) {
          Err++;
        }
        else {
          thisView.getContent()[2].getContent()[1].setValueState("None");
        }

        if (thisView.getContent()[2].getContent()[3].getValue() === "") {
          thisView.getContent()[2].getContent()[3].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[2].getContent()[5].getValue() === "") {
          thisView.getContent()[2].getContent()[5].setValueState("None");
          Err++;
        }

        if (thisView.getContent()[2].getContent()[7].getValue() === "") {
          thisView.getContent()[2].getContent()[7].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[2].getContent()[9].getValue() === "") {
          thisView.getContent()[2].getContent()[9].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[2].getContent()[13].getSelectedKey() === "") {
          thisView.getContent()[2].getContent()[13].setValueState("None");
          Err++;
        }
        return Err;
      },

      deleteTaskDailog: function (evt) {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show(" Can't Delete task for Completed Projects ")
        }
        else {
          this.table = this.getView().byId("TreeTableBasic");
          var selectedItems = this.table.getSelectedIndices();
          var oModel = this.table.getBinding().getModel();

          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to delete the selected Task?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    var deletePromises = [];
                    selectedItems.forEach(function (itemIndex) {
                      var oContext = that.table.getContextByIndex(itemIndex);
                      var oData = oContext.getProperty();
                      var sPath = oContext.getPath()
                      var itemId = oData.id;
                      var id = parseInt(that.id);
                      if (sPath.includes("p_sub_tasks")) {
                        // Delete subtask
                        deletePromises.push(
                          new Promise(function (resolve, reject) {
                            $.ajax({
                              url: "/deswork/api/p-sub-tasks/" + itemId,
                              type: "DELETE",
                              success: function (res) {
                                resolve(res);
                                MessageToast.show("Sub-Tasks Deleted Successfully!");
                                that._onObjectMatched(that.id);
                                that.getView().getModel().updateBindings(true);
                              },
                              error: function (err) {
                                reject(err.responseText);
                              },
                            });
                          })
                        );
                      } else {
                        // Delete task
                        deletePromises.push(

                          new Promise(function (resolve, reject) {
                            $.ajax({
                              url: "/deswork/api/p-tasks/" + itemId + "?populate=*",
                              type: "DELETE",
                              success: function (res) {
                                resolve(res);
                                MessageToast.show("Tasks Deleted Successfully!");
                                that._onObjectMatched(id);
                                that.getView().getModel().updateBindings(true);
                              },
                              error: function (err) {
                                reject(err.responseText);
                              },
                            });
                          })
                        );
                      }
                    });

                    Promise.all(deletePromises)
                      .then(function () {
                        // MessageToast.show("Tasks Deleted Successfully!");
                        that._onObjectMatched(that.id);
                        that.getView().getModel().updateBindings(true);
                        that.getView().getModel("mCsfDetails").updateBindings(true);
                        that.getView().getModel("mCsfDetails").refresh();
                        that.getView().getModel("mprojects").refresh();
                        that.getView().getModel("mprojects").updateBindings(true);
                      })
                      .catch(function (error) {
                        MessageBox.error(error);
                      });
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        }
      },




      onSearch: function () {
        var aTableFilters = this.oFilterBar
          .getFilterGroupItems()
          .reduce(function (aResult, oFilterGroupItem) {
            var oControl = oFilterGroupItem.getControl(),
              aSelectedKeys = oControl.getSelectedKeys(),
              aFilters = aSelectedKeys.map(function (sSelectedKey) {
                return new Filter({
                  path: oFilterGroupItem.getName(),
                  operator: FilterOperator.Contains,
                  value1: sSelectedKey,
                });
              });

            if (aSelectedKeys.length > 0) {
              aResult.push(
                new Filter({
                  filters: aFilters,
                  and: false,
                })
              );
            }

            return aResult;
          }, []);

        this.oTable.getBinding("items").filter(aTableFilters);
        this.oTable.setShowOverlay(false);
      },

      onFilterChange: function () {
        this._updateLabelsAndTable();
      },

      onAfterVariantLoad: function () {
        this._updateLabelsAndTable();
      },

      getFormattedSummaryText: function () {
        var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return "No filters active";
        }

        if (aFiltersWithValues.length === 1) {
          return (
            aFiltersWithValues.length +
            " filter active: " +
            aFiltersWithValues.join(", ")
          );
        }

        return (
          aFiltersWithValues.length +
          " filters active: " +
          aFiltersWithValues.join(", ")
        );
      },

      getFormattedSummaryTextExpanded: function () {
        var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

        if (aFiltersWithValues.length === 0) {
          return "No filters active";
        }

        var sText = aFiltersWithValues.length + " filters active",
          aNonVisibleFiltersWithValues =
            this.oFilterBar.retrieveNonVisibleFiltersWithValues();

        if (aFiltersWithValues.length === 1) {
          sText = aFiltersWithValues.length + " filter active";
        }

        if (
          aNonVisibleFiltersWithValues &&
          aNonVisibleFiltersWithValues.length > 0
        ) {
          sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
        }

        return sText;
      },

      _updateLabelsAndTable: function () {
        this.oTable.setShowOverlay(true);
      },

      onApproveProjects: function () {
        var that = this;
        that.programApproved("Approved");
      },
      programApproved: function (result) {
        var that = this;
        this.table = this.getView().byId("TreeTableBasic");
        var selectedItems = this.table.getSelectedIndices();
        var oModel = this.table.getBinding().getModel();

        if (selectedItems.length > 0) {
          MessageBox.confirm(
            "Are you sure you want to Approve the Time Extension for selected Task?",
            {
              title: "Confirm Deletion",
              icon: MessageBox.Icon.WARNING,
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                if (oAction === "YES") {
                  //  var deletePromises = [];

                  selectedItems.forEach(function (itemIndex) {
                    var oContext = that.table.getContextByIndex(itemIndex);
                    var oData = oContext.getProperty();
                    var sPath = oContext.getPath()
                    var itemId = oData.id;
                    var itemStatus = oData.p_approver_status;
                    //   if(itemStatus == "Requested"){
                    var updateData = {
                      p_approver_status: "Approved" // Update the status to "approved"
                    };
                    $.ajax({
                      url: "/deswork/api/p-sub-tasks/" + itemId,
                      type: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      data: JSON.stringify({
                        data: updateData,
                      }),

                      success: function (res) {
                        //  resolve(res);
                        MessageToast.show("Sub-Tasks Approved Successfully!");
                        that._onObjectMatched(that.id);
                        that.getView().getModel().updateBindings(true);
                      },
                      error: function (err) {

                      },
                    });
                    // }
                    // else{
                    //   sap.m.MessageToast.show("Please select the Time Extension Requested item only.");
                    // }


                  });


                }
              },
            }
          );
        } else {
          sap.m.MessageToast.show("Please select at least one item.");
        }
      },
      OnRejectProjects: function () {
        var that = this;
        that.programRejected("Rejected");
      },
      programRejected: function (result) {
        var that = this;
        this.table = this.getView().byId("TreeTableBasic");
        var selectedItems = this.table.getSelectedIndices();
        var oModel = this.table.getBinding().getModel();

        if (selectedItems.length > 0) {
          MessageBox.confirm(
            "Are you sure you want to Reject the selected Time Extension for  Task?",
            {
              title: "Confirm Deletion",
              icon: MessageBox.Icon.WARNING,
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (oAction) {
                if (oAction === "YES") {
                  //  var deletePromises = [];

                  selectedItems.forEach(function (itemIndex) {
                    var oContext = that.table.getContextByIndex(itemIndex);
                    var oData = oContext.getProperty();
                    var sPath = oContext.getPath()
                    var itemId = oData.id;
                    var itemStatus = oData.p_approver_status;
                    //   if(itemStatus == "Requested"){
                    var updateData = {
                      p_approver_status: "Rejected" // Update the status to "approved"
                    };
                    $.ajax({
                      url: "/deswork/api/p-sub-tasks/" + itemId,
                      type: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      data: JSON.stringify({
                        data: updateData,
                      }),

                      success: function (res) {
                        //  resolve(res);
                        MessageToast.show("Sub-Tasks Approved Successfully!");
                        that._onObjectMatched(that.id);
                        that.getView().getModel().updateBindings(true);
                      },
                      error: function (err) {

                      },
                    });
                    // }
                    // else{
                    //   sap.m.MessageToast.show("Please select the Time Extension Requested item only.");
                    // }


                  });


                }
              },
            }
          );
        } else {
          sap.m.MessageToast.show("Please select at least one item.");
        }
      },
      //from here
      handleSelectionChange: function (oEvent) {
        var that = this;
        var gettingText = oEvent.getParameter("item").getProperty("text");

        if (gettingText === 'CREATE TASK') {
          this.oAddSubTaskInfo.getContent()[1].setVisible(true);
          this.oAddSubTaskInfo.getContent()[2].setVisible(false);
          // that.getView().byId('AddTasks').setVisible(true);
          // that.getView().byId('AddSubTasks').setVisible(false);

        } else {
          this.oAddSubTaskInfo.getContent()[1].setVisible(false);
          this.oAddSubTaskInfo.getContent()[2].setVisible(true);
          // that.getView().byId('AddTasks').setVisible(false);
          // that.getView().byId('AddSubTasks').setVisible(true);
        }
      },
      handleAddTaskCancelS: function () {
        var that = this;
        that.oAddSubTaskInfo.close();
        if (this.oAddSubTaskInfo.getContent()[1].getVisible() == true) {
          // that.CLearSubInfoAdd()
          that.CLearSubInfo();
        } else {
          that.CLearSubInfosub();
        }
      },
      handleAddTaskS: function () {
        var that = this;
        // var taskStatus;
        var projectData = this.getView().getModel("mprojects").getData();
        // that.frg = this.getView().getModel("mCsfDetails").getData()[this.taskPath]

        that.addCSFPayload = {
          "name": this.oAddSubTaskInfo.getContent()[1].getContent()[1].getValue(),
          "description": this.oAddSubTaskInfo.getContent()[1].getContent()[3].getValue(),
          "startDate": this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue(),
          "endDate": this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue(),
          "noOfDays": this.oAddSubTaskInfo.getContent()[1].getContent()[9].getValue(),
          "status": this.oAddSubTaskInfo.getContent()[1].getContent()[11].getSelectedKey(),
          "priority": this.oAddSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
          "users_permissions_user": this.oAddSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
          "p_project": [projectData.id],
        };
        if (new Date(projectData.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue())) {
          sap.m.MessageBox.error("Start date is less than Project Start date");
        }
        // else if (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.estimatedEndDate)) {
        //   sap.m.MessageBox.error("End date is greater than Project Estimated end date");
        // }
        else if (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue()) > new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue())) {
          sap.m.MessageBox.error("Start date is greater than end date");
        }
        else if ((new Date(projectData.attributes.actualEndDate)) > (new Date(projectData.attributes.estimatedEndDate)) &&
          (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.actualEndDate))) {
          sap.m.MessageBox.error("End date is greater than project extended end date");
        }
        else if ((new Date(projectData.attributes.actualEndDate)) < (new Date(projectData.attributes.estimatedEndDate)) &&
          (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.estimatedEndDate))) {
          sap.m.MessageBox.error("End date is greater than project estimated end date");
        }
        // else if (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.estimatedEndDate)){
        //     sap.m.MessageBox.error("End date is greater than Project estimated end date");
        //     }

        else if (this.oAddSubTaskInfo.getContent()[1].getVisible() == true) {
          var Err = this.ValidateAddTask();
          if (Err == 0) {
            $.post(
              "/deswork/api/p-tasks?populate=*",
              {
                data: that.addCSFPayload
              },
              function (response) {
                var resValue = JSON.parse(response);

                if (resValue.error) {
                  MessageBox.error(resValue.error.message);
                } else {
                  MessageToast.show("Task Added successfully!");
                  // that.projectsDetails();
                  var id = JSON.parse(that.id);
                  that.getView().getModel().updateBindings(true);
                  that.oAddSubTaskInfo.close();
                  that.CLearSubInfo();
                  that._onObjectMatched(id);
                }
              }
            )
          }

          else {
            this.getView().setBusy(false);
            var text = "Mandatory Fields are Required";
            MessageBox.error(text);
          }
        }
        else {
          var that = this;
          var Err = this.ValidateAddSubTask();
          if (Err == 0) {
            var taskdetailid = this.oAddSubTaskInfo.getContent()[2].getContent()[1].getSelectedKey();
            $.ajax({
              url: "deswork/api/p-tasks/" + taskdetailid + "?populate=*",
              type: "GET",

              success: function (res) {
                var response = JSON.parse(res);
                that.mcsrfLength = response.data.length;
                var cModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(cModel, "mCsfDetails");
                that.taskDetails = that.getView().getModel("mCsfDetails").getData();
              },
              error: function (res) {
                MessageBox.error(res + "Something went wrong");
              }
            });
            that.addSubCSFPayload = {
              "p_task": this.oAddSubTaskInfo.getContent()[2].getContent()[1].getSelectedKey(),

              "name": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[3]
                .getValue(),
              "description": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[5]
                .getValue(),
              "startDate": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[7]
                .getValue(),
              "endDate": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[9]
                .getValue(),
              "noOfDays": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[11]
                .getValue(),
              "status": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[13]
                .getSelectedKey(),
            };

            if (new Date(projectData.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue())) {
              sap.m.MessageBox.error("Start date is less than Project start date");
            }
            else if (new Date(that.taskDetails.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue())) {
              sap.m.MessageBox.error("Start date is less than Task start date");
            }
            else if (((new Date(that.taskDetails.attributes.endDate)) > (new Date(that.taskDetails.attributes.extended_end_date))) &&
              (new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue()) > new Date(that.taskDetails.attributes.endDate))) {
              sap.m.MessageBox.error("Estimated End date is greater than Task End date");
            }
            else if (((new Date(that.taskDetails.attributes.endDate)) < (new Date(that.taskDetails.attributes.extended_end_date))) &&
              (new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue()) > new Date(that.taskDetails.attributes.extended_end_date))) {
              sap.m.MessageBox.error("Estimated End date is greater than Task Extended End date");
            }
            else if (new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue()) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue())) {
              sap.m.MessageBox.error("Start date is greater than End date");
            }
            else {
              $.post(
                "/deswork/api/p-sub-tasks?populate=*",
                {
                  data: that.addSubCSFPayload
                },
                function (response) {
                  var resValue = JSON.parse(response);
                  if (resValue.error) {
                    MessageBox.error(resValue.error.message);
                  } else {
                    MessageToast.show("Sub-Task Added successfully!");
                    that.oAddSubTaskInfo.close();
                    var id = JSON.parse(that.id);
                    that._onObjectMatched(id);
                    that.getView().getModel().updateBindings(true);
                    that.CLearSubInfosub();
                  }
                })
            }
          }
          else {
            this.getView().setBusy(false);
            var text = "Mandatory Fields are Required";
            MessageBox.error(text);
          }
        }
      },
      // VALIDATE ADD TASK 
      ValidateAddTask: function () {
        var Err = 0;
        var thisView = this.oAddSubTaskInfo;
        if (thisView.getContent()[1].getContent()[1].getValue() === "" || thisView.getContent()[1].getContent()[1].getValue() == null) {
          Err++;
        }
        else {
          thisView.getContent()[1].getContent()[1].setValueState("None");
        }
        if (thisView.getContent()[1].getContent()[5].getValue() === "") {
          thisView.getContent()[1].getContent()[5].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[7].getValue() === "") {
          thisView.getContent()[1].getContent()[7].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[11].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[11].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[13].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[13].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[15].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[15].setValueState("None");
          Err++;
        }
        return Err;
      },
      CLearSubInfosub: function () {
        var that = this;
        this.oAddSubTaskInfo.getContent()[2].getContent()[1].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[3].setValue("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[5].setValue("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[7].setValue("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[9].setValue("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[11].setValue("");
        this.oAddSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey("");
      },
      CLearSubInfo: function () {
        var that = this;
        this.oAddSubTaskInfo.getContent()[1].getContent()[1].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[3].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[5].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[7].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[9].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
      },
      CLearSubInfoAdd: function () {
        var that = this;
        this.oAddSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[3].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[5].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[7].setValue("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[9].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");
        this.oAddSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
      },

      handleSubSelectionChange: function (oEvent) {
        var that = this;
        var gettingText = oEvent.getParameter("item").getProperty("text");

        if (gettingText === 'EDIT TASK') {
          this.oEditSubTaskInfo.getContent()[1].setVisible(true);
          this.oEditSubTaskInfo.getContent()[2].setVisible(false);

        } else {
          this.oEditSubTaskInfo.getContent()[1].setVisible(false);
          this.oEditSubTaskInfo.getContent()[2].setVisible(true);
        }
      },
      handleEditAddTaskCancelS: function () {
        var that = this;
        this.oEditSubTaskInfo.close();
        if (this.oEditSubTaskInfo.getContent()[1].getVisible() == true) {
          that.CLearSubInfoAddEdit();
        } else {
          that.CLearSubInfosubEdit();
        }
      },
      editSubTaskDailog: function () {
        var that = this;
        var EditModel = that
          .getView()
          .getModel("mprojects")
          .getData().attributes;
        if (EditModel.status === "Completed") {
          MessageToast.show(" can't edit task for Completed Projects ")
        }
        else {
          this.oEditSubTaskInfo.open();
        }
      },
      Subcsf: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-sub-tasks?populate[0]=p_task.p_project&filters[p_task][p_project][id][$eq]= " + that.id,
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mSubcsf");
          },
          error: function (res) {

            MessageBox.error(res + "Something went wroung");
          }
        });
      },

      csf: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-tasks?populate=*&filters[p_project][id][$eq]=" + that.id,
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mcsf");
          },
          error: function (res) {
            MessageBox.error(res + "Something went wroung");
          }
        });
      },

      onPress: function (oEvent) {
        var that = this;
        that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url: "deswork/api/p-sub-tasks/" + that.selectedId + "?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            var taskData = that.getView().getModel("mCsfDetails").getData();
            var selected_id = that.getView().getModel("mCsfDetails").getData().id;

            var check = that.getView().getModel("mCsfDetails").getData().attributes;
            that.oEditSubTaskInfo.getContent()[2].getContent()[3].setValue(check.description);
            that.oEditSubTaskInfo.getContent()[2].getContent()[5].setValue(check.startDate);
            that.oEditSubTaskInfo.getContent()[2].getContent()[7].setValue(check.endDate);
            that.oEditSubTaskInfo.getContent()[2].getContent()[9].setValue(check.extended_end_date);
            that.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(check.noOfDays);
            that.oEditSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey(check.status);

          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      onPressTask: function (oEvent) {
        var that = this;
        that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url: "deswork/api/p-tasks/" + that.selectedId + "?populate=*",
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);

            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");

            var taskData = that.getView().getModel("mCsfDetails").getData();
            var selected_id = that.getView().getModel("mCsfDetails").getData().id;

            var check = that.getView().getModel("mCsfDetails").getData().attributes;
            that.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue(check.description);
            that.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue(check.startDate);
            that.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue(check.endDate);
            that.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue(check.extended_end_date);
            that.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(check.noOfDays);
            that.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey(check.status);
            that.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey(check.priority);
            that.oEditSubTaskInfo.getContent()[1].getContent()[17].setSelectedKey(check.users_permissions_user.data.id);

          },
          error: function (res) {
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      handleEditAddTaskS: function () {
        var that = this;
        that.selectedId;
        that.Subid = JSON.parse(that.selectedId);
        that.upEditSubTaskInfo = {
          description: that.oEditSubTaskInfo.getContent()[2].getContent()[3].getValue(),
          startDate: that.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue(),
          endDate: that.oEditSubTaskInfo.getContent()[2].getContent()[7].getValue(),
          extended_end_date: that.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue() ? that.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue() : null,
          noOfDays: that.oEditSubTaskInfo.getContent()[2].getContent()[11].getValue(),
          status: that.oEditSubTaskInfo.getContent()[2].getContent()[13].getSelectedKey(),
        }
        that.taskDetails = that.getView().getModel("mCsfDetails").getData();
        var projectData = this.getView().getModel("mprojects").getData();
        if (this.oEditSubTaskInfo.getContent()[2].getVisible() == true) {
          if (new Date(that.taskDetails.attributes.startDate) > new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue())) {
            sap.m.MessageBox.error("Start date is less than Task start date");
          }
          else if (((new Date(that.taskDetails.attributes.endDate)) > (new Date(that.taskDetails.attributes.extended_end_date))) &&
            (new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue()) > new Date(that.taskDetails.attributes.endDate))) {
            sap.m.MessageBox.error("start date is greater than Task End date");
          }
          else if (((new Date(that.taskDetails.attributes.endDate)) < (new Date(that.taskDetails.attributes.extended_end_date))) &&
            (new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue()) > new Date(that.taskDetails.attributes.extended_end_date))) {
            sap.m.MessageBox.error("start date is greater than Task Extended End date");
          }
          else if (((new Date(that.taskDetails.attributes.endDate)) > (new Date(that.taskDetails.attributes.extended_end_date))) &&
            (new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue()) > new Date(that.taskDetails.attributes.endDate))) {
            sap.m.MessageBox.error("Subtask Extended End date is greater than Task End date");
          }
          else if (((new Date(that.taskDetails.attributes.endDate)) < (new Date(that.taskDetails.attributes.extended_end_date))) &&
            (new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue()) > new Date(that.taskDetails.attributes.extended_end_date))) {
            sap.m.MessageBox.error("Subtask Extended End date is greater than Task Extended End date");
          }
          else if (new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[7].getValue()) > new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue())) {
            sap.m.MessageBox.error("Estimated End date is greater than Extended End date");
          }
          else {
            var Err = this.ValidateEditSubTask();
            if (Err == 0) {
              $.ajax({
                url: "deswork/api/p-sub-tasks/" + that.Subid + "?populate=*",
                type: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                data: JSON.stringify({
                  data: that.upEditSubTaskInfo,
                }),
                success: function (res) {
                  var getValues = JSON.parse(res);
                  if (getValues.error) {
                    MessageBox.error(getValues.error.message);
                  } else {
                    that.oEditSubTaskInfo.close();
                    MessageToast.show("Sub-Tasks Updated Successfully!");
                    that._onObjectMatched(that.id);
                    that.getView().getModel().updateBindings(true);
                    that.CLearSubInfosubEdit();
                  }
                },
              })
            } else {
              this.getView().setBusy(false);
              var text = "Mandatory Fields are Required";
              MessageBox.error(text);
            }
          }
        }
        else {
          that.upEditTaskInfo = {
            description: that.oEditSubTaskInfo.getContent()[1].getContent()[3].getValue(),
            startDate: that.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue(),
            endDate: that.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue(),
            extended_end_date: that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue() ? that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue() : null,
            noOfDays: that.oEditSubTaskInfo.getContent()[1].getContent()[11].getValue(),
            status: that.oEditSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
            priority: that.oEditSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
            users_permissions_user: that.oEditSubTaskInfo.getContent()[1].getContent()[17].getSelectedKey(),
          }
          that.taskDetails = that.getView().getModel("mCsfDetails").getData();
          var projectData = this.getView().getModel("mprojects").getData();
          if (new Date(projectData.attributes.startDate) > new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue())) {
            sap.m.MessageBox.error("Start date is less than Project Start date");
          }
          // else if (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.estimatedEndDate)) {
          //   sap.m.MessageBox.error("End date is greater than Project Estimated end date");
          // }
          else if (new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue()) > new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue())) {
            sap.m.MessageBox.error("Start date is greater than end date");
          }
          else if ((new Date(projectData.attributes.actualEndDate)) > (new Date(projectData.attributes.estimatedEndDate)) &&
            (new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue()) > new Date(projectData.attributes.actualEndDate))) {
            sap.m.MessageBox.error("Extended end date is greater than project extended end date");
          }
          else if ((new Date(projectData.attributes.actualEndDate)) < (new Date(projectData.attributes.estimatedEndDate)) &&
            (new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue()) > new Date(projectData.attributes.estimatedEndDate))) {
            sap.m.MessageBox.error("Extended end date is greater than project estimated end date");
          }
          else if ((new Date(projectData.attributes.actualEndDate)) > (new Date(projectData.attributes.estimatedEndDate)) &&
            (new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.actualEndDate))) {
            sap.m.MessageBox.error("End date is greater than project extended end date");
          }
          else if ((new Date(projectData.attributes.actualEndDate)) < (new Date(projectData.attributes.estimatedEndDate)) &&
            (new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue()) > new Date(projectData.attributes.estimatedEndDate))) {
            sap.m.MessageBox.error("End date is greater than project estimated end date");
          }
          else {
            var Err = this.ValidateEditTask();
            if (Err == 0) {
              $.ajax({
                url: "deswork/api/p-tasks/" + that.Subid + "?populate=*",
                type: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                data: JSON.stringify({
                  data: that.upEditTaskInfo,
                }),
                success: function (res) {
                  var getValues = JSON.parse(res);
                  if (getValues.error) {
                    MessageBox.error(getValues.error.message);
                  } else {
                    that.oEditSubTaskInfo.close();
                    MessageToast.show("Tasks Updated Successfully!");
                    that.id;
                    that.parId = that.id;
                    that.parIds = JSON.parse(that.parId);
                    that._onObjectMatched(that.parIds);
                    that.getView().getModel().updateBindings(true);
                    that.CLearSubInfoAddEdit();
                  }
                },
              })
            } else {
              this.getView().setBusy(false);
              var text = "Mandatory Fields are Required";
              MessageBox.error(text);
            }
          }
        }
      },
      ValidateEditTask: function () {
        var Err = 0;
        var thisView = this.oEditSubTaskInfo;
        if (thisView.getContent()[1].getContent()[1].getSelectedKey() === "" || thisView.getContent()[1].getContent()[1].getSelectedKey() == null) {
          Err++;
        }
        else {
          thisView.getContent()[1].getContent()[1].setValueState("None");
        }
        if (thisView.getContent()[1].getContent()[5].getValue() === "") {
          thisView.getContent()[1].getContent()[5].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[7].getValue() === "") {
          thisView.getContent()[1].getContent()[7].setValueState("None");
          Err++;
        }
        // if (thisView.getContent()[1].getContent()[9].getValue() === "") {
        //   thisView.getContent()[1].getContent()[9].setValueState("None");
        //   Err++;
        // }
        if (thisView.getContent()[1].getContent()[13].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[13].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[15].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[15].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[1].getContent()[17].getSelectedKey() === "") {
          thisView.getContent()[1].getContent()[17].setValueState("None");
          Err++;
        }
        return Err;
      },
      ValidateEditSubTask: function () {
        var Err = 0;
        var thisView = this.oEditSubTaskInfo;
        if (thisView.getContent()[2].getContent()[1].getSelectedKey() === "" || thisView.getContent()[2].getContent()[1].getSelectedKey() == null) {
          Err++;
        }
        else {
          thisView.getContent()[2].getContent()[1].setValueState("None");
        }

        if (thisView.getContent()[2].getContent()[3].getValue() === "") {
          thisView.getContent()[2].getContent()[3].setValueState("None");
          Err++;
        }
        if (thisView.getContent()[2].getContent()[5].getValue() === "") {
          thisView.getContent()[2].getContent()[5].setValueState("None");
          Err++;
        }

        if (thisView.getContent()[2].getContent()[7].getValue() === "") {
          thisView.getContent()[2].getContent()[7].setValueState("None");
          Err++;
        }
        // if (thisView.getContent()[2].getContent()[9].getValue() === "") {
        //   thisView.getContent()[2].getContent()[9].setValueState("None");
        //   Err++;
        // }
        if (thisView.getContent()[2].getContent()[13].getSelectedKey() === "") {
          thisView.getContent()[2].getContent()[13].setValueState("None");
          Err++;
        }
        return Err;


      },
      CLearSubInfosubEdit: function () {
        this.oEditSubTaskInfo.getContent()[2].getContent()[1].setSelectedKey("");
        this.oEditSubTaskInfo.getContent()[2].getContent()[3].setValue("");
        this.oEditSubTaskInfo.getContent()[2].getContent()[5].setValue("");
        this.oEditSubTaskInfo.getContent()[2].getContent()[7].setValue("");
        this.oEditSubTaskInfo.getContent()[2].getContent()[9].setValue("");
        this.oEditSubTaskInfo.getContent()[2].getContent()[11].setSelectedKey("");

        this.oEditSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey("");
        // this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
      },
      CLearSubInfoAddEdit: function () {
        this.oEditSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[17].setSelectedKey("");

        this.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
      },
      CLearSubInfosubTask: function () {
        var that = this;
        this.oEditSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");

        this.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
        this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
        // description: that.oEditSubTaskInfo.getContent()[1].getContent()[3].getValue(),
        //   startDate: that.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue(),
        //   endDate: that.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue(),
        //   extended_end_date: that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue(),
        //   status: that.oEditSubTaskInfo.getContent()[1].getContent()[11].getSelectedKey(),
        //   priority: that.oEditSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
        //   users_permissions_user: that.oEditSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
      },

      ///calculate Effort for Projects

      getEffort: function () {
        var that = this;
        $.ajax({
          type: "GET",
          url: '/deswork/api/p-projects?populate=*&filters[id][$eq]=' + that.id,
          success: function (response) {
            var res = JSON.parse(response);

            var projects = res.data;
            var kpiInfo = [];

            projects.forEach(function (project) {
              var completedTasksCount = 0;
              var totalDays = 0;
              project.attributes.p_tasks.data.forEach(function (task) {
                if (task.attributes.status === "Completed") {
                  completedTasksCount++;
                  var startDate = new Date(task.attributes.startDate);
                  var endDate = new Date(task.attributes.endDate);
                  var businessDays = that.calculateBusinessDays(startDate, endDate);
                  totalDays += businessDays;
                }
              });

              // Add the project details along with completed tasks count and total days to kpiInfo
              kpiInfo.push({
                // project: project,
                //completedTasksCount: completedTasksCount,
                totalDays: totalDays
              });
            });

            var oModel3 = new sap.ui.model.json.JSONModel(kpiInfo);
            that.getView().setModel(oModel3, "kpiInfo");
          }
        });
      },

      calculateBusinessDays: function (startDate, endDate) {
        var days = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)); // Total days between startDate and endDate
        var businessDays = 0;

        for (var i = 0; i <= days; i++) {
          var currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);

          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            businessDays++; // Increment businessDays if the currentDate is not Saturday or Sunday
          }
        }

        return businessDays;
      },

      //FOR NO OF TASK CAL
      handleChange: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue());
        var endDate = new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oAddSubTaskInfo.getContent()[1].getContent()[9].setValue(totalDays);
        var today = new Date().toISOString().slice(0, 10);

        that.startDate = this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue();
        that.endDate = this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue();

			if (that.startDate <= today && that.endDate >= today) {
				//that.projectStatus.attributes.status = "In-progress";
				
        this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("In-Progress")
			} else if (that.startDate > today) {
        this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("New")
			}
     },
      //FOR NO OF DAYS SUB-TASK CAL
      handleChangeSub: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue());
        var endDate = new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oAddSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
      },
      onChangeSubTaskEdit: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue());
        var endDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[7].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
      },
      onChangeTaskEdit: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue());
        var endDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(totalDays);
      },
      onChangeTaskEditIfExtended: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue());
        var endDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(totalDays);
      },
      onChangeSubTaskEditIfExtended: function (oEvent) {
        var that = this;
        var startDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue());
        var endDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue());
        var businessDays = that.calculateBusinessDays(startDate, endDate);
        var totalDays = businessDays;
        this.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
      },
      onSearchParticipantValueHelp: function (evt) {
        this.selectUser.getBinding("items").filter([new sap.ui.model.Filter("firstName", sap.ui.model.FilterOperator.Contains,
          evt.getParameters().value)]);
      },
    });
  }
);


