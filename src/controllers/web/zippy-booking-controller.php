<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web;

use WP_REST_Request;

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

        if (empty($product_id) || empty($email) || empty($booking_start_date) || empty($booking_end_date)) {
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

        $wpdb->insert($table_name, array(
            'user_id' => $user_id,
            'email' => $email,
            'product_id' => $product_id,
            'booking_start_date' => $booking_start_date,
            'booking_end_date' => $booking_end_date,
            'booking_status' => 'pending',
        ));

        return Zippy_Response_Handler::success(
            array(
                'user_id' => $user_id,
                'email' => $email,
                'product_id' => $product_id,
                'booking_start_date' => $booking_start_date,
                'booking_end_date' => $booking_end_date,
                'booking_status' => 'pending'
            ),
            'Booking created successfully.'
        );
    }
    public static function get_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $booking_id = $request->get_param('booking_id');
        $email = $request->get_param('email');
        $product_id = $request->get_param('product_id');

        $query = "SELECT * FROM $table_name WHERE 1=1";

        if ($booking_id) {
            $query .= $wpdb->prepare(" AND ID = %d", $booking_id);
        }
        if ($email) {
            $query .= $wpdb->prepare(" AND email = %s", $email);
        }
        if ($product_id) {
            $query .= $wpdb->prepare(" AND product_id = %d", $product_id);
        }

        $results = $wpdb->get_results($query);
        var_dump($results);

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
        if (!current_user_can('administrator') && $booking->user_id != $user_id) {
            return Zippy_Response_Handler::error('You do not have permission to update this booking.');
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

        $user_id_from_request = intval($request->get_param('user_id'));
        $booking_id = intval($request->get_param('booking_id'));

        if (empty($user_id_from_request) || empty($booking_id)) {
            return Zippy_Response_Handler::error('Booking ID or User ID is missing.');
        }

        $booking = $wpdb->get_row(
            $wpdb->prepare("SELECT user_id FROM $table_name WHERE ID = %d", $booking_id)
        );

        if (!$booking || $booking->user_id !== $user_id_from_request) {
            return Zippy_Response_Handler::error('You do not have permission to update this booking.');
        }

        if (current_user_can('administrator') || get_current_user_id() === $user_id_from_request) {
            return true;
        } else {
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

        $added_item = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
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

        $items = $wpdb->get_results("SELECT items_id, mapping_type FROM {$table_name}", ARRAY_A);

        if (empty($items)) {
            return Zippy_Response_Handler::error('No items found in the database.');
        }

        return Zippy_Response_Handler::success($items, 'Items retrieved successfully.');
    }
    public static function handle_support_booking_category(WP_REST_Request $request)
    {
        global $wpdb;

        $items_id = $request->get_param('items_id');
        $mapping_type = $request->get_param('mapping_type');

        if (empty($items_id)) {
            return Zippy_Response_Handler::error('Items ID is required.');
        }

        if ($mapping_type !== 'category') {
            return Zippy_Response_Handler::error('Mapping type must be "category".');
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

        $added_item = array(
            'items_id' => $items_id,
            'mapping_type' => $mapping_type,
        );

        return Zippy_Response_Handler::success($added_item, 'Category booking mapping created successfully.');
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
                $items_id, $mapping_type
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
                $added_items[] = array(
                    'items_id' => $items_id,
                    'mapping_type' => $mapping_type,
                );
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
    
}
