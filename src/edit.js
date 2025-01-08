import { useState, useEffect } from "@wordpress/element";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  RangeControl,
  ColorPalette,
  ToggleControl,
} from "@wordpress/components";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// API URLs for fetching images and categories
const IMAGE_GALLERY_API_URL = "http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/filter-images";
const CATEGORY_API_URL = "http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/categories";

// Main Component for the Image Gallery Block
const ImageGalleryBlock = (props) => {
  const { attributes, setAttributes } = props;
  const {
    selectedCategory,
    imagesPerRowDesktop,
    imagesPerRowMobile,
    cardSizeDesktop,
    cardSizeMobile,
    cardBgColor,
    borderWidth,
    borderRadius,
    cardMargin,
    borderEnabled,
    isResponsive,
  } = attributes;

  // State hooks for managing data and loading state
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Basic Authentication credentials for API requests
  const username = "thishanth";
  const password = "hht0768340599"; // Replace with actual password/token for production
  const authHeader = "Basic " + btoa(`${username}:${password}`);

  // Fetch categories when the component mounts
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
        setError("Error fetching categories. Please try again later.");
      }
    };
    fetchCategories();
  }, []); // Run once on mount

  // Fetch images based on selected category
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        let url = IMAGE_GALLERY_API_URL;
        // Apply category filter if selected
        if (selectedCategory && selectedCategory.length > 0) {
          url = `${IMAGE_GALLERY_API_URL}?category_slug=${selectedCategory}`;
        }
        const response = await axios.get(url, {
          headers: {
            Authorization: authHeader,
          },
        });
        setImages(response.data);
      } catch (err) {
        setError("Error fetching images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedCategory]); // Trigger on category change

  // Block Props for styling and attributes
  const blockProps = useBlockProps();

  // Calculate the image width dynamically based on the number of images per row
  const calculateImageWidth = (isMobileView) => {
    return `calc(${100 / (isMobileView ? imagesPerRowMobile : imagesPerRowDesktop)}% - 10px)`; // Adjust width per row based on view
  };

  // Handle resizing of cards based on window size
  const handleResize = () => {
    if (isResponsive) {
      const screenWidth = window.innerWidth;
      // Apply mobile settings for smaller screens
      if (screenWidth < 600) {
        setAttributes({
          imagesPerRowDesktop: imagesPerRowDesktop,  // Keep desktop setting as is
          imagesPerRowMobile: imagesPerRowMobile, // Set mobile number of columns
        });
      }
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isResponsive]);

  // Ensure cardSizeDesktop and cardSizeMobile are not undefined
  const cardHeightDesktop = cardSizeDesktop?.height || '300px';
  const cardHeightMobile = cardSizeMobile?.height || '200px';

  // Return the rendered component
  return (
    <div {...blockProps}>
      {/* Block Inspector Controls */}
      <InspectorControls>
        <PanelBody title="Gallery Settings" initialOpen={true}>
          {/* Category Select Dropdown */}
          <SelectControl
            label="Select Category"
            value={selectedCategory}
            options={[{ label: "All Categories", value: "" }, ...categories.map((cat) => ({
              label: cat.name,
              value: cat.slug,
            }))]}
            onChange={(newCategory) => setAttributes({ selectedCategory: newCategory })}
          />

          {/* Images per row control for Desktop */}
          <RangeControl
            label="Images Per Row (Desktop)"
            value={imagesPerRowDesktop}
            onChange={(newImagesPerRowDesktop) => setAttributes({ imagesPerRowDesktop: Number(newImagesPerRowDesktop) })}
            min={1}
            max={12}
          />

          {/* Images per row control for Mobile */}
          <RangeControl
            label="Images Per Row (Mobile)"
            value={imagesPerRowMobile}
            onChange={(newImagesPerRowMobile) => setAttributes({ imagesPerRowMobile: Number(newImagesPerRowMobile) })}
            min={1}
            max={12}
          />

          {/* Card Height for Desktop */}
          <RangeControl
            label="Card Height (Desktop)"
            value={parseInt(cardHeightDesktop, 10)}
            onChange={(newHeight) => setAttributes({ cardSizeDesktop: { ...cardSizeDesktop, height: `${newHeight}px` } })}
            min={100}
            max={1500}
          />

          {/* Card Height for Mobile */}
          <RangeControl
            label="Card Height (Mobile)"
            value={parseInt(cardHeightMobile, 10)}
            onChange={(newHeight) => setAttributes({ cardSizeMobile: { ...cardSizeMobile, height: `${newHeight}px` } })}
            min={100}
            max={1500}
          />

          {/* Background color and border controls */}
          <ColorPalette
            label="Card Background Color"
            value={cardBgColor}
            onChange={(newColor) => setAttributes({ cardBgColor: newColor })}
          />

          {/* Border Width and Radius */}
          <RangeControl
            label="Border Width"
            value={parseInt(borderWidth, 10)}
            onChange={(value) => setAttributes({ borderWidth: `${value}px` })}
            min={1}
            max={10}
            disabled={!borderEnabled}
          />
          <RangeControl
            label="Border Radius"
            value={parseInt(borderRadius, 10)}
            onChange={(value) => setAttributes({ borderRadius: `${value}px` })}
            min={0}
            max={50}
            disabled={!borderEnabled}
          />

          {/* Card Margin */}
          <RangeControl
            label="Card Margin"
            value={parseInt(cardMargin, 10)}
            onChange={(value) => setAttributes({ cardMargin: `${value}px` })}
            min={0}
            max={50}
          />

          {/* Toggle Border Enabled */}
          <ToggleControl
            label="Enable Border"
            checked={borderEnabled}
            onChange={() => setAttributes({ borderEnabled: !borderEnabled })}
          />

          {/* Toggle Responsiveness */}
          <ToggleControl
            label="Enable Responsiveness"
            checked={isResponsive}
            onChange={() => setAttributes({ isResponsive: !isResponsive })}
          />
        </PanelBody>
      </InspectorControls>

      {/* Loading, Error, and Image Display */}
      {loading ? (
        <div>
          <Skeleton height={20} width={200} style={{ marginBottom: "10px" }} />
          <div className="image-gallery" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="image-item" style={{ width: "calc(33% - 10px)", boxSizing: "border-box" }}>
                <Skeleton height={cardHeightDesktop} width="100%" />
                <Skeleton width={60} height={15} style={{ marginTop: "10px", marginLeft: "auto", marginRight: "auto" }} />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div>
          <p>{images.length > 0 ? `${images.length} images found` : "No images found"}</p>
          <div className="image-gallery" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {images.length > 0 ? (
              images.map((image, index) => {
                const isMobileView = window.innerWidth < 600; // Check if mobile view
                return (
                  <div
                    key={index}
                    className="image-item"
                    style={{
                      margin: cardMargin,
                      padding: 0,
                      width: calculateImageWidth(isMobileView),
                      boxSizing: "border-box",
                      borderRadius: borderRadius,
                      backgroundColor: cardBgColor,
                      border: borderEnabled ? `${borderWidth} solid #ccc` : "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                      height: isMobileView ? cardHeightMobile : cardHeightDesktop,
                    }}
                  >
                    <div className="image-container" style={{ width: "100%", height: "100%", position: "relative" }}>
                      <img
                        src={image.image_url}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // Ensures image fills space without distortion
                          borderRadius: borderRadius,
                        }}
                      />
                    </div>
                    <div className="image-title" style={{ marginTop: "10px", textAlign: "center" }}>
                      <h3>{image.title}</h3>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No images found for this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryBlock;
