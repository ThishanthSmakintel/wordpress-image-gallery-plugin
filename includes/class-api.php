<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

class ImageGallery_API {

    /**
     * Constructor to hook the necessary actions
     */
    public function __construct() {
        // Register custom REST API endpoints when the rest_api_init action is fired
        add_action( 'rest_api_init', array( $this, 'register_api_endpoints' ) );
    }

    /**
     * Register custom REST API endpoints
     */
    public function register_api_endpoints() {
        // Register the filter images by category endpoint
        register_rest_route( 'imagegallery/v1', '/filter-images', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'filter_images_by_category' ),
            'permission_callback' => '__return_true', // Open to all
            'args'                => array(
                'category_slug' => array(
                    'required'          => false,
                    'validate_callback' => function( $param, $request, $key ) {
                        return is_string( $param );  // Validate as string
                    },
                ),
            ),
        ));

        // Register the category details endpoint
        register_rest_route( 'imagegallery/v1', '/categories', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_category_details' ),
            'permission_callback' => '__return_true', // Open to all
        ));
    }

    /**
     * Callback to fetch category details
     */
    public function get_category_details( WP_REST_Request $request ) {
        // Fetch categories from the 'gallery_category' taxonomy
        $categories = get_terms(array(
            'taxonomy' => 'gallery_category',
            'hide_empty' => false, // Show all categories even if empty
        ));

        if (is_wp_error($categories)) {
            return new WP_REST_Response(array('message' => 'Error fetching categories'), 500);
        }

        // Prepare response data
        $response_data = array();

        foreach ($categories as $category) {
            $response_data[] = array(
                'slug'        => $category->slug,
                'name'        => $category->name,
                'description' => $category->description,
                'count'       => $category->count,
            );
        }

        // Return the category details in the response
        return new WP_REST_Response($response_data, 200);
    }

    /**
     * Callback to filter images by category
     */
    public function filter_images_by_category( $request ) {
        global $wpdb;

        // Get category slug from the request
        $category_slug = $request->get_param( 'category_slug' );

        // If category is specified, filter by category
        if ( ! empty( $category_slug ) ) {
            $where_clause = " AND t.slug = %s";
            $params = array( $category_slug );
        } else {
            // If no category specified, get all images
            $where_clause = "";
            $params = array();
        }

        // Prepare SQL query
        $sql = "
            SELECT p.ID AS image_id, p.post_title, GROUP_CONCAT(t.name ORDER BY t.name ASC) AS category_names 
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
            INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
            WHERE p.post_type = 'attachment' AND tt.taxonomy = 'gallery_category'
            {$where_clause}
            GROUP BY p.ID
            ORDER BY p.ID;
        ";

        // Run the query and get the results
        $results = $wpdb->get_results( $wpdb->prepare( $sql, ...$params ) );

        // Check if results were found
        if ( $results ) {
            $images = array();
            foreach ( $results as $row ) {
                $image_url = wp_get_attachment_url( $row->image_id );
                $category_names = $row->category_names ? $row->category_names : 'No categories assigned';

                // Collect images and their category names
                $images[] = array(
                    'image_url'  => esc_url( $image_url ),
                    'categories' => esc_html( $category_names ),
                );
            }

            // Return images data in JSON format
            return new WP_REST_Response( $images, 200 );
        } else {
            // If no images are found
            return new WP_REST_Response( [ 'message' => 'No images found for this category.' ], 200 );
        }
    }
}

// Instantiate the API class
new ImageGallery_API();
