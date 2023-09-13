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
			//	debugger
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
			var oData = this.getView().getModel("mreportInProgress").getData();
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
			$.get("/deswork/api/p-projects?filters[status][$eq]=New", function (response) {
				response = JSON.parse(response);

				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mreportNew");
			})
			$.get("/deswork/api/p-projects?filters[status][$eq]=Completed&populate=*", function (response) {
				response = JSON.parse(response);

				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mreportCompleted");
			})
			$.get("/deswork/api/p-projects?filters[status][$eq]=In-progress", function (response) {
				response = JSON.parse(response);

				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mreportInProgress");
			})
			
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
});