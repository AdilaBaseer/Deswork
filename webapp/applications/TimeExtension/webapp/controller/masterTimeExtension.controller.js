sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'vaspp/TimeExtension/utils/formatter',
	'sap/ui/model/Sorter',

	"sap/m/MessageBox",
], function (Controller, Filter, FilterOperator, formatter, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("vaspp.TimeExtension.controller.masterTimeExtension", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			that.oRouter = that.getOwnerComponent().getRouter();
			// Add the route pattern matched event for the master page
			this.oRouter.getRoute("masterTimeExtension").attachPatternMatched(this.onMasterPagePatternMatched, this);
		},

		onMasterPagePatternMatched: function (oEvent) {
			this.getTimeExtensionRequests();
		},


		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			var leaveID = oEvent.getSource().getSelectedItem().getBindingContext("mprojects").getObject().id;
			var userId = oEvent.getSource().getSelectedItem().getBindingContext("mprojects").getObject().attributes.name;
			this.oRouter.navTo("detailTimeExtension", {
				layout: oNextUIState.layout,
				userId: userId,
				product: leaveID,
			});
			this.getView().getModel("mprojects").updateBindings(true);
		},
		//SEARCH
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				var oTableSearchState = new Filter("attributes/name", FilterOperator.Contains, sQuery);
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("attributes/name", this._bDescendingSort);
			oBinding.sort(oSorter);
		},
		getTimeExtensionRequests: function () {
			var that = this;
			that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			$.ajax({
				url: "/deswork/api/users?populate=*&filters[id]=" + that.loginId,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var role = response[0].designation;
					that.role = role;
					if (that.role == "Manager") {
						that.getManagerProjects();
					} else {
						that.getAllProjects();
					}
				}
			});
		},
		getManagerProjects: function () {
			var that = this;
			that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
			$.ajax({
				url: "/deswork/api/p-projects?populate[0]=p_tasks.p_sub_tasks&populate[1]=&filters[users_permissions_users][id]=" + that.loginId,
				// url: "/deswork/api/p-projects?populate[0]=p_tasks.p_sub_tasks=*&filters[users_permissions_users][id]=" + that.loginId,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "projectModel");
					var projects = that.getView().getModel("projectModel").getData();
					that.updateOrCreateTiles(projects);
				}
			});
		},
		getAllProjects: function () {
			var that = this;
			var data1 = [];
			var oTileContainer = this.byId("tileContainer");
			$.ajax({
				url: '/deswork/api/p-projects?populate[0]=p_tasks.p_sub_tasks',
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				success: function (response) {
					response = JSON.parse(response);

					var projects = response.data;
					that.updateOrCreateTiles(projects);


				},
				error: function (error) {
					MessageBox.success("Error while loading TimeExtension Requests");
				}
			});
		},
		onTilePress: function (oEvent) {
			var selectedProject = oEvent.getSource().data("projectId");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detailTimeExtension", {
				projectId: selectedProject
			});
		},
		updateOrCreateTiles: function (projects) {
			var that = this;
			var data1 = [];
			var theModel = new sap.ui.model.json.JSONModel();
			var oGrid = that.byId("tileContainer");
			projects.forEach(function (project) {
				var ExtensionRequestCount = 0;
				var id = project.id;
				var tasks = project.attributes.p_tasks.data;
				var tasksLength = tasks.length;
				var oExistingTile = oGrid.getItems().find(function (oItem) {
					return oItem.data("projectId") === project.id;
				});
				if (oExistingTile) {
					for (var i = 0; i < tasksLength; i++) {
						var subTasks = tasks[i].attributes.p_sub_tasks.data;
						var subTasksLength = subTasks.length;
						if (subTasksLength === 0) {
							var data = {
								"ExtensionRequestCount": ExtensionRequestCount,
							}
						} else {
							for (var j = 0; j < subTasksLength; j++) {
								var status = subTasks[j].attributes.p_approver_status;
								if (status === "Requested") {
									ExtensionRequestCount = ++ExtensionRequestCount;
								}
							}
						}
					}
					var oNumericContent = oExistingTile.getTileContent()[0].getContent();
					oNumericContent.setValue(ExtensionRequestCount);
				} else {
					for (var i = 0; i < tasksLength; i++) {
						var subTasks = tasks[i].attributes.p_sub_tasks.data;
						var subTasksLength = subTasks.length;
						if (subTasksLength === 0) {
							var data = {
								"ExtensionRequestCount": ExtensionRequestCount,
							}
						} else {
							var TaskName = tasks[i].attributes.name;
							for (var j = 0; j < subTasksLength; j++) {
								var status = subTasks[j].attributes.p_approver_status;
								var subTaskName = subTasks[j].attributes.name;
								if (status === "Requested") {
									ExtensionRequestCount = ++ExtensionRequestCount;
									var data = {
										"ExtensionRequestCount": ExtensionRequestCount,
									}

								}
							}
						}
					}
					var attributes = {
						"id": id,
						"attributes": data
					}
					data1.push(attributes);
					theModel.setData(data1);
					that.getView().setModel(theModel, "mprojects");

					that.oGrid = that.byId("tileContainer");
					var oTile = new sap.m.GenericTile({
						header: project.attributes.name,
						// subheader: "Number of Requests : ",	
						customData: new sap.ui.core.CustomData({
							key: id,
							value: id
						}),
						press: that.onTilePress.bind(that),
						tileContent: new sap.m.TileContent({
							footer: "Project Type: " + project.attributes.type,
							content: new sap.m.NumericContent({
								value: ExtensionRequestCount,
								icon: "sap-icon://time-entry-request",
								withMargin: true,
							})
						})
					});
					oTile.data("projectId", project.id);
					that.oGrid.addItem(oTile);
				}
			});

		},
	




	});
}); 