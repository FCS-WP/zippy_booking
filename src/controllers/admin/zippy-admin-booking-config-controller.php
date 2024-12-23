<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use DateTime;
use Zippy_Booking\Utils\Zippy_Utils_Core;
use Zippy_Booking\Src\App\Zippy_Response_Handler;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Config_Controller{
    public static function zippy_booking_create_configs(WP_REST_Request $request){
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $open_at        = $request["open_at"];
        $close_at       = $request["close_at"];
        $weekdays       = $request["weekdays"];

        // Rules
        $required_fields = [
            "booking_type"  => ["required" => true, "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "open_at"       => ["required" => true, "type" => "datetime"],
            "close_at"      => ["required" => true, "type" => "datetime"],
            "weekdays"      => ["required" => true, "type" => "array"],
        ];

        // Validate main required fields
        foreach ($required_fields as $field => $rules) {
            if ($rules['required'] && (!isset($request[$field]) || empty($request[$field]))) {
                return Zippy_Response_Handler::error("$field is required.");
            }
    
            if ($field === "booking_type" && isset($request[$field])) {
                if (!in_array($request[$field], $rules['allowed_values'], true)) {
                    return Zippy_Response_Handler::error("$field must be one of: " . implode(", ", $rules['allowed_values']));
                }
            }
    
            if (($field === "open_at" || $field === "close_at") && isset($request[$field])) {
                $datetime = DateTime::createFromFormat('H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('H:i:s') !== $request[$field]) {
                    return Zippy_Response_Handler::error("$field must be a valid datetime in the format H:i:s.");
                }
            }
        }
    
        // Duration Validate
        if ($booking_type == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            if (empty($duration)) {
                return Zippy_Response_Handler::error("duration is required when booking_type is " . ZIPPY_BOOKING_BOOKING_TYPE_SINGLE);
            } elseif (!is_numeric($duration) || $duration <= 0) {
                return Zippy_Response_Handler::error("duration must be a positive number.");
            }
        }


        /* Insert */
        global $wpdb;
        $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

        $result = $wpdb->get_results("SELECT * from $table_name");
        if(empty($result)){
            $data = [
                'booking_type'  => $booking_type,
                'weekdays'      => serialize($weekdays),
                'open_at'       => $open_at,
                'close_at'      => $close_at,
                'duration'      => $duration,
            ];
            $wpdb->insert($table_name, $data);
            return Zippy_Response_Handler::success($data);
        }
        return Zippy_Response_Handler::error("Configs already exists!");
    }


    public static function zippy_booking_update_configs(WP_REST_Request $request){
        
        $booking_id     = $request["id"];
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $open_at        = $request["open_at"];
        $close_at       = $request["close_at"];
        $weekdays       = $request["weekdays"];

        /* Rules */
        $required_fields = [
            "id"            => ["required" => true, "type" => "integer"],
            "booking_type"  => ["required" => true, "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "open_at"       => ["required" => true, "type" => "datetime"],
            "close_at"      => ["required" => true, "type" => "datetime"],
            "weekdays"      => ["required" => true, "type" => "array"],
            
        ];

        /* Validate main required fields */
        foreach ($required_fields as $field => $rules) {
            if ($rules['required'] && (!isset($request[$field]) || empty($request[$field]))) {
                return Zippy_Response_Handler::error("$field is required.");
            }
    
            if ($field === "booking_type" && isset($request[$field])) {
                if (!in_array($request[$field], $rules['allowed_values'], true)) {
                    return Zippy_Response_Handler::error("$field must be one of: " . implode(", ", $rules['allowed_values']));
                }
            }
    
            if (($field === "open_at" || $field === "close_at") && isset($request[$field])) {
                $datetime = DateTime::createFromFormat('H:i:s', $request[$field]);
                if (!$datetime || $datetime->format('H:i:s') !== $request[$field]) {
                    return Zippy_Response_Handler::error("$field must be a valid datetime in the format H:i:s.");
                }
            }
        }
    
        // Duration Validate
        if ($booking_type == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            if (empty($duration)) {
                return Zippy_Response_Handler::error("duration is required when booking_type is " . ZIPPY_BOOKING_BOOKING_TYPE_SINGLE);
            } elseif (!is_numeric($duration) || $duration <= 0) {
                return Zippy_Response_Handler::error("duration must be a positive number.");
            }
        }

        
        /* Update */
        global $wpdb;
        $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

        $result = $wpdb->get_results("SELECT * from $table_name WHERE id=$booking_id");
        if(!empty($result)){
            $data = [
                'booking_type'  => $booking_type,
                'weekdays'      => serialize($weekdays),
                'open_at'       => $open_at,
                'close_at'      => $close_at,
                'duration'      => $duration,
            ];
            $wpdb->update($table_name, $data, ["id" => $booking_id]);
            return Zippy_Response_Handler::success($data);
        }
        return Zippy_Response_Handler::error("No Config found!");
    }
}