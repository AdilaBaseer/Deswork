sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    '../utils/formatter'
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageToast, MessageBox, formatter) {

        "use strict";
        return Controller.extend("vaspp.myprofile.controller.myprofile", {
            formatter: formatter,
            onInit: function () {
                var that = this;
                that.getPersonalInformation();
            },
            getPersonalInformation: function () {
                var that = this;
                var url = 'deswork/api/users/me';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel = new sap.ui.model.json.JSONModel(response);
                        that.getView().setModel(oModel, "userModel");
                        that.setSkillSet(response.skills);
                        that.setCertificatesSet(response.certificates);
                    }
                });
            },
            //for certificates
            setCertificatesSet: function (certificates) {
                var result = [];
                if (certificates === "" || certificates === null) {
                    // var obj = {
                    //     "name": "",
                    //     "rate": 0
                    // }
                    // result.push(obj);
                } else {
                    var certificatesSet = certificates.split(",");
                    var result = [];
                    for (var i = 0; i < certificatesSet.length; i++) {
                        var temp = certificatesSet[i].split("-");
                        var name = temp[0];
                        var rate = temp[1];
                        var obj = {
                            "name": name,
                            "rate": rate
                        }
                        result.push(obj);
                    }
                }
                var oModel = new sap.ui.model.json.JSONModel(result);
                this.getView().setModel(oModel, "certificateModel");
                this.setListc(result);


            },
            setListc: function () {
                this.byId("tableCol1c").setVisible(true);
                this.byId("tableCol4c").setVisible(false);
                this.byId("tableCol2c").setVisible(true);
                this.byId("tableCol3c").setVisible(false);
            },
            onAddc: function () {
                this.onEditc();
                var certificates = this.getView().getModel("certificateModel").getData();
                var obj = {
                    "name": "",
                    "rate": ""
                }
                certificates.push(obj);
                this.getView().getModel("certificateModel").setData(certificates);
            },
            onEditc: function () {
                this.byId("cancelButtonc").setVisible(true);
                this.byId("saveButtonc").setVisible(true);
                this.byId("editButtonc").setVisible(false);
                this.byId("addButtonc").setVisible(false);
                this.byId("tableCol1c").setVisible(false);
                this.byId("tableCol4c").setVisible(true);
                this.byId("tableCol2c").setVisible(false);
                this.byId("tableCol3c").setVisible(true);
            },
            onSavec: function () {
                this.setVisibilityc();
                this.clearEmptySetc();
                this.getSkillSetc();              
                this.postSkillSetc();
            },
            onCancelc: function () {
                this.setVisibilityc();   
                var certificates = this.getView().getModel("userModel").getData().certificates;      
                this. setCertificatesSet(certificates); 
                this.clearEmptySetc();
            },
            setVisibilityc: function () {
                this.byId("cancelButtonc").setVisible(false);
                this.byId("saveButtonc").setVisible(false);
                this.byId("editButtonc").setVisible(true);
                this.byId("addButtonc").setVisible(true);
                this.byId("tableCol1c").setVisible(true);
                this.byId("tableCol4c").setVisible(false);
                this.byId("tableCol2c").setVisible(true);
                this.byId("tableCol3c").setVisible(false);
            },
            getSkillSetc: function () {
                var temp = "", that = this;
                var data = that.getView().getModel("certificateModel").getData();
                for (var i = 0; i < data.length; i++) {
                    if (i + 1 === data.length) {
                        temp = temp + data[i].name + "-" + data[i].rate;
                    } else {
                        temp = temp + data[i].name + "-" + data[i].rate + ",";
                    }

                }
                that.getView().getModel("userModel").getData().certificates = temp;
            },
            clearEmptySetc: function () {
                var certificates = this.getView().getModel("certificateModel").getData();
                for (var i = 0; i < certificates.length; i++) {
                    if (certificates[i].name === "") {
                        certificates.splice(i, 1);
                    }
                }
                this.getView().getModel("certificateModel").setData(certificates);
            },
            postSkillSetc: function () {
                var that = this;
                var data = that.getView().getModel("userModel").getData();
                var id = data.id;
                var url = 'deswork/api/users/' + id;
                $.ajax({
                    url: url,
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(data),
                    success: function (response) {
                        response = JSON.parse(response);
                    }
                });
            },
            //certificates till here
            setSkillSet: function (skills) {
                var result = [];
                if (skills === "" || skills === null) {
                    // var obj = {
                    //     "name": "",
                    //     "rate": 0
                    // }
                    // result.push(obj);
                } else {
                    var skillSet = skills.split(",");
                    for (var i = 0; i < skillSet.length; i++) {                     
                        var temp = skillSet[i].split("-");
                        var name = temp[0];
                        var rate = temp[1];
                        var obj = {
                            "name": name,
                            "rate": rate
                        }
                        result.push(obj);
                    }

                }
                var oModel = new sap.ui.model.json.JSONModel(result);
                this.getView().setModel(oModel, "skillModel");
                this.setList(result);
            },
            setList: function () {
                this.byId("tableCol1").setVisible(true);
                this.byId("tableCol4").setVisible(false);
                this.byId("tableCol2").setVisible(true);
                this.byId("tableCol3").setVisible(false);
            },
            onEdit: function () {
                this.byId("cancelButton").setVisible(true);
                this.byId("saveButton").setVisible(true);
                this.byId("editButton").setVisible(false);
                this.byId("addButton").setVisible(false);
                this.byId("tableCol1").setVisible(false);
                this.byId("tableCol2").setVisible(false);
                this.byId("tableCol4").setVisible(true);        
                this.byId("tableCol3").setVisible(true);
            },
            onSave: function () {
                this.setVisibility();
                this.clearEmptySet();
                this.getSkillSet();            
                this.postSkillSet();
            },
            onCancel: function () {
                this.setVisibility();
                // this.dataclear();
                this.clearEmptySet();
                var skills = this.getView().getModel("userModel").getData().skills;      
                 this.setSkillSet(skills); 
            },
            dataclear:function(){
            this.getView().byId("tableColList12").getData()
            },
        
            setVisibility: function () {
                this.byId("cancelButton").setVisible(false);
                this.byId("saveButton").setVisible(false);
                this.byId("editButton").setVisible(true);
                this.byId("addButton").setVisible(true);
                this.byId("tableCol1").setVisible(true);
                this.byId("tableCol4").setVisible(true);
                this.byId("tableCol2").setVisible(false);
                this.byId("tableCol3").setVisible(false);
            },
            getSkillSet: function () {
                var temp = "", that = this;
                var data = that.getView().getModel("skillModel").getData();
                for (var i = 0; i < data.length; i++) {
                    if (i + 1 === data.length) {
                        temp = temp + data[i].name + "-" + data[i].rate;
                    } else {
                        temp = temp + data[i].name + "-" + data[i].rate + ",";
                    }

                }
                that.getView().getModel("userModel").getData().skills = temp;
            },
            postSkillSet: function () {
                var that = this;
                var data = that.getView().getModel("userModel").getData();
                var id = data.id;
                var url = 'deswork/api/users/' + id;
                $.ajax({
                    url: url,
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(data),
                    success: function (response) {
                        response = JSON.parse(response);
                    }
                });
            },
            onAdd: function () {
                this.onEdit();     
             var skills = this.getView().getModel("skillModel").getData();
                // var i= skills.length;
                var obj = {
                    "name": "",
                    "rate": 0
                }
                skills.push(obj);
                this.getView().getModel("skillModel").setData(skills);
            },
            clearEmptySet: function () {
                var skills = this.getView().getModel("skillModel").getData();
                for (var i = 0; i < skills.length; i++) {
                    if (skills[i].name === "") {
                        skills.splice(i, 1);
                    }            
                }
                this.getView().getModel("skillModel").setData(skills);
            }
        });

    });    