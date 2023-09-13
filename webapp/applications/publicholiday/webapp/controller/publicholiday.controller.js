sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "vaspp/publicholiday/utils/formatter"
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageToast, MessageBox, formatter, Fragment) {

        "use strict";
        return Controller.extend("vaspp.publicholiday.controller.publicholiday", {
            formatter: formatter,
            onInit: function () {
                var that = this;
                this.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
                that.callCalendar();

            },
            callCalendar: function (userId) {
                var arr = [];
                var that = this;
                var date = new Date();
                var year = date.getFullYear();
                var url = 'deswork/api/p-holidays?populate=*&filters[year][$eq]=' + year;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "calendar");
                    }
                });

            },
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));
                var object = {
                    "editable": false,
                    "editButton": true
                };
                var oModel = new sap.ui.model.json.JSONModel(object);
                that.getView().setModel(oModel, "editableModel");

            },
            onEditholiday: function () {
                var that = this;
                that.editableMode(true, false);
            },
            onCancelholiday: function () {
                var that = this;
                that.editableMode(false, true);
                that.removeDuplicates();
                that.callCalendar();

            },
            onSaveEditholiday: function (evt) {
                var that = this;
                var path = evt.getSource().getBindingContext("calendar").getPath();
                path = path.replace("/", "");
                path = parseInt(path);
                var data = (evt.getSource().getBindingContext("calendar").getModel().getData())[path];
                var Err =  that.checkDataEmpty(data.attributes, data.id);
                if(Err==0){
                    that.dataUpdated(data.attributes, data.id);
                    that.removeDuplicates();
                    that.editableMode(false, true);
                }else{
                    this.getView().setBusy(false);
                    var text = "Mandatory Fields are Required..";
                    MessageBox.error(text);
                    // that.editableMode(true, false);
                }
               
            },

            checkDataEmpty: function (data, id) {
              var reason=data.reason;
              var date=data.date;
              var Err=0;
                if (reason === "" || date == "") {
                    // setValueState("None");
                    Err++;       
                }
                return Err;
            },

            editableMode: function (val1, val2) {
                var that = this;
                var data = that.getView().getModel("editableModel").getData();
                data.editable = val1;
                data.editButton = val2;
                that.getView().getModel("editableModel").setData(data);
            },
            dataUpdated: function (data, id) {
                var that=this;
                    var url = "/deswork/api/p-holidays/";
                    var userId = id;
                    var settings = {
                        "url": url + (userId ? "/" + userId : ""),
                        "type": userId ? "PUT" : "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({
                            "data": {
                                "year": parseInt(data.year),
                                "reason": data.reason,
                                "date": data.date,
                                "userId": data.userId,
                                "userName": data.userName
                            }
                        }),
                    };
                    $.ajax(settings).done(function (response) {
                        response = JSON.parse(response);
                        // Success callback
                        if (userId) {
                            // PUT request succeeded
                            MessageBox.success("Holiday Updated successfully");
                        } else {
                            // POST request succeeded
                            MessageBox.success("Holiday Added successfully");
                        }
                     
                    });
            },
           
            onPressAddHoliday: function () {
                var that = this;
                // that.removeDuplicates();
                that.onEditholiday();
                var currYear = new Date();
                currYear = currYear.getFullYear();
                var data = that.getView().getModel("calendar").getData();
                var obj =
                {
                    "attributes": {
                        "year": currYear,
                        "reason": "",
                        "date": "",
                    },
                    "id": 0,
                };
                data.push(obj);
                that.getView().getModel("calendar").setData(data);
            },


            removeDuplicates: function () {
                var that = this;
                var data = that.getView().getModel("calendar").getData();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].attributes.reason === "") {
                        data.splice(i, 1);
                    }
                }
                that.getView().getModel("calendar").setData(data);
            },
            onPressDeleteHoliday: function (evt) {
                var that = this;
                var table = this.getView().byId("holidayCalendar");
                var selectedItems = table.getSelectedItems();
                if (selectedItems.length > 0) {
                    MessageBox.confirm(
                        "Are you sure you want to delete the Selected Holiday?",
                        {
                            title: "Confirm Deletion",
                            icon: MessageBox.Icon.WARNING,
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (oAction) {
                                if (oAction === "YES") {
                                    var deletePromises = [];
                                    selectedItems.forEach(function (item) {
                                        var path = item.getBindingContextPath();
                                        var itemId = table
                                            .getModel("calendar")
                                            .getProperty(path).id;
                                        deletePromises.push(
                                            new Promise(function (resolve, reject) {
                                                $.ajax({
                                                    url: "deswork/api/p-holidays/" + itemId,
                                                    type: "DELETE",
                                                    success: function (res) {
                                                        resolve(res);
                                                    },
                                                    error: function (err) {
                                                        reject(err.responseText);
                                                    },
                                                });
                                            })
                                        );
                                    });

                                    Promise.all(deletePromises)
                                        .then(function () {
                                            // Handle success
                                            that.getView().getModel("calendar").updateBindings(true);
                                            that.onInit();
                                            MessageToast.show("Holiday Deleted Successfully!");

                                        })
                                        .catch(function (error) {
                                            // Handle error
                                            MessageBox.error(error);
                                        });
                                }
                            },
                        }
                    );
                }
            },
        });
    });    