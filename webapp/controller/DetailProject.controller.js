/*global location */
/*eslint-disable no-console, no-alert */
sap.ui.define([
	"be/ehb/mobile/EnterpriseFlexso/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"be/ehb/mobile/EnterpriseFlexso/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("be.ehb.mobile.EnterpriseFlexso.controller.DetailProject", {

		formatter: formatter,


		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
            
			this.getRouter().getRoute("project").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
		},



		onShareEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},


		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		onDelete: function () {
			var that = this;
			var oViewModel = this.getModel("detailView"),
				sPath = oViewModel.getProperty("/sObjectPath"),
				sObjectHeader = this._oODataModel.getProperty(sPath + "/Titel"),
				sQuestion = this._oResourceBundle.getText("deleteText", sObjectHeader),
				sSuccessMessage = this._oResourceBundle.getText("deleteSuccess", sObjectHeader);

			var fnMyAfterDeleted = function () {
				MessageToast.show(sSuccessMessage);
				oViewModel.setProperty("/busy", false);
				var oNextItemToSelect = that.getOwnerComponent().oListSelector.findNextItem(sPath);
				that.getModel("appView").setProperty("/itemToSelect", oNextItemToSelect.getBindingContext().getPath()); //save last deleted
			};
			this._confirmDeletionByUser({
				question: sQuestion
			}, [sPath], fnMyAfterDeleted);
		},

		onEdit: function () {
			this.getModel("appView").setProperty("/addEnabled", false);
			var sObjectPath = this.getView().getElementBinding().getPath();
			this.getRouter().getTargets().display("createProject", {
				mode: "update",
				objectPath: sObjectPath
			});
		},


		_onObjectMatched: function (oEvent) {
			var oParameter = oEvent.getParameter("arguments");
			for (var value in oParameter) {
				oParameter[value] = decodeURIComponent(oParameter[value]);
			}
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("ProjectOdataSet", oParameter);
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},


		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		 onEvaluate: function(oEventArgs)
		 {
		 	var row = oEventArgs.getSource();
        	var context = row.getBindingContext("modelPath");
			var oView = this.getView();
        	// get binding object (reference to an object of the original array)
        	var person = context.oModel.getProperty(context.sPath);
        	
			if (!this.oAddfeedbackDialog) {
				this.oAddfeedbackDialog = sap.ui.xmlfragment("be.ehb.mobile.EnterpriseFlexso.view.AddFeedbackDialog", this);
				this.getView().addDependent(this.oAddfeedbackDialog);
			}
			var objectString = this.getView().getElementBinding().getPath();
			var objectid = objectString.substring(19, 26);
			var array = [];
			array.push({empid: person.Employeeid, projid: parseInt(objectid), name: person.Firstname + " " +person.Lastname});
			var userModel = new sap.ui.model.json.JSONModel();
            userModel.setData({
            	arrayName: array
            });
          //  var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var oModelCheck = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"});
        	oModelCheck.read("/PdetailOdataSet", {
        		success: function(data)
        		{

            	var mdl = new sap.ui.model.json.JSONModel();
            			   mdl.setData({
            					arrayName: {id: data.results}
            
            			   });
            	oView.setModel(mdl, "PdetailPath"); 

            	}
        	});

			
			this.oAddfeedbackDialog.setModel(userModel, "userPath");
			this.oAddfeedbackDialog.open();
		 }, 
		 
		 onAddMembers: function()
		 {
		 	var oView = this.getView();
		 	if (!this.oAddUserDialog) {
				this.oAddUserDialog = sap.ui.xmlfragment("be.ehb.mobile.EnterpriseFlexso.view.AddUserDialog", this);
				this.getView().addDependent(this.oAddUserDialog);
			}
			this.oAddUserDialog.open();
			var oModelCheck = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"});
        	oModelCheck.read("/EmployeeOdataSet", {
        		success: function(data)
        		{
					var odata = data.results; 
            		var mdl = new sap.ui.model.json.JSONModel();
            		mdl.setData({
            			arrayName: odata
            	
            		});
            		oView.setModel(mdl, "EmpPath"); 

            	}
        	});
			
		//	this.oAddUserDialog.setModel(userModel, "userPath");
			
		 },
		 
		 _onClose: function()
		 {
		 	 if (this.oAddUserDialog) {
					this.oAddUserDialog.close();
    		 }
		 },
		 
		 _onAddUser: function()
		 {
		 	//
		 	var employeeid = sap.ui.getCore().byId('selectId').getSelectedKey(); 
        	var objectString = this.getView().getElementBinding().getPath();
			var projectid = objectString.substring(19, 26);

			var oModel = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"});
			oModel.read("/PdetailOdataSet",{
				success:function(data)
				{
					var latestid = 0;
					var exist = false;
					for(var i = 0; i < data.results.length; i++)
					{
						if(parseInt(data.results[0].Employeeid) == parseInt(employeeid) && parseInt(data.results[0].Projectid) == parseInt(projectid)) 
						{
							exist = true;	
						}
						latestid = data.results[i].Projectdetailid; 
					}
					latestid = parseInt(latestid);
					latestid++;
					
					if(exist == false) 
					{
						var oData = {
								  "d" : {
								    "__metadata" : {
								      "id" : "/PdetailOdataSet('00000001')",
								      "uri" : "/PdetailOdataSet('00000001')",
								      "type" : "YXM_122_ODATA_SRV.PdetailOdata"
								    },
								    "Projectdetailid" : latestid + "",
								    "Employeeid" : parseInt(employeeid) + "",
								    "Projectid" : parseInt(projectid) + "",
								    "Evaluationid" : "",
								    "EmployeeOdataSet" : {
								      "__deferred" : {
								        "uri" : "/PdetailOdataSet('00000001')/EmployeeOdataSet"
								      }
								    }
								  }
								};
								
						oModel.create("/PdetailOdataSet", oData);
					}
				}
			});

		 	
		 },
		 _onSubmitFeedback: function()
		 {
		 	var oView = this.getView();
		 	var model = this.oAddfeedbackDialog.getModel("userPath");
		 	var person = model.oData.arrayName[0];
		 	var quality = sap.ui.getCore().byId("quality").getValue();
		 	var deadlines = sap.ui.getCore().byId("deadlines").getValue();
		 	var extra = sap.ui.getCore().byId("extra").getValue();
		 	var info = sap.ui.getCore().byId("info").getValue();
		 	var latestid = 0;
		    var oModel = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"});
        	oModel.read("/EvalutieOdataSet", {
					method: "GET",
        	 	success: function(data){
        	 		for(var i = 0; i < data.results.length; i++)
        	 		{
        	 			latestid = data.results[i].Evaluationid;
        	 		}
        	 		latestid = parseInt(latestid);
        	 		latestid += 1;
        	 		
        	 		var oData = {
							"d" : {
    							"__metadata" : {
    									"id" : "/EvalutieOdataSet('00000004')",
    									"uri" : "/EvalutieOdataSet('00000004')",
    									"type" : "YXM_122_ODATA_SRV.EvalutieOdata"
    							},
								"Evaluationid" : latestid + "",
								"Quality" : quality + "",
								"Punctuality" : deadlines + "",
								"Extraimpact" : extra + "",
								"Info" : info + ""
							}
						};
						
						var oDataModel = new sap.ui.model.odata.v2.ODataModel("/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/");
        	                             
    					oDataModel.create("/EvalutieOdataSet", oData, {
    						success: function()
    						{
							 //  sap.m.MessageToast.show(person.name + " was evaluated");
							   
							   var jsonModel = new sap.ui.model.json.JSONModel();
        	 			   jsonModel.setData({
        	 					arrayName: {id: latestid}
        	 
        	 			   });
        	 		    oView.setModel(jsonModel, "latestPath");
    						},
    						error: function()
    						{
    						   var jsonModel = new sap.ui.model.json.JSONModel();
        	 			   jsonModel.setData({
        	 					arrayName: {id: -1}
        	 
        	 			   });
        	 		       oView.setModel(jsonModel, "latestPath");
							 //  sap.m.MessageBox.error(person.name + " was not evaluated");
    						}
    					});
        	 	}
        	 });
            
		 			// id of created evaluation
        			var testModel = oView.getModel("latestPath").oData;
            		var id = testModel.arrayName.id;	
            		// all pdetails
            		var details = oView.getModel("PdetailPath").oData;
    				var exist = false;
        			var pdetailid = -1;
        			var latest = 0;

        		
        			for(var i = 0; i < details.arrayName["id"].length; i++)
        			{
        				if(parseInt(details.arrayName["id"][i].Employeeid) === parseInt(person.empid) && parseInt(details.arrayName["id"][i].Projectid) === person.projid)
        				{
        					
        					pdetailid = details.arrayName["id"][i].Projectdetailid;

        					exist = true;
        				}
        				latest = details.arrayName["id"][i].Projectdetailid;

        				if(exist)
        				{
        					i = details.arrayName["id"].length;
        				}
        			}
        			latest = parseInt(latest);
        			latest++;
        		
        			if(exist)
        			{
        				
        				var data = 
									{
									  "d" : {
									    "__metadata" : {
									      "id" : "/PdetailOdataSet('00000001')",
									      "uri" : "/PdetailOdataSet('00000001')",
									      "type" : "YXM_122_ODATA_SRV.PdetailOdata"
									    },
									    "Projectdetailid" : pdetailid + "",
									    "Employeeid" : person.empid + "",
									    "Projectid" : person.projid + "",
									    "Evaluationid" : id+ "",
									    "EmployeeOdataSet" : {
									      "__deferred" : {
									        "uri" : "/PdetailOdataSet('00000001')/EmployeeOdataSet"
									      }
									    }
									  }
									};
        				
        				
        				var path = "/PdetailOdataSet('" + parseInt(pdetailid) + "')";
        				var oDataModel = new sap.ui.model.odata.v2.ODataModel("/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/");
    					oDataModel.update(path, data);
    					
    					 if (this.oAddfeedbackDialog) {
							this.oAddfeedbackDialog.close();
    					 }
        			}
        			else
        			{
        					var data = 
									{
									  "d" : {
									    "__metadata" : {
									      "id" : "/PdetailOdataSet('00000001')",
									      "uri" : "/PdetailOdataSet('00000001')",
									      "type" : "YXM_122_ODATA_SRV.PdetailOdata"
									    },
									    "Projectdetailid" : latest + "",
									    "Employeeid" : person.empid + "",
									    "Projectid" : person.projid + "",
									    "Evaluationid" : id + "",
									    "EmployeeOdataSet" : {
									      "__deferred" : {
									        "uri" : "/PdetailOdataSet('00000001')/EmployeeOdataSet"
									      }
									    }
									  }
									};
        				var path = "/PdetailOdataSet('" + parseInt(pdetailid) + "')";
        				var oDataModel = new sap.ui.model.odata.v2.ODataModel("/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/");
    					oDataModel.create(path, data);
    					
    					 if (this.oAddfeedbackDialog) {
								this.oAddfeedbackDialog.close();
							}
        			}

            

		 },
		 
	
		 
		 _onCloseFeedback: function()
		 {
		 	if (this.oAddfeedbackDialog) {
				this.oAddfeedbackDialog.close();
			}
		 },
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding(),
				oViewModel = this.getModel("detailView"),
				oAppViewModel = this.getModel("appView");
				
			var objectString = this.getView().getElementBinding().getPath();
			var objectid = objectString.substring(19, 26);
			var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			
			var employees = [];
			var oModel = new sap.ui.model.odata.v2.ODataModel({
											serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"
                                        });
           oModel.read("/PdetailOdataSet", {
				method: "GET",
            	success: function(data){
            		oStorage.clear();
            		var temp = [];
            		for(var i = 0; i < data.results.length; i++) {
            				temp.push({ empid: data.results[i].Employeeid ,
            							 projid: data.results[i].Projectid
            				});
            		}
            		
            		for(var j = 0; j < temp.length; j++)
            		{
            			if(parseInt(temp[j].projid) === parseInt(objectid))
            			{
            					employees.push(temp[j]);
            			}
            		}
            		
            		//Get Storage object to use
					
					oStorage.put("empid", employees);
            	}
            });	
            
        	var model = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/SAPGateway/sap/opu/odata/SAP/YXM_122_ODATA_SRV/"});

        	model.read("/EmployeeOdataSet", {
        		method: "GET",
            	success: function(emp){   		
            		var filterids = oStorage.get("empid");
            		var emps = [];
            		
            		for(var i = 0; i < emp.results.length; i++)
            		{
            			for(var j = 0; j < filterids.length; j++)
            			{
            				if(parseInt(emp.results[i].Employeeid) === parseInt(filterids[j].empid))
            				{
            					emps.push(emp.results[i]);
            				}
            			}
            		}
            		
            		
            		var jsonModel = new sap.ui.model.json.JSONModel();
            		jsonModel.setData({
            			arrayName: emps
            
            		});
            		oView.setModel(jsonModel, "modelPath");
            	}
            });	

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = oElementBinding.getBoundContext().getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Projectid,
				sObjectName = oObject.Titel;

			oViewModel.setProperty("/sObjectId", sObjectId);
			oViewModel.setProperty("/sObjectPath", sPath);
			oAppViewModel.setProperty("/itemToSelect", sPath);
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the deletion of a list of entities
		 * @param {object} oConfirmation - Possesses up to two attributes: question (obligatory) is a string providing the statement presented to the user.
		 * title (optional) may be a string defining the title of the popup.
		 * @param {object} oConfirmation - Possesses up to two attributes: question (obligatory) is a string providing the statement presented to the user.
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnAfterDeleted (optional) - called after deletion is done. 
		 * @param {callback} fnDeleteCanceled (optional) - called when the user decides not to perform the deletion
		 * @param {callback} fnDeleteConfirmed (optional) - called when the user decides to perform the deletion. A Promise will be passed
		 * @function
		 * @private
		 */
		/* eslint-disable */ // using more then 4 parameters for a function is justified here
		_confirmDeletionByUser: function (oConfirmation, aPaths, fnAfterDeleted, fnDeleteCanceled, fnDeleteConfirmed) {
			/* eslint-enable */
			// Callback function for when the user decides to perform the deletion
			var fnDelete = function () {
				// Calls the oData Delete service
				this._callDelete(aPaths, fnAfterDeleted);
			}.bind(this);

			// Opens the confirmation dialog
			MessageBox.show(oConfirmation.question, {
				icon: oConfirmation.icon || MessageBox.Icon.WARNING,
				title: oConfirmation.title || this._oResourceBundle.getText("delete"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						fnDelete();
					} else if (fnDeleteCanceled) {
						fnDeleteCanceled();
					}
				}
			});
		},

		/**
		 * Performs the deletion of a list of entities.
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnAfterDeleted (optional) - called after deletion is done. 
		 * @return a Promise that will be resolved as soon as the deletion process ended successfully.
		 * @function
		 * @private
		 */
		_callDelete: function (aPaths, fnAfterDeleted) {
			var oViewModel = this.getModel("detailView");
			oViewModel.setProperty("/busy", true);
			var fnFailed = function () {
				this._oODataModel.setUseBatch(true);
			}.bind(this);
			var fnSuccess = function () {
				if (fnAfterDeleted) {
					fnAfterDeleted();
					this._oODataModel.setUseBatch(true);
				}
				oViewModel.setProperty("/busy", false);
			}.bind(this);
			return this._deleteOneEntity(aPaths[0], fnSuccess, fnFailed);
		},

		/**
		 * Deletes the entity from the odata model
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnSuccess - Event handler for success operation.
		 * @param {callback} fnFailed - Event handler for failure operation.
		 * @function
		 * @private
		 */
		_deleteOneEntity: function (sPath, fnSuccess, fnFailed) {
			var oPromise = new Promise(function (fnResolve, fnReject) {
				this._oODataModel.setUseBatch(false);
				this._oODataModel.remove(sPath, {
					success: fnResolve,
					error: fnReject,
					async: true
				});
			}.bind(this));
			oPromise.then(fnSuccess, fnFailed);
			return oPromise;
		}

	});
});