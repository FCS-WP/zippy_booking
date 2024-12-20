<?php

/**
 * Bookings Router
 *
 *
 */

namespace Zippy_Booking\Src\Routers;


defined('ABSPATH') or die();

use WP_REST_Request;
use WP_Error;
use Zippy_Booking\Utils\Zippy_Response_Handler;
use Zippy_Booking\Src\Controllers\Admin\BookingController;

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
        register_rest_route('zippy-booking/v1', '/booking', array(
            'methods' => 'GET',
            'callback' =>  array($this, 'get_booking_with_product'),
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

        register_rest_route('zippy-booking/v1', '/booking', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_booking_with_product'),
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

    public function create_booking_with_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = 'fcs_data_bookings';

        $product_id = intval($request->get_param('product_id'));
        $user_id = intval($request->get_param('user_id'));
        $email = sanitize_email($request->get_param('email'));
        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));

        if (empty($product_id) || empty($email) || empty($booking_start_date) || empty($booking_end_date)) {
            return new WP_Error('missing_parameters', 'Missing request parameter.', array('status' => 'error'));
        }

        $product = wc_get_product($product_id);
        if (!$product) {
            return new WP_Error('invalid_product', 'Product does not exist.', array('status' => 'error'));
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
                    return new WP_Error('user_creation_failed', 'User creation failed.', array('status' => 'error'));
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
    public function get_booking_with_product(WP_REST_Request $request)
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
            return new WP_Error('no_booking', 'Booking not found.', array('status' => 404));
        }

        return Zippy_Response_Handler::success(
            array(
                $results,
            ),
            'Bookings retrieved successfully.'
        );
    }
}
