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
        $order->update_meta_data('booking_start_date', $booking_start_date);
        $order->update_meta_data('booking_end_date', $booking_end_date);
        $order->update_meta_data('booking_start_time', $booking_start_time);
        $order->update_meta_data('booking_end_time', $booking_end_time);
        $order->save();

        $order->update_status('on-hold');
        
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
                'order_name' => $custom_order_name,
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

        $order_id = $booking->order_id;

        if ($order_id) {
            $order = wc_get_order($order_id);

            if ($order) {
                switch ($booking_status) {
                    case 'pending':
                        $order->update_status('on-hold');
                        break;
                    case 'approve':
                        $order->update_status('pending');
                        break;
                    case 'completed':
                        $order->update_status('completed');
                        break;
                    case 'cancel':
                        $order->update_status('cancelled');
                        break;
                }

                $order->save();
            }
        }

        return Zippy_Response_Handler::success(
            array(
                'booking_id' => $booking_id,
                'updated_fields' => $data_to_update
            ),
            'Booking and Order updated successfully.'
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
}
