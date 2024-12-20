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

        $product_id = intval($request->get_param('product_id'));
        $status = sanitize_text_field($request->get_param('status'));

        $product = wc_get_product($product_id);
        if (!$product) {
            return Zippy_Response_Handler::error('Product does not exist.');
        }

        $query = "SELECT * FROM $table_name WHERE 1=1";
        
        if ($product_id) {
            $query .= $wpdb->prepare(" AND product_id = %d", $product_id);
        }

        if ($status) {
            $query .= $wpdb->prepare(" AND booking_status = %s", $status);
        }

        $results = $wpdb->get_results($query);

        if (empty($results)) {
            return Zippy_Response_Handler::error('Booking not found.');
        }

        return Zippy_Response_Handler::success(!empty($results) ? $results : []);

    }
}
