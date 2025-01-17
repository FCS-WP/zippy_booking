<?php

/**
 * Uninstall
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;

class Zippy_Uninstall
{
  private static $_instance = null;

  /**
   * @return Zippy_Uninstall
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
    /* Delete Table Booking */
    register_uninstall_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_table'));

    /* Delete Table Booking Config */
    register_uninstall_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_config_table'));

    register_uninstall_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_product_booking_mapping'));

    register_uninstall_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_zippy_booking_log_table'));

    /* Delete Zippy API Token */
    register_uninstall_hook(ZIPPY_BOOKING_BASENAME, array($this, 'remove_zippy_booking_api_token'));
  }


  function delete_booking_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'bookings';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }

  function delete_booking_config_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'booking_configs';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
  function delete_product_booking_mapping()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'products_booking';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
  function remove_zippy_booking_api_token()
  {
    if (get_option(ZIPPY_BOOKING_API_TOKEN_NAME) == true) {
      delete_option(ZIPPY_BOOKING_API_TOKEN_NAME);
    }
  }

  function delete_zippy_booking_log_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'zippy_booking_log';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
}
