import axios from 'axios';

// WooCommerce API credentials
const API_BASE_URL = 'https://wordpress.thishanth.online/wp-json/wc/v3/';
const CONSUMER_KEY = 'ck_fc9abd279655dd7faf7086a67c29839c126d4654';
const CONSUMER_SECRET = 'cs_e5ab70e65fa92e51fe22bdd88882aa675d7ad290';

// Function to fetch products
const fetchProducts = async () => {
	try {
		const response = await axios.get( `${ API_BASE_URL }products`, {
			params: {
				consumer_key: CONSUMER_KEY,
				consumer_secret: CONSUMER_SECRET,
			},
		} );

		const mappedProducts = response.data.map( ( product ) => ( {
			id: product.id,
			name: product.name,
			category: product.categories
				.map( ( category ) => category.name )
				.join( ', ' ),
			imageUrl: product.images.length > 0 ? product.images[ 0 ].src : '',
			permalink: product.permalink,
		} ) );

		return mappedProducts;
	} catch ( error ) {
		console.error( 'Error fetching products:', error );
		return [];
	}
};

// Function to fetch categories
const fetchCategories = async () => {
	try {
		const response = await axios.get(
			`${ API_BASE_URL }products/categories`,
			{
				params: {
					consumer_key: CONSUMER_KEY,
					consumer_secret: CONSUMER_SECRET,
				},
			}
		);

		const uniqueCategories = response.data.map(
			( category ) => category.name
		);
		return uniqueCategories;
	} catch ( error ) {
		console.error( 'Error fetching categories:', error );
		return [];
	}
};

// Export functions explicitly
export { fetchProducts, fetchCategories };
