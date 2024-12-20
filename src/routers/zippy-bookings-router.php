<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers;

use Zippy_Booking\Src\Controller\Zippy_Booking_Controller;
use Zippy_Booking\Utils\Zippy_Request_Validation;
use Zippy_Booking\Src\Controllers\Admin\Booking_Controller;

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
            'callback' => array(new Zippy_Booking_Controller(), 'get_booking_with_product'),
            'args' => array(
                'booking_id' => array(
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
                'email' => array(
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return is_email($param);
                    }
                ),
                'product_id' => array(
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
            ),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'POST',
            'callback' => array(new Zippy_Booking_Controller(), 'create_booking_with_product'),
            'args' => array(
                'product_id' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
                'user_id' => array(
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
                'email' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_email($param);
                    }
                ),
                'booking_start_date' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return strtotime($param) !== false;
                    }
                ),
                'booking_end_date' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return strtotime($param) !== false;
                    }
                ),
            ),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/bookings', array(
            'methods' => 'GET',
            'callback' => [Booking_Controller::class, "get_booking_list"],
            'args' => array(
                'status' => Zippy_Request_Validation::is_string_field(false),
                'product_id' => Zippy_Request_Validation::is_numeric_field(true),
            ),
            'permission_callback' => '__return_true',
        ));

    }
}
