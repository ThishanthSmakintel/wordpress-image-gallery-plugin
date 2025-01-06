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

// Custom Image Gallery API URL
const API_BASE_URL = '/wp-json/imagegallery/v1/images';

// State and Loading States
const MyImageGalleryBlock = () => {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [category, setCategory] = useState('');
	const [error, setError] = useState(null);

	// Fetch images on mount
	useEffect(() => {
		const fetchImages = async () => {
			try {
				setLoading(true);
				// Construct the API URL with selected category
				const response = await axios.get(`${API_BASE_URL}?category=${category}`);
				setImages(response.data); // Assuming response is the image data
			} catch (err) {
				setError('Error fetching images');
			} finally {
				setLoading(false);
			}
		};

		fetchImages();
	}, [category]); // Re-run when category changes

	// Block Props
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
			{/* Category Select */}
			<SelectControl
				label="Select Category"
				value={category}
				options={[
					{ label: 'All Categories', value: '' },
					// Add your categories here dynamically if needed
					{ label: 'Category 1', value: 'category-1' },
					{ label: 'Category 2', value: 'category-2' },
				]}
				onChange={(newCategory) => setCategory(newCategory)}
			/>

			{/* Display images or loading state */}
			{loading ? (
				<Skeleton count={5} />
			) : error ? (
				<p>{error}</p>
			) : (
				<div className="image-gallery">
					{images.map((image, index) => (
						<div key={index} className="image-item">
							<img src={image.image_url} alt={`Image ${index + 1}`} />
							<p>{image.categories}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyImageGalleryBlock;
