sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"VASPP/myProjects/utils/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, formatter, JSONModel, MessageToast, MessageBox, Fragment, Sorter) {
	"use strict";

	return Controller.extend("VASPP.myProjects.controller.MasterMyProjects", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("masterMyProjects").attachPatternMatched(function (oEvent) {
				//this.getView().setBusy(true);
				this.getView().byId("productsTable").removeSelections(true);
				$.get("/deswork/api/p-projects?populate[0]=p_project_teams.users_permissions_users", function (response) {
					console.log(response);
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprojects");
					that.getView().setBusy(false);
				})
				//this.getOwnerComponent().getModel("loggedOnUserData").getData();
				var User = this.getOwnerComponent().getModel("loggedOnUserModel").getData();
				this.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			}, this);
			this._bDescendingSort = false;

			that.projectsDetails();
			//that.getCustomerDetails();




		},

		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				projectID = oEvent.getSource().getSelectedItem().getBindingContext("myproject").getObject().id;
			this.oRouter.navTo("detailMyProjects", { layout: oNextUIState.layout, product: projectID });
			this.getView().getModel("myproject").updateBindings(true);
		},




		projectsDetails: function (oEvent) {
			var that = this;
			var loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			$.ajax({
				url: "/deswork/api/p-projects?populate=*&filters[users_permissions_users][id]=" + loginId,
				type: "GET",

				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "myproject");
					var oModel = that.getView().getModel("myproject");
				var aProjects = oModel.getProperty("/"); // Get the array of projects
		  
				aProjects.forEach(function(project) {
				  var sStartDate = project.attributes.startDate; // Assuming it is in the format "YYYY-MM-DD"
				  var sEndDate = project.attributes.estimatedEndDate;
				 var today = new Date().toISOString().slice(0, 10);
				 if (sStartDate <= today && sEndDate >= today) {
					project.attributes.status = "In-progress";
				  } else if (sEndDate < today) {
					project.attributes.status = "Delayed";
				  }
				});
		     oModel.refresh(true)

				},
				error: function (res) {
					console.log(res);
				}
			});

		},
		getCustomerDetails: function () {
			var that = this;
			$.ajax({
				url: "/deswork/api/p-customers",
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					console.log(response);

					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "customerInfo");

				},
				error: function (res) {
					console.log(res);
					MessageBox.error(res + "Something went wrong");
				}
			});
		},

		onAddProjects: function (oEvent) {

			if (!this.oAddProjectDialog) {
				this.oAddProjectDialog = sap.ui.xmlfragment("idfrag", "VASPP.myProjects.view.Register", this);
				this.getView().addDependent(this.oAddProjectDialog);
			}
			this.oAddProjectDialog.setModel(new sap.ui.model.json.JSONModel({}), "mproject");
			this.oAddProjectDialog.open();
		},


		closeProjectDialog: function () {
			this.oAddProjectDialog.close();
		},


		onSaveProject: function (oEvent) {
			var that = this;
			var settings = {
				"url": "/deswork/api/p-projects",
				"method": "POST",
				"timeout": 0,
				"headers": {
					"Content-Type": "application/json"
				},
				"data": JSON.stringify({
					"data": this.oAddProjectDialog.getModel("mproject").getData()
				}),
			};
			$.ajax(settings).done(function (response) {
				response = JSON.parse(response);
				if (response.error) {
					MessageBox.error(response.error.message);
				} else {
					MessageToast.show("Project Added Successfully!");
					that.oAddProjectDialog.close();
				}

			});


			that.getView().getModel("mprojects").updateBindings(true);

		},

		// SORT /FILTER

		onOpenViewSettings: function (oEvent) {
			var sDialogTab = "sort";
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = new sap.ui.xmlfragment("VASPP.myProjects.fragment.viewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
			}
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().sId;
				if (sButtonId.match("filter")) {
					sDialogTab = "filter";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			this._oViewSettingsDialog.open(sDialogTab);
		},

		//INSIDE FRAGMENT

		onConfirmViewSettingsDialog: function (oEvent) {
			var filters = [];
			//to get Archived Data send ZERO(0) in Parameter
			this.filterforarchive(0);
			this._oList = this.getView().byId("productsTable");
			this._oList.getBinding("items").filter([], "Application");
			if (oEvent.getParameters().filterItems.length > 0) {
				for (var a = 0; a < oEvent.getParameters().filterItems.length; a++) {
					filters.push(new sap.ui.model.Filter(oEvent.getParameters().filterItems[a].getParent().getKey(), "Contains", oEvent.getParameters()
						.filterItems[a].getKey()));
				}
				filters = filters.length == 1 ? filters : new sap.ui.model.Filter(filters, true);
				this._oList.getBinding("items").filter(filters, "Application");
			} else {
				this._oList.getBinding("items").filter([], "Application");
				//to get Not-Archived Data send ONE(1) in Parameter
				this.filterforarchive(1);
			}
			this._applySortGroup(oEvent);
		},

		filterforarchive: function (i) {

			var sQuery = "";
			if (i == 1) {
				sQuery = "Archived";
			}
			var aFilter = [];
			var oBinding = this.getView().byId("productsTable").getBinding("items");
			if (sQuery) {
				var Status = new Filter("attributes/status", FilterOperator.NotContains, sQuery);

				var deafultFilters = [Status];
				aFilter = new Filter(deafultFilters, false);
				oBinding.filter(aFilter);
			} else {
				//Set empty filter array if no query found, in order to show the complete list of assessments
				oBinding.filter(new Filter(aFilter, true));
			}
		},

		_applySortGroup: function (oEvent) {
			this._oList.getBinding("items").sort([]);
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				var vGroup = this._oGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

		//ON SEARCH PROJECT 

		onSearch: function (oEvent) {
			var oTableSearchState = [],
				//oTableidSearchState=[],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				//oTableidSearchState = [new Filter("id", FilterOperator.Contains, sQuery)];
				oTableSearchState = [new Filter("attributes/name", FilterOperator.Contains, sQuery)];
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");

		},
	});
});
