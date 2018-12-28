jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 EmployeeOdataSet in the list
// * All 3 EmployeeOdataSet have at least one PdetailOdata

sap.ui.require([
	"sap/ui/test/Opa5",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/App",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Browser",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Master",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Detail",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Create",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "be.ehb.mobile.EnterpriseFlexso.view."
	});

	sap.ui.require([
		"be/ehb/mobile/EnterpriseFlexso/test/integration/MasterJourney",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/NavigationJourney",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/NotFoundJourney",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/BusyJourney",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});