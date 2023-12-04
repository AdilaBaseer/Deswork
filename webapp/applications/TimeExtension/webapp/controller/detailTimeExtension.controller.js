sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"vaspp/TimeExtension/utils/formatter",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/TextArea"
], function (Controller, Dialog, Button, Label, formatter, mobileLibrary, MessageBox, MessageToast, TextArea) {
	"use strict";
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
	return Controller.extend("vaspp.TimeExtension.controller.detailTimeExtension", {
		formatter: formatter,
		onInit: function () {
			var that = this;

			// var oExitButton = that.getView().byId("exitFullScreenBtn");
			// var oEnterButton = that.getView().byId("enterFullScreenBtn");
			that.oRouter = that.getOwnerComponent().getRouter();
			that.oModel = that.getOwnerComponent().getModel();
			that.oRouter.getRoute("detailTimeExtension").attachPatternMatched(that._onObjectMatched, that);
		},



		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailTimeExtension", { layout: sNextLayout, product: this.id });
		},
		//EXIT FULL SCREEN
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailTimeExtension", { layout: sNextLayout, product: this.id });
		},
		//CLOSE THE DETAIL
		handleNavBack: function () {
			this.oRouter.navTo("masterTimeExtension");
		},

		_onObjectMatched: function (oEvent) {
			var that = this;
			if (typeof oEvent == "number") {
				this.id = oEvent;
			} else {
				this.id = oEvent.getParameter("arguments").projectId;
			}
			var options = {};
			that.mCsfData();
			$.get(
				"/deswork/api/p-projects/" +
				this.id +
				"?populate",
				options,
				function (response) {
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprojects");
					that.getView().getModel("mprojects").updateBindings("true");
					that.mCsfData();
				}
			);
		},
		// mCsfData1: function () {
		// 	var that = this;
		// 	$.ajax({
		// 		url: "/deswork/api/p-tasks?populate[0]=p_sub_tasks&populate[1]=users_permissions_user&filters[p_project][id]=" + that.id,
		// 		type: "GET",
		// 		success: function (res) {
		// 			var response = JSON.parse(res);
		// 			that.mcsrfLength = response.data.length;
		// 			var cModel = new sap.ui.model.json.JSONModel(response.data);
		// 			that.getView().setModel(cModel, "mCsfDetails");
		// 			var taskLength = that.getView().getModel("mCsfDetails").getData();
		// 			var finalCsfSet = [];

		// 			for (var i = 0; i < taskLength.length; i++) {
		// 				var task = taskLength[i].attributes;
		// 				task.id = taskLength[i].id;
		// 				var subTasks = task.p_sub_tasks.data;

		// 				if (subTasks) {
		// 					task.p_sub_tasks = [];
		// 					for (var j = 0; j < subTasks.length; j++) {
		// 						var subTask = subTasks[j].attributes;
		// 						subTask.id = subTasks[j].id;
		// 						task.p_sub_tasks.push(subTask);
		// 					}
		// 				}

		// 				// Convert users_permissions_user array to an object
		// 				var usersPermissionsUser = task.users_permissions_user.data;
		// 				if (usersPermissionsUser) {
		// 					task.users_permissions_user = usersPermissionsUser.attributes;
		// 					task.users_permissions_user.id = usersPermissionsUser.id;
		// 					task.users_permissions_user.appPermission = permission;
		// 					//task.users_permissions_user.firstName = usersPermissionsUser.firstName;

		// 				}
		// 				// Convert users_permissions_user array to an object
		// 				var usersPermissionsUser = task.users_permissions_user;
		// 				if (usersPermissionsUser) {
		// 					task.users_permissions_user = undefined;
		// 					for (var k = 0; k < usersPermissionsUser.length; k++) {
		// 						var permission = usersPermissionsUser[k].attributes;
		// 						permission.id = usersPermissionsUser[k].id;
		// 						task.users_permissions_user[permission.appPermission] = permission;

		// 					}
		// 					var userFirstName = usersPermissionsUser.firstName;
		// 					task.firstName = userFirstName;
		// 				}

		// 				finalCsfSet.push(task);
		// 			}

		// 			var csfData = new sap.ui.model.json.JSONModel(finalCsfSet);
		// 			that.getView().setModel(csfData, "csfData");
		// 			debugger;
		// 			that.getView().getModel("mCsfDetails").updateBindings(true);
		// 			// that.tableExpand();
		// 		},
		// 		error: function (res) {
		// 			MessageBox.error(res + "Something went wrong");
		// 		}
		// 	});
		// },
	
		calculateBusinessDays: function (startDate, extendedEndDate) {
			var that = this;
			var startDate1 = that.parseDate(startDate);
			var extendedEndDate1 = that.parseDate(extendedEndDate);
			// var startDate1 = that.formatDate(startDate);
			// var endDate1 = that.formatDate(endDate);
			var days = Math.ceil((extendedEndDate1 - startDate1) / (1000 * 3600 * 24)); // Total days between startDate and endDate
			var businessDays = 0;

			for (var i = 0; i <= days; i++) {
				var currentDate = new Date(startDate1);
				currentDate.setDate(currentDate.getDate() + i);

				if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
					businessDays++; // Increment businessDays if the currentDate is not Saturday or Sunday
				}
			}

			return businessDays;
		},
		parseDate: function (dateString) {
			var parts = dateString.split("-");

			if (parts.length === 3) {
				var day = parseInt(parts[2], 10);
				var month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
				var year = parseInt(parts[0], 10);

				// Check if the parsed values result in a valid date
				if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
					return new Date(year, month, day);
				}
			}

			// Return null for invalid date format or values
			return null;
		},
		mCsfData: function () {
			var that = this;
			$.ajax({
				url: "/deswork/api/p-tasks?populate[0]=p_sub_tasks&populate[1]=users_permissions_user&filters[p_project][id]=" + that.id,
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var cModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(cModel, "mCsfDetails");
					var task = that.getView().getModel("mCsfDetails").getData();
					var tasks = response.data;
					var finalCsfSet = [];
					tasks.forEach(function (task) {
						task.attributes.name;
						var subTasks = task.attributes.p_sub_tasks.data;
						var subTaskLength = subTasks.length;
						var responsible = task.attributes.users_permissions_user.data.attributes.firstName + " " +						                  task.attributes.users_permissions_user.data.attributes.lastName;
						for (var i = 0; i < subTaskLength; i++) {
							if (subTaskLength > 0) {
								var status = subTasks[i].attributes.p_approver_status;
								
								if (status === "Requested") {
									var data = {
										"taskName": task.attributes.name,
										"name": subTasks[i].attributes.name,
										"startDate": subTasks[i].attributes.startDate,
										"endDate": subTasks[i].attributes.endDate,
										"extended_end_date": subTasks[i].attributes.extended_end_date,
										"p_task_reason": subTasks[i].attributes.p_task_reason,
										"p_approver_status": subTasks[i].attributes.p_approver_status,
										"id": subTasks[i].id,
										"taskId": task.id,
										taskEndDate: task.attributes.endDate,
										"taskExtendedEndDate": task.attributes.extended_end_date,
										"taskNoOfDays": task.attributes.noOfDays,
										"responsible": responsible
									}
									finalCsfSet.push(data);
								}
							}
						}
					})
					var csfData = new sap.ui.model.json.JSONModel(finalCsfSet);
					that.getView().setModel(csfData, "csfData");
				}
			});

		},
		onDownloadSelectedButton: function () {
			var oUploadSet = this.byId("UploadSet");
			oUploadSet.getItems().forEach(function (oItem) {
				if (oItem.getListItem().getSelected()) {
					oItem.download(true);
				}
			});
		},
		onApproveProjects: function (oEvent) {
			var that = this;
			that.programApproved("Approved");
		},
		programApproved: function (result) {
			var that = this;
			var table = this.getView().byId("timeExt");
			var selectedItems = table.getSelectedContextPaths();
			var approvePromises = [];
			selectedItems.forEach(function (itemIndex) {
				var itemIndex1 = parseInt(itemIndex.replace('/', ''), 10)
				var oData = table.mBindingInfos.items.binding.oList[itemIndex1]
				var itemId = oData.id;
				var taskId = oData.taskId;
				var taskEndDate = oData.taskEndDate;
				var taskExtendedEndDate = oData.taskExtendedEndDate;
				var taskNoOfDays = oData.taskNoOfDays;
				var startDate = oData.startDate;
				var subtaskEndDate = oData.endDate;
				var subtaskExtendedEndDate = oData.extended_end_date;
				var itemStatus = oData.p_approver_status;
				var oldBusinessDays = that.calculateBusinessDays(startDate, subtaskEndDate);
				var businessDays = that.calculateBusinessDays(startDate, subtaskExtendedEndDate);
				var totalDays = businessDays;
				var noOfDaysExtended = businessDays - oldBusinessDays;
				if (selectedItems.length > 0) {
						MessageBox.confirm(
							"Are you sure you want to Approve the Time Extension for selected Sub-Task?",
							{
								title: "Confirm Time Extension for selected Sub-Task",
								icon: MessageBox.Icon.WARNING,
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.YES,
								onClose: function (oAction) {
									if (oAction === "YES") {

										var updateData = {
											noOfDays: totalDays,
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
												var date;
												taskNoOfDays = parseInt(taskNoOfDays);
												var noOfDays1 = taskNoOfDays + noOfDaysExtended
												if (taskExtendedEndDate ? date = taskExtendedEndDate : date = taskEndDate) {
													if (date === taskExtendedEndDate) {
														if (date < subtaskExtendedEndDate) {
															var updatedData1 = {
																"extended_end_date": subtaskExtendedEndDate,
																"noOfDays": noOfDays1
															};
														} 
													} else if (date === taskEndDate) {
														if (date < subtaskExtendedEndDate) {
															var updatedData1 = {
																"extended_end_date": subtaskExtendedEndDate,
																"noOfDays": noOfDays1
															};
														} 
													}
												}
												$.ajax({
													url: "/deswork/api/p-tasks/" + taskId,
													type: "PUT",
													headers: {
														"Content-Type": "application/json",
													},
													data: JSON.stringify({
														data: updatedData1,
													}),
													success: function (res) {
														MessageToast.show("Time Extension Approved Successfully!");
														that.mCsfData();
														that._onObjectMatched(that.id);
														that.getView().getModel().updateBindings(true);
													}
												});
											},
											error: function (err) {

											},

										});
									}
								},
							});
					// } 
				}
				else {
					sap.m.MessageToast.show("Please select at least one item.");

				}
			});
		},
		OnRejectProjects: function () {
			var that = this;
			that.programRejected("Rejected");
		},
		programRejected: function (result) {
			var that = this;
			var table = this.getView().byId("timeExt");
			var selectedItems = table.getSelectedContextPaths();
			selectedItems.forEach(function (itemIndex) {
				var itemIndex1 = parseInt(itemIndex.replace('/', ''), 10)
				var oData = table.mBindingInfos.items.binding.oList[itemIndex1]
				var itemId = oData.id;
				var itemStatus = oData.p_approver_status;
				if (selectedItems.length > 0) {
					if (itemStatus == "Requested") {

						MessageBox.confirm(
							"Are you sure you want to Reject the selected Time Extension for  Task?",
							{
								title: "Confirm TimeExtend Rejection for selectd Sub-Task",
								icon: MessageBox.Icon.WARNING,
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.YES,
								onClose: function (oAction) {
									if (oAction === "YES") {
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
												MessageToast.show("Time Extension Rejected Successfully!");
												that.mCsfData();
												that._onObjectMatched(that.id);
												that.getView().getModel().updateBindings(true);
											},
											error: function (err) {

											},
										});
									}
								},
							});
					} else {
						sap.m.MessageToast.show("Please select the Time Extension of Requested item only.");
					}
				}
				else {
					sap.m.MessageToast.show("Please select at least one item.");

				}
			});
		},

	});
});