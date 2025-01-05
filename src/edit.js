import { useState, useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	CheckboxControl,
	Button,
	RangeControl,
	ColorPicker,
	FontSizePicker,
	SelectControl,
} from '@wordpress/components';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton styles

// WooCommerce API credentials
const API_BASE_URL = 'https://wordpress.thishanth.online/wp-json/wc/v3/';
const CONSUMER_KEY = 'ck_fc9abd279655dd7faf7086a67c29839c126d4654';
const CONSUMER_SECRET = 'cs_e5ab70e65fa92e51fe22bdd88882aa675d7ad290';

export default function Edit( props ) {
	const { attributes, setAttributes } = props;
	const {
		viewDetailsText = 'View Details',
		selectedCategories = [],
		cardsPerRow = 3,
		cardHeight = '100%',
		imageHeight = '200px',
		cardBgColor = '#ffffff',
		textColor = '#000000',
		fontSize = '16px',
		buttonColor = '#0073aa',
		buttonHoverColor = '#005177',
		cardMargin = '20px',
		cardPadding = '20px',
		borderWidth = '1px',
		borderRadius = '8px',
		cardWidth = '100%', // Added to control the width of the card
		cardStyle = 'rectangular', // Added option to select card style (square or rectangular)
	} = attributes;

	const resetAllSettings = () => {
		setAttributes( {
			viewDetailsText: 'View Details',
			selectedCategories: [],
			cardsPerRow: 3,
			cardHeight: '100%',
			imageHeight: '200px',
			cardBgColor: '#ffffff',
			textColor: '#000000',
			fontSize: '16px',
			buttonColor: '#0073aa',
			buttonHoverColor: '#005177',
			cardMargin: '20px',
			cardPadding: '20px',
			borderWidth: '1px',
			borderRadius: '8px',
			cardWidth: '100%',
			cardStyle: 'rectangular',
		} );
	};

	const blockProps = useBlockProps();

	const [ showCategoryFilter, setShowCategoryFilter ] = useState( true );
	const [ productCategories, setProductCategories ] = useState( [] );
	const [ products, setProducts ] = useState( [] );
	const [ loading, setLoading ] = useState( true ); // Track loading state
	const [ imageLoading, setImageLoading ] = useState( false ); // Track image loading state

	// Fetch products from WooCommerce
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
				imageUrl:
					product.images.length > 0 ? product.images[ 0 ].src : '',
				permalink: product.permalink,
				rating: product.average_rating, // Fetch product rating
			} ) );
			setProducts( mappedProducts );
			setAttributes( { products: mappedProducts } );
		} catch ( error ) {
			console.error( 'Error fetching products:', error );
		} finally {
			setLoading( false ); // Set loading to false when data is fetched
		}
	};

	// Fetch categories from WooCommerce
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
			setProductCategories( uniqueCategories );
		} catch ( error ) {
			console.error( 'Error fetching categories:', error );
		}
	};

	// Fetch data on component mount
	useEffect( () => {
		fetchProducts();
		fetchCategories();
	}, [] );

	const handleCategoryVisibilityChange = ( category ) => {
		setAttributes( {
			selectedCategories: selectedCategories.includes( category )
				? selectedCategories.filter( ( c ) => c !== category )
				: [ ...selectedCategories, category ],
		} );
	};

	const resetCategoriesVisibility = () => {
		setAttributes( { selectedCategories: productCategories } );
	};

	useEffect( () => {
		setAttributes( { viewDetailsText } );
	}, [ viewDetailsText ] );

	const handleImageLoad = () => {
		setImageLoading( false );
	};

	const renderRating = ( rating ) => {
		const fullStars = Math.floor( rating );
		const halfStar = rating % 1 !== 0;
		const emptyStars = 5 - fullStars - ( halfStar ? 1 : 0 );

		return (
			<div
				className="product-rating"
				style={ { display: 'flex', alignItems: 'center' } }
			>
				{ [ ...Array( fullStars ) ].map( ( _, index ) => (
					<span
						key={ `full-${ index }` }
						style={ { color: '#FFD700' } }
					>
						★
					</span>
				) ) }
				{ halfStar && <span style={ { color: '#FFD700' } }>★</span> }
				{ [ ...Array( emptyStars ) ].map( ( _, index ) => (
					<span
						key={ `empty-${ index }` }
						style={ { color: '#ddd' } }
					>
						★
					</span>
				) ) }
			</div>
		);
	};

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title="Filter Settings">
					<CheckboxControl
						label="Show Category Filter"
						checked={ showCategoryFilter }
						onChange={ () =>
							setShowCategoryFilter( ! showCategoryFilter )
						}
					/>
					{ showCategoryFilter && (
						<div
							className="category-filter"
							style={ { marginBottom: '20px' } }
						>
							<h3
								style={ {
									fontSize: '18px',
									fontWeight: '600',
									marginBottom: '10px',
								} }
							>
								Categories
							</h3>
							<div
								className="category-filter-checkboxes"
								style={ { display: 'block' } }
							>
								{ productCategories.map( ( category ) => (
									<div
										key={ category }
										className="filter-checkbox-item"
										style={ {
											marginBottom: '10px',
											display: 'block',
										} }
									>
										<input
											type="checkbox"
											checked={ selectedCategories.includes(
												category
											) }
											onChange={ () =>
												handleCategoryVisibilityChange(
													category
												)
											}
											style={ {
												marginRight: '10px',
												cursor: 'pointer',
											} }
										/>
										<label
											style={ {
												fontSize: '16px',
												cursor: 'pointer',
											} }
										>
											{ category }
										</label>
									</div>
								) ) }
							</div>
							<Button
								onClick={ resetCategoriesVisibility }
								style={ {
									backgroundColor: '#f1f1f1',
									border: '1px solid #ccc',
									padding: '5px 10px',
									fontSize: '14px',
									cursor: 'pointer',
								} }
							>
								Reset Categories
							</Button>
						</div>
					) }
				</PanelBody>
				<PanelBody title="Button Text Settings">
					<TextControl
						label="View Details Button Text"
						value={ viewDetailsText }
						onChange={ ( text ) =>
							setAttributes( { viewDetailsText: text } )
						}
					/>
				</PanelBody>
				<PanelBody title="Layout Settings">
					<RangeControl
						label="Cards per Row"
						value={ cardsPerRow }
						onChange={ ( value ) =>
							setAttributes( { cardsPerRow: value } )
						}
						min={ 1 }
						max={ 6 }
					/>
				</PanelBody>
				<PanelBody title="Reset Settings">
					<Button
						isSecondary
						onClick={ resetAllSettings }
						style={ {
							backgroundColor: '#f1f1f1',
							border: '1px solid #ccc',
							padding: '5px 10px',
							fontSize: '14px',
							cursor: 'pointer',
							marginTop: '10px',
						} }
					>
						Reset All Settings
					</Button>
				</PanelBody>

				{ /* Card Styling Settings */ }
				<PanelBody title="Card Styling Settings">
					<RangeControl
						label="Card Height (px)"
						value={ parseInt( cardHeight ) }
						onChange={ ( value ) =>
							setAttributes( { cardHeight: `${ value }px` } )
						}
						min={ 150 }
						max={ 1000 }
					/>
					<RangeControl
						label="Image Height (px)"
						value={ parseInt( imageHeight ) }
						onChange={ ( value ) =>
							setAttributes( { imageHeight: `${ value }px` } )
						}
						min={ 100 }
						max={ 1000 }
					/>
					<RangeControl
						label="Card Margin (px)"
						value={ parseInt( cardMargin ) }
						onChange={ ( value ) =>
							setAttributes( { cardMargin: `${ value }px` } )
						}
						min={ 0 }
						max={ 50 }
					/>
					<RangeControl
						label="Card Padding (px)"
						value={ parseInt( cardPadding ) }
						onChange={ ( value ) =>
							setAttributes( { cardPadding: `${ value }px` } )
						}
						min={ 0 }
						max={ 50 }
					/>
					<ColorPicker
						color={ cardBgColor }
						onChangeComplete={ ( color ) =>
							setAttributes( { cardBgColor: color.hex } )
						}
						disableAlpha
						label="Card Background Color"
					/>
					<ColorPicker
						color={ textColor }
						onChangeComplete={ ( color ) =>
							setAttributes( { textColor: color.hex } )
						}
						disableAlpha
						label="Text Color"
					/>
					<FontSizePicker
						label="Font Size"
						value={ fontSize }
						onChange={ ( value ) =>
							setAttributes( { fontSize: value } )
						}
					/>
					<ColorPicker
						color={ buttonColor }
						onChangeComplete={ ( color ) =>
							setAttributes( { buttonColor: color.hex } )
						}
						disableAlpha
						label="Button Color"
					/>
					<ColorPicker
						color={ buttonHoverColor }
						onChangeComplete={ ( color ) =>
							setAttributes( { buttonHoverColor: color.hex } )
						}
						disableAlpha
						label="Button Hover Color"
					/>
					<RangeControl
						label="Border Width (px)"
						value={ parseInt( borderWidth ) }
						onChange={ ( value ) =>
							setAttributes( { borderWidth: `${ value }px` } )
						}
						min={ 0 }
						max={ 20 }
					/>
					<RangeControl
						label="Border Radius (px)"
						value={ parseInt( borderRadius ) }
						onChange={ ( value ) =>
							setAttributes( { borderRadius: `${ value }px` } )
						}
						min={ 0 }
						max={ 50 }
					/>
				</PanelBody>

				{ /* Card Style Selection */ }
				<PanelBody title="Card Style Settings">
					<SelectControl
						label="Select Card Style"
						value={ cardStyle }
						options={ [
							{ label: 'Rectangular', value: 'rectangular' },
							{ label: 'Square', value: 'square' },
						] }
						onChange={ ( value ) =>
							setAttributes( { cardStyle: value } )
						}
					/>
					<RangeControl
						label="Card Width (%)"
						value={ parseInt( cardWidth ) }
						onChange={ ( value ) =>
							setAttributes( { cardWidth: `${ value }px` } )
						}
						min={ 5 }
						max={ 1000 }
					/>
				</PanelBody>
			</InspectorControls>

			<div
				className="product-filter-frontend"
				style={ {
					padding: '20px',
					backgroundColor: '#f9f9f9',
					borderRadius: '8px',
				} }
			>
				<div
					className="filter-container"
					style={ { marginBottom: '20px' } }
				>
					<Button
						isSecondary
						onClick={ () =>
							setShowCategoryFilter( ! showCategoryFilter )
						}
						style={ {
							padding: '10px 20px',
							fontSize: '16px',
							backgroundColor: '#0073aa',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						} }
					>
						Toggle Category Filter
					</Button>
					{ showCategoryFilter && (
						<div
							className="category-filter-checkboxes"
							style={ {
								display: 'flex',
								marginTop: '10px',
								flexWrap: 'wrap',
							} }
						>
							{ productCategories.map( ( category ) => (
								<div
									key={ category }
									className="filter-checkbox-item"
									style={ {
										marginRight: '20px',
										display: 'flex',
										alignItems: 'center',
									} }
								>
									<input
										type="checkbox"
										checked={ selectedCategories.includes(
											category
										) }
										onChange={ () =>
											handleCategoryVisibilityChange(
												category
											)
										}
										style={ {
											marginRight: '10px',
											cursor: 'pointer',
										} }
									/>
									<label
										style={ {
											fontSize: '16px',
											cursor: 'pointer',
										} }
									>
										{ category }
									</label>
								</div>
							) ) }
						</div>
					) }
				</div>

				{ /* Updated grid layout */ }
				<div
					className="product-list"
					style={ {
						display: 'grid',
						gridTemplateColumns: `repeat(${ cardsPerRow }, 1fr)`, // Explicitly set columns based on cardsPerRow
						gap: '20px',
						overflow: 'hidden', // Prevent overflow
					} }
				>
					{ loading ? (
						// Skeleton loader for product cards while loading data
						[ ...Array( cardsPerRow ) ].map( ( _, index ) => (
							<div
								key={ index }
								className="product-item"
								style={ {
									backgroundColor: cardBgColor,
									border: `${ borderWidth } solid #ddd`,
									borderRadius: `${ borderRadius }px`,
									padding: cardPadding,
									margin: cardMargin,
									boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									height: cardHeight,
									boxSizing: 'border-box', // Ensure padding and border are included in height
									overflow: 'hidden', // Prevent overflow
									width:
										cardStyle === 'square'
											? '100%'
											: cardWidth, // Adjust width based on selected card style
								} }
							>
								<Skeleton
									height={ parseInt( imageHeight ) }
									width="100%"
								/>
								<Skeleton width="80%" />
								<Skeleton width="60%" />
							</div>
						) )
					) : products.length > 0 ? (
						products.map( ( product ) => {
							const productCategoriesList = product.category
								.split( ',' )
								.map( ( cat ) => cat.trim() );
							const isVisible = productCategoriesList.some(
								( cat ) => selectedCategories.includes( cat )
							);
							if ( isVisible ) {
								return (
									<div
										className="product-item"
										key={ product.id }
										style={ {
											backgroundColor: cardBgColor,
											border: `${ borderWidth } solid #ddd`,
											borderRadius: `${ borderRadius }px`,
											padding: cardPadding,
											margin: cardMargin,
											boxShadow:
												'0 4px 8px rgba(0,0,0,0.1)',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'space-between',
											height: cardHeight,
											boxSizing: 'border-box', // Ensure padding and border are included in height
											overflow: 'hidden', // Prevent overflow
											width:
												cardStyle === 'square'
													? '100%'
													: cardWidth, // Adjust width based on selected card style
										} }
									>
										{ imageLoading && (
											<Skeleton
												height={ parseInt(
													imageHeight
												) }
												width="100%"
											/>
										) }
										<img
											src={ product.imageUrl }
											alt={ product.name }
											onLoad={ handleImageLoad }
											loading="lazy"
											style={ {
												width: '100%',
												height: imageHeight,
												objectFit: 'cover',
												borderRadius: '8px',
												display: imageLoading
													? 'none'
													: 'block',
											} }
										/>
										<h3
											style={ {
												fontSize: fontSize,
												fontWeight: '600',
												marginTop: '15px',
												color: textColor,
											} }
										>
											{ product.name }
										</h3>
										<p
											style={ {
												fontSize: '14px',
												color: '#555',
											} }
										>
											Category:{ ' ' }
											{ product.category ||
												'No category' }
										</p>
										{ renderRating( product.rating ) }{ ' ' }
										{ /* Render Rating */ }
										<a
											href={ product.permalink }
											style={ {
												display: 'inline-block',
												marginTop: 'auto',
												padding: '10px 20px',
												backgroundColor: buttonColor,
												color: 'white',
												textDecoration: 'none',
												borderRadius: '4px',
												textAlign: 'center',
												transition:
													'background-color 0.3s',
											} }
											onMouseEnter={ ( e ) =>
												( e.target.style.backgroundColor =
													buttonHoverColor )
											}
											onMouseLeave={ ( e ) =>
												( e.target.style.backgroundColor =
													buttonColor )
											}
										>
											{ viewDetailsText }
										</a>
									</div>
								);
							}
							return null;
						} )
					) : (
						<p>No products found matching the selected filters.</p>
					) }
				</div>
			</div>
		</div>
	);
}
