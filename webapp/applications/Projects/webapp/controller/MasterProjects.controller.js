sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"VASPP/Projects/utils/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, formatter, JSONModel, MessageToast, MessageBox, Fragment, Sorter) {
	"use strict";

	return Controller.extend("VASPP.Projects.controller.MasterProjects", {
		formatter: formatter,
		onInit: function () {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("masterProjects").attachPatternMatched(function (oEvent) {
				this.getView().setBusy(true);
				this.getView().byId("productsTable").removeSelections(true);
				$.get("/deswork/api/p-projects?populate[0]=p_customer&populate[1]=p_tasks&populate[2]=p_project_teams.users_permissions_users&populate[3]=users_permissions_users", function (response) {
					response = JSON.parse(response);
					response.data.forEach(function (project) {
						var startDate = project.attributes.startDate;
                        var sEndDate = project.attributes.estimatedEndDate;
                        var actEndDate = project.attributes.actualEndDate;
                        var today = new Date().toISOString().slice(0, 10);
                        var date;
            			if(actEndDate ? date=actEndDate : date=sEndDate)
             				if (startDate > today) {
                			project.attributes.status  = "New";      
           				 } else if ((startDate <= today) && (today < date)) {
                		project.attributes.status  = "In-progress";
           				 }else if (today > date) {
                		project.attributes.status  = "Delayed";      
           				 } else if(date=== today){
                		project.attributes.status ="In-progress";
            			 }  
					});
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprojects");
					that.getView().setBusy(false);
				})

			}, this);
			this._bDescendingSort = false;
			that.getCustomerDetails();
		},

		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				projectID = oEvent.getSource().getSelectedItem().getBindingContext("mprojects").getObject().id;
			this.oRouter.navTo("detailProjects", { layout: oNextUIState.layout, product: projectID });
			this.getView().getModel("mprojects").updateBindings(true);
		},

		// ON ADD PROJECTS

		projectsDetails: function (oEvent) {
			var that = this;
			that.getView().setBusy(false);
			$.ajax({
				url: "/deswork/api/p-projects?populate[1]=p_customer",
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var projectCustomerDetails = [];
					response.data.forEach(function (Project) {
						projectCustomerDetails.push(Project.attributes.p_customer.data)
					});
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "mproject");
					that.getOwnerComponent().getModel("mproject").updateBindings("true");

				},
				error: function (res) {
				}
			});
		},
		getCustomerDetails: function () {
			var that = this;
			$.ajax({
				url: "/deswork/api/p-customers?populate=*",
				type: "GET",
				success: function (res) {
					var response = JSON.parse(res);
					var theModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(theModel, "customerInfo");
				},
				error: function (res) {
					MessageBox.error(res + "Something went wrong");
				}
			});
		},

		onAddProjects: function (oEvent) {
			if (!this.oAddProjectDialog) {
				this.oAddProjectDialog = sap.ui.xmlfragment("idfrag", "VASPP.Projects.view.Register", this);
				this.getView().addDependent(this.oAddProjectDialog);
			}
			this.oAddProjectDialog.setModel(new sap.ui.model.json.JSONModel({}), "mproject");
			this.oAddProjectDialog.open();
		},

		closeProjectDialog: function () {
		 this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[2].setValue()==="",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[4].setValue()==="",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[6].setSelectedKey() === "",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[8].setValue()==="",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[10].setValue()==="",
        this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[12].setValue()==="",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[14].setSelectedKey() === "",
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[16].setSelectedKey() === "",			
        this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[18].setSelectedKey() === "" 
		this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[20].getItems()[0].setValue()==="",
		this.oAddProjectDialog.close();
		},

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
				this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[16]
						.setSelectedKey("In-progress")
			} else if (that.statusstartdate > today) {
				this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[16]
						.setSelectedKey("New")
			}
		},
		onSaveProject: function (oEvent) {
			var that = this;
			var Err = this.ValidateAddProject();
			if (Err == 0) {
				that.addProject = {
					name: this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[2].getValue(),
					description: this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[4].getValue(),
					type: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[6]
						.getSelectedKey(),
					startDate: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[8]
						.getValue(),
					estimatedEndDate: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[10]
						.getValue(),
					actualEndDate: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[12]
						.getValue() ? this.oAddProjectDialog
							.getContent()[0]
							.getItems()[0]
							.getContent()[12]
							.getValue() : null,
					priority: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[14]
						.getSelectedKey(),
					status: "New",
					p_customer: this.oAddProjectDialog
						.getContent()[0]
						.getItems()[0]
						.getContent()[18]
						.getSelectedKey() ? this.oAddProjectDialog
							.getContent()[0]
							.getItems()[0]
							.getContent()[18]
							.getSelectedKey() : null,
					estimated_budget: this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[20].getItems()[0].getValue() + " " +
						this.oAddProjectDialog.getContent()[0].getItems()[0].getContent()[20].getItems()[1].getSelectedKey(),
				}
				var settings = {
					"url": "/deswork/api/p-projects?populate=*",
					"method": "POST",
					"timeout": 0,
					"headers": {
						"Content-Type": "application/json"
					},
					"data": JSON.stringify({
						//"data": this.oAddProjectDialog.getModel("mproject").getData()
						data: that.addProject,
					}),
				};
				$.ajax(settings).done(function (response) {
					response = JSON.parse(response);
					if (response.error) {
						MessageBox.error(response.error.message);
					} else {
						that.oAddProjectDialog.close();
						$.get("/deswork/api/p-projects?populate[0]=p_customer&populate[1]=p_tasks&populate[2]=p_project_teams.users_permissions_users&populate[3]=users_permissions_users", function (response) {
							response = JSON.parse(response);
							var oModel = new sap.ui.model.json.JSONModel(response.data);
							that.getView().setModel(oModel, "mprojects");
							that.getView().setBusy(false);
							MessageBox.success("Project Added Successfully");
							that.closeProjectDialog();
						})

					}
				});
			}
			else {
				this.getView().setBusy(false);
				var text = "Mandatory Fields are Required";
				MessageBox.error(text);
			}
		},


		//VALIDATE ADD PROJECT

		ValidateAddProject: function () {
			var Err = 0;
			var thisView = this.oAddProjectDialog;
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
			return Err;
		},

		// SORT /FILTER

		onOpenViewSettings: function (oEvent) {
			var sDialogTab = "sort";
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = new sap.ui.xmlfragment("VASPP.Projects.fragment.viewSettingsDialog", this);
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




// Mujaida
		// onConfirmViewSettingsDialog: function (evt) {
        //     var sortType = evt.oSource.getSelectedSortItem();
        //     for (var i = 0; i < evt.oSource.getSortItems().length; i++) {
        //         if (evt.oSource.getSortItems()[i].sId == evt.oSource.getSelectedSortItem()) {
        //             var sortItemSelected = evt.oSource.getSortItems()[i].getKey();
        //             break;
        //         }
        //     }
        //     var sortType = evt.oSource.getSortDescending() == false ? true : false;
        //     var oList = this.getView().byId("list");
        //     var oBinding = oList.getBinding("items");
        //     var aSorter = [];
        //     if (sortItemSelected) {
        //         aSorter.push(new sap.ui.model.Sorter(sortItemSelected, evt.oSource.getSortDescending()));
        //         oBinding.sort(aSorter);
        //     } else {
        //         oBinding.sort([]);
        //     }
        //     var filters = [],
        //         eFilters = [],
        //         allFilters = [];
        //     if (evt.oSource.getSelectedFilterItems().length > 0) {
        //         var filterKeys = evt.getSource().getSelectedFilterCompoundKeys();
        //         for (var c = 0; c < Object.keys(filterKeys).length; c++) {
        //             eFilters = [];
        //             for (var k = 0; k < Object.keys(filterKeys[Object.keys(filterKeys)[c]]).length; k++) {
        //                 eFilters.push(new sap.ui.model.Filter(Object.keys(filterKeys)[c], "EQ", Object.keys(filterKeys[Object.keys(filterKeys)[c]])[k]));
        //             }
        //             if (eFilters.length > 1) {
        //                 allFilters.push(new sap.ui.model.Filter(eFilters, false));
        //             } else {
        //                 allFilters.push(eFilters[0]);
        //             }
        //         }
        //         // var oBindingInfo = this.getView().byId("list").getBindingInfo("items").parameters.custom.search = "Q";
        //         // this.getView().byId("list").getBindingInfo("items").bindItems(oBindingInfo);
        //         oBinding.filter(new sap.ui.model.Filter(allFilters, true));
        //     }
        // },
		
		// filterforarchive: function (i) {
		// 	var sQuery = "";
		// 	if (i == 1) {
		// 		sQuery = "Archived";
		// 	}
		// 	var aFilter = [];
		// 	var oBinding = this.getView().byId("productsTable").getBinding("items");
		// 	if (sQuery) {
		// 		var Status = new Filter("attributes/status", FilterOperator.NotContains, sQuery);
				 
		// 		var deafultFilters = [Status];
		// 		aFilter = new Filter(deafultFilters, false);
		// 		oBinding.filter(aFilter);
		// 	} else {
		// 		oBinding.filter(new Filter(aFilter, true));
		// 	}
		// },
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
				sQuery = oEvent.getParameter("query");
			if (sQuery && sQuery.length > 0) {
				//oTableidSearchState = [new Filter("id", FilterOperator.Contains, sQuery)];
				oTableSearchState = [new Filter("attributes/name", FilterOperator.Contains, sQuery)];
			}
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
	});
});

