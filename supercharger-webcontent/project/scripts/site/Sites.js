define(['util/Asserts', 'model/Address', 'site/SiteList'], function (Asserts, Address, SiteList) {

    var Sites = {};

    Sites.LIST = SiteList;

    Sites.getById = function (id) {
        Asserts.isInteger(id, "id must be an integer");
        for (var i = 0; i < Sites.LIST.length; i++) {
            var supercharger = Sites.LIST[i];
            if (supercharger.id === id) {
                return supercharger;
            }
        }
        return null;
    };

    Sites.removeById = function (id) {
        Asserts.isInteger(id, "id must be an integer");
        for (var index = 0; index < Sites.LIST.length; index++) {
            var supercharger = Sites.LIST[index];
            if (supercharger.id === id) {
                Sites.LIST.splice(index, 1);
                break;
            }
        }
    };

    Sites.addSupercharger = function (displayName, location) {
        var charger = {
            "id": (Sites.LIST.length + 25000),
            "displayName": displayName,
            "address": new Address("", "", "", "", ""),
            "location": location,
            "url": null,
            "count": false,
            "custom": true
        };
        Sites.LIST.push(charger);
        return charger;
    };

    return Sites;

});