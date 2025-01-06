import { useState, useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	ColorPalette,
	Button,
	ToggleControl,
} from '@wordpress/components';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Custom Image Gallery API URL
const API_BASE_URL = 'http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/filter-images';
const CATEGORY_API_URL = 'http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/categories';

// State and Loading States
const MyImageGalleryBlock = (props) => {
	const { attributes, setAttributes } = props;
	const { selectedCategory, imagesPerRow, cardSize, cardShape, cardBgColor, borderWidth, borderRadius, cardMargin, autoAdjustSize } = attributes;

	// Ensure cardSize has default values
	const defaultCardSize = { width: 'auto', height: '200px' };
	const validCardSize = cardSize || defaultCardSize;

	// State for categories and images
	const [categories, setCategories] = useState([]);
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Basic Authentication credentials
	const username = 'thishanth';
	const password = 'hht0768340599'; // Replace with actual password or token
	const authHeader = 'Basic ' + btoa(`${username}:${password}`);

	// Fetch categories on mount
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get(CATEGORY_API_URL, {
					headers: {
						Authorization: authHeader,
					},
				});
				setCategories(response.data);
			} catch (err) {
				setError('Error fetching categories');
			}
		};
		fetchCategories();
	}, []); // Fetch categories only once on component mount

	// Fetch images when category changes or on block load
	useEffect(() => {
		const fetchImages = async () => {
			try {
				setLoading(true);
				let url = API_BASE_URL;
				// If selectedCategory is not empty, append category filter
				if (selectedCategory && selectedCategory.length > 0) {
					url = `${API_BASE_URL}?category_slug=${selectedCategory}`;
				}
				const response = await axios.get(url, {
					headers: {
						Authorization: authHeader,
					},
				});
				setImages(response.data);
			} catch (err) {
				setError('Error fetching images');
			} finally {
				setLoading(false);
			}
		};
		fetchImages();
	}, [selectedCategory]); // Re-run when selectedCategory changes

	// Block Props
	const blockProps = useBlockProps();

	// Calculate the image width based on the number of images per row
	const calculateImageWidth = () => {
		return `calc(${100 / imagesPerRow}% - 10px)`; // Adjust width dynamically based on images per row
	};

	// Adjust card size based on screen width
	const adjustCardSize = () => {
		const width = window.innerWidth;
		if (width < 600) {
			setAttributes({
				cardSize: { width: '100%', height: cardShape === 'square' ? '100%' : '200px' },
				imagesPerRow: 1,
			});
		} else if (width < 900) {
			setAttributes({
				cardSize: { width: 'auto', height: cardShape === 'square' ? '100%' : '250px' },
				imagesPerRow: 2,
			});
		} else {
			setAttributes({
				cardSize: { width: 'auto', height: cardShape === 'square' ? '100%' : '300px' },
				imagesPerRow: 3,
			});
		}
	};

	// Reset to default values
	const resetCardSize = () => {
		setAttributes({
			cardSize: { width: 'auto', height: cardShape === 'square' ? '100%' : '200px' },
			imagesPerRow: 3,
		});
	};

	// Handle Toggle for Auto Adjust
	const handleAutoAdjustToggle = () => {
		setAttributes({ autoAdjustSize: !autoAdjustSize });
	};

	return (
		<div {...blockProps}>
			{/* Settings Panel for Category Select and Images Per Row */}
			<InspectorControls>
				<PanelBody title="Gallery Settings" initialOpen={true}>
					<SelectControl
						label="Select Category"
						value={selectedCategory}
						options={[{ label: 'All Categories', value: '' }, ...categories.map((cat) => ({ label: cat.name, value: cat.slug }))]}
						onChange={(newCategory) => setAttributes({ selectedCategory: newCategory })}
					/>

					<SelectControl
						label="Images Per Row"
						value={imagesPerRow}
						options={[
							{ label: '1 Image Per Row', value: 1 },
							{ label: '2 Images Per Row', value: 2 },
							{ label: '3 Images Per Row', value: 3 },
							{ label: '4 Images Per Row', value: 4 },
						]}
						onChange={(newImagesPerRow) => setAttributes({ imagesPerRow: Number(newImagesPerRow) })}
					/>

					{/* Card Size Settings */}
					<ToggleControl
						label="Auto Adjust Card Size"
						checked={autoAdjustSize}
						onChange={handleAutoAdjustToggle}
					/>

					{/* If Auto Adjust is disabled, show the range for fixed height */}
					{!autoAdjustSize && (
						<RangeControl
							label="Card Height"
							value={parseInt(validCardSize.height)}
							onChange={(value) => setAttributes({ cardSize: { ...validCardSize, height: `${value}px` } })}
							min={100}
							max={1500}
						/>
					)}

					<SelectControl
						label="Card Shape"
						value={cardShape}
						options={[
							{ label: 'Rectangle', value: 'rectangle' },
							{ label: 'Square', value: 'square' },
						]}
						onChange={(newShape) => setAttributes({ cardShape: newShape })}
					/>

					<ColorPalette
						label="Card Background Color"
						value={cardBgColor}
						onChange={(newColor) => setAttributes({ cardBgColor: newColor })}
					/>

					<RangeControl
						label="Border Width"
						value={parseInt(borderWidth)}
						onChange={(value) => setAttributes({ borderWidth: `${value}px` })}
						min={1}
						max={10}
					/>

					<RangeControl
						label="Border Radius"
						value={parseInt(borderRadius)}
						onChange={(value) => setAttributes({ borderRadius: `${value}px` })}
						min={0}
						max={50}
					/>

					<RangeControl
						label="Card Margin"
						value={parseInt(cardMargin)}
						onChange={(value) => setAttributes({ cardMargin: `${value}px` })}
						min={0}
						max={50}
					/>

					<Button isPrimary onClick={adjustCardSize}>Set Suitable Card Size</Button>
					<Button isSecondary onClick={resetCardSize}>Reset Card Size</Button>
				</PanelBody>
			</InspectorControls>

			{/* Display image count and gallery */}
			{loading ? (
				<div>
					<Skeleton height={20} width={200} style={{ marginBottom: '10px' }} />

					{/* Skeleton for Image Gallery */}
					<div
						className="image-gallery"
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'space-between',
							gap: '10px',
						}}
					>
						{/* Skeleton for each image item */}
						{[...Array(6)].map((_, index) => (
							<div
								key={index}
								className="image-item"
								style={{
									width: 'calc(33% - 10px)', // Three images per row with gap
									boxSizing: 'border-box',
								}}
							>
								<Skeleton height={validCardSize.height} width="100%" />
								<Skeleton width={60} height={15} style={{ marginTop: '10px', marginLeft: 'auto', marginRight: 'auto' }} />
							</div>
						))}
					</div>
				</div>
			) : error ? (
				<p>{error}</p>
			) : (
				<div>
					<p>{images.length > 0 ? `${images.length} images found` : 'No images found'}</p>

					{/* Image Gallery with Flexbox */}
					<div
						className="image-gallery"
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'space-between',
							gap: '10px',
						}}
					>
						{images.length > 0 ? (
							images.map((image, index) => (
								<div
									key={index}
									className="image-item"
									style={{
										width: calculateImageWidth(),
										boxSizing: 'border-box',
										borderRadius: borderRadius,
										margin: cardMargin,
										backgroundColor: cardBgColor,
										border: `${borderWidth} solid #ccc`,
										borderRadius: cardShape === 'square' ? '0' : borderRadius,
									}}
								>
									<img
										src={image.image_url}
										alt={`Image ${index + 1}`}
										style={{
											width: '100%',
											height: autoAdjustSize ? 'auto' : validCardSize.height,
											borderRadius: cardShape === 'square' ? '0' : borderRadius,
										}}
									/>
								</div>
							))
						) : (
							<p>No images found for this category.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default MyImageGalleryBlock;
