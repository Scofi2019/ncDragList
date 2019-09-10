$.fn.extend({
	ncDragList : function(option){
		var proto = this.constructor.prototype;
		var ncDragList = new __ncDragList(option);
		
		ncDragList.$view = this;
		ncDragList.create();
		
		if(!proto.innerMap){
			proto.innerMap = {};
		}
		proto.innerMap[this.selector] = {
		    view: ncDragList
		}
		this.constructor.prototype.getNcDragList = function(){
			var selector = this.attr("innerId");
			return this.constructor.prototype.innerMap[selector].view;
		};
		if(option && option.complete){
			option.complete.call(this);
		}
		
		this.attr("innerId", this.selector);

		return ncDragList;
	}
});

function __ncDragList(option){
	this.option = option?option:{};
	
	myself = this;

	this.create = function(){

		this.$head = this.$view.children(".ncDragListHead");
		this.$body = this.$view.children(".ncDragListBody");
		
		if(this.$body.length == 0){
			this.$body = $("<div class='ncDragListBody'></div>");
		    this.$view.append(this.$body);
		}
		
		if(myself.option.width){
			this.$view.width(myself.option.width);
		}
		
		if(myself.option.height){
			var height = myself.option.height;
			if(this.$head.length > 0){
				height -= this.$head.outerHeight();
			}
			this.$body.height(height);
		}

		this.bindMouseDown = function(e, $this){
			myself.startDrag = true;
			
			$this.after($this.clone().addClass("fixPos"));
			$this.addClass("startDrag");
			
			myself.$dragItem = $this;
			myself.itemStartPosY = $this.position().top;

            myself.startPosY = e.pageY;
		}

        this.bindMouseMove = function(e){
			if(!myself.startDrag || myself.$dragItem.length == 0) return;
            
			var scrollTop = myself.$body.scrollTop();
			
            var $dragItem = myself.$dragItem;
			var top = myself.itemStartPosY + (e.pageY - myself.startPosY) + scrollTop;
			
			$dragItem.css({top: top});

			var $items = myself.$body.children(".ncDragListItem");

			for(var i=0;i<$items.length;i++){
			    var $item = $($items[i]);
				var itemTop = $item.position().top + $item.outerHeight() + scrollTop;
				if(itemTop > top && itemTop < top + $dragItem.outerHeight()){
				    myself.$body.scrollTop(scrollTop);
					myself.$insertAfterItem = $item;
					myself.$insertBeforeItem = null;
					break;
				}else if(itemTop < top){
					myself.$insertAfterItem = $item;
					myself.$insertBeforeItem = null;
				}else if(itemTop > top + $dragItem.outerHeight()){
					myself.$insertAfterItem = null;
					myself.$insertBeforeItem = $item;
					break;
				}
			}

		}

		this.bindMouseUp = function(e){
			if(!myself.startDrag) return;

			myself.$dragItem.removeClass("startDrag");
			myself.$dragItem.removeAttr("style");
			
			if(myself.$insertAfterItem){
				myself.$insertAfterItem.after(myself.$dragItem);
			}else if(myself.$insertBeforeItem){
				myself.$insertBeforeItem.before(myself.$dragItem);
			}

			myself.startDrag = false;
			myself.$dragItem = null;
			myself.$insertAfterItem = null;
			myself.$insertBeforeItem = null;
			myself.$body.children(".ncDragListItem.fixPos").remove();

			if(myself.option.afterDrag){
			    myself.option.afterDrag.call(myself);
			}
		}

		this.bindBtnRemove = function($item){
		    $item.append("<span class='ncDragListItemBtn'><a class='ncDragListItemBtnRemove'><i class='fa fa-close'></i></a></span>");
		    $item.find(".ncDragListItemBtnRemove").mousedown(function(e){
			    var $this = $(this);
			    var id = $this.parent().parent().attr("drag-id");
			    
			    if(id){
			    	myself.deleteItem(id);
			    }else{
			    	$this.parent().parent().remove();
			    }
			    
                e.stopPropagation();
			});
		}

        var $items = this.$body.children(".ncDragListItem");

	    $items.bind("mousedown", function(e){
		    myself.bindMouseDown(e, $(this));
		});

		$items.bind("mousemove", function(e){
		    myself.bindMouseMove(e);
		})

	    $items.bind("mouseup", function(e){
		    myself.bindMouseUp(e);
		})

		$(document).bind("mouseup", function(e){
		    myself.bindMouseUp(e);
		})

		$items.each(function(){
		    myself.bindBtnRemove($(this));
		});
	}

    //插入项
    this.insertItem = function(id, name){
	    var $item = $("<div class='ncDragListItem' drag-id='"+id+"' drag-name='"+name+"'><span class='ncDragListItemTitle'>"+name+"</span></div>");
		this.$body.append($item);

        $item.bind("mousedown", function(e){
		    myself.bindMouseDown(e, $(this));
		});

		$item.bind("mousemove", function(e){
		    myself.bindMouseMove(e);
		})

	    $item.bind("mouseup", function(e){
		    myself.bindMouseUp(e);
		})

		myself.bindBtnRemove($item);
	}
    
    //删除项目
    this.deleteItem = function(id){
    	var $item = this.$body.children(".ncDragListItem[drag-id='"+id+"']");
    	$item.remove();
    	if(this.option.afterDeleteItem){
    		this.option.afterDeleteItem.call(this, this._getItem($item));
    	}
    }
    
    //清除所有项目
    this.clearItem = function(){
    	this.$body.children(".ncDragListItem").remove();
    }

    //获取所有项目
	this.getItems = function(){
	    var $items = this.$body.children(".ncDragListItem");
		var items = [];
		$items.each(function(){
		    var $this = $(this);
			var id = $this.attr("drag-id");
			var name = $this.attr("drag-name");
			items.push(myself._getItem($this));
		})
	    return items;
	}
	
	this._getItem = function($item){
		var id = $item.attr("drag-id");
		var name = $item.attr("drag-name");
		return {id:id, name:name?name:$item.children(".ncDragListItemTitle").text()};
	}
	
}