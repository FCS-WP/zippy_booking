<?php

/**
 * Bookings Admin Settings
 *
 *
 */

namespace Zippy_Booking\Src\Admin;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;
use  WC_Order_Item_Product;

class Zippy_Admin_Settings
{
  protected static $_instance = null;

  /**
   * @return Zippy_Admin_Settings
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

    /* Register Menu Admin Part */
    add_action('admin_menu',  array($this, 'zippy_booking_page'));

    /* Register Assets Admin Part */
    add_action('admin_enqueue_scripts', array($this, 'admin_booking_assets'));

    /* Create New Table For Booking */
    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_booking_table'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_product_booking_table'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_booking_configs_table'));

    /* Delete Table Booking */
    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_table'));
  }

  public function admin_booking_assets()
  {
    $version = time();
    $current_user_id = get_current_user_id();
    //lib
    // wp_enqueue_style('admin-jquery-ui-css', ZIPPY_BOOKING_URL . 'assets/libs/jquery-ui/jquery-ui.min.css', [], $version);
    // Pass the user ID to the script
    wp_enqueue_script('admin-booking-js', ZIPPY_BOOKING_URL . '/assets/dist/js/admin.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_BOOKING_URL . '/assets/dist/css/admin.min.css', [], $version);





    wp_localize_script('booking-js-current-id', 'admin_id', array(
      'userID' => $current_user_id,
    ));
  }

  public function zippy_booking_page()
  {
    add_menu_page('Zippy Bookings', 'Zippy Bookings', 'manage_options', 'zippy-bookings', array($this, 'render'), 'dashicons-list-view', 6);
    // SubPage 
    add_submenu_page('zippy-bookings', 'Bookings', 'Bookings', 'manage_options', 'bookings', array($this, 'render'));
    add_submenu_page('zippy-bookings', 'Calander', 'Calander', 'manage_options', 'calander', array($this, 'render'));
    add_submenu_page('zippy-bookings', 'Products Booking', 'Products Booking', 'manage_options', 'products-booking', array($this, 'render'));
    add_submenu_page('zippy-bookings', 'Settings', 'Settings', 'manage_options', 'settings', array($this, 'render'));
    add_submenu_page('zippy-bookings', 'Customize', 'Customize', 'manage_options', 'customize', array($this, 'render'));
  }

  function create_booking_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'bookings';

    $charset_collate = $wpdb->get_charset_collate();

    // SQL query to create the table
    $sql = "CREATE TABLE $table_name (
      ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT(20) UNSIGNED DEFAULT NULL,
      email VARCHAR(255) NOT NULL,
      product_id BIGINT(20) UNSIGNED NOT NULL,
      booking_start_date DATETIME NOT NULL,
      booking_end_date DATETIME NOT NULL,
      booking_status VARCHAR(50) NOT NULL,
      PRIMARY KEY  (ID),
      KEY product_id (product_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    dbDelta($sql);
  }

  function create_product_booking_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'product_booking_mapping';

    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
      $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            product_id BIGINT(20) NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            PRIMARY KEY  (id)
        );";

      require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
      dbDelta($sql);
    }
  }
  function create_booking_configs_table()
  {
    global $wpdb;
    $table_name = $wpdb->prefix . 'booking_configs';

    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
      $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            booking_type VARCHAR NOT NULL,
            duration VARCHAR NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            PRIMARY KEY  (id)
        );";

      require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
      dbDelta($sql);
    }
  }

  function delete_booking_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'bookings';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }

  public function render()
  {
    echo Zippy_Utils_Core::get_template('booking-dashboard.php', [], dirname(__FILE__), '/templates');
  }
}
