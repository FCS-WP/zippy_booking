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
use Zippy_booking\Src\App\Models\Zippy_Log_Action;

defined('ABSPATH') or die();


class Zippy_Admin_Booking_Config_Controller
{


    /**
     * 
     * 
     * CREATED CONFIGS
     * 
     */
    public static function zippy_booking_create_configs(WP_REST_Request $request)
    {

        // Rules
        $required_fields = [
            "default_booking_status" => ["required" => true, "data_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_STATUS_PENDING, ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED, ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD, ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED, ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING, ZIPPY_BOOKING_BOOKING_STATUS_APPROVE]],
            "store_email" => ["required" => true, "data_type" => "email"],
            "store_working_time" => ["required" => true, "data_type" => "array"],
        ];

        // Validate Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $store_working_time = $request["store_working_time"];

        // Validate store_working_time
        $required_weekdays = Zippy_Request_Validation::get_weekdays();
        $weekdays = array_keys($store_working_time);

        if (array_diff(array_map('strtolower', $required_weekdays), array_map('strtolower', $weekdays))) {
            return Zippy_Response_Handler::error("store_working_time must include all days from 0 to 6.");
        }

        $working_time_required_fields = [
            "is_open" => ["required" => true, "data_type" => "boolean"],
            "booking_type" => ["required" => true, "data_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "duration" => ["required" => true, "data_type" => "number"],
            "allow_overlap" => ["required" => true, "data_type" => "boolean"],
            "open_at" => ["data_type" => "time"],
            "close_at" => ["data_type" => "time"],
            "extra_time" => ["data_type" => "array"],
        ];

        foreach ($store_working_time as $value) {
            // Validate working_time_required_fields
            $validate = Zippy_Request_Validation::validate_request($working_time_required_fields, $value);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }

            // validate extra_time
            if (!empty($value["extra_time"])) {
                $extra_time = $value["extra_time"];


                // check if is_active exist
                if (empty($extra_time["is_active"])) {
                    return Zippy_Response_Handler::error("is_active is required");
                }


                //check for extra_time has both from and to
                $time_data = $extra_time["data"];
                $validate_from_to = empty(array_filter($time_data, fn($item) => !isset($item["from"], $item["to"])));
                if($validate_from_to == false){
                    return Zippy_Response_Handler::error("extra_time data must have both from and to");
                }
            }

        }

        try {
            //insert data to config table

            global $wpdb;
            $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
            foreach ($store_working_time as $key => $value) {
                $result = $wpdb->get_results("SELECT ID from $table_name WHERE 'weekday' = $key");
                if (!empty($result)) {
                    return Zippy_Response_Handler::error("Config for weekday: $key already exists!");
                }
            }

            $insert_id = [];

            /* Insert to config table */
            foreach ($store_working_time as $key => $value) {
                $data = [
                    'weekday' => $key,
                    'is_open' => sanitize_text_field($value['is_open']),
                    'booking_type' => sanitize_text_field($value['booking_type']),
                    'duration' => sanitize_text_field($value['duration']),
                    'allow_overlap' => sanitize_text_field($value['allow_overlap']),
                    'open_at' => sanitize_text_field($value['open_at']),
                    'close_at' => sanitize_text_field($value['close_at']),
                    'extra_time' => !empty($value['extra_time']) ? json_encode($value['extra_time']) : "",
                    'created_at' => current_time("mysql"),
                    'updated_at' => current_time("mysql"),
                ];

                $insert = $wpdb->insert($table_name, $data);
                $insert_id[] = $wpdb->insert_id;
                if ($insert == 0) {
                    $message = 'Failed to insert data';
                    Zippy_Log_Action::log('create_booking_configs', json_encode($data), 'failure', $message);
                    return Zippy_Response_Handler::error($message);
                }
            }

            // insert store_email, default_booking_status to wp_option
            $options = [
                "store_email",
                "default_booking_status",
            ];

            foreach ($options as $opt) {
                $add = add_option($opt, sanitize_text_field($request[$opt]));
                if (!$add) {
                    return Zippy_Response_Handler::error("Failed to insert $opt");
                }
            }

            Zippy_Log_Action::log('create_booking_configs', json_encode($request), 'Success', 'Success');
            return Zippy_Response_Handler::success($insert_id);

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_booking_configs', json_encode($request), 'failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }



    /**
     * 
     * 
     * UPDATE CONFIGS
     * 
     */
    public static function zippy_booking_update_configs(WP_REST_Request $request)
    {
        // Rules
        $required_fields = [
            "default_booking_status" => ["required" => true, "data_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_STATUS_PENDING, ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED, ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD, ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED, ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING, ZIPPY_BOOKING_BOOKING_STATUS_APPROVE]],
            "store_email" => ["required" => true, "data_type" => "email"],
            "store_working_time" => ["required" => true, "data_type" => "array"],
        ];

        // Validate Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }

        $store_working_time = $request["store_working_time"];

        // Validate store_working_time
        $required_weekdays = Zippy_Request_Validation::get_weekdays();
        $weekdays = array_keys($store_working_time);

        if (array_diff(array_map('strtolower', $required_weekdays), array_map('strtolower', $weekdays))) {
            return Zippy_Response_Handler::error("store_working_time must include all days from 0 to 6.");
        }

        $working_time_required_fields = [
            "is_open" => ["required" => true, "data_type" => "boolean"],
            "booking_type" => ["required" => true, "data_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "duration" => ["required" => true, "data_type" => "number"],
            "allow_overlap" => ["required" => true, "data_type" => "boolean"],
            "open_at" => ["data_type" => "time"],
            "close_at" => ["data_type" => "time"],
            "extra_time" => ["data_type" => "array"],
        ];

        foreach ($store_working_time as $value) {
            // Validate working_time_required_fields
            $validate = Zippy_Request_Validation::validate_request($working_time_required_fields, $value);
            if (!empty($validate)) {
                return Zippy_Response_Handler::error($validate);
            }

            // validate extra_time
            if (!empty($value["extra_time"])) {
                $extra_time = $value["extra_time"];


                // check if is_active exist
                if (empty($extra_time["is_active"])) {
                    return Zippy_Response_Handler::error("is_active is required");
                }


                //check for extra_time has both from and to
                $time_data = $extra_time["data"];
                $validate_from_to = empty(array_filter($time_data, fn($item) => !isset($item["from"], $item["to"])));
                if($validate_from_to == false){
                    return Zippy_Response_Handler::error("extra_time data must have both from and to");
                }
            }

        }

        try {
            global $wpdb;
            $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;


            foreach ($store_working_time as $key => $value) {
                $result = $wpdb->get_results("SELECT COUNT(ID) from $table_name WHERE 'weekday' = $key");
                if (empty($result)) {
                    return Zippy_Response_Handler::error("Config for weekday: $key not found!");
                }
            }

            /* Insert to config table */
            foreach ($store_working_time as $key => $value) {        
                $data = [
                    'is_open' => sanitize_text_field($value['is_open']),
                    'open_at' => sanitize_text_field($value['open_at']),
                    'close_at' => sanitize_text_field($value['close_at']),
                    'booking_type' => sanitize_text_field($value['booking_type']),
                    'duration' => sanitize_text_field($value['duration']),
                    'allow_overlap' => sanitize_text_field($value['allow_overlap']),
                    'extra_time' => !empty($value['extra_time']) ? json_encode($value['extra_time']) : "",
                    'updated_at' => current_time("mysql"),
                ];
                
                $update = $wpdb->update($table_name, $data, ["weekday" => $key]);

                if ($update == 0) {
                    $message = 'Failed to update data';
                    Zippy_Log_Action::log('update_booking_configs', json_encode($request), 'failure', $message);
                    return Zippy_Response_Handler::error($message);
                }
            }


            // insert store_email, default_booking_status to wp_option
            $options = [
                "store_email",
                "default_booking_status",
            ];

            foreach ($options as $opt) {
                $get = get_option($opt);
                if($get !== sanitize_text_field($request[$opt])){
                    $add = update_option($opt, sanitize_text_field($request[$opt]));
                    if (!$add) {
                        return Zippy_Response_Handler::error("Failed to update $opt");
                    }
                }
            }

            Zippy_Log_Action::log('update_booking_configs', json_encode($request), 'Success', 'Success');
            return Zippy_Response_Handler::success($request);

        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('update_booking_configs', json_encode($request), 'failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }




    /** 
     * 
     * 
     * GET CONFIGS
     * 
     * */
    public static function zippy_booking_get_configs(WP_REST_Request $request)
    {
        try {
            global $wpdb;
            $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

            $query = "SELECT * FROM $table_name WHERE 1=1";
            $results = $wpdb->get_results($query);

            $response = [];

            // insert store_email, default_booking_status to wp_option
            $options = [
                "store_email",
                "default_booking_status",
            ];

            foreach ($options as $opt) {
                $get = get_option($opt);
                $response[$opt] = $get;
            }

            if (empty($results)) {
                $message = ZIPPY_BOOKING_NOT_FOUND;
                Zippy_Log_Action::log('get_booking_configs', json_encode([]), 'failure', $message);
                return Zippy_Response_Handler::success([], $message);
            }


            foreach ($results as $key => $value) {
                $value->extra_time = !empty($value->extra_time) ? json_decode($value->extra_time) : "";
                $response["store_working_time"][] = $value;
            }


            //Get booking holidays
            $holiday = get_option("zippy_booking_holiday_config");

            $response["holiday"] = !empty($holiday) ? maybe_unserialize($holiday) : [];

            Zippy_Log_Action::log('get_booking_configs', json_encode($response), 'Success', 'Success');
            return Zippy_Response_Handler::success($response);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_booking_configs', json_encode([]), 'failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }
}
