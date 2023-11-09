sap.ui.define([
 
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast'
 
], function (Controller, JSONModel, exportLibrary, Spreadsheet, MessageToast) {
 
    "use strict";
    var EdmType = exportLibrary.EdmType;
 
    return Controller.extend("vaspp.ProjectStatisticalReport.controller.drilldown", {
 
        onInit: function () {
 
            var that = this;
           
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("drilldown").attachPatternMatched(this._objMatched, this);
        },
 
        onBackButtonPress: function () {
                 this.getOwnerComponent().getRouter().navTo("View1");
        },
 
        onExportProject: function () {
            //  debugger
            var oData = this.getView().getModel("mreport").getData();
            var aColumns = this.createColumnsProgram();
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: oData,
                fileName: "Projects.xlsx"
            };
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build();
        },
        createColumnsProgram: function () {
            return [{
                label: "Project Name",
                property: "attributes/name"
            }, {
                label: "Description",
                property: "attributes/description"
            }, {
                label: "StartDate",
                property: "attributes/startDate"
            }, {
                label: "Actual End Date",
                property: "attributes/actualEndDate"
            },
            {
                label: "Estimated End Date",
                property: "attributes/estimatedEndDate"
            },  {
                label: "Status",
                property: "attributes/status"
            }];
        },
        onExportprojecttask: function () {
            var oData = this.getView().getModel("mreportTask").getData();
            var aColumns = this.createColumnConfigProjectTask();
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: oData,
                fileName: "Tasks.xlsx"
            };
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build();
        },
 
        createColumnConfigProjectTask: function () {
            return [{
                label: "Task Name",
                property: "attributes/name"
            }, {
                label: "Description",
                property: "attributes/description"
            }, {
                label: "StartDate",
                property: "attributes/startDate"
            }, {
                label: "EndDate",
                property: "attributes/endDate"
            }, {
                label: "Project Name",
                property: "attributes/p_project/data/attributes/name"
            }, {
                label: "Status",
                property: "attributes/status"
            }];
        },
        onExportProjectCompleted: function () {
            var oData = this.getView().getModel("mreportCompleted").getData();
            var aColumns = this.createColumnConfigCompleted();
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: oData,
                fileName: "Projects Completed.xlsx"
            };
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build();
        },
        createColumnConfigCompleted: function () {
            return [{
                label: "Project Name",
                property: "attributes/name"
            }, {
                label: "Description",
                property: "attributes/description"
            }, {
                label: "StartDate",
                property: "attributes/startDate"
            }, {
                label: "Actual End Date",
                property: "attributes/actualEndDate"
            },
            {
                label: "Estimated End Date",
                property: "attributes/estimatedEndDate"
            }, {
                label: "Status",
                property: "attributes/status"
            }];
        },
        onExportnewprojects: function () {
            var oData = this.getView().getModel("mreportNew").getData();
            var aColumns = this.createColumnConfigNew();
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: oData,
                fileName: "New Projects.xlsx"
            };
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build();
        },
        createColumnConfigNew: function () {
            return [{
                label: "Project Name",
                property: "attributes/name"
            }, {
                label: "Description",
                property: "attributes/description"
            }, {
                label: "StartDate",
                property: "attributes/startDate"
            }, {
                label: "Actual End Date",
                property: "attributes/actualEndDate"
            },
            {
                label: "Estimated End Date",
                property: "attributes/estimatedEndDate"
            }, {
                label: "Status",
                property: "attributes/status"
            }];
        },
        onExportProjectInProgress: function () {
            var oData = this.getView().getModel("inProgressProjects").getData();
            var aColumns = this.createColumnConfigInProgress();
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: oData,
                fileName: "In-Progress Projects.xlsx"
            };
            var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
            oSpreadsheet.build();
        },
        createColumnConfigInProgress: function () {
            return [{
                label: "Project Name",
                property: "attributes/name"
            }, {
                label: "Description",
                property: "attributes/description"
            }, {
                label: "StartDate",
                property: "attributes/startDate"
            }, {
                label: "Actual End Date",
                property: "attributes/actualEndDate"
            },
            {
                label: "Estimated End Date",
                property: "attributes/estimatedEndDate"
            }, {
                label: "Status",
                property: "attributes/status"
            }];
        },
        _objMatched: function (oEvent) {
            var that = this;
            $.get("/deswork/api/p-projects?populate=*", function (response) {
                response = JSON.parse(response);
 
                var oModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(oModel, "mreport");
            })
            $.get("/deswork/api/p-tasks?populate=*", function (response) {
                response = JSON.parse(response);
 
                var oModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(oModel, "mreportTask");
            })
            // $.get("/deswork/api/p-projects?filters[status][$eq]=New", function (response)
            // {
            //  response = JSON.parse(response);
 
            //  var oModel = new sap.ui.model.json.JSONModel(response.data);
            //  that.getView().setModel(oModel, "mreportNew");
            // })
            var today = new Date().toISOString().slice(0, 10);
            $.ajax({
                url: "/deswork/api/p-projects",
                type: "GET",
                success: function (res) {
                    var response = JSON.parse(res);
                    var projects = response.data;
                    var date;
                    var newProjects = projects.filter(function (project) {
                        var startDate = project.attributes.startDate;
                        var actualEndDate = project.attributes.actualEndDate;
                        var estimatedEndDate = project.attributes.estimatedEndDate;
                        var status = project.attributes.status;
       
                        // Check if the project has an actual end date; otherwise, use the estimated end date
                        if (actualEndDate) {
                            date = actualEndDate;
                        } else {
                            date = estimatedEndDate;
                        }
       
                        // Check the conditions to determine if the project is in the "New" status
                        if (status !== "Completed" && startDate > today) {
                            return true;
                        }
       
                        return false;
                    });
       
                    // Get the length of the new projects
                    var newProjectsLength = newProjects;
       
                    // Update the model with the new projects length
                    // that.getView().getModel("modelLength").getData().projectNewLength = newProjectsLength;
                    // that.getView().getModel("modelLength").updateBindings(true);
       
                    // If you need to use the newProjects array for other purposes, set it to a model
                    //that.getView().setModel(new sap.ui.model.json.JSONModel(newProjects));
                    var theModel1 = new sap.ui.model.json.JSONModel(newProjectsLength);
                    that.getView().setModel(theModel1, "mreportNew");
                },
                error: function (res) {
                    console.log(res);
                }
            });
            $.get("/deswork/api/p-projects?filters[status][$eq]=Completed&populate=*", function (response) {
                response = JSON.parse(response);
 
                var oModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(oModel, "mreportCompleted");
            })
            // $.get("/deswork/api/p-projects?filters[status][$eq]=In-progress", function (response) {
            //  // response = JSON.parse(response);
 
            //  // var oModel = new sap.ui.model.json.JSONModel(response.data);
            //  // that.getView().setModel(oModel, "mreportInProgress");
               
            // })
 
 
            var today = new Date().toISOString().slice(0, 10);
            $.ajax({
                url: "/deswork/api/p-projects",
                type: "GET",
                success: function (res) {
                    var response = JSON.parse(res);
                    var projects = response.data;
                    var date;
                    var inProgressProjects = projects.filter(function (project) {
                        var startDate = project.attributes.startDate;
                        var actualEndDate = project.attributes.actualEndDate;
                        var estimatedEndDate = project.attributes.estimatedEndDate;
                        var status = project.attributes.status;
       
                        // Check if the project has an actual end date; otherwise, use the estimated end date
           
                        if (actualEndDate) {
                            date = actualEndDate;
                        } else {
                            date = estimatedEndDate;
                        }
       
                        // Check the conditions to determine if the project is in progress
                        if (status !== "Completed" && startDate <= today && today <= date) {
                            return true;
                        }
       
                        return false;
                    });
       
                    // Get the length of the in-progress projects
                    var inProgressProjectsL = inProgressProjects;
       
                    // Update the model with the in-progress projects length
                    // that.getView().getModel("modelLength").getData().ProjectsInProgress = inProgressProjectsL;
                    // that.getView().getModel("modelLength").updateBindings(true);
       
                    // If you need to use the inProgressProjects array for other purposes, set it to a model
                    var theModel = new sap.ui.model.json.JSONModel(inProgressProjectsL);
                    that.getView().setModel(theModel, "inProgressProjects");
                    //that.getView().setModel(new sap.ui.model.json.JSONModel(inProgressProjects));
                },
                error: function (res) {
                    console.log(res);
                }
            });
            this.Title = oEvent.getParameter("arguments").selectedKPI;
            if (this.Title == "Total Projects") {
                this.getView().byId("drillDownTableIdproject").setVisible(true);
                this.getView().byId("drillDownTableIdtask").setVisible(false);
                this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
                this.getView().byId("drillDownTableIdnewproject").setVisible(false);
                this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
           
            }
            if (this.Title == "Total Tasks") {
                this.getView().byId("drillDownTableIdproject").setVisible(false);
                this.getView().byId("drillDownTableIdtask").setVisible(true);
                this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
                this.getView().byId("drillDownTableIdnewproject").setVisible(false);
                this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
               
            }
            if (this.Title == "New Projects") {
                this.getView().byId("drillDownTableIdproject").setVisible(false);
                this.getView().byId("drillDownTableIdtask").setVisible(false);
                this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
                this.getView().byId("drillDownTableIdnewproject").setVisible(true);
                this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
               
            }
 
            if (this.Title == "Projects Completed") {
                this.getView().byId("drillDownTableIdproject").setVisible(false);
                this.getView().byId("drillDownTableIdtask").setVisible(false);
                this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(true);
                this.getView().byId("drillDownTableIdnewproject").setVisible(false);
                this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
            }
           
            if (this.Title == "Projects In-Progress") {
                this.getView().byId("drillDownTableIdproject").setVisible(false);
                this.getView().byId("drillDownTableIdtask").setVisible(false);
                this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
                this.getView().byId("drillDownTableIdnewproject").setVisible(false);
                this.getView().byId("drillDownTableIdprojectinprogress").setVisible(true);
            }  
        }
    });
})