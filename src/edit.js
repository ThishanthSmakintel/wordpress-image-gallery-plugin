import { useState, useEffect } from "@wordpress/element";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  RangeControl,
  ColorPalette,
  Button,
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
    imagesPerRow,
    cardSize,
    cardBgColor,
    borderWidth,
    borderRadius,
    cardMargin,
    autoAdjustSize,
    borderEnabled,
    imageHeight,
  } = attributes;

  // Default card size if none is selected
  const defaultCardSize = { width: "auto", height: imageHeight || "200px" };
  const validCardSize = cardSize || defaultCardSize;

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
        setError("Error fetching categories");
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
        setError("Error fetching images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [selectedCategory]); // Trigger on category change

  // Block Props for styling and attributes
  const blockProps = useBlockProps();

  // Calculate the image width dynamically based on the number of images per row
  const calculateImageWidth = () => {
    return `calc(${100 / imagesPerRow}% - 10px)`; // Adjust width per row
  };

  // Handle resizing of cards based on window size
  const handleResize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      setAttributes({
        cardSize: { width: "100%", height: `${imageHeight || 200}px` },
        imagesPerRow: 1,
      });
    } else if (screenWidth < 900) {
      setAttributes({
        cardSize: { width: "auto", height: `${imageHeight || 250}px` },
        imagesPerRow: 2,
      });
    } else {
      setAttributes({
        cardSize: { width: "auto", height: `${imageHeight || 300}px` },
        imagesPerRow: 3,
      });
    }
  };

  // Reset card size to default values
  const resetCardSize = () => {
    setAttributes({
      cardSize: { width: "auto", height: `${imageHeight || 200}px` },
      imagesPerRow: 3,
    });
  };

  // Toggle the auto-adjust feature for card size
  const toggleAutoAdjustSize = () => {
    setAttributes({ autoAdjustSize: !autoAdjustSize });
  };

  // Toggle border settings
  const toggleBorderEnabled = () => {
    setAttributes({ borderEnabled: !borderEnabled });
  };

  // Handle changes to image height via range slider
  const handleHeightChange = (value) => {
    setAttributes({
      imageHeight: `${value}px`,
      cardSize: {
        ...cardSize,
        height: `${value}px`,
      },
    });
  };

  // Set card height to auto to allow for dynamic adjustment
  const setCardHeightToAuto = () => {
    setAttributes({
      imageHeight: "auto",
      cardSize: { width: "auto", height: "auto" },
    });
  };

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

          {/* Images per row control */}
          <SelectControl
            label="Images Per Row"
            value={imagesPerRow}
            options={[
              { label: "1 Image Per Row", value: 1 },
              { label: "2 Images Per Row", value: 2 },
              { label: "3 Images Per Row", value: 3 },
              { label: "4 Images Per Row", value: 4 },
            ]}
            onChange={(newImagesPerRow) => setAttributes({ imagesPerRow: Number(newImagesPerRow) })}
          />

          {/* Toggle for auto-adjusting card size */}
          <ToggleControl
            label="Auto Adjust Card Size"
            checked={autoAdjustSize}
            onChange={toggleAutoAdjustSize}
          />

          {/* Fixed height range control */}
          {!autoAdjustSize && (
            <RangeControl
              label="Card Height"
              value={parseInt(validCardSize.height, 10)}
              onChange={handleHeightChange}
              min={100}
              max={1500}
            />
          )}

          {/* Card background color palette */}
          <ColorPalette
            label="Card Background Color"
            value={cardBgColor}
            onChange={(newColor) => setAttributes({ cardBgColor: newColor })}
          />

          {/* Border width and radius controls */}
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

          {/* Card margin control */}
          <RangeControl
            label="Card Margin"
            value={parseInt(cardMargin, 10)}
            onChange={(value) => setAttributes({ cardMargin: `${value}px` })}
            min={0}
            max={50}
          />

          {/* Border enabled toggle */}
          <ToggleControl
            label="Enable Border"
            checked={borderEnabled}
            onChange={toggleBorderEnabled}
          />

          {/* Buttons for adjusting card size */}
          <Button isPrimary onClick={handleResize}>Set Suitable Card Size</Button>
          <Button isSecondary onClick={resetCardSize}>Reset Card Size</Button>
          <Button isSecondary onClick={setCardHeightToAuto}>Set Card Height to Auto</Button>
        </PanelBody>
      </InspectorControls>

      {/* Loading and error handling */}
      {loading ? (
        <div>
          <Skeleton height={20} width={200} style={{ marginBottom: "10px" }} />
          <div className="image-gallery" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="image-item" style={{ width: "calc(33% - 10px)", boxSizing: "border-box" }}>
                <Skeleton height={validCardSize.height} width="100%" />
                <Skeleton width={60} height={15} style={{ marginTop: "10px", marginLeft: "auto", marginRight: "auto" }} />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <p>{images.length > 0 ? `${images.length} images found` : "No images found"}</p>
          <div className="image-gallery" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {images.length > 0 ? (
              images.map((image, index) => (
                <div
                  key={index}
                  className="image-item"
                  style={{
                    margin: cardMargin,
                    padding: 0,
                    width: calculateImageWidth(),
                    boxSizing: "border-box",
                    borderRadius: borderRadius,
                    backgroundColor: cardBgColor,
                    border: borderEnabled ? `${borderWidth} solid #ccc` : "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "stretch",
                    height: validCardSize.height,
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

export default ImageGalleryBlock;
