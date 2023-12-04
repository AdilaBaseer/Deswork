sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'vaspp/Leave/utils/formatter',
	'sap/ui/model/Sorter',

	"sap/m/MessageBox",
], function (Controller, Filter, FilterOperator, formatter, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("vaspp.Leave.controller.MasterLeave", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			that.oRouter = that.getOwnerComponent().getRouter();
			that.oRouter.getRoute("masterLeave").attachPatternMatched(function (oEvent) {
				that.getView().byId("productsTable").removeSelections(true);
				that.getLeaveRequests();
				// that.getTeamMemberdetails();           
			}, that);
			that._bDescendingSort = false;
		},

		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			var leaveID = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getObject().id;
			var userId = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getObject().attributes.requestedById;
			this.oRouter.navTo("detailLeave", {
				layout: oNextUIState.layout,
				userId: userId,
				product: leaveID,
			});
			this.getView().getModel("mleave").updateBindings(true);
		},
		//SEARCH
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				var oTableSearchState = new Filter("attributes/requestedBy", FilterOperator.Contains, sQuery);
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("attributes/requestedBy", this._bDescendingSort);
			oBinding.sort(oSorter);
		},

		getLeaveRequests: function () {
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
						$.ajax({
							url: "/deswork/api/p-projects?populate=*&filters[users_permissions_users][id]=" + that.loginId,
							type: "GET",
							success: function (res) {
								var response = JSON.parse(res);
								var theModel = new sap.ui.model.json.JSONModel(response.data);
								that.getView().setModel(theModel, "projectModel");
								var projects = that.getView().getModel("projectModel").getData();
								var peopleUnderPrjctManager = [], peopleUnderPrjctManager1 = [];
								for (var i = 0; i < projects.length; i++) {
									var projectDatalength = projects[i].attributes.users_permissions_users.data.length;
									for (var j = 0; j < projectDatalength; j++) {
										peopleUnderPrjctManager1.push(projects[i].attributes.users_permissions_users.data[j].id);
									}
									// Convert the array to a Set to remove duplicates
									var uniqueNumbers = new Set(peopleUnderPrjctManager1);

									// Convert the Set back to an array
									var peopleUnderPrjctManager = Array.from(uniqueNumbers);
									var peopleUnderPrjctManagerL = peopleUnderPrjctManager.length;

									$.ajax({
										url: '/deswork/api/p-leaves?populate=*&filters[status][$eq]=Requested',
										method: "GET",
										headers: {
											"Content-Type": "application/json"
										},
										success: function (response) {
											var response = JSON.parse(response);
											var response1 = response.data;
											var leavesLength = response1.length;
											var theModel = new sap.ui.model.json.JSONModel();
											var data = [];
											for (var k = 0; k < leavesLength; k++) {
												var id = response1[k].attributes.requestedById;
												for (var m = 0; m < peopleUnderPrjctManagerL; m++) {
													if (that.loginId !== peopleUnderPrjctManager[m]) {
														if (id === peopleUnderPrjctManager[m]) {
															data.push(response1[k]);
														}
													}
												}
											}
											theModel.setData(data);
											that.getView().setModel(theModel, "mleave");
										}
									});
								}
							}
						});
					} else {
						$.ajax({
							url: '/deswork/api/p-leaves?populate=*&filters[status][$eq]=Requested',
							method: "GET",
							headers: {
								"Content-Type": "application/json"
							},
							success: function (response) {
								response = JSON.parse(response);
								var oModel = new sap.ui.model.json.JSONModel(response.data);
								that.getView().setModel(oModel, "mleave");
							},
							error: function (error) {
								MessageBox.success("Error while loading Leave Requests");
							}
						});
					}
				}
			});
		}
	});
}); 