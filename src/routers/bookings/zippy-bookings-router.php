<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers\Bookings;

use Zippy_Booking\Src\Controller\Zippy_Booking_Controller;

use Zippy_Booking\Src\App\Models\Zippy_Api_Booking_Model;

use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Controller;


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
            'args' => Zippy_Api_Booking_Model::get_booking_args(),
            'permission_callback' => '__return_true',
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'POST',
            'callback' => array(new Zippy_Booking_Controller(), 'create_booking_with_product'),
            'args' => Zippy_Api_Booking_Model::create_booking_args(),
            'permission_callback' => '__return_true',
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/bookings', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Controller::class, 'get_booking_list_of_a_product'),
            'args' => Zippy_Api_Booking_Model::get_bookings_args(),
            'permission_callback' => '__return_true',
        ));
    }
}
