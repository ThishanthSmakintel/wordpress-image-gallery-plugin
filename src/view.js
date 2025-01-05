import { store, getContext } from '@wordpress/interactivity';

// Define the store and actions for product filter
store( 'productfilter', {
	state: {
		selectedCategories: [], // Initialize selectedCategories in the state
		products: [], // Initialize products in the state
	},
	actions: {
		// Toggle category on click
		toggleCategory: function ( event ) {
			const category = event.target.dataset.category; // Get the category directly from the data-category attribute
			const context = getContext(); // Get the current context (state)

			if ( ! context ) {
				console.error( 'Context is undefined' );
				return;
			}

			// Ensure selectedCategories is initialized as an empty array if it doesn't exist
			context.selectedCategories = context.selectedCategories || [];
			context.products = context.products || [];

			// Check if category is selected, add or remove it from selectedCategories
			const index = context.selectedCategories.indexOf( category );
			if ( index === -1 ) {
				context.selectedCategories.push( category ); // Add category
			} else {
				context.selectedCategories.splice( index, 1 ); // Remove category
			}

			console.log(
				'Updated Selected Categories:',
				context.selectedCategories
			);

			// After updating the selected categories, render the filtered products
			renderFilteredProducts(
				context.products,
				context.selectedCategories
			); // Call the standalone function
		},
	},
} );

// Standalone function to render filtered products
function renderFilteredProducts( products, selectedCategories ) {
	const productListContainer = document.querySelector( '.product-list' ); // Select the first matching element

	if ( ! productListContainer ) {
		console.error( 'Product list container not found' );
		return; // Exit if no container is found
	}

	productListContainer.innerHTML = ''; // Clear previous list

	// Filter products by selected categories
	const filteredProducts = products.filter(
		( product ) =>
			selectedCategories.length === 0 ||
			selectedCategories.includes( product.category )
	);

	// Render each filtered product with the modern styles
	filteredProducts.forEach( ( product ) => {
		console.log( product ); // Log the product for debugging

		// Create the product item element
		const productElement = document.createElement( 'div' );
		productElement.classList.add( 'product-item' ); // Apply the 'product-item' class

		// Set the HTML content of the product item
		productElement.innerHTML = `
            <div class="product-card"> <!-- Apply the 'product-card' class -->
                <img src="${ product.imageUrl }" alt="${ product.name }" class="product-image" /> <!-- Apply the 'product-image' class -->
                <h3 class="product-name"><a href="${ product.permalink }">${ product.name }</a></h3> <!-- Apply the 'product-name' class -->
                <p class="product-category">Category: ${ product.category }</p> <!-- Apply the 'product-category' class -->
                <a href="${ product.permalink }" class="view-details-button">View Details</a> <!-- Apply the 'view-details-button' class -->
            </div>
        `;

		// Append the product item to the product list container
		productListContainer.appendChild( productElement );
	} );
}
