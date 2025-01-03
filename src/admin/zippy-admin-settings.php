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
    
    /* Create Zippy API Token */
    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'generate_zippy_booking_api_token'));

    register_activation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'create_zippy_booking_log_table'));

    /* Delete Table Booking */
    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_table'));

    /* Delete Table Booking Config */
    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_booking_config_table'));

    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_product_booking_mapping'));

    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'delete_zippy_booking_log_table'));

    /* Delete Zippy API Token */
    register_deactivation_hook(ZIPPY_BOOKING_BASENAME, array($this, 'remove_zippy_booking_api_token'));
    
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
    add_submenu_page('zippy-bookings', 'Bookings', 'Bookings', 'manage_options', 'bookings', array($this, 'bookings_render'));
    add_submenu_page('zippy-bookings', 'Calander', 'Calander', 'manage_options', 'calander', array($this, 'render'));
    add_submenu_page('zippy-bookings', 'Products Booking', 'Products Booking', 'manage_options', 'products-booking', array($this, 'render_products_booking'));
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
      order_id BIGINT(20) UNSIGNED NOT NULL,
      booking_start_date DATE NOT NULL,
      booking_start_time TIME NOT NULL,
      booking_end_date DATE NOT NULL,
      booking_end_time TIME NOT NULL,
      booking_status VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY  (ID),
      KEY product_id (product_id),
      FOREIGN KEY (order_id) REFERENCES {$wpdb->prefix}wc_orders(ID) ON DELETE CASCADE
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
            items_id BIGINT(20) NOT NULL,
            mapping_type VARCHAR(255) NOT NULL,
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
            booking_type VARCHAR(255) NOT NULL,
            duration VARCHAR(255) NULL,
            store_email VARCHAR(255) NULL,
            allow_overlap BOOLEAN NOT NULL,
            store_working_time LONGTEXT NOT NULL,
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

  function delete_booking_config_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'booking_configs';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
  function delete_product_booking_mapping()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'product_booking_mapping';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }


  public function render()
  {
    echo Zippy_Utils_Core::get_template('booking-dashboard.php', [], dirname(__FILE__), '/templates');
  }

  public function bookings_render()
  {
    echo Zippy_Utils_Core::get_template('bookings.php', [], dirname(__FILE__), '/templates');
  }

  public function render_products_booking ()
  {
    echo Zippy_Utils_Core::get_template('booking-products.php', [], dirname(__FILE__), '/templates');
  }

  function generate_zippy_booking_api_token(){
    if(get_option(ZIPPY_BOOKING_API_TOKEN_NAME) == false){
      add_option(ZIPPY_BOOKING_API_TOKEN_NAME, ZIPPY_BOOKING_API_TOKEN);
    }
  }
  function remove_zippy_booking_api_token(){
    if(get_option(ZIPPY_BOOKING_API_TOKEN_NAME) == true){
      delete_option(ZIPPY_BOOKING_API_TOKEN_NAME);
    }
  }


  function create_zippy_booking_log_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'zippy_booking_log';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        action VARCHAR(255) NOT NULL,
        details LONGTEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        message LONGTEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
  }

  function delete_zippy_booking_log_table()
  {
    global $wpdb;

    $table_name = $wpdb->prefix . 'zippy_booking_log';

    $wpdb->query("DROP TABLE IF EXISTS $table_name");
  }
}
