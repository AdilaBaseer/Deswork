sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "VASPP/employee/utils/formatter",
    "sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, MessageToast, formatter, UploadCollectionParameter) {
    "use strict";
    return Controller.extend("VASPP.employee.controller.DetailEmployee", {
        formatter: formatter,
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();
            this.oRouter.getRoute("detailEmployee").attachPatternMatched(this._onObjectMatched, this);
            [oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;
                            oButton.focus();
                        }
                    }.bind(this)
                });
            }, this);
        },

        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailEmployee", { layout: sNextLayout, product: this.id });
        },

        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailEmployee", { layout: sNextLayout, product: this.id });
        },

        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterEmployee", { layout: sNextLayout });
        },

        handleAddPagesAccess: function () {
            var that = this;
            if (!this.AddappFragment) {
                this.AddappFragment = sap.ui.xmlfragment("VASPP.employee.fragments.applicationList", this);
                this.getView().addDependent(this.AddappFragment);
            }
            this.AddappFragment.open();
        },

        handleConfirmAppList: function () {
            var that = this;
            var data = {
                "appId": that.AddappFragment._aSelectedItems[0].mProperties.title,
                "appName": that.AddappFragment._aSelectedItems[0].mProperties.description,
                "create": false,
                "read": true,
                "update": false,
                "delete": false
            };
            var model = that.getView().getModel("memployee").getData().EmployeeCollection[that._product].assignedApps;
            model.push(data);
            that.getView().getModel("memployee").updateBindings(true);
        },
        handleDeletePageAccess: function () {
            var that = this;
            MessageBox.confirm("Are you sure you want to Delete  ?", {
                actions: ["Yes", "No"],
                emphasizedAction: "Yes",
                onClose: function (oEvent) {
                    if (oEvent == "Yes") {
                        var model = that.getView().getModel("memployee").getData().EmployeeCollection[that._product].assignedApps;
                        var len = that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].length - 1;
                        var fulllen = that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].length;
                        var pos = that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].slice(len, fulllen);
                        model.splice(pos, 1);
                        that.getView().getModel("memployee").updateBindings(true);
                    }
                    MessageBox.success("Deleted Successfully");
                }
            });
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            //this.id = oEvent.getParameter("arguments").product;
            //fcl error
            if (typeof oEvent == "number") {
                this.id = oEvent;
            } else {
                this.id = oEvent.getParameter("arguments").product;
            }
            //fcl error
            that.delete = false;
            var options = {};
            that.mCsfData(this.id);
            this.handleGetUser(this.id);
            this.getUser(this.id);
            this.SkillUser(this.id);
        },
        SkillUser: function (id) {
            var that = this;
            var url = 'deswork/api/users/' + id;
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
                    that.setSkillSet(response.skills);
                    //that.setCertificatesSet(response.certificates);
                }
            });
        },

        setSkillSet: function (skills) {
            var result = [];
            if (skills === "" || skills === null) {
                var obj = {
                    "name": "",
                    "rate": 0
                }
                result.push(obj);

            } else {
                var skillSet = skills.split(",");
                for (var i = 0; i < skillSet.length; i++) {
                    var temp = skillSet[i].split("-");
                    var name = temp[0];
                    var rate = temp[1];
                    var obj = {
                        "name": name,
                        "rate": rate
                    }
                    result.push(obj);
                }
            }
            var oModel = new sap.ui.model.json.JSONModel(result);
            this.getView().setModel(oModel, "skillModel");
            //  this.setList(result);
        },
 
        mCsfData: function (id) {
            var that = this;
            // &populate[1]=users_permissions_user
            $.ajax({
                url: "/deswork/api/users/" + id + "?populate[0]=p_tasks.p_sub_tasks",
                type: "GET",
                success: function (res) {
                    var response = JSON.parse(res);
                    that.response = response;
                    var appPermissionData = [];
                    that.response.appPermission = appPermissionData;
                    var cModel = new sap.ui.model.json.JSONModel(that.response);
                    that.getView().setModel(cModel, "csfData");
                },
                error: function (res) {
                    MessageBox.error(res + "Something went wrong");
                }
            });
        },

        getUser: function (id) {
            var that = this;
            $.ajax({
                type: "GET",
                url: '/deswork/api/p-projects?populate[0]=p_tasks.users_permissions_user&filters[p_tasks][users_permissions_user][id]=' + id,
                success: function (response) {
                    var res = JSON.parse(response);
                    var projects = res.data;
                    var kpiInfo = [];
                    projects.forEach(function (project) {
                        var completedTasksCount = 0;
                        var totalDays = 0;
                        var taskLength = project.attributes.p_tasks.data.length;
                        var startDate = project.attributes.p_tasks.data[0].attributes.startDate;
                        var currDate = new Date();
                        var currYear = currDate.getFullYear();
                        var revisingDate = new Date(currYear, "03", "01");
                        var currYear1 = currDate.getFullYear() + 1;
                        // var revisingDate = new Date(currYear, "03", "01");
                        var revisingDate1 = new Date(currYear1, "03", "01");
                        var taskDate = new Date(startDate);
                        var taskYear = taskDate.getFullYear();
                        // var revisingMonth = revisingDate.getMonth() + 1;

                        for (var i = 0; i < taskLength; i++) {
                            var userId = project.attributes.p_tasks.data[i].attributes.users_permissions_user.data.id;
                            if (id == userId) {
                                var taskScan = project.attributes.p_tasks.data[i].attributes.status
                                if (taskScan === "Completed") {
                                    completedTasksCount++;
                                    var totalDays1 = parseInt(project.attributes.p_tasks.data[i].attributes.noOfDays);
                                    totalDays += totalDays1;
                                }
                                // Add the project details along with completed tasks count and total days to kpiInfo
                            }
                        }
                        if ((taskDate >= revisingDate) && (taskDate < revisingDate1)) {
                            kpiInfo.push({
                                project: project,
                                completedTasksCount: completedTasksCount,
                                totalDays: totalDays
                            });
                        } else {
                            completedTasksCount = 0;
                            totalDays = 0;
                        }
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
        //Get service for user list

        handleGetUser: function (id) {
            var that = this;
            if (this.delete) {
                $.ajax({
                    type: "GET",
                    url: '/deswork/api/users?populate=*',
                    success: function (response) {
                        that.getView().setBusy(false);
                        var resv = JSON.parse(response);
                        if (resv.error) {
                            MessageBox.error(resv.error.message)
                        } else {
                            var oModel = new sap.ui.model.json.JSONModel(resv);
                            that.getOwnerComponent().setModel(oModel, "memployee");
                            that.getOwnerComponent().getModel("memployee").updateBindings(true);
                            MessageBox.success("Employee has been deleted");
                            that.handleClose();
                        }
                    }
                });

            } else {
                $.ajax({
                    type: "GET",
                    url: '/deswork/api/users/' + id + '?populate[0]=p_project_teams&populate[1]=p_bank_datum&populate[2]=p_tasks.p_project&populate[3]=p_team_role_users',
                    success: function (response) {
                        response = JSON.parse(response);
                        that.getView().setBusy(false);
                        var oModel = new sap.ui.model.json.JSONModel(response);
                        that.getView().setModel(oModel, "memployee");
                        that.getView().getModel("memployee").updateBindings(true);
                        var tasks = response.p_tasks;
                        var oModel1 = new sap.ui.model.json.JSONModel(tasks);
                        that.getView().setModel(oModel1, "mtasks");
                        that.getView().getModel("memployee").updateBindings(true);
                    }
                })
            }
        },

        getCounty: function (oContext) {
            return oContext.getProperty('county');
        },

        getGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title: oGroup.key
            }
            );
        },

        setKPIInfo: function (task) {
            //var that = this;
            let kpiInfo = [];
            for (let i = 0; i < task.length;) {
                let d = task[i].endDate;
                let date = new Date(d);
                let quater = Math.floor(date.getMonth() / 3 + 1);
                task[i].quater = quater;
                kpiInfo.push(task);
                i++;
            }
            let oModel2 = new sap.ui.model.json.JSONModel(kpiInfo);
            that.getView().setModel(oModel2, "kpiInfo");
        },

        getQuarter: function (d) {
            let date = new Date(d);
            return Math.floor(date.getMonth() / 3 + 1);
        },

        //TO DELETE THE EMPLOYEE DETAILS

        onDetailPageDelete: function (evt) {
            var that = this;
            MessageBox.confirm("Are you sure you want to Delete  ?", {
                actions: ["Yes", "No"],
                emphasizedAction: "Yes",
                onClose: function (evt) {
                    if (evt == "Yes") {
                        $.ajax({
                            type: "DELETE",
                            url: "/deswork/api/users/" + that.id,
                            success: function (response) {
                                var resv = JSON.parse(response);
                                if (resv.error) {
                                    MessageBox.error(resv.error.message)
                                }
                                else {
                                    that.delete = true;
                                    that.handleGetUser();
                                }
                            }
                        })
                    }
                }
            }
            );
        },
        //TO NAVIGATE TO EDIT EMPLOYEE
        onEdit: function () {
            // var that = this;
            // this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Edit", "layout": "OneColumn", "listindex": this.id });
            var that = this;
            var sendVendordetails = new sap.ui.model.json.JSONModel(this.getView().getModel("memployee").getData());
            this.getOwnerComponent().setModel(sendVendordetails, "custUpdateDetails");
            this.getView().getModel().setProperty("/layout", "OneColumn");
            var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
            if (sNextLayout == null)
                sNextLayout = "OneColumn"
            this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Edit", "layout": sNextLayout, "listindex": this.id });
        },
        //TO ATTACH DOCUMENTS

        onChange: function (oEvent) {
            var that = this;
            var oUploadCollection = oEvent.getSource();
            var file = oEvent.getParameter("item").getFileObject();
            that.fileName = oEvent.getParameter("item").getFileName();
            var reader = new FileReader();
            reader.onload = function (e) {
                that.getView().mElementBindingContexts.memployee.getObject().documents.push({
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
                // delay the success message in order to see other messages before
                MessageToast.show("Event uploadComplete triggered");
            }.bind(this), 8000);
        },
        onSelectChange: function (oEvent) {
            var oUploadCollection = this.byId("UploadCollection");
            oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
        }
    });
});

