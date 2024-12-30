<?php

/**
 * Admin Booking Controller
 *
 *
 */

namespace Zippy_Booking\Src\Controllers\Admin;

use WP_REST_Request;
use Zippy_Booking\Src\App\Zippy_Response_Handler;
use Zippy_Booking\Src\App\Models\Zippy_Request_Validation;

defined('ABSPATH') or die();



class Zippy_Admin_Booking_Booking_Controller
{
    public static function get_booking_list_of_a_product(WP_REST_Request $request)
    {
        
        // Rules
        $required_fields = [
            "product_id" => ["data_type" => "number"],
            "email" => ["data_type" => "email"],
            "user_id" => ["data_type" => "number"],
            "order_id" => ["data_type" => "number"],
            "booking_status" => ["data_type" => "string"],
            "booking_start_date" => ["data_type" => "date"],
            "booking_start_time" => ["data_type" => "time"],
            "booking_end_date" => ["data_type" => "date"],
            "booking_end_time" => ["data_type" => "time"],
            "limit" => ["data_type" => "number"],
            "offset" => ["data_type" => "number"],
        ];
        
        // Validate Request Fields
        $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
        if(!empty($validate)){
            return Zippy_Response_Handler::error($validate);
        }

        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;
        $data = [];

        $query_param = [
            "product_id" => sanitize_text_field($request->get_param('product_id')),
            "email" => sanitize_text_field($request->get_param('email')),
            "user_id" => sanitize_text_field($request->get_param('user_id')),
            "order_id" => sanitize_text_field($request->get_param('user_id')),
            "booking_status" => sanitize_text_field($request->get_param('booking_status')),
        ];

        $limit = intval($request->get_param('limit'));
        $offset = intval($request->get_param('offset'));

        // Count total
        $total_query = "SELECT ID FROM $table_name WHERE 1=1";

        $total_count = count($wpdb->get_results($total_query));
    
        

        // Query on params
        $query = "SELECT * FROM $table_name WHERE 1=1";
        
        foreach ($query_param as $key => $value) {
            if ($value !== "" && $value !== null) {
                $query .= $wpdb->prepare(" AND $key = %s ", $value);
            }
        }

        $booking_start_date = sanitize_text_field($request->get_param('booking_start_date'));
        $booking_start_time = sanitize_text_field($request->get_param('booking_start_time'));
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));
        $booking_end_time = sanitize_text_field($request->get_param('booking_end_time'));

        if($booking_end_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_end_date) <= %s ", $booking_end_date);
        }

        if($booking_end_time != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_end_time) <= %s ", $booking_end_time);
        }

        if($booking_start_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_start_date) >= %s ", $booking_start_date);
        }
        
        if($booking_start_time != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_start_time) >= %s ", $booking_start_time);
        }

        // Add limit and offset
        if (!empty($limit)) {
            $query .= $wpdb->prepare(" LIMIT %d ", $limit);
            if (!empty($offset)) {
                $query .= $wpdb->prepare(" OFFSET %d ", $offset);
            }
        } elseif (!empty($offset)) {
            return Zippy_Response_Handler::error('limit is required');
        }

        $results = $wpdb->get_results($query);

        if (empty($results)) {
            return Zippy_Response_Handler::success([], ZIPPY_BOOKING_NOT_FOUND);
        }

        $products = [];

        foreach ($results as $res) {
            $product_id = $res->product_id;
            $product_name = wc_get_product($product_id)->get_name();
            $res->product_name = $product_name;
            $products[] = $res;
        }


        // Booking Configs
        $config_table_name = ZIPPY_BOOKING_CONFIG_TABLE_NAME;

        $config_query = "SELECT booking_type, duration, store_email, allow_overlap, weekdays, open_at, close_at FROM $config_table_name WHERE 1=1";
        $config_results = $wpdb->get_results($config_query);

        $configs = $config_results[0];
        
        !empty($configs->weekdays) ? $configs->weekdays = unserialize($configs->weekdays) : $configs->weekdays;

        // Prepare Data
        $data["bookings"] = $products;
        $data["count"] = count($results);
        $data["total_count"] = $total_count;
        $data["configs"] = $configs;

        return Zippy_Response_Handler::success($data);

    }


    /* Booking Stats */
    public static function get_booking_stats(WP_REST_Request $request){
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;


        // Count total
        $total_query = "SELECT ID, booking_status FROM $table_name WHERE 1=1";
        $total = $wpdb->get_results($total_query);
        $total_count = count($total);

        $pending_count = 0;
        $on_hold_count = 0;
        $completed_count = 0;
        $processing_count = 0;
        $cancelled_count = 0;

        // Count statuses in a single loop
        foreach ($total as $item) {
            switch ($item->booking_status) {
                case ZIPPY_BOOKING_BOOKING_STATUS_PENDING:
                    $pending_count++;
                    break;
                case ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD:
                    $on_hold_count++;
                    break;
                case ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED:
                    $completed_count++;
                    break;
                case ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING:
                    $processing_count++;
                    break;
                case ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED:
                    $cancelled_count++;
                    break;
            }
        }

        // Prepare Data
        $data = [
            "total_count" => $total_count,
            "pending_count" => $pending_count,
            "on_hold_count" => $on_hold_count,
            "completed_count" => $completed_count,
            "processing_count" => $processing_count,
            "cancelled_count" => $cancelled_count,
        ];
        
        return Zippy_Response_Handler::success($data);
    }
}