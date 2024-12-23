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
        
        $valid_token = hash('sha256', ZIPPY_BOOKING_NAME);;
        
        // Valid Token
        if ($token === $valid_token) {
            return true;
        }

        return false;
    }
}