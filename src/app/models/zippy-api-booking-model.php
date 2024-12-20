<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models;

defined('ABSPATH') or die();

class Zippy_Api_Booking_Model
{
  public static function get_booking_args()
  {
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

  public static function create_booking_args()
  {
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
  public static function get_remove_booking_args()
  {
    return array(
      'booking_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param) && intval($param) > 0;
        },
      ),
      'user_id' => array(
        'required' => true,
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param) && intval($param) > 0;
        },
      ),
    );
  }

  public static function get_update_booking_args()
  {
    return array(
      'booking_id' => array(
          'required' => true,
          'validate_callback' => function ($param, $request, $key) {
              return is_numeric($param) && intval($param) > 0;
          },
      ),
      'user_id' => array(
          'required' => true,
          'validate_callback' => function ($param, $request, $key) {
              return is_numeric($param) && intval($param) > 0;
          },
      ),
      'booking_start_date' => array(
          'required' => false,
          'sanitize_callback' => 'sanitize_text_field',
      ),
      'booking_end_date' => array(
          'required' => false,
          'sanitize_callback' => 'sanitize_text_field',
      ),
      'booking_status' => array(
          'required' => false,
          'sanitize_callback' => 'sanitize_text_field',
      ),
    );
  }
}
