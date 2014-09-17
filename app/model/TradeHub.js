Ext.define("EVEInDust.model.TradeHub", {
    extend: "Ext.data.Model",
    uses: [
    ],
    idProperty: "stationId",
    fields: [
        {
                name: "stationId",            
                type: "int",            
                useNull: true,            
                persist: false            
        },
        {
                name: "name",            
                type: "string"            
        }
    ],
    validations: [
        {
            type: "presence",
            field: "name"
        }
    ],
    associations: [
    ],
    proxy: {"type":"rest","url":"/api/tradehubs","actionMethods":{"update":"PATCH","read":"GET","create":"POST","destroy":"DELETE"},"reader":{"rootProperty":"data","type":"json","messageProperty":"message"},"writer":{"type":"json","writeRecordId":false,"writeAllFields":false,"dateFormat":"Y-m-d\\TH:i:sO"}}
});