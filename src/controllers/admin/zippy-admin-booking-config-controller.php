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
        global $wpdb;
        $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
        
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $start_time     = $request["start_time"];
        $end_time       = $request["end_time"];
        $weekdays       = $request["weekdays"];

        // Rules
        $required_fields = [
            "booking_type"  => ["required" => true, "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "start_time"    => ["required" => true, "type" => "datetime"],
            "end_time"      => ["required" => true, "type" => "datetime"],
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
    
            if (($field === "start_time" || $field === "end_time") && isset($request[$field])) {
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


        $result = $wpdb->get_results("SELECT * from $table_name");
        if(empty($result)){
            $data = [
                'booking_type'  => $booking_type,
                'weekdays'      => serialize($weekdays),
                'open_at'       => $start_time,
                'close_at'      => $end_time,
                'duration'      => $duration,
            ];
            $wpdb->insert($table_name, $data);
            return Zippy_Response_Handler::success($data);
        }
        return Zippy_Response_Handler::error("Configs already exists!");
    }


    public static function zippy_booking_update_configs(WP_REST_Request $request){
        global $wpdb;
        $table_name     = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
        
        $booking_id     = $request["id"];
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $start_time     = $request["start_time"];
        $end_time       = $request["end_time"];
        $weekdays       = $request["weekdays"];

        // Rules
        $required_fields = [
            "id"            => ["required" => true, "type" => "integer"],
            "booking_type"  => ["required" => true, "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "start_time"    => ["required" => true, "type" => "datetime"],
            "end_time"      => ["required" => true, "type" => "datetime"],
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
    
            if (($field === "start_time" || $field === "end_time") && isset($request[$field])) {
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


        $result = $wpdb->get_results("SELECT * from $table_name WHERE id=$booking_id");
        if(!empty($result)){
            $data = [
                'booking_type'  => $booking_type,
                'weekdays'      => serialize($weekdays),
                'open_at'       => $start_time,
                'close_at'      => $end_time,
                'duration'      => $duration,
            ];
            $res = $wpdb->update($table_name, $data, ["id" => $booking_id]);
            if($res == 1){
                return Zippy_Response_Handler::success($data);
            }
        }
        return Zippy_Response_Handler::error("No Config found!");
    }
}