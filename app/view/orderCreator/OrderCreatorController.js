Ext.define('EVEInDust.view.orderCreator.OrderCreatorController', {
    extend: 'Ext.app.ViewController',
    requires: [
        "EVEInDust.model.Order",
        "EVEInDust.Common"
    ],
    alias: 'controller.OrderCreator',
    onClickCreateOrderButton: function(){
        var ordersGrid = this.lookupReference("orders-grid"),
            order = new EVEInDust.model.Order()
        ;
        order.setStatus(Ext.getStore("OrderStatuses").getById(1));
        ordersGrid.getSelectionModel().deselectAll();
        ordersGrid.getStore().insert(0, [order]);
        ordersGrid.findPlugin("rowediting").startEdit(order,0);
    },
    onEditOrderRowComplete: EVEInDust.Common.onEditModelRowComplete(),
    onCancelEditOrderRow: EVEInDust.Common.onCancelEditModelRow,
    onClickDeleteOrderButton: function(){
        EVEInDust.Common.deleteSelectedItemInGrid(this.lookupReference("orders-grid"),"Удаление заказа не удалось");
    },
    onItemClickInOrdersGrid: function(ordersGrid, order) {
        var itemsGrid = this.lookupReference("items-grid"),
            loadAnotherOrderData = true,
            filters, orderIdOfLoadingStore
        ;

        // показываем таблицу с предметами принеобходимости
        if(itemsGrid.isHidden()){
            itemsGrid.show();
        }

        // проверяем не задан ли тот же фильтр, что хотим задать мы. Т.о. предотвращаем повторную загрузку одних и
        // тех же данных
        filters = itemsGrid.getStore().getFilters();
        if(filters.count() > 0 && filters.containsKey("order") && filters.get("order").getValue() === order.getId()) {
            loadAnotherOrderData = false;
        }

        if(loadAnotherOrderData) {
            if(itemsGrid.getStore().isLoading()) {
                orderIdOfLoadingStore = filters.get("order").getValue();
                Ext.Msg.alert("Не торопитесь","Дождитесь загрузки заказа #"+orderIdOfLoadingStore+" прежде чем загружать заказ #"+order.getId());
                ordersGrid.getSelectionModel().select(ordersGrid.getStore().getById(orderIdOfLoadingStore))
            } else {
                // т.к. в таблицу с предметами будут загружаться новые данные, то в связи с этим необходимо
                // спрятать таблицы с работами
                this.lookupReference("associatedJobs-grid").hide();
                this.lookupReference("notAssociatedJobs-grid").hide();
                itemsGrid.getStore().addFilter({
                    id: "order",
                    property: "order",
                    value: order.getId()
                });
            }
        }
    },
    onSelectionChangeInOrdersGrid: function(ordersGrid, selectedItems){
        if(selectedItems.length === 0) {
            this.lookupReference("items-grid").hide();
            this.lookupReference("associatedJobs-grid").hide();
            this.lookupReference("notAssociatedJobs-grid").hide();
        }
    },
    onClickCreateItem: function(){
        var itemsGrid = this.lookupReference("items-grid"),
            item = new EVEInDust.model.Item()
        ;
        item.setOrder(this.lookupReference("orders-grid").getSelection()[0]);
        itemsGrid.getSelectionModel().deselectAll();
        itemsGrid.getStore().insert(0, [item]);
        itemsGrid.findPlugin("rowediting").startEdit(item,0);
    },
    onClickDeleteItemItem: function(){
        EVEInDust.Common.deleteSelectedItemInGrid(this.lookupReference("items-grid"),"Удаление товара для производства не удалось");
    },
    onCancelEditItemRow: EVEInDust.Common.onCancelEditModelRow,
    onEditItemRowComplete: EVEInDust.Common.onEditModelRowComplete(),
    onItemClickInItemGrid: function(itemsGrid, item){
        var associatedJobsGrid = this.lookupReference("associatedJobs-grid"),
            notAssociatedJobsGrid = this.lookupReference("notAssociatedJobs-grid"),
            associatedJobsStoreFilters = associatedJobsGrid.getStore().getFilters(),
            isAssociatedJobsStoreNecessaryLoading = true,
            notAssociatedJobsStoreFilters = notAssociatedJobsGrid.getStore().getFilters(),
            isNotAssociatedJobsStoreNecessaryLoading = true,
            itemIdOfLoadingAssociatedJobs
        ;
        if(associatedJobsGrid.isHidden()){
            associatedJobsGrid.show();
        }
        if(notAssociatedJobsGrid.isHidden()) {
            notAssociatedJobsGrid.show()
        }

        if(
            associatedJobsStoreFilters.count() > 0 &&
                associatedJobsStoreFilters.containsKey("item") &&
                associatedJobsStoreFilters.get("item").getValue() === item.getId()
            ) {
            isAssociatedJobsStoreNecessaryLoading = false;
        }
        if(
            notAssociatedJobsStoreFilters.count() > 0 &&
                notAssociatedJobsStoreFilters.containsKey("productTypeId") &&
                notAssociatedJobsStoreFilters.get("productTypeId").getValue() === item.get("typeId")
            ) {
            isNotAssociatedJobsStoreNecessaryLoading = false;
        }


        if( isAssociatedJobsStoreNecessaryLoading || isNotAssociatedJobsStoreNecessaryLoading ) {
            if((associatedJobsGrid.getStore().isLoading() || notAssociatedJobsGrid.getStore().isLoading())) {
                itemIdOfLoadingAssociatedJobs = associatedJobsStoreFilters.get("item").getValue();
                Ext.Msg.alert("Не торопитесь","Дождитесь загрузки данных о предмете #"+itemIdOfLoadingAssociatedJobs+" прежде чем загружать данные о #"+item.getId());
                itemsGrid.getSelectionModel().select(itemsGrid.getStore().getById(itemIdOfLoadingAssociatedJobs))
            } else {
                if(isAssociatedJobsStoreNecessaryLoading) {
                    associatedJobsGrid.getStore().addFilter({
                        id: "item",
                        property: "item",
                        value: item.getId()
                    });
                }
                if(isNotAssociatedJobsStoreNecessaryLoading) {
                    notAssociatedJobsGrid.getStore().addFilter([{
                        id: "productTypeId",
                        property: "productTypeId",
                        value: item.get("typeId")
                    },{
                        id: "activityId",
                        property: "activityId",
                        value: EVEInDust.common.IndustryActivity.Manufacturing
                    }]);
                }

                this.getViewModel().getStore('industry_activity_products').addFilter([{
                    id: "productTypeId",
                    property: "productTypeId",
                    value: item.get("typeId")
                },{
                    id: "activityId",
                    property: "activityId",
                    value: EVEInDust.common.IndustryActivity.Manufacturing
                }]);
            }
        }



    },
    onSelectionChangeInItemsGrid: function(itemsGrid, selectedItems) {
        if(selectedItems.length === 0) {
            this.lookupReference("associatedJobs-grid").hide();
            this.lookupReference("notAssociatedJobs-grid").hide();
        }
    },
    onClickAssociateJobToProducingItemButton: function (button) {
        var association,
            notAssociatedJobsGrid = this.lookupReference("notAssociatedJobs-grid"),
            me = this
        ;
        button.disable();
        association = new EVEInDust.model.IndJobToProducingItemAssociation();
        association.setItem(this.lookupReference("items-grid").getSelection()[0]);
        association.set("jobId",notAssociatedJobsGrid.getSelection()[0].get("jobId"));
        
        association.save({
            success: function () {
                notAssociatedJobsGrid.getStore().load();
                me.lookupReference("associatedJobs-grid").getStore().load();
            },
            callback: function () {
                button.enable();
            }
        });
    },
    onClickDisassociateJobFromProducingItemButton: function(button) {
        var store,
            me = this,
            associatedJobsGrid = this.lookupReference("associatedJobs-grid")
        ;
        button.disable();
        associatedJobsGrid.setLoading(true);

        // Я пока не знаю как загрузить необходимую сущность по-другому... реализовывать аякс запрос мне не очень хочется, так проще...
        store = Ext.create(Ext.data.Store,{
            model: 'EVEInDust.model.IndJobToProducingItemAssociation',
            remoteFilter: true,
            filters: [{
                id: "jobId",
                property: "jobId",
                value: associatedJobsGrid.getSelection()[0].get("jobId")
            }]
        });
        store.load(function (records, operation, success) {
            if(success) {
                records[0].erase({
                    success: function () {
                        associatedJobsGrid.setLoading(false);
                        associatedJobsGrid.getStore().load();
                        me.lookupReference("notAssociatedJobs-grid").getStore().load()
                    },
                    failure: function () {
                        Ext.Msg.show({
                            title: "Ошибка",
                            msg: "Не удалось отвязать работу",
                            icon: Ext.Msg.ERROR,
                            buttons: Ext.Msg.OK
                        });
                        associatedJobsGrid.setLoading(false);
                    },
                    callback: function () {
                        button.enable();
                    }
                });
            } else {
                button.enable();
                associatedJobsGrid.setLoading(false);
                Ext.Msg.show({
                    title: "Ошибка",
                    msg: "Не удалось загрузить данные для отвязывания работы",
                    icon: Ext.Msg.ERROR,
                    buttons: Ext.Msg.OK
                });
            }
        });
    },
    onClickCloseOrderButton: function(button){
        var ordersGrid = this.lookupReference('orders-grid'),
            order = ordersGrid.getSelection()[0]
        ;
        ordersGrid.setLoading(true);
        button.disable();
        order.setStatus(Ext.getStore("OrderStatuses").getById(EVEInDust.common.OrderStatuses.WaitingForProduce));
        order.save({
            success: function(){
                ordersGrid.getStore().load();
            },
            failure: function(){
                order.reject();
            },
            callback: function(){
                button.enable();
                ordersGrid.setLoading(false);
            }
        })
    }
    
});
