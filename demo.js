var dragListDemo = {
    init : function(){
	    $(function(){
		    $("#dragList1").ncDragList({afterDrag:function(){
			    
			}});

			$("#btnInsert").click(function(){
				var dl = $(".ncDragList").getNcDragList();
                var items = dl.getItems();
			    $(".ncDragList").getNcDragList().insertItem(items.length + 1,"item"+(items.length+1));
			});

			$("#btnGet").click(function(){
				var dl = $(".ncDragList").getNcDragList();
                var items = dl.getItems();
			    alert(JSON.stringify(items));
			});
		});
	}
}

dragListDemo.init();