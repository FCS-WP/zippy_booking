<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web;

use WP_REST_Request;
use Zippy_Booking\Utils\Zippy_Response_Handler; 

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

        if (empty($results)) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        return Zippy_Response_Handler::success(
            !empty($results) ? $results[0] : array(),
            'Bookings retrieved successfully.'
        );
    }
}
