<?php
// Set default values for attributes
$view_details_text = isset($attributes['viewDetailsText']) ? $attributes['viewDetailsText'] : 'View Details';
$selected_categories = isset($attributes['selectedCategories']) ? $attributes['selectedCategories'] : [];
$products = isset($attributes['products']) ? $attributes['products'] : [];
$cards_per_row = isset($attributes['cardsPerRow']) ? $attributes['cardsPerRow'] : 3;
$card_height = isset($attributes['cardHeight']) ? $attributes['cardHeight'] : '300px';
$image_height = isset($attributes['imageHeight']) ? $attributes['imageHeight'] : '200px';
$card_bg_color = isset($attributes['cardBgColor']) ? $attributes['cardBgColor'] : '#ffffff';
$text_color = isset($attributes['textColor']) ? $attributes['textColor'] : '#000000';
$font_size = isset($attributes['fontSize']) ? $attributes['fontSize'] : '16px';
$button_color = isset($attributes['buttonColor']) ? $attributes['buttonColor'] : '#0073aa';
$button_hover_color = isset($attributes['buttonHoverColor']) ? $attributes['buttonHoverColor'] : '#005177';
$card_margin = isset($attributes['cardMargin']) ? $attributes['cardMargin'] : '20px';
$card_padding = isset($attributes['cardPadding']) ? $attributes['cardPadding'] : '20px';
$border_width = isset($attributes['borderWidth']) ? $attributes['borderWidth'] : '1px';
$border_radius = isset($attributes['borderRadius']) ? $attributes['borderRadius'] : '8px';
$card_width = isset($attributes['cardWidth']) ? $attributes['cardWidth'] : 'auto';
$card_shape = isset($attributes['cardShape']) ? $attributes['cardShape'] : 'rectangle';

// Add styles for grid layout based on cards per row
$grid_styles = 'display: grid; grid-template-columns: repeat(' . esc_attr($cards_per_row) . ', 1fr); gap: ' . esc_attr($card_margin) . ';';
?>
<style>
    /* Category Checkbox Style */
    .category-checkbox {
        margin-right: 10px;
        width: 20px; /* Set the checkbox size */
        height: 20px;
        flex-shrink: 0;
        transition: all 0.3s ease; /* Smooth transition for interaction */
        
        /* Make checkbox bigger on mobile for better accessibility */
        @media (max-width: 767px) {
            width: 24px;
            height: 24px;
        }
    }

    /* Flexbox for the category list */
    .category-list {
        display: flex;
        flex-wrap: wrap; /* Allow the checkboxes to wrap to the next line */
        gap: 15px; /* Space between checkboxes */
        justify-content: flex-start; /* Align checkboxes to the left */
        align-items: center;
    }

    /* Align category items properly */
    .category-item {
        display: flex;
        align-items: center;
        margin-right: 10px;
    }

    /* Product Card Styles */
    .product-card {
        background-color: <?php echo esc_attr($card_bg_color); ?> !important;
        border: <?php echo esc_attr($border_width); ?> solid #ddd !important;
        border-radius: <?php echo esc_attr($border_radius); ?> !important;
        padding: <?php echo esc_attr($card_padding); ?> !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        height: <?php echo esc_attr($card_height); ?> !important;
        width: <?php echo esc_attr($card_width); ?> !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        margin-bottom: <?php echo esc_attr($card_margin); ?> !important;
        <?php if ($card_shape === 'square'): ?>
            aspect-ratio: 1; /* Force square shape */
        <?php endif; ?>
    }

    .product-card img {
        width: 100% !important;
        height: <?php echo esc_attr($image_height); ?> !important;
        border-radius: <?php echo esc_attr($border_radius); ?> !important;
        object-fit: cover !important;
    }

    .product-name {
        font-size: <?php echo esc_attr($font_size); ?> !important;
        color: <?php echo esc_attr($text_color); ?> !important;
        margin-top: 15px !important;
        flex-grow: 1;
    }

    .product-category {
        font-size: 14px !important;
        color: <?php echo esc_attr($text_color); ?> !important;
    }

    .view-details-button {
        display: inline-block !important;
        margin-top: auto !important;
        padding: 10px 20px !important;
        background-color: <?php echo esc_attr($button_color); ?> !important;
        color: white !important;
        text-decoration: none !important;
        border-radius: 4px !important;
        text-align: center !important;
        transition: background-color 0.3s !important;
    }

    .view-details-button:hover {
        background-color: <?php echo esc_attr($button_hover_color); ?> !important;
    }

    /* Layout for mobile and smaller screens */
    @media (max-width: 1024px) {
        .product-list {
            display: grid !important;
            grid-template-columns: repeat(1, 1fr) !important;
            gap: <?php echo esc_attr($card_margin); ?> !important;
        }
        .product-card {
            width: 100% !important;
        }
    }

    /* Rating stars */
    .rating {
        display: flex;
        gap: 3px;
    }

    .star {
        font-size: 18px;
        color: #ff9800;
    }

    /* Category list layout */
    .category-list {
        display: flex;
        flex-wrap: wrap;
        gap: 15px; /* Space between checkboxes */
        justify-content: flex-start; /* Align checkboxes to the left */
    }

    /* Large screens: Horizontal layout for checkboxes */
    @media (min-width: 1025px) {
        .category-list {
            flex-direction: row;
        }
    }

    /* Small screens: Vertical layout for checkboxes */
    @media (max-width: 1024px) {
        .category-list {
            flex-direction: column;
        }
    }
