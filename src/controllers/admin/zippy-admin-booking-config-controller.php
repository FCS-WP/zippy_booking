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
        $booking_type = $request["booking_type"];
        $store_email = $request["store_email"];
        $allow_overlap = $request["allow_overlap"];
        $duration = $request["duration"];
        $store_working_time = $request["store_working_time"];
    
        // Rules
        $required_fields = [
            "booking_type" => ["required" => true, "data_type" => "string", "field_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "store_email" => ["required" => true, "data_type" => "email"],
            "allow_overlap" => ["required" => true, "data_type" => "boolean"],
            "store_working_time" => ["required" => true, "data_type" => "array"],
        ];
    
        // Validate Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }
    
        // Validate store_working_time
        $required_weekdays = Zippy_Request_Validation::get_weekdays();
        $weekdays_provided = array_column($store_working_time, 'weekday');
    
        if (array_diff(array_map('strtolower', $required_weekdays), array_map('strtolower', $weekdays_provided))) {
            return Zippy_Response_Handler::error("store_working_time must include all days from Monday to Sunday.");
        }
    
        foreach ($store_working_time as $value) {
            $weekday = $value['weekday'];
            $is_open = $value['is_open'];
            $open_at = $value['open_at'];
            $close_at = $value['close_at'];
    
            if (!in_array(strtolower($weekday), array_map('strtolower', $required_weekdays))) {
                return Zippy_Response_Handler::error("Invalid weekday: $weekday");
            }
    
            if ($is_open == 1) {
                if (empty($open_at) || empty($close_at)) {
                    return Zippy_Response_Handler::error("open_at and close_at are required when is_open is 1 for $weekday.");
                }
                if (!Zippy_Request_Validation::validate_time($open_at) || !Zippy_Request_Validation::validate_time($close_at)) {
                    return Zippy_Response_Handler::error("open_at and close_at must be in HH:mm:ss format for $weekday.");
                }
            }
        }
    
        // Validate Duration
        if ($booking_type == ZIPPY_BOOKING_BOOKING_TYPE_SINGLE) {
            if (empty($duration)) {
                return Zippy_Response_Handler::error("duration is required when booking_type is " . ZIPPY_BOOKING_BOOKING_TYPE_SINGLE);
            } elseif (!is_numeric($duration) || $duration <= 0) {
                return Zippy_Response_Handler::error("duration must be a positive number.");
            }
        }
    
        try {
            /* Insert */
            global $wpdb;
            $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;
    
            $result = $wpdb->get_results("SELECT * from $table_name");
    
            if (!empty($result)) {
                return Zippy_Response_Handler::error("Configs already exists!");
            }
    
            $data = [
                'booking_type' => $booking_type,
                'duration' => $duration,
                'store_email' => $store_email,
                'allow_overlap' => $allow_overlap,
                'store_working_time' => json_encode($store_working_time),
            ];
    
            $insert = $wpdb->insert($table_name, $data);
    
            if (!$insert) {
                $message = 'Failed to insert data';
                Zippy_Log_Action::log('create_booking_configs', json_encode($data), 'failure', $message);
                return Zippy_Response_Handler::error($message);
            }
    
            // Retrieve the ID of the inserted record
            $config_id = $wpdb->insert_id;
    
            Zippy_Log_Action::log('create_booking_configs', json_encode($data), 'Success', 'Success');
    
            // Add the ID to the response data
            $data['id'] = $config_id;
    
            return Zippy_Response_Handler::success($data);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('create_booking_configs', json_encode($data), 'failure', $message);
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


        $booking_id = $request["id"];
        $booking_type = $request["booking_type"];
        $store_email = $request["store_email"];
        $allow_overlap = $request["allow_overlap"];
        $duration = $request["duration"];
        $store_working_time = $request["store_working_time"];

        /* Rules */
        $required_fields = [
            "id" => ["required" => true, "data_type" => "number"],
            "booking_type" => ["required" => true, "data_type" => "string", "field_type" => "range", "allowed_values" => [ZIPPY_BOOKING_BOOKING_TYPE_SINGLE, ZIPPY_BOOKING_BOOKING_TYPE_MULTIPLE]],
            "store_email" => ["required" => true, "data_type" => "email"],
            "allow_overlap" => ["data_type" => "boolean"],
            "store_working_time" => ["required" => true, "data_type" => "array"],
        ];


        // Validate request fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);

        if (!empty($validate)) {
            return Zippy_Response_Handler::error($validate);
        }


        // Validate store_working_time
        $required_weekdays = Zippy_Request_Validation::get_weekdays();
        $weekdays_provided = array_column($store_working_time, 'weekday');

        if (array_diff(array_map('strtolower', $required_weekdays), array_map('strtolower', $weekdays_provided))) {
            return Zippy_Response_Handler::error("store_working_time must include all days from Monday to Sunday.");
        }

        foreach ($store_working_time as $value) {
            $weekday = $value['weekday'];
            $is_open = $value['is_open'];
            $open_at = $value['open_at'];
            $close_at = $value['close_at'];

            if (!in_array(strtolower($weekday), array_map('strtolower', $required_weekdays))) {
                return Zippy_Response_Handler::error("Invalid weekday: $weekday");
            }

            if ($is_open == 1) {
                if (empty($open_at) || empty($close_at)) {
                    return Zippy_Response_Handler::error("open_at and close_at are required when is_open is 1 for $weekday.");
                }
                if (!Zippy_Request_Validation::validate_time($open_at) || !Zippy_Request_Validation::validate_time($close_at)) {
                    return Zippy_Response_Handler::error("open_at and close_at must be time in format H:i:s for $weekday.");
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

        try {
            /* Update */
            global $wpdb;
            $table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

            $result = $wpdb->get_results("SELECT * from $table_name WHERE id=$booking_id");
            if (empty($result)) {
                return Zippy_Response_Handler::error(ZIPPY_BOOKING_NOT_FOUND);
            }

            $data = [
                'booking_type' => $booking_type,
                'duration'=> $duration,
                'store_email' => $store_email,
                'allow_overlap' => $allow_overlap,
                'store_working_time' => json_encode($store_working_time),
            ];

            $update = $wpdb->update($table_name, $data, ["id" => $booking_id]);
            $log_status = $update ? 'Success' : 'failure';
            $log_message = $update ? 'Success' : 'Failed to update data';

            Zippy_Log_Action::log('update_booking_configs', json_encode($data), $log_status, $log_message);

            if ($update == 0) {
                return Zippy_Response_Handler::error("Failed to update data");
            }

            return Zippy_Response_Handler::success($data);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('update_booking_configs', json_encode($data), 'failure', $message);
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

            if (empty($results)) {
                $message = ZIPPY_BOOKING_NOT_FOUND;
                Zippy_Log_Action::log('get_booking_configs', json_encode([]), 'failure', $message);
                return Zippy_Response_Handler::success([], $message);
            }

            $data = $results[0];

            $data->allow_overlap = 0 ? "F" : "T";

            if (!empty($data->store_working_time)) {
                $data->store_working_time = json_decode($data->store_working_time);
            }

            Zippy_Log_Action::log('get_booking_configs', json_encode($data), 'Success', 'Success');
            return Zippy_Response_Handler::success($data);
        } catch (\Throwable $th) {
            $message = $th->getMessage();
            Zippy_Log_Action::log('get_booking_configs', json_encode([]), 'failure', $message);
            return Zippy_Response_Handler::error($message);
        }
    }
}
