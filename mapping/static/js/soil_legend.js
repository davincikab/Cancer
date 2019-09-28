$(function(){
	let loadForm = function(){
		let btn = $(this);

		$.ajax({
			url: btn.attr("data-url"),
			type:'get',
			dataType:'json',
			beforeSend: function () {
	        	$("#modalSoilLegend").modal("show");
	      	},
	      	success:function(data){
	      		$("#modalSoilLegend .modal-content").html(data.html_form);
	      		// console.log(data.html_form);
	      	}
		});
	}

	let saveForm =  function(){
		let form = $(this);
		$.ajax({
			url:form.attr("action"),
			data:form.serialize(),
			type: form.attr("method"),
			dataType:'json',
			success:function(data){
				if(data.form_is_valid){
					$("#soil_legend").html(data.html_soil_list);
					$("#modalSoilLegend").modal('hide');
				}
				else{
					$("#modalSoilLegend .modal-content").html(data.html_form);
				}
			}

		});

		return false;  //Prevent a browser from completing the HTTP POST request
	}

	// Create new Entry
	$(".js-create-soil").click(loadForm);
	$("#modalSoilLegend").on('submit',".js-soilLegend-create-form", saveForm);

	// Update form
	$(".js-update-soil").click(loadForm);
	$("#modalSoilLegend").on('submit',".js-soilLegend-update-form", saveForm);


	// Delete form
	$(".js-delete-soil").click(loadForm);
	$("#modalSoilLegend").on('submit',".js-soilLegend-delete-form", saveForm);

});