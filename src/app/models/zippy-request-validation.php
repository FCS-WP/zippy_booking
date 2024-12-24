<?php

/**
 * Request Validation
 *
 * @package Shin
 */

namespace Zippy_Booking\App\Models;

defined('ABSPATH') or die();

use DateTime;

class Zippy_Request_Validation
{
  // Validate email
  public static function is_email_field($required){
    
    $required = gettype($required) == "boolean" ? $required : false;

    return array(
      'required' => $required,
      'validate_callback' => function ($param) {
          return is_email($param);
      }
    );
  }


  // Validate numberic
  public static function is_numeric_field($required){
    
    $required = gettype($required) == "boolean" ? $required : false;

    return array(
      'required' => $required,
      'validate_callback' => function ($param) {
        return is_numeric($param);
      }
    );
  }

  // Validate string
  public static function is_string_field($required){
    $required = gettype($required) == "boolean" ? $required : false;

    return array(
      'required' => $required,
      'validate_callback' => function ($param) {
          return is_string($param);
      }
    );
  }

  public static function validateDate($date, $format = 'Y-m-d H:i:s'){
      $d = DateTime::createFromFormat($format, $date);
      return $d && $d->format($format) == $date;
  }
}
