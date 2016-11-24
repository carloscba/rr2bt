var $this = {
	lng : "es",
	labels : {
	    "es" : {
	    	"t01" : "Hola <%=first_name%>",
	    	"t02" : "Hola <%=first_name%>"
	    },
	    "en" : {
	    }
	},

	change : function(){
		if($this.lng == 'es'){
			$this.lng = 'en'
		}else{
			$this.lng = 'es'
		}
	},
	
	set : function(locale){
	    var lng = locale.split('_');
	    $this.lng = lng[0];
	    $this.lng = 'es';
	    return $this.lng;		
		
	},

	get : function(label, obj){
	    
		console.log('label: ' + label);

	    var str = $this.labels[$this.lng][label];
	    
	    for(var key in obj){
	        var search = '<%='+key+'%>';
	        str = str.replace(search, obj[key]);
	    }

	    return str;
	}

}

module.exports = $this;