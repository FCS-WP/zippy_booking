<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Middleware\Admin;


defined('ABSPATH') or die();

use Zippy_Booking\Src\App\Zippy_Response_Handler;

class Zippy_Booking_Permission
{
    protected static $_instance = null;

    /**
     * @return Zippy_Booking_Permission
     */

    public static function get_instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    public static function zippy_permission_callback() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? trim(str_replace('Bearer', '', $headers['Authorization'])) : '';
        
        $valid_token = get_option(ZIPPY_BOOKING_API_TOKEN_NAME);

        // Valid Token
        return $token === $valid_token;
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