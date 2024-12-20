<?php

/**
 * API ResponHandler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\Controllers\Web;


defined('ABSPATH') or die();

class Zippy_Booking_Params
{
    public static function get_booking_with_product_args() {
        return array(
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
        );
    }

    public static function create_booking_with_product_args() {
        return array(
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
        );
    }
}