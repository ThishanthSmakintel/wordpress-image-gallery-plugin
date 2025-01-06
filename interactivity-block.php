<?php

/**
 * Plugin Name:       ImageGallery Block
 * Description:       Custom image gallery block with category selection.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       imagegallery-block
 *
 * @package CreateBlock
 */

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class ImageGallery_Block
{

	public function __construct()
	{
		add_action('init', array($this, 'register_block'));
		add_action('admin_menu', array($this, 'add_admin_menu'));
		add_action('init', array($this, 'register_taxonomy'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_media_uploader_scripts'));
		add_action('wp_ajax_filter_images_by_category', array($this, 'filter_images_by_category'));
		add_action('admin_post_imagegallery_upload_images', array($this, 'handle_image_upload_ajax'));
		add_action('wp_ajax_imagegallery_upload_images', array($this, 'handle_image_upload_ajax'));

		// Hook the CSS enqueue function properly
		add_action('admin_enqueue_scripts', array($this, 'enqueue_imagegallery_styles'));
	}

	public function enqueue_imagegallery_styles($hook)
	{
		// Only load the CSS file on the plugin's admin page
		if ('toplevel_page_imagegallery-plugin' === $hook) {
			wp_enqueue_style('imagegallery-block-styles', plugin_dir_url(__FILE__) . 'css/plugin-admin.css');
		}
	}

	public function enqueue_media_uploader_scripts($hook)
	{
		// Only load the media uploader scripts on the plugin's admin page
		if ('toplevel_page_imagegallery-plugin' !== $hook) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_script('imagegallery-media-uploader', plugin_dir_url(__FILE__) . 'js/ajax-upload.js', array('jquery'), null, true);

		wp_localize_script('imagegallery-media-uploader', 'imagegalleryAjax', array(
			'ajax_url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('imagegallery_ajax_nonce'),
		));
	}


	public function register_block()
	{
		register_block_type(__DIR__ . '/build');
	}

	public function register_taxonomy()
	{
		register_taxonomy(
			'gallery_category',
			'attachment',
			array(
				'label' => 'Gallery Categories',
				'rewrite' => array('slug' => 'gallery-category'),
				'hierarchical' => true,
				'show_ui' => true,
				'show_admin_column' => true,
			)
		);
	}

	public function add_admin_menu()
	{
		add_menu_page(
			'Image Gallery Settings',
			'Image Gallery',
			'manage_options',
			'imagegallery-plugin',
			array($this, 'settings_page'),
			'dashicons-images-alt2',
			6
		);
	}


	public function handle_image_upload_ajax()
	{
		// Verify nonce for security
		if (! isset($_POST['nonce']) || ! wp_verify_nonce($_POST['nonce'], 'imagegallery_ajax_nonce')) {
			wp_send_json_error(array('message' => 'Permission Denied: Invalid nonce.'));
		}

		// Get the selected category and validate it
		$category = isset($_POST['gallery_category']) ? sanitize_text_field($_POST['gallery_category']) : '';
		if (empty($category) || ! term_exists($category, 'gallery_category')) {
			wp_send_json_error(array('message' => 'Invalid or missing category.'));
		}

		$errors = [];

		// Process selected images (from media library)
		if (isset($_POST['gallery_images']) && ! empty($_POST['gallery_images'])) {
			$image_ids = explode(',', $_POST['gallery_images']);
			$invalid_images = [];

			foreach ($image_ids as $attachment_id) {
				$attachment_id = intval($attachment_id);

				// Validate if the image exists and is a valid attachment
				if (! get_post($attachment_id) || 'attachment' !== get_post_type($attachment_id)) {
					$invalid_images[] = $attachment_id;
					continue;
				}

				// Try to associate the image with the selected category
				$result = wp_set_object_terms($attachment_id, $category, 'gallery_category');
				if (is_wp_error($result)) {
					$invalid_images[] = $attachment_id;
				}
			}

			if (! empty($invalid_images)) {
				$errors[] = 'Some images were not associated with the category: ' . implode(', ', $invalid_images);
			}
		}

		// Process new image uploads (from file input)
		if (isset($_FILES['new_gallery_images']) && ! empty($_FILES['new_gallery_images']['name'][0])) {
			$files = $_FILES['new_gallery_images'];
			$attachment_ids = [];
			$upload_errors = [];

			foreach ($files['name'] as $key => $file_name) {
				if ($files['error'][$key] !== UPLOAD_ERR_OK) {
					$upload_errors[] = 'Error uploading file: ' . $file_name;
					continue;
				}

				// Handle the file upload
				$attachment_id = media_handle_upload('new_gallery_images', 0);
				if (is_wp_error($attachment_id)) {
					$upload_errors[] = 'Error uploading image: ' . $file_name . ' - ' . $attachment_id->get_error_message();
					continue;
				}

				// Associate the uploaded image with the selected category
				$result = wp_set_object_terms($attachment_id, $category, 'gallery_category');
				if (is_wp_error($result)) {
					$upload_errors[] = 'Error associating image ' . $file_name . ' with the category.';
					continue;
				}

				$attachment_ids[] = $attachment_id;
			}

			if (! empty($upload_errors)) {
				$errors = array_merge($errors, $upload_errors);
			}
		}

		// No images selected for upload
		if (empty($_POST['gallery_images']) && empty($_FILES['new_gallery_images'])) {
			$errors[] = 'No images selected for upload.';
		}

		if (! empty($errors)) {
			wp_send_json_error(array('message' => implode('; ', $errors)));
		}

		wp_send_json_success(array('message' => 'Images successfully uploaded and associated with the category.'));
	}

	public function settings_page()
	{
		// Check if a new category is being submitted
		if (isset($_POST['create_category'])) {
			$this->handle_create_category();
		}

?>
		<div class="wrap">
			<h1>Image Gallery Settings</h1>

			<!-- Upload and Category Select Form -->
			<form id="upload_images_form" method="post" enctype="multipart/form-data">
				<?php wp_nonce_field('imagegallery_ajax_nonce', 'nonce'); ?>

				<h2>Upload or Select Images</h2>
				<label for="gallery_images">Select Images:</label><br>
				<input type="button" class="button" value="Select Images" id="upload_images_button">
				<input type="hidden" name="gallery_images" id="gallery_images"><br><br>

				<div id="image-preview-container" style="margin-top: 10px;"></div> <!-- Image preview container -->

				<label for="gallery_category">Select Category:</label><br>
				<select name="gallery_category">
					<option value="">-- Select a Category --</option>
					<?php
					$categories = get_terms('gallery_category', array('hide_empty' => false));
					foreach ($categories as $category) {
						echo '<option value="' . esc_attr($category->slug) . '">' . esc_html($category->name) . '</option>';
					}
					?>
				</select><br><br>

				<input type="submit" name="submit" value="Upload" class="button button-primary">
			</form>

			<h2>Images by Category</h2>
			<h3>All Images (Default Display)</h3>

			<!-- Category Filter Form -->
			<select name="gallery_category_filter" id='gallery_category_filter'>
				<option value="">All Categories</option>
				<?php
				$categories = get_terms(array(
					'taxonomy' => 'gallery_category',
					'hide_empty' => false,
				));
				foreach ($categories as $category) {
					echo '<option value="' . esc_attr($category->slug) . '">' . esc_html($category->name) . '</option>';
				}
				?>
			</select>

			<!-- Form for adding a new category -->
			<h2>Create New Category</h2>
			<form method="post">
				<?php wp_nonce_field('imagegallery_ajax_nonce', 'nonce'); ?>
				<label for="new_category_name">Category Name:</label><br>
				<input type="text" name="new_category_name" id="new_category_name" required><br><br>
				<input type="submit" name="create_category" value="Create Category" class="button button-secondary">
			</form>


			<!-- Display the image table -->
			<table class="wp-list-table widefat fixed striped" id="wp-list-table">
				<thead>
					<tr>
						<th scope="col" class="manage-column">Image</th>
						<th scope="col" class="manage-column">Category</th>
					</tr>
				</thead>
				<tbody>
					<?php
					// Custom SQL query to fetch images
					global $wpdb;

					$sql = "
					SELECT p.ID AS image_id, p.post_title, GROUP_CONCAT(t.name ORDER BY t.name ASC) AS category_names 
					FROM {$wpdb->posts} p
					INNER JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
					INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
					INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
					WHERE p.post_type = 'attachment' AND tt.taxonomy = 'gallery_category'
					GROUP BY p.ID
					ORDER BY p.ID;
				";
					$results = $wpdb->get_results($sql);
					if ($results) {
						foreach ($results as $row) {
							$image_url = wp_get_attachment_url($row->image_id);
							$category_names = $row->category_names ? $row->category_names : 'No categories assigned';
							echo '<tr>';
							echo '<td><img src="' . esc_url($image_url) . '" style="max-width: 150px;"></td>';
							echo '<td>' . esc_html($category_names) . '</td>';
							echo '</tr>';
						}
					} else {
						echo '<tr><td colspan="2">No images found.</td></tr>';
					}
					?>
				</tbody>
			</table>
		</div>
<?php
	}


	public function handle_create_category()
	{
		// Verify nonce for security
		if (! isset($_POST['nonce']) || ! wp_verify_nonce($_POST['nonce'], 'imagegallery_ajax_nonce')) {
			wp_die('Permission Denied: Invalid nonce.');
		}

		// Get the category name from the form
		$new_category_name = isset($_POST['new_category_name']) ? sanitize_text_field($_POST['new_category_name']) : '';

		// Check if the category name is not empty
		if (empty($new_category_name)) {
			echo '<div class="notice notice-error"><p>' . esc_html__('Category name cannot be empty.', 'imagegallery-block') . '</p></div>';
			return;
		}

		// Create a new category using wp_insert_term
		$term = wp_insert_term($new_category_name, 'gallery_category');

		if (is_wp_error($term)) {
			echo '<div class="notice notice-error"><p>' . esc_html__('Error creating category: ', 'imagegallery-block') . $term->get_error_message() . '</p></div>';
			return;
		}

		// Successfully created the category
		echo '<div class="notice notice-success"><p>' . esc_html__('Category created successfully!', 'imagegallery-block') . '</p></div>';
	}


	public function filter_images_by_category()
	{
		global $wpdb;

		// Check nonce for security
		if (! isset($_GET['nonce']) || ! wp_verify_nonce($_GET['nonce'], 'imagegallery_ajax_nonce')) {
			wp_send_json_error(array('message' => 'Permission Denied'));
		}

		// Get category slug from GET request
		$category_slug = isset($_GET['category_slug']) ? sanitize_text_field($_GET['category_slug']) : '';

		// If category is specified, filter by category
		if (! empty($category_slug)) {
			$where_clause = " AND t.slug = %s";
			$params = array($category_slug);
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
		$results = $wpdb->get_results($wpdb->prepare($sql, ...$params));

		if ($results) {
			$images = array();
			foreach ($results as $row) {
				$image_url = wp_get_attachment_url($row->image_id);
				$category_names = $row->category_names ? $row->category_names : 'No categories assigned';

				// Collect images and their category names
				$images[] = array(
					'image_url' => esc_url($image_url),
					'categories' => esc_html($category_names),
				);
			}

			// Send the images data in JSON format
			wp_send_json_success(array('images' => $images));
		} else {
			wp_send_json_error(array('message' => 'No images found for this category.'));
		}
	}
}

$imagegallery_block = new ImageGallery_Block();
