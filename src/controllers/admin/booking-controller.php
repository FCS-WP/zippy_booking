<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

defined('ABSPATH') or die();

use WP_REST_Request;
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
  }

  public static function get_booking_list(WP_REST_Request $request)
  {
    var_dump(11111111111111);die;
  }
}
