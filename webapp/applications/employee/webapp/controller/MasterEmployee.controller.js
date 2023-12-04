sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, Sorter) {
	"use strict";
	return Controller.extend("VASPP.employee.controller.MasterEmployee", {
		onInit: function () {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("masterEmployee").attachPatternMatched(function (oEvent) {
				this.getView().byId("productsTable").removeSelections(true);

			}, this);
			this._bDescendingSort = false;

			$.get("/deswork/api/users?populate[0]=p_projects.p_tasks.p_sub_tasks&populate[1]=*", function (response) {
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response);		
				// var aUsers = oModel.getProperty("/");
                // var aFilteredUsers = aUsers.filter(function(user) {
                //     return user.designation !== "SuperAdmin";
                //  });
                // oModel.setProperty("/", aFilteredUsers);
                // oModel.updateBindings();
				that.getOwnerComponent().setModel(oModel, "memployee");
				that.getOwnerComponent().getModel("memployee").updateBindings(true);
				that.getProjectDetails(oModel);
			})
		},
		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				employeeID = oEvent.getSource().getSelectedItem().getBindingContext("memployee").getObject().id;
			this.oRouter.navTo("detailEmployee", { layout: oNextUIState.layout, product: employeeID });
			this.getView().getModel("memployee").updateBindings(true);
		},
		//SEARCH THE EMPLOYEE DETAILS USING NAME
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("firstName", FilterOperator.Contains, sQuery)];
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		//TO SORT THE EMPLOYEE DETAILS USING ID
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("id", this._bDescendingSort);
			oBinding.sort(oSorter);
		},
		//TO ADD NEW EMPLOYEE 
		onAddNewEmployee: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");
			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if (sNextLayout == null)
				sNextLayout = "OneColumn"
			//NAVIGATE TO THE ADD NEW EMPLOYEE
			this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Add", "layout": sNextLayout, "listindex": "a" });
		},

		getProjectDetails: function (data1) {
			var that = this;
			var data=data1.oData;
			data.forEach(function (user) {
				var subTasks = 0;
				var project = user.p_projects;
				var projectLength = project.length;
				for (var k = 0; k < projectLength; k++) {
					var task = project[k].p_tasks;
					var taskLength = task.length;
					for (var i = 0; i < taskLength; i++) {
						var subTtask = task[i].p_sub_tasks;
						var subTtaskLength = subTtask.length;
						if (subTtaskLength > 0) {
							for (var j = 0; j < subTtaskLength; j++) {
								var status = subTtask[j].status;
								var startDate = subTtask[j].startDate;
								var estimatedEndDate = subTtask[j].endDate;
								var actualEndDate = subTtask[j].extended_end_date;
								var alteredStatus, date;
								var today = new Date().toISOString().slice(0, 10);
								if (actualEndDate ? date = actualEndDate : date = estimatedEndDate)
									if (status === "Completed") {
										alteredStatus = status;
									} else if (startDate > today) {
										alteredStatus = "New";
									} else if ((startDate <= today) && (today < date)) {
										alteredStatus = "In-progress";
									} else if (today > date) {
										alteredStatus = "Delayed";
									} else if (date === today) {
										alteredStatus = status;
									}
								if (alteredStatus === "In-Progress" || alteredStatus === "Delayed") {
									subTasks++;
								}
							}
							if (subTasks === 0) {
								var text  = "100%";;
								user.availability = text;
							} else {
								var text = "Working on " + subTasks + " sub-task";
								user.availability = text;
							}
						} else if (subTtaskLength = 0) {
							user.availability = "100%";
						} else {
							user.availability = "100%";
						}
						
					}
				}
				if(project.length === 0){
					user.availability = "100%";
			}
			});

			that.getOwnerComponent().getModel("memployee").setData(data);

		}
	});
});
