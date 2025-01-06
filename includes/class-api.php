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
        // Register a simple test endpoint that returns a string
        register_rest_route( 'testapi/v1', '/check', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'test_api_callback' ),
            'permission_callback' => '__return_true', // Open to all
        ));
    }

    /**
     * Callback function for the test API endpoint
     */
    public function test_api_callback( $request ) {
        return new WP_REST_Response( 'API is working!', 200 );
    }
}

// Instantiate the API class
new ImageGallery_API();
