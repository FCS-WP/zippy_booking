<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web;

use WP_REST_Request;
use WP_Query;

use Zippy_Booking\Src\App\Zippy_Response_Handler;

defined('ABSPATH') or die();

class Zippy_Booking_Controller
{
    public static function create_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';
    
        $product_id = intval($request->get_param('product_id'));
        $user_id = intval($request->get_param('user_id'));
        $email = sanitize_email($request->get_param('email'));
        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));
        $booking_start_time = sanitize_text_field($request->get_param('booking_start_time'));
        $booking_end_time = sanitize_text_field($request->get_param('booking_end_time'));
    
        if (empty($product_id) || empty($email) || empty($booking_start_date) || empty($booking_end_date) || empty($booking_start_time) || empty($booking_end_time)) {
            return Zippy_Response_Handler::error('Missing request parameter.');
        }
    
        $product = wc_get_product($product_id);
        if (!$product) {
            return Zippy_Response_Handler::error('Product does not exist.');
        }
    
        if (empty($user_id)) {
            $user = get_user_by('email', $email);
    
            if (!$user) {
                $user_data = array(
                    'user_login' => $email,
                    'user_email' => $email,
                    'user_pass' => wp_generate_password(),
                    'role' => 'customer',
                );
    
                $user_id = wp_insert_user($user_data);
    
                if (is_wp_error($user_id)) {
                    return Zippy_Response_Handler::error('User creation failed.');
                }
            } else {
                $user_id = $user->ID;
            }
        }
    
        $order = wc_create_order();
    
        $order->add_product($product, 1);
    
        $order->set_customer_id($user_id);
    
        $order->calculate_totals();
        $order->save();
        $order_id = $order->get_id();
    
        $inserted = $wpdb->insert($table_name, array(
            'user_id' => $user_id,
            'email' => $email,
            'product_id' => $product_id,
            'booking_start_date' => $booking_start_date,
            'booking_end_date' => $booking_end_date,
            'booking_start_time' => $booking_start_time,
            'booking_end_time' => $booking_end_time,
            'booking_status' => 'pending',
            'order_id' => $order_id,
        ));
    
        $booking_id = $wpdb->insert_id;

        if (false === $inserted || empty($booking_id)) {
            return Zippy_Response_Handler::error('Failed to insert booking. Error: ' . $wpdb->last_error);
        }
        
        $custom_order_name = 'Booking #' . $booking_id;
        $order->add_order_note($custom_order_name); 
        $order->update_meta_data('custom_order_name', $custom_order_name);
        $order->update_meta_data('booking_id', $booking_id);
        $order->update_meta_data('booking_start_time', $booking_start_time);
        $order->update_meta_data('booking_end_time', $booking_end_time);
        $order->save();
    
        return Zippy_Response_Handler::success(
            array(
                'booking_id' => $booking_id,
                'user_id' => $user_id,
                'email' => $email,
                'product_id' => $product_id,
                'booking_start_date' => $booking_start_date,
                'booking_end_date' => $booking_end_date,
                'booking_start_time' => $booking_start_time,
                'booking_end_time' => $booking_end_time,
                'booking_status' => 'pending',
                'order_id' => $order_id,
                'orrder_name'=> $custom_order_name,
            ),
            'Booking and order created successfully.'
        );
    }
    
    
    public static function get_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';
    
        $booking_id = $request->get_param('booking_id');
        $email = $request->get_param('email');
        $product_id = $request->get_param('product_id');
    
        $query = "
            SELECT b.*, o.ID AS order_id
            FROM $table_name b
            LEFT JOIN {$wpdb->prefix}posts o ON o.post_type = 'shop_order' 
            LEFT JOIN {$wpdb->prefix}postmeta pm ON o.ID = pm.post_id AND pm.meta_key = 'booking_id' 
            WHERE 1=1
        ";
    
        if ($booking_id) {
            $query .= $wpdb->prepare(" AND b.ID = %d", $booking_id);
        }
        if ($email) {
            $query .= $wpdb->prepare(" AND b.email = %s", $email);
        }
        if ($product_id) {
            $query .= $wpdb->prepare(" AND b.product_id = %d", $product_id);
        }
    
        $results = $wpdb->get_results($query);
    
        if (empty($results)) {
            return Zippy_Response_Handler::error('Booking not found.');
        }
    
        return Zippy_Response_Handler::success(
            !empty($results) ? $results[0] : array(),
            'Bookings retrieved successfully.'
        );
    }
    
    public static function delete_booking(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $booking_id = intval($request->get_param('booking_id'));
        $user_id = intval($request->get_param('user_id'));

        if (empty($booking_id)) {
            return Zippy_Response_Handler::error('Missing booking_id parameter.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        if (!current_user_can('administrator') && $booking->user_id != $user_id) {
            return Zippy_Response_Handler::error('You do not have permission to delete this booking.');
        }

        $deleted = $wpdb->delete($table_name, array('ID' => $booking_id), array('%d'));

        if ($deleted === false) {
            return Zippy_Response_Handler::error('Failed to delete the booking.');
        }

        return Zippy_Response_Handler::success(
            array('deleted_id' => $booking_id),
            'Booking deleted successfully.'
        );
    }

    public static function update_booking(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $booking_id = intval($request->get_param('booking_id'));
        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));
        $booking_status = sanitize_text_field($request->get_param('booking_status'));
        $user_id = intval($request->get_param('user_id'));

        if (empty($booking_id)) {
            return Zippy_Response_Handler::error('Missing booking_id parameter.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        $data_to_update = array();
        $where = array('ID' => $booking_id);

        if (!empty($booking_start_date)) {
            $data_to_update['booking_start_date'] = $booking_start_date;
        }
        if (!empty($booking_end_date)) {
            $data_to_update['booking_end_date'] = $booking_end_date;
        }
        if (!empty($booking_status)) {
            $data_to_update['booking_status'] = $booking_status;
        }

        if (empty($data_to_update)) {
            return Zippy_Response_Handler::error('No valid fields to update.');
        }
        $updated = $wpdb->update($table_name, $data_to_update, $where);

        if ($updated === false) {
            return Zippy_Response_Handler::error('Failed to update the booking.');
        }

        return Zippy_Response_Handler::success(
            array(
                'booking_id' => $booking_id,
                'updated_fields' => $data_to_update
            ),
            'Booking updated successfully.'
        );
    }
    public static function check_permission(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $booking_id = intval($request->get_param('booking_id'));

        if (empty($user_id_from_request) || empty($booking_id)) {
            return Zippy_Response_Handler::error('Booking ID or User ID is missing.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT user_id FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking) {
            return Zippy_Response_Handler::error('You do not have permission to update this booking.');
        }
    }
    public static function handle_support_booking_product(WP_REST_Request $request)
    {
        global $wpdb;
    
       
        $items_id = $request->get_param('items_id');
        $mapping_type = $request->get_param('mapping_type');
    
        if (empty($items_id)) {
            return Zippy_Response_Handler::error('Items ID is required.');
        }
    
        $table_name = $wpdb->prefix . 'product_booking_mapping';
    
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d",
            $items_id
        ));
    
        if ($exists > 0) {
            return Zippy_Response_Handler::error('Items ID already exists.');
        }
    
        $product = wc_get_product($items_id); 
        if (!$product) {
            return Zippy_Response_Handler::error('Product not found.');
        }
    
        $product_name = $product->get_name(); 
        $product_price = $product->get_price();
    
        $result = $wpdb->insert(
            $table_name,
            array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
            ),
            array(
                '%d',
                '%s',
            )
        );
    
        if ($result === false) {
            return Zippy_Response_Handler::error('Error inserting data into the database.');
        }
    
        $meta_key = 'product_booking_mapping';
        $meta_value = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'product_name' => $product_name,
            'product_price' => $product_price
        );
    
        $update_meta = update_post_meta($items_id, $meta_key, $meta_value);
    
        if (!$update_meta) {
            return Zippy_Response_Handler::error('Failed to add meta to the product.');
        }
    
        $added_item = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'product_name' => $product_name,
            'product_price' => $product_price,
            'meta_key' => $meta_key,
        );
    
        return Zippy_Response_Handler::success($added_item, 'Product booking mapping created successfully.');
    }
    

    public static function handle_support_booking_products(WP_REST_Request $request)
    {
        global $wpdb;

        $products = $request->get_param('products');

        if (empty($products) || !is_array($products)) {
            return Zippy_Response_Handler::error('Products array is required and must be an array.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $added_items = [];
        $duplicate_items = [];

        foreach ($products as $product) {
            $items_id = isset($product['items_id']) ? intval($product['items_id']) : null;
            $mapping_type = isset($product['mapping_type']) ? sanitize_text_field($product['mapping_type']) : null;

            if (!$items_id || !$mapping_type) {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d",
                $items_id
            ));

            if ($exists > 0) {
                $duplicate_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
                continue;
            }

            $product_data = wc_get_product($items_id);
            if (!$product_data) {
                continue; // Skip if product is not found
            }

            $product_name = $product_data->get_name();
            $product_price = $product_data->get_price();

            $result = $wpdb->insert(
                $table_name,
                array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                ),
                array(
                    '%d',
                    '%s',
                )
            );

            if ($result !== false) {
                $added_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                    'product_name' => $product_name,
                    'product_price' => $product_price,
                );
            }
        }

        if (empty($added_items) && !empty($duplicate_items)) {
            return Zippy_Response_Handler::error('All provided items already exist in the database.', $duplicate_items);
        }

        if (empty($added_items)) {
            return Zippy_Response_Handler::error('No valid items were added to the database.');
        }

        return Zippy_Response_Handler::success(
            array(
                'added_items' => $added_items,
                'duplicate_items' => $duplicate_items,
            ),
            'Items booking mappings processed successfully.'
        );
    }

    public static function get_all_support_booking_products(WP_REST_Request $request)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_type = %s",
                'product'
            ),
            ARRAY_A
        );

        if (empty($items)) {
            return Zippy_Response_Handler::error('No items found in the database.');
        }

        $items_with_product_info = [];
        foreach ($items as $item) {
            $product = wc_get_product($item['items_id']);
            if ($product) {
                $item['product_name'] = $product->get_name();
                $item['product_price'] = $product->get_price();
            }
            $items_with_product_info[] = $item;
        }

        return Zippy_Response_Handler::success($items_with_product_info, 'Items retrieved successfully.');
    }



    public static function handle_support_booking_category(WP_REST_Request $request)
    {
        global $wpdb;

        $items_id = $request->get_param('items_id');
        $mapping_type = $request->get_param('mapping_type');

        if (empty($items_id) || $mapping_type !== 'category') {
            return Zippy_Response_Handler::error('Items ID is required and mapping type must be "category".');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
            $items_id,
            $mapping_type
        ));

        if ($exists > 0) {
            return Zippy_Response_Handler::error('Items ID with this mapping type already exists.');
        }

        $result = $wpdb->insert(
            $table_name,
            array(
                'items_id' => $items_id,
                'mapping_type' => $mapping_type,
            ),
            array(
                '%d',
                '%s',
            )
        );

        if ($result === false) {
            return Zippy_Response_Handler::error('Error inserting data into the database.');
        }

        $term = get_term($items_id, 'product_cat');
        if (!$term || is_wp_error($term)) {
            return Zippy_Response_Handler::error('Invalid category ID or category not found.');
        }

        $category_name = $term->name;

        $product_query = new WP_Query(array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'id',
                    'terms' => $items_id,
                ),
            ),
        ));

        $products = [];
        if ($product_query->have_posts()) {
            while ($product_query->have_posts()) {
                $product_query->the_post();
                $product_id = get_the_ID();
                $product_name = get_the_title();
                $product_price = get_post_meta($product_id, '_price', true);

                $products[] = array(
                    'product_id' => $product_id,
                    'product_name' => $product_name,
                    'product_price' => $product_price,
                );
            }
            wp_reset_postdata();
        }

        $subcategories = get_terms(array(
            'taxonomy' => 'product_cat',
            'parent' => $items_id,
            'hide_empty' => false,
        ));

        $subcategory_data = [];
        if (!empty($subcategories) && !is_wp_error($subcategories)) {
            foreach ($subcategories as $subcategory) {
                $subcategory_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $subcategory->term_id,
                        ),
                    ),
                ));

                $subcategory_products = [];
                if ($subcategory_query->have_posts()) {
                    while ($subcategory_query->have_posts()) {
                        $subcategory_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                if (!empty($subcategory_products)) {
                    $subcategory_data[] = array(
                        'subcategory_id' => $subcategory->term_id,
                        'subcategory_name' => $subcategory->name,
                        'subcategory_products' => $subcategory_products,
                    );
                }
            }
        }

        $response_data = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
            'category_name' => $category_name,
        );

        if (empty($subcategory_data)) {
            if (!empty($products)) {
                $response_data['products_in_category'] = $products;
            } else {
                $response_data['products_in_category'] = [];
            }
        }

        if (!empty($subcategory_data)) {
            $response_data['subcategories'] = $subcategory_data;
        }

        return Zippy_Response_Handler::success($response_data, 'Category booking mapping created successfully.');
    }

    public static function handle_support_booking_categories(WP_REST_Request $request)
    {
        global $wpdb;

        $categories = $request->get_param('categories');

        if (empty($categories) || !is_array($categories)) {
            return Zippy_Response_Handler::error('Categories array is required and must be an array.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $added_items = [];
        $duplicate_items = [];

        foreach ($categories as $category) {
            $items_id = isset($category['items_id']) ? intval($category['items_id']) : null;
            $mapping_type = isset($category['mapping_type']) ? sanitize_text_field($category['mapping_type']) : null;

            if (!$items_id || $mapping_type !== 'category') {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = %s",
                $items_id,
                $mapping_type
            ));

            if ($exists > 0) {
                $duplicate_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
                continue;
            }

            $result = $wpdb->insert(
                $table_name,
                array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                ),
                array(
                    '%d',
                    '%s',
                )
            );

            if ($result !== false) {
                $term = get_term($items_id, 'product_cat');
                $category_name = $term ? $term->name : 'Unknown Category';

                $subcategories = get_terms(array(
                    'taxonomy' => 'product_cat',
                    'parent' => $items_id,
                    'hide_empty' => false,
                ));

                $subcategories_data = [];
                foreach ($subcategories as $subcategory) {
                    $product_query = new WP_Query(array(
                        'post_type' => 'product',
                        'posts_per_page' => -1,
                        'post_status' => 'publish',
                        'tax_query' => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field' => 'id',
                                'terms' => $subcategory->term_id,
                            ),
                        ),
                    ));

                    $subcategory_products = [];
                    if ($product_query->have_posts()) {
                        while ($product_query->have_posts()) {
                            $product_query->the_post();
                            $product_id = get_the_ID();
                            $product_name = get_the_title();
                            $product_price = get_post_meta($product_id, '_price', true);

                            $subcategory_products[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                            );
                        }
                        wp_reset_postdata();
                    }

                    $subcategories_data[] = array(
                        'subcategory_id' => $subcategory->term_id,
                        'subcategory_name' => $subcategory->name,
                        'subcategory_products' => $subcategory_products,
                    );
                }

                $category_data = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                    'category_name' => $category_name,
                    'subcategories' => $subcategories_data,
                );

                if (empty($subcategories_data)) {
                    $product_query = new WP_Query(array(
                        'post_type' => 'product',
                        'posts_per_page' => -1,
                        'post_status' => 'publish',
                        'tax_query' => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field' => 'id',
                                'terms' => $items_id,
                            ),
                        ),
                    ));

                    $products_in_category = [];
                    if ($product_query->have_posts()) {
                        while ($product_query->have_posts()) {
                            $product_query->the_post();
                            $product_id = get_the_ID();
                            $product_name = get_the_title();
                            $product_price = get_post_meta($product_id, '_price', true);

                            $products_in_category[] = array(
                                'product_id' => $product_id,
                                'product_name' => $product_name,
                                'product_price' => $product_price,
                            );
                        }
                        wp_reset_postdata();
                    }

                    $category_data['products_in_category'] = $products_in_category;
                }

                $added_items[] = $category_data;
            }
        }

        if (empty($added_items) && !empty($duplicate_items)) {
            return Zippy_Response_Handler::error('All provided categories already exist in the database.', $duplicate_items);
        }

        if (empty($added_items)) {
            return Zippy_Response_Handler::error('No valid categories were added to the database.');
        }

        return Zippy_Response_Handler::success(
            array(
                'added_items' => $added_items,
                'duplicate_items' => $duplicate_items,
            ),
            'Category booking mappings processed successfully.'
        );
    }


    public static function get_all_support_booking_categories(WP_REST_Request $request)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT items_id, mapping_type FROM {$table_name} WHERE mapping_type = %s",
                'category'
            ),
            ARRAY_A
        );

        if (empty($items)) {
            return Zippy_Response_Handler::error('No category items found in the database.');
        }

        $categories_data = [];

        foreach ($items as $item) {
            $items_id = $item['items_id'];

            $term = get_term($items_id, 'product_cat');
            $category_name = $term ? $term->name : 'Unknown Category';

            $subcategories = get_terms(array(
                'taxonomy' => 'product_cat',
                'parent' => $items_id,
                'hide_empty' => false,
            ));

            $subcategories_data = [];
            foreach ($subcategories as $subcategory) {
                $product_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $subcategory->term_id,
                        ),
                    ),
                ));

                $subcategory_products = [];
                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $subcategory_products[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                $subcategories_data[] = array(
                    'subcategory_id' => $subcategory->term_id,
                    'subcategory_name' => $subcategory->name,
                    'subcategory_products' => $subcategory_products,
                );
            }

            $category_data = array(
                'items_id' => $items_id,
                'mapping_type' => $item['mapping_type'],
                'category_name' => $category_name,
                'subcategories' => $subcategories_data,
            );

            if (empty($subcategories_data)) {
                $product_query = new WP_Query(array(
                    'post_type' => 'product',
                    'posts_per_page' => -1,
                    'post_status' => 'publish',
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'id',
                            'terms' => $items_id,
                        ),
                    ),
                ));

                $products_in_category = [];
                if ($product_query->have_posts()) {
                    while ($product_query->have_posts()) {
                        $product_query->the_post();
                        $product_id = get_the_ID();
                        $product_name = get_the_title();
                        $product_price = get_post_meta($product_id, '_price', true);

                        $products_in_category[] = array(
                            'product_id' => $product_id,
                            'product_name' => $product_name,
                            'product_price' => $product_price,
                        );
                    }
                    wp_reset_postdata();
                }

                $category_data['products_in_category'] = $products_in_category;
            }

            $categories_data[] = $category_data;
        }

        return Zippy_Response_Handler::success(
            array('categories' => $categories_data),
            'Category items retrieved successfully.'
        );
    }
    public static function delete_support_booking_product(WP_REST_Request $request)
    {
        global $wpdb;

        $items_ids = $request->get_param('items_ids');

        if (empty($items_ids) || !is_array($items_ids)) {
            return Zippy_Response_Handler::error('Items IDs are required and should be an array.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';

        $deleted_items = [];
        $not_found_items = [];

        foreach ($items_ids as $items_id) {
            if (!is_numeric($items_id)) {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = 'product'",
                $items_id
            ));

            if ($exists > 0) {
                $result = $wpdb->delete(
                    $table_name,
                    array('items_id' => $items_id, 'mapping_type' => 'product'),
                    array('%d', '%s')
                );

                if ($result !== false) {
                    $product = wc_get_product($items_id);
                    if ($product) {
                        $deleted_items[] = [
                            'items_id' => $items_id,
                            'product_name' => $product->get_name(),
                            'product_price' => $product->get_price(),
                        ];
                    }
                }
            } else {
                $not_found_items[] = $items_id;
            }
        }

        if (empty($deleted_items)) {
            return Zippy_Response_Handler::error('No valid products were deleted.', ['not_found_items' => $not_found_items]);
        }

        return Zippy_Response_Handler::success(
            ['deleted_items' => $deleted_items, 'not_found_items' => $not_found_items],
            'Products deleted successfully.'
        );
    }
    public static function delete_support_booking_category(WP_REST_Request $request)
    {
        global $wpdb;

        $category_ids = $request->get_param('items_ids');

        if (empty($category_ids) || !is_array($category_ids)) {
            return Zippy_Response_Handler::error('Category IDs are required and should be an array.');
        }

        $table_name = $wpdb->prefix . 'product_booking_mapping';
        $deleted_categories = [];
        $not_found_categories = [];

        foreach ($category_ids as $category_id) {
            if (!is_numeric($category_id)) {
                continue;
            }

            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE items_id = %d AND mapping_type = 'category'",
                $category_id
            ));

            if ($exists > 0) {
                $result = $wpdb->delete(
                    $table_name,
                    array('items_id' => $category_id, 'mapping_type' => 'category'),
                    array('%d', '%s')
                );

                if ($result !== false) {
                    $category = get_term_by('id', $category_id, 'product_cat');
                    if ($category) {
                        $deleted_categories[] = [
                            'category_id' => $category_id,
                            'category_name' => $category->name,
                        ];
                    }
                }
            } else {
                $not_found_categories[] = $category_id;
            }
        }

        if (empty($deleted_categories)) {
            return Zippy_Response_Handler::error('No valid categories were deleted.', ['not_found_categories' => $not_found_categories]);
        }

        return Zippy_Response_Handler::success(
            ['deleted_categories' => $deleted_categories, 'not_found_categories' => $not_found_categories],
            'Categories deleted successfully.'
        );
    }
}
