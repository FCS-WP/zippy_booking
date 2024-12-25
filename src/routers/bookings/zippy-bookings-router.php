<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers\Bookings;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;

use Zippy_Booking\Src\Controllers\Web\Zippy_Booking_Controller;

use Zippy_Booking\Src\App\Models\Zippy_Api_Booking_Model;


/* Zippy_Admin_Booking_Controller */
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Controller;


/* Zippy_Admin_Booking_Config_Controller */
use Zippy_Booking\Src\Controllers\Admin\Zippy_Admin_Booking_Config_Controller;


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

        /* GET a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Controller::class, 'get_booking_with_product'],
            'args' => Zippy_Api_Booking_Model::get_booking_args(),
            'permission_callback' => '__return_true',
        ));


        /* CREATE a Booking */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/booking', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'create_booking_with_product'],
            'args' => Zippy_Api_Booking_Model::create_booking_args(),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));


        /* GET Booking List */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/bookings', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Controller::class, 'get_booking_list_of_a_product'),
            'args' => Zippy_Api_Booking_Model::get_bookings_args(),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));


        /* GET Booking Stats */
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/stats', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Controller::class, 'get_booking_stats'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/remove-booking', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Controller::class, 'delete_booking'],
            'args' => Zippy_Api_Booking_Model::get_remove_booking_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/update-booking', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'update_booking'],
            'args' => Zippy_Api_Booking_Model::get_update_booking_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/product', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'handle_support_booking_product'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_product_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/products', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'handle_support_booking_products'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_products_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/products', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Controller::class, 'get_all_support_booking_products'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],

        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/product', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Controller::class, 'delete_support_booking_product'],
            'args' => Zippy_Api_Booking_Model::get_delete_product_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));


        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/category', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'handle_support_booking_category'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_category_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/categories', array(
            'methods' => 'POST',
            'callback' => [Zippy_Booking_Controller::class, 'handle_support_booking_categories'],
            'args' => Zippy_Api_Booking_Model::get_support_booking_categories_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));

        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/categories', array(
            'methods' => 'GET',
            'callback' => [Zippy_Booking_Controller::class, 'get_all_support_booking_categories'],
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/support-booking/category', array(
            'methods' => 'DELETE',
            'callback' => [Zippy_Booking_Controller::class, 'delete_support_booking_category'],
            'args' => Zippy_Api_Booking_Model::get_delete_category_args(),
            'permission_callback' => [Zippy_Booking_Controller::class, 'check_permission'],
        ));




        /* Plugin Config */
        // CREATE plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/configs', array(
            'methods' => 'POST',
            'callback' => array(Zippy_Admin_Booking_Config_Controller::class, 'zippy_booking_create_configs'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));


        // UPDATE plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/configs', array(
            'methods' => 'PUT',
            'callback' => array(Zippy_Admin_Booking_Config_Controller::class, 'zippy_booking_update_configs'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));


        // GET plugin config
        register_rest_route(ZIPPY_BOOKING_API_NAMESPACE, '/configs', array(
            'methods' => 'GET',
            'callback' => array(Zippy_Admin_Booking_Config_Controller::class, 'zippy_booking_get_configs'),
            'permission_callback' => array(Zippy_Booking_Permission::class, 'zippy_permission_callback'),
        ));
    }
}
