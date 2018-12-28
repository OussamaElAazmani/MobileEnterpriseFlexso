jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/App",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Browser",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Master",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/Detail",
	"be/ehb/mobile/EnterpriseFlexso/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "be.ehb.mobile.EnterpriseFlexso.view."
	});

	sap.ui.require([
		"be/ehb/mobile/EnterpriseFlexso/test/integration/NavigationJourneyPhone",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/NotFoundJourneyPhone",
		"be/ehb/mobile/EnterpriseFlexso/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});