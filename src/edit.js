import { useState, useEffect } from "@wordpress/element";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  RangeControl,
  ColorPalette,
  ToggleControl,
  TextControl,
} from "@wordpress/components";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSelect } from "@wordpress/data";

// API URLs for fetching images and categories
const IMAGE_GALLERY_API_URL =
  "http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/filter-images";
const CATEGORY_API_URL =
  "http://localhost/wordpress.thishanth/wp-json/imagegallery/v1/categories";

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

  const { deviceType } = useSelect((select) => {
    const { __experimentalGetPreviewDeviceType } = select("core/edit-post");
    return {
      deviceType: __experimentalGetPreviewDeviceType(),
    };
  }, []);

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
    return `calc(${
      100 / (isMobileView ? imagesPerRowMobile : imagesPerRowDesktop)
    }% - 10px)`; // Adjust width per row based on view
  };

  // Handle resizing of cards based on window size
  const handleResize = () => {
    if (isResponsive) {
      const screenWidth = window.innerWidth;
      // Apply mobile settings for smaller screens
      if (screenWidth < 600) {
        setAttributes({
          imagesPerRowDesktop: imagesPerRowDesktop, // Keep desktop setting as is
          imagesPerRowMobile: 1, // Set mobile number of columns to 1 (as per your requirement)
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
  const cardHeightDesktop = cardSizeDesktop?.height || "300px";
  const cardHeightMobile = cardSizeMobile?.height || "200px";

  // Return the rendered component
  return (
    <div {...blockProps}>
      {/* Block Inspector Controls */}
      <InspectorControls>
        <PanelBody title="Gallery Settings" initialOpen={true}>
          {/* Device Type Display (for debugging or informative purposes) */}
          <TextControl
            label="Current Device Type"
            value={deviceType || "Loading..."}
            disabled
          />

          {/* Category Select Dropdown */}
          <SelectControl
            label="Select Category"
            value={selectedCategory}
            options={[
              { label: "All Categories", value: "" },
              ...categories.map((cat) => ({
                label: cat.name,
                value: cat.slug,
              })),
            ]}
            onChange={(newCategory) =>
              setAttributes({ selectedCategory: newCategory })
            }
          />

          {/* Images per row control for Desktop (visible for mobile/tablet only) */}
          {(deviceType === "Desktop" || deviceType === "Tablet") && (
            <RangeControl
              label="Images Per Row (Desktop/Tablet)"
              value={imagesPerRowDesktop}
              onChange={(newImagesPerRowDesktop) =>
                setAttributes({
                  imagesPerRowDesktop: Number(newImagesPerRowDesktop),
                })
              }
              min={1}
              max={12}
            />
          )}

          {/* Images per row control for Mobile */}
          {deviceType === "Mobile" && (
            <RangeControl
              label="Images Per Row (Mobile)"
              value={imagesPerRowMobile}
              onChange={(newImagesPerRowMobile) =>
                setAttributes({
                  imagesPerRowMobile: Number(newImagesPerRowMobile),
                })
              }
              min={1}
              max={12}
            />
          )}

          {/* Card Height for Desktop (visible for desktop only) */}
          {deviceType === "Desktop" && (
            <RangeControl
              label="Card Height (Desktop)"
              value={parseInt(cardHeightDesktop, 10)}
              onChange={(newHeight) =>
                setAttributes({
                  cardSizeDesktop: {
                    ...cardSizeDesktop,
                    height: `${newHeight}px`,
                  },
                })
              }
              min={100}
              max={1500}
            />
          )}

          {/* Card Height for Mobile (visible for mobile only) */}
          {deviceType === "Mobile" && (
            <RangeControl
              label="Card Height (Mobile)"
              value={parseInt(cardHeightMobile, 10)}
              onChange={(newHeight) =>
                setAttributes({
                  cardSizeMobile: {
                    ...cardSizeMobile,
                    height: `${newHeight}px`,
                  },
                })
              }
              min={100}
              max={1500}
            />
          )}

          {/* Background Color Picker */}
          <ColorPalette
            label="Card Background Color"
            value={cardBgColor}
            onChange={(newColor) => setAttributes({ cardBgColor: newColor })}
          />

          {/* Border Width Control */}
          <RangeControl
            label="Border Width"
            value={parseInt(borderWidth, 10)}
            onChange={(value) => setAttributes({ borderWidth: `${value}px` })}
            min={1}
            max={10}
            disabled={!borderEnabled}
          />

          {/* Border Radius Control */}
          <RangeControl
            label="Border Radius"
            value={parseInt(borderRadius, 10)}
            onChange={(value) => setAttributes({ borderRadius: `${value}px` })}
            min={0}
            max={50}
            disabled={!borderEnabled}
          />

          {/* Card Margin Control */}
          <RangeControl
            label="Card Margin"
            value={parseInt(cardMargin, 10)}
            onChange={(value) => setAttributes({ cardMargin: `${value}px` })}
            min={0}
            max={50}
          />

          {/* Toggle for enabling Border */}
          <ToggleControl
            label="Enable Border"
            checked={borderEnabled}
            onChange={() => setAttributes({ borderEnabled: !borderEnabled })}
          />

          {/* Toggle for enabling Responsiveness */}
          <ToggleControl
            label="Enable Responsiveness"
            checked={isResponsive}
            onChange={() => setAttributes({ isResponsive: !isResponsive })}
          />
        </PanelBody>
      </InspectorControls>

      {loading ? (
        <div>
          {/* Skeleton for Desktop View */}
          {deviceType === "Desktop" && (
            <div
              className="image-gallery"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="image-item"
                  style={{ width: `calc(33% - 10px)`, boxSizing: "border-box" }}
                >
                  <Skeleton height={cardHeightDesktop} width="100%" />
                  <Skeleton
                    width={60}
                    height={15}
                    style={{
                      marginTop: "10px",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Skeleton for Mobile View */}
          {deviceType === "Mobile" && (
            <div
              className="image-gallery"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {[...Array(1)].map(
                (
                  _,
                  index // Only 1 skeleton item for mobile
                ) => (
                  <div
                    key={index}
                    className="image-item"
                    style={{
                      width: "calc(100% - 10px)",
                      boxSizing: "border-box",
                    }}
                  >
                    <Skeleton height={cardHeightMobile} width="100%" />
                    <Skeleton
                      width={60}
                      height={15}
                      style={{
                        marginTop: "10px",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div>
          <p>
            {images.length > 0
              ? `${images.length} images found`
              : "No images found"}
          </p>
          <div
            className="image-gallery"
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
          >
            {deviceType === "Desktop" &&
              // Desktop Layout - Render images based on imagesPerRowDesktop
              (images.length > 0 ? (
                images.map((image, index) => {
                  const totalImagesInRow = imagesPerRowDesktop; // Number of images per row for Desktop
                  const imageWidth = `calc(${100 / totalImagesInRow}% - 10px)`; // Adjust image width per row
                  return (
                    <div
                      key={index}
                      className="image-item"
                      style={{
                        margin: cardMargin,
                        padding: 0,
                        width: imageWidth, // Adjust width dynamically based on imagesPerRowDesktop
                        boxSizing: "border-box",
                        borderRadius: borderRadius,
                        backgroundColor: cardBgColor,
                        border: borderEnabled
                          ? `${borderWidth} solid #ccc`
                          : "none",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "stretch",
                        height: cardHeightDesktop,
                      }}
                    >
                      <div
                        className="image-container"
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                        }}
                      >
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
                      <div
                        className="image-title"
                        style={{ marginTop: "10px", textAlign: "center" }}
                      >
                        <h3>{image.title}</h3>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No images found for this category.</p>
              ))}

            {deviceType === "Mobile" &&
              // Mobile Layout - Render images based on imagesPerRowMobile (1 image per row)
              (images.length > 0 ? (
                images.map((image, index) => {
                  const totalImagesInRow = imagesPerRowMobile; // Number of images per row for Mobile (usually 1)
                  const imageWidth = `calc(${100 / totalImagesInRow}% - 10px)`; // Adjust image width for mobile (usually 100%)
                  return (
                    <div
                      key={index}
                      className="image-item"
                      style={{
                        margin: cardMargin,
                        padding: 0,
                        width: imageWidth, // Adjust width dynamically based on imagesPerRowMobile
                        boxSizing: "border-box",
                        borderRadius: borderRadius,
                        backgroundColor: cardBgColor,
                        border: borderEnabled
                          ? `${borderWidth} solid #ccc`
                          : "none",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "stretch",
                        height: cardHeightMobile,
                      }}
                    >
                      <div
                        className="image-container"
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                        }}
                      >
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
                      <div
                        className="image-title"
                        style={{ marginTop: "10px", textAlign: "center" }}
                      >
                        <h3>{image.title}</h3>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No images found for this category.</p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryBlock;
