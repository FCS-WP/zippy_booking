<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\App\Zippy_Response_Handler;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Controller
{
    public static function get_booking_list_of_a_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;

        $query_param = [
            "product_id" => sanitize_text_field($request->get_param('product_id')),
            "booking_status" => sanitize_text_field($request->get_param('booking_status')),
            "email" => sanitize_text_field($request->get_param('email')),
            "user_id" => sanitize_text_field($request->get_param('user_id')),
        ];

        $query = "SELECT * FROM $table_name WHERE 1=1";
        
        foreach ($query_param as $key => $value) {
            if ($value !== "" && $value !== null) {
                $query .= $wpdb->prepare(" AND $key = %s", $value);
            }
        }

        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));

        if($booking_end_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_end_date) <= %s ", $booking_end_date);
        }

        if($booking_start_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_start_date) >= %s ", $booking_start_date);
        }
    
        $results = $wpdb->get_results($query);

        if (empty($results)) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        return Zippy_Response_Handler::success(!empty($results) ? $results : []);

    }
}
