<?php
/*
Plugin Name: Zippy Booking
Plugin URI: https://zippy.sg/
Description: Booking System, Manage Oder, Monthly Payment...
Version: 1.0 Author: Zippy SG
Author URI: https://zippy.sg/
License: GNU General Public
License v3.0 License
URI: https://zippy.sg/
Domain Path: /languages

Copyright 2024

*/

namespace Zippy_Booking;


defined('ABSPATH') or die('°_°’');

/* ------------------------------------------
 // Constants
 ------------------------------------------------------------------------ */
/* Set plugin version constant. */

if (!defined('ZIPPY_BOOKING_VERSION')) {
  define('ZIPPY_BOOKING_VERSION', '4.0');
}

/* Set plugin name. */

if (!defined('ZIPPY_BOOKING_NAME')) {
  define('ZIPPY_BOOKING_NAME', 'Zippy Booking');
}

if (!defined('ZIPPY_BOOKING_PREFIX')) {
  define('ZIPPY_BOOKING_PREFIX', 'zippy_booking');
}

if (!defined('ZIPPY_BOOKING_BASENAME')) {
  define('ZIPPY_BOOKING_BASENAME', plugin_basename(__FILE__));
}

/* Set constant path to the plugin directory. */

if (!defined('ZIPPY_BOOKING_DIR_PATH')) {
  define('ZIPPY_BOOKING_DIR_PATH', plugin_dir_path(__FILE__));
}

/* Set constant url to the plugin directory. */

if (!defined('ZIPPY_BOOKING_URL')) {
  define('ZIPPY_BOOKING_URL', plugin_dir_url(__FILE__));
}

/* Set constant enpoint to the plugin directory. */
if (!defined('ZIPPY_BOOKING_API_NAMESPACE')) {
  define('ZIPPY_BOOKING_API_NAMESPACE', 'zippy-booking/v1');
}

/* Booking table name */
if (!defined('ZIPPY_BOOKING_TABLE_NAME')) {
  define('ZIPPY_BOOKING_TABLE_NAME', 'fcs_data_bookings');
}

/* Booking Configs table name */
if (!defined('ZIPPY_BOOKING_CONFIG_TABLE_NAME')) {
  define('ZIPPY_BOOKING_CONFIG_TABLE_NAME', 'fcs_data_booking_configs');
}

/* Booking Product Mapping table name */
if (!defined('ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME')) {
  define('ZIPPY_BOOKING_PRODUCT_MAPPING_TABLE_NAME', 'fcs_data_product_booking_mapping');
}

/* Booking Product Mapping table name */
if (!defined('ZIPPY_BOOKING_LOG_TABLE_NAME')) {
  define('ZIPPY_BOOKING_LOG_TABLE_NAME', 'fcs_data_zippy_booking_log');
}

/* Booking status */
if (!defined('ZIPPY_BOOKING_BOOKING_STATUS_PENDING')) {
  define('ZIPPY_BOOKING_BOOKING_STATUS_PENDING', 'pending');
}

if (!defined('ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED')) {
  define('ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED', 'completed');
}

if (!defined('ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD')) {
  define('ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD', 'onhold');
}

if (!defined('ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED')) {
  define('ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED', 'cancelled');
}

if (!defined('ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING')) {
  define('ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING', 'processing');
}


// Booking type
if (!defined('ZIPPY_BOOKING_BOOKING_TYPE_SINGLE')) {
  define('ZIPPY_BOOKING_BOOKING_TYPE_SINGLE', 'single');
}
if (!defined('ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE')) {
  define('ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE', 'multiple');
}


// API Response Message
if (!defined('ZIPPY_BOOKING_SUCCESS')) {
  define('ZIPPY_BOOKING_SUCCESS', 'Operation Successful!');
}
if (!defined('ZIPPY_BOOKING_NOT_FOUND')) {
  define('ZIPPY_BOOKING_NOT_FOUND', 'Nothing Found!');
}
if (!defined('ZIPPY_BOOKING_ERROR')) {
  define('ZIPPY_BOOKING_ERROR', 'An Error Occurred!');
}


if (!defined('ZIPPY_BOOKING_API_TOKEN_NAME')) {
  define('ZIPPY_BOOKING_API_TOKEN_NAME', 'zippy_booking_api_token');
}

if (!defined('ZIPPY_BOOKING_API_TOKEN')) {
  define('ZIPPY_BOOKING_API_TOKEN', 'FEhI30q7ySHtMfzvSDo6RkxZUDVaQ1BBU3lBcGhYS3BrQStIUT09');
}


/* ------------------------------------------
// i18n
---------------------------- --------------------------------------------- */

// load_plugin_textdomain('zippy-booking-car', false, basename(dirname(__FILE__)) . '/languages');


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/* ------------------------------------------
// Includes
 --------------------------- --------------------------------------------- */
require ZIPPY_BOOKING_DIR_PATH . '/includes/autoload.php';
// require ZIPPY_BOOKING_DIR_PATH . 'vendor/plugin-update-checker/plugin-update-checker.php';

// require ZIPPY_BOOKING_DIR_PATH . 'vendor/autoload.php';

// use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

use  Zippy_Booking\Src\Admin\Zippy_Admin_Settings;

use Zippy_Booking\Src\Routers\Bookings\Zippy_Booking_Router;

use Zippy_Booking\Src\Middleware\Admin\Zippy_Booking_Permission;
use Zippy_Booking\Src\Web\Zippy_Booking_Web;

/**
 * Zippy Plugin update
 *
 */
// if (is_admin()) {


//   $zippyUpdateChecker = PucFactory::buildUpdateChecker(
//     'https://github.com/FCS-WP/zippy-booking-car/',
//     __FILE__,
//     'zippy-booking-car'
//   );

//   $zippyUpdateChecker->setBranch('production');

//   // $zippyUpdateChecker->setAuthentication('your-token-here');

//   add_action('in_plugin_update_message-' . ZIPPY_BOOKING_NAME . '/' . ZIPPY_BOOKING_NAME . '.php', 'plugin_name_show_upgrade_notification', 10, 2);
//   function plugin_name_show_upgrade_notification($current_plugin_metadata, $new_plugin_metadata)
//   {

//     if (isset($new_plugin_metadata->upgrade_notice) && strlen(trim($new_plugin_metadata->upgrade_notice)) > 0) {

//       echo sprintf('<span style="background-color:#d54e21;padding:10px;color:#f9f9f9;margin-top:10px;display:block;"><strong>%1$s: </strong>%2$s</span>', esc_attr('Important Upgrade Notice', 'exopite-multifilter'), esc_html(rtrim($new_plugin_metadata->upgrade_notice)));
//     }
//   }
// }

/**
 *
 * Init Zippy Booking
 */

Zippy_Admin_Settings::get_instance();

Zippy_Booking_Router::get_instance();

Zippy_Booking_Web::get_instance();