</style>

<div data-wp-interactive="productfilter" data-wp-context='<?php echo esc_attr(json_encode([ 
    'products' => $products, 
    'categories' => $selected_categories 
])); ?>'>
    <div class="product-filter-block">
        <div class="category-list">
            <?php foreach ($selected_categories as $category): ?>
                <div class="category-item">
                    <label for="category-checkbox-<?php echo esc_attr($category); ?>" class="category-label">
                        <input type="checkbox"
                               id="category-checkbox-<?php echo esc_attr($category); ?>"
                               class="category-checkbox"
                               data-wp-on--click="actions.toggleCategory"
                               data-wp-bind--checked="context.selectedCategories.indexOf('<?php echo esc_attr($category); ?>') !== -1"
                               data-category="<?php echo esc_attr($category); ?>" />
                        <?php echo esc_html($category); ?>
                    </label>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="product-list" style="<?php echo esc_attr($grid_styles); ?>">
            <?php if (!empty($products)): ?>
                <?php foreach ($products as $product): ?>
                    <?php
                    // Safely extract product details with defaults
                    $product_name = isset($product['name']) ? $product['name'] : 'Unnamed Product';
                    $product_category = isset($product['category']) ? $product['category'] : 'Uncategorized';
                    $product_image_url = isset($product['imageUrl']) ? $product['imageUrl'] : '';
                    $product_permalink = isset($product['permalink']) ? $product['permalink'] : '#';
                    $product_rating = isset($product['rating']) ? $product['rating'] : 0;
                    ?>
                    <div class="product-item">
                        <div class="product-card">
                            <?php if ($product_image_url): ?>
                                <img src="<?php echo esc_url($product_image_url); ?>" alt="<?php echo esc_attr($product_name); ?>" class="product-image">
                            <?php endif; ?>
                            <h3 class="product-name"><?php echo esc_html($product_name); ?></h3>
                            <p class="product-category">Category: <?php echo esc_html($product_category); ?></p>

                            <!-- Rating Stars -->
                            <div class="rating">
                                <?php for ($i = 0; $i < 5; $i++): ?>
                                    <span class="star"><?php echo $i < $product_rating ? '★' : '☆'; ?></span>
                                <?php endfor; ?>
                            </div>

                            <a href="<?php echo esc_url($product_permalink); ?>" class="view-details-button">
                                <?php echo esc_html($view_details_text); ?>
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p>No products available.</p>
            <?php endif; ?>
        </div>
    </div>
</div>
