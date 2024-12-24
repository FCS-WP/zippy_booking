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
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Config_Controller{
    public static function zippy_booking_create_configs(WP_REST_Request $request){
        // Rules
         $required_fields = [
            "booking_type"  => ["required" => true, "data_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "open_at"       => ["required" => true, "data_type" => "time"],
            "close_at"      => ["required" => true, "data_type" => "time"],
            "weekdays"      => ["required" => true, "data_type" => "array"],
        ];


        // Validate Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if(!empty($validate)){
            return Zippy_Response_Handler::error($validate);
        }

        // Duration Validate
        if ($request["booking_type"] == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            if (empty($request["duration"])) {
                return Zippy_Response_Handler::error("duration is required when booking_type is " . ZIPPY_BOOKING_BOOKING_TYPE_SINGLE);
            } elseif (!is_numeric($request["duration"]) || $request["duration"] <= 0) {
                return Zippy_Response_Handler::error("duration must be a positive number.");
            }
        }
        
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $open_at        = $request["open_at"];
        $close_at       = $request["close_at"];
        $weekdays       = $request["weekdays"];


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
        
        /* Rules */
        $required_fields = [
            "id"            => ["required" => true, "data_type" => "number"],
            "booking_type"  => ["required" => true, "data_type" => "string", "field_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "open_at"       => ["required" => true, "data_type" => "time"],
            "close_at"      => ["required" => true, "data_type" => "time"],
            "weekdays"      => ["required" => true, "data_type" => "array"],
            
        ];


        // Validate request fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

        if(!empty($validate)){
            return Zippy_Response_Handler::error($validate);
        }

        // Duration Validate
        if ($request["booking_type"] == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            if (empty($request["duration"])) {
                return Zippy_Response_Handler::error("duration is required when booking_type is " . ZIPPY_BOOKING_BOOKING_TYPE_SINGLE);
            } elseif (!is_numeric($request["duration"]) || $request["duration"] <= 0) {
                return Zippy_Response_Handler::error("duration must be a positive number.");
            }
        }


        $booking_id     = $request["id"];
        $booking_type   = $request["booking_type"];
        $duration       = $request["duration"];
        $open_at        = $request["open_at"];
        $close_at       = $request["close_at"];
        $weekdays       = $request["weekdays"];
        
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
        return Zippy_Response_Handler::error(ZIPPY_BOOKING_NOT_FOUND);
    }


    public static function zippy_booking_get_configs(WP_REST_Request $request){
        global $wpdb;
        $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

        $query = "SELECT * FROM $table_name WHERE 1=1";
        $results = $wpdb->get_results($query);

        $data = $results[0];

        if(empty($data)){
            return Zippy_Response_Handler::success([], ZIPPY_BOOKING_NOT_FOUND);
        }

        !empty($data->weekdays) ? $data->weekdays = unserialize($data->weekdays) : "";

        return Zippy_Response_Handler::success($results);
    }
}