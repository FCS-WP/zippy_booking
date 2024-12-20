<?php

/**
 * API Args Handler
 *
 * @package Shin
 */

namespace Zippy_Booking\Src\App\Models;

defined('ABSPATH') or die();

use WP_REST_Response;
use Zippy_Booking\App\Models\Zippy_Request_Validation;

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
  public static function get_bookings_args()
  {
    return array(
      'product_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_numeric($param);
          return true;
        }
      ),
      'booking_status' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_string($param);
          return true;
        }
      ),
      'booking_start_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return Zippy_Request_Validation::validateDate($param);
          return true;
        }
      ),
      'booking_end_date' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return Zippy_Request_Validation::validateDate($param);
          return true;
        }
      ),
      'email' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_email($param);
          return true;
        }
      ),
      'user_id' => array(
        'required' => false,
        'validate_callback' => function ($param) {
          // return is_string($param);
          return true;
        }
      ),
    );
  }
}