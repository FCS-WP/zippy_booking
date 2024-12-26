<?php

/**
 * Bookings FontEnd Form
 *
 *
 */

namespace Zippy_Booking\Src\Web;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;

class Zippy_Booking_Web
{
  protected static $_instance = null;

  /**
   * @return Zippy_Booking_Web
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
    /* Set timezone SG */
    date_default_timezone_set('Asia/Singapore');

    /* Booking Assets  */
    add_action('wp_enqueue_scripts', array($this, 'booking_assets'));
    add_shortcode('zippy_booking_form',  array($this, 'zippy_booking_form_shortcode'));
  }

  public function booking_assets()
  {
    // if (!is_archive() && !is_single() && !is_checkout()) return;
    $version = time();

    $current_user_id = get_current_user_id();
    $user_info = get_userdata($current_user_id);
    // Form Assets
    wp_enqueue_script('booking-js', ZIPPY_BOOKING_URL . '/assets/dist/js/web.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_BOOKING_URL . '/assets/dist/css/web.min.css', [], $version);
    wp_localize_script('booking-js', 'admin_data', array(
      'userID' => $current_user_id,
      'user_email' => $user_info->user_email
    ));

  }
  function zippy_booking_form_shortcode() {
    // Output content for the shortcode
    return '<div id="zippy-root">Loading booking app...</div>';
  }
  
}
