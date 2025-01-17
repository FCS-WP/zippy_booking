<?php

if (!defined('ZIPPY_BOOKING_DIR_PATH')) {
    define('ZIPPY_BOOKING_DIR_PATH', plugin_dir_path(__FILE__));
}

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}


require ZIPPY_BOOKING_DIR_PATH . '/includes/autoload.php';

use Zippy_Booking\Src\Admin\Zippy_Uninstaller;

Zippy_Uninstaller::delete_booking_table();