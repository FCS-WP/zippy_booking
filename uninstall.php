<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}


require ZIPPY_BOOKING_DIR_PATH . '/includes/autoload.php';

use Zippy_Booking\Src\Admin\Zippy_Uninstall;

Zippy_Uninstall::get_instance();