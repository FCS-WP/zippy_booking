<?php

/**
 * Uninstaller
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

class Zippy_Uninstaller
{

  public static function delete_booking_table(){
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
