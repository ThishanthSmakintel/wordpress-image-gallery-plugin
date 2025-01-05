jQuery( document ).ready( function ( $ ) {
	// Handle the media uploader for selecting images
	$( 'body' ).on( 'click', '#upload_images_button', function ( e ) {
		e.preventDefault();

		var frame = wp.media( {
			title: 'Select Images',
			button: {
				text: 'Use these images',
			},
			multiple: true,
		} );

		frame.on( 'select', function () {
			var selection = frame.state().get( 'selection' );
			var imageIDs = [];
			var imagePreviewHTML = '';

			selection.each( function ( attachment ) {
				var imageURL = attachment.attributes.url;
				var attachmentID = attachment.id;

				imageIDs.push( attachmentID );
				imagePreviewHTML +=
					'<div class="image-preview-item" data-id="' +
					attachmentID +
					'">';
				imagePreviewHTML +=
					'<img src="' +
					imageURL +
					'" style="max-width: 100px; margin: 5px;">';
				imagePreviewHTML +=
					'<button class="remove-image" type="button" style="background: red; color: white; border: none; padding: 5px; cursor: pointer;">Remove</button>';
				imagePreviewHTML += '</div>';
			} );

			$( '#gallery_images' ).val( imageIDs.join( ',' ) );
			$( '#image-preview-container' ).html( imagePreviewHTML );
		} );

		frame.open();
	} );

	// Handle the image removal
	$( 'body' ).on( 'click', '.remove-image', function () {
		var imageItem = $( this ).closest( '.image-preview-item' );
		var attachmentID = imageItem.data( 'id' );

		// Remove the image preview item
		imageItem.remove();

		// Remove the ID from the hidden input field
		var currentImageIDs = $( '#gallery_images' ).val().split( ',' );
		var newImageIDs = currentImageIDs.filter( function ( id ) {
			return id != attachmentID;
		} );

		$( '#gallery_images' ).val( newImageIDs.join( ',' ) );
	} );

	// Handle the form submission for uploading images
	$( 'body' ).on( 'submit', '#upload_images_form', function ( e ) {
		e.preventDefault();

		// Check if a category is selected
		var categorySlug = $( 'select[name="gallery_category"]' ).val();
		if ( ! categorySlug ) {
			alert( 'Please select a category for the images.' );
			return; // Prevent form submission if no category is selected
		}

		var formData = new FormData( this );
		formData.append( 'action', 'imagegallery_upload_images' );
		formData.append( 'nonce', imagegalleryAjax.nonce );
		formData.append( 'category_slug', categorySlug ); // Use the selected category

		$.ajax( {
			url: imagegalleryAjax.ajax_url,
			method: 'POST',
			data: formData,
			contentType: false,
			processData: false,
			success: function ( response ) {
				if ( response.success ) {
					alert( response.data.message );
					// Optionally, reload the page or do additional actions
				} else {
					alert( response.data.message );
				}
			},
			error: function () {
				alert( 'An error occurred while uploading the images.' );
			},
		} );
	} );

	// Handle the category filter change event
	$( 'body' ).on( 'change', '#gallery_category_filter', function () {
		var categorySlug = $( this ).val();
		console.log( categorySlug );

		if ( categorySlug ) {
			$.ajax( {
				url: imagegalleryAjax.ajax_url,
				method: 'GET',
				data: {
					action: 'filter_images_by_category',
					category_slug: categorySlug,
					nonce: imagegalleryAjax.nonce,
				},
				success: function ( response ) {
					if ( response.success ) {
						var images = response.data.images;
						var tableContent = '';

						if ( images.length > 0 ) {
							// Loop through the images and build the table rows
							images.forEach( function ( image ) {
								tableContent += '<tr>';
								tableContent +=
									'<td><img src="' +
									image.image_url +
									'" style="max-width: 150px; margin: 5px;"></td>';
								tableContent +=
									'<td>' + image.categories + '</td>';
								tableContent += '</tr>';
							} );
							$( '#wp-list-table tbody' ).html( tableContent ); // Inject rows into the table body
						} else {
							$( '#wp-list-table tbody' ).html(
								'<tr><td colspan="2">No images found for this category.</td></tr>'
							);
						}
					} else {
						$( '#wp-list-table tbody' ).html(
							'<tr><td colspan="2">No images found for this category.</td></tr>'
						);
					}
				},
				error: function () {
					$( '#wp-list-table tbody' ).html(
						'<tr><td colspan="2">An error occurred while loading images.</td></tr>'
					);
				},
			} );
		} else {
			$( '#wp-list-table tbody' ).html( '' ); // Clear the table body when no category is selected
		}
	} );
} );
