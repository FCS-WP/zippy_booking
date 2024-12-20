<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers;

use Zippy_Booking\Src\Controllers\Web\Zippy_Booking_Controller;
use Zippy_Booking\Src\Controllers\Web\Zippy_Booking_Params;

defined('ABSPATH') or die();


class Zippy_Bookings_Router
{
    protected static $_instance = null;

    /**
     * @return Zippy_Bookings_Router
     */

    public static function get_instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'zippy_booking_init_api'));
    }


    public function zippy_booking_init_api()
    {
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Controller::class, 'get_booking_with_product'],
            'args' => Zippy_Booking_Params::get_booking_with_product_args(),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'create_booking_with_product'],
            'args' => Zippy_Booking_Params::create_booking_with_product_args(),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/bookings', array(
            'methods' => 'GET',
            'callback' => [BookingController::class, 'get_booking_list'],
            'args' => array(
                'status' => array(
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return is_string($param);
                    }
                ),
                'product_id' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
            ),
            'permission_callback' => '__return_true',
        ));
    }
}
