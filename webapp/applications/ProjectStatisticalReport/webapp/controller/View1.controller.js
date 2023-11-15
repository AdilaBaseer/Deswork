sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("vaspp.ProjectStatisticalReport.controller.View1", {
			onInit: function () {
				var that = this;
				var design = this.getOwnerComponent().getModel("loggedOnUserModel").getData().designation;
				if (design === "IT") {
					this.getView().byId("_IDGenTitle1").setVisible(false);
					this.getView().byId("totalCalls").setVisible(false);
					this.getView().byId("totaltask").setVisible(false);
					this.getView().byId("newprojects").setVisible(false);
					this.getView().byId("totalCount").setVisible(false);
					this.getView().byId("InProgress").setVisible(false);
					this.getView().byId("Delayed").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell2").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell5").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell3").setVisible(false);
					this.getView().byId("_IDGenBlockLayutCell2").setVisible(false);
					this.getView().byId("_IDGenObjectIdentifier1").setVisible(false);
				}
				else if (design === "HR") {
					this.getView().byId("_IDGenTitle1").setVisible(false);
					this.getView().byId("totalCalls").setVisible(false);
					this.getView().byId("totaltask").setVisible(false);
					this.getView().byId("newprojects").setVisible(false);
					this.getView().byId("totalCount").setVisible(false);
					this.getView().byId("InProgress").setVisible(false);
					this.getView().byId("Delayed").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell2").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell5").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell3").setVisible(false);
					this.getView().byId("_IDGenBlockLayutCell2").setVisible(false);
					this.getView().byId("_IDGenObjectIdentifier1").setVisible(false);

				}
				else {


				}
				$.get('deswork/api/p-projects?populate=*', function (response) {
					
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprojects");
					//  that.programLength();
					that.projectLength();
					that.taskLength();
					that.statusPiePrograms();
					that.projectNewLength();
					that.ProjectsSubmitted();
					that.ProjectsInProgress();
					that.ProjectsDelayed();
					that.projectReceivedAll();
					that.ProjectBudget();
				});
				var oModel = new sap.ui.model.json.JSONModel({
					"programLength": 0,
					"projectLength": 0,
					"taskLength": 0,
					"projectNewLength": 0,
					"ProjectsSubmitted": 0,
					"ProjectsInProgress": 0,
					"ProjectsDelayed": 0
				});
				this.getView().setModel(oModel, "modelLength");

				var oModelStatus = new sap.ui.model.json.JSONModel({
					"New": 0,
					"In-progress": 0,
					"Completed": 0,
					"Delayed": 0

				});
				this.getView().setModel(oModelStatus, "modelProjectStatus");

			},
			statusPiePrograms: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						
						var status_counts = that.getView().getModel("modelProjectStatus").getData();
						var response = JSON.parse(res);
						
						var reslen = that.getView().getModel("mprojects").getData();
						var alteredStatus, date;
						var today = new Date().toISOString().slice(0, 10);
						for (var i = 0; i < reslen.length; i++) {
							//var status = reslen[i].attributes.status;
							var startDate = reslen[i].attributes.startDate;
							var actualEndDate = reslen[i].attributes.actualEndDate;
							var estimatedEndDate = reslen[i].attributes.estimatedEndDate;
							var status = reslen[i].attributes.status;
							if (actualEndDate ? date = actualEndDate : date = estimatedEndDate) {
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
							}
							if (!status_counts[alteredStatus]) {
								status_counts[alteredStatus] = 1;
							} else {
								status_counts[alteredStatus]++;
							}
						}
						var chartData = [];
						for (var alteredStatus in status_counts) {
							chartData.push({
								status: alteredStatus,
								count: status_counts[alteredStatus]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartstatuspie");
						that.getView().getModel("mreportchartstatuspie").updateBindings(true);
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			progressChart: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						var statusCounts = that.getView().getModel("mprojects").getData();

						var chartData = [];
						statusCounts.forEach(function (project) {
							var chartEntry = {
								"progress": project.attributes.progress,
								"name": project.attributes.name
							};
							chartData.push(chartEntry);
						});

						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "mreportchartprogress");
						that.getView().getModel("mreportchartprogress").updateBindings(true);

					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			ProjectBudget: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						var statusCounts = that.getView().getModel("mprojects").getData();

						var chartData = [];
						statusCounts.forEach(function (project) {
							if (project.attributes.actual_budget === null) {
								that.actualBudget = 0;
							} else {
								that.actualBudget = project.attributes.actual_budget.split(" ")[0];
							}

							// Split the estimated_budget to get the value and currency code separately
							var estimatedBudgetParts = project.attributes.estimated_budget.split(" ");
							var estimatedBudgetValue = estimatedBudgetParts[0];
							//var estimatedBudgetCurrency = estimatedBudgetParts[1];

							var chartEntry = {
								"actual_budget": that.actualBudget,
								"estimated_budget": estimatedBudgetValue,
								//	"currency_code": estimatedBudgetCurrency, // Add the currency code to the chart entry
								"name": project.attributes.name
							};
							chartData.push(chartEntry);
						});

						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "mreportchartBudget");
						that.getView().getModel("mreportchartBudget").updateBindings(true);

					},
					error: function (err) {
						console.error(err);
					}
				});
			},

			projectReceivedAll: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?populate=*",
					type: "GET",
					success: function (res) {
						
						var month_counts = {
							Jan: 0,
							Feb: 0,
							Mar: 0,
							Apr: 0,
							May: 0,
							Jun: 0,
							Jul: 0,
							Aug: 0,
							Sep: 0,
							Oct: 0,
							Nov: 0,
							Dec: 0

						};
						var response = JSON.parse(res);
						
						var reslen = that.getView().getModel("mprojects").getData();
						var projectData = [];
						for (var i = 0; i < reslen.length; i++) {
							projectData.push(reslen[i].attributes.startDate);
						}
						for (var i = 0; i < reslen.length; i++) {
							var startDate = reslen[i].attributes.startDate;
							var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "MMM"
							});
							var oDate = new Date(startDate);
							var sMonthName = oDateFormat.format(oDate);
							if (!month_counts[sMonthName]) {
								month_counts[sMonthName] = 1;
							} else {
								month_counts[sMonthName]++;
							}
						}
						var chartData = [];
						for (var sMonthName in month_counts) {
							chartData.push({
								sMonthName: sMonthName,
								count: month_counts[sMonthName]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartmonth");
						that.getView().getModel("mreportchartmonth").updateBindings(true);
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			projectLength: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?populate=*",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
					
						that.mPrograms = response.data.length;
						that.getView().getModel("modelLength").getData().projectLength = that.mPrograms;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));

					},
					error: function (res) {
						
					}
				});
			},
			taskLength: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-tasks?populate=*",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						
						that.mTasks = response.data.length;
						that.getView().getModel("modelLength").getData().taskLength = that.mTasks;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));
					},
					error: function (res) {
					}
				});
			},
			projectNewLength: function () {
				var that = this;
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
							if (actualEndDate) {
								date = actualEndDate;
							} else {
								date = estimatedEndDate;
							}
							if (status !== "Completed" && startDate > today) {
								return true;
							}
							return false;
						});
						var newProjectsLength = newProjects.length;
						that.getView().getModel("modelLength").getData().projectNewLength = newProjectsLength;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(newProjects));
					},
				});
			},

			ProjectsSubmitted: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?filters[status]=Completed",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						
						that.mCompleted = response.data.length;
						that.getView().getModel("modelLength").getData().ProjectsSubmitted = that.mCompleted;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));
					},
					error: function (res) {
						
					}
				});
			},
			ProjectsDelayed: function () {
				var that = this;
				var today = new Date().toISOString().slice(0, 10);
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						var projects = response.data;
						var date;
						var delayedProjects = projects.filter(function (project) {
							var actualEndDate = project.attributes.actualEndDate;
							var estimatedEndDate = project.attributes.estimatedEndDate;
							var today = new Date().toISOString().slice(0, 10);
							if (actualEndDate ? date = actualEndDate : date = estimatedEndDate)
								if (today > date) {
							return true;
								}
						});
						var delayedProjectsLength = delayedProjects.length;
						that.getView().getModel("modelLength").getData().ProjectsDelayed = delayedProjectsLength;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(delayedProjectsLength));
					},
				});
			},

			ProjectsInProgress: function () {
				var that = this;
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
						var inProgressProjectsLength = inProgressProjects.length;

						// Update the model with the in-progress projects length
						that.getView().getModel("modelLength").getData().ProjectsInProgress = inProgressProjectsLength;
						that.getView().getModel("modelLength").updateBindings(true);

						// If you need to use the inProgressProjects array for other purposes, set it to a model
						that.getView().setModel(new sap.ui.model.json.JSONModel(inProgressProjects));
					},
					error: function (res) {
						
					}
				});
			},

			onKpiLinkPress: function (evt) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();
				oRouter.navTo("drilldown", {
					selectedKPI: pressedLinkText
				}
				);
			},
			onKpiLinkPressTasks: function (evt) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();
				oRouter.navTo("drilldown", {
					selectedKPI: pressedLinkText
				}
				);
			},
		});
	});


