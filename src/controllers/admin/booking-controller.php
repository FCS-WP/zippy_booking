<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Controllers;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;

class BookingController
{
  protected static $_instance = null;

  /**
   * @return BookingController
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
    /* Admin Booking List API  */
    add_action('rest_api_init', array($this, 'get_booking_list'));
  }

  public function get_booking_list()
  {
    register_rest_route('zippy-booking/v1', '/bookings', [
      'methods' => 'GET',
      'callback' => [$this, 'get_data'],
      'permission_callback' => '__return_true',
    ]);
  }

  public function get_data(){
    var_dump(1111111111111);
  }
}
