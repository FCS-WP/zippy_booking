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



class Zippy_Admin_Booking_Controller
{
    public static function get_booking_list_of_a_product(WP_REST_Request $request)
    {
        global $wpdb;
        $table_name = ZIPPY_BOOKING_TABLE_NAME;
        $data = [];

        $query_param = [
            "product_id" => sanitize_text_field($request->get_param('product_id')),
            "booking_status" => sanitize_text_field($request->get_param('booking_status')),
            "email" => sanitize_text_field($request->get_param('email')),
            "user_id" => sanitize_text_field($request->get_param('user_id')),
        ];

        $limit = $request->get_param('limit');
        $offset = $request->get_param('offset');


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
        $booking_end_date = sanitize_text_field($request->get_param('booking_end_date'));

        if($booking_end_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_end_date) <= %s ", $booking_end_date);
        }

        if($booking_start_date != ""){
            $query .= $wpdb->prepare(" AND DATE(booking_start_date) >= %s ", $booking_start_date);
        }

        if(!empty($limit)){
            $query .= $wpdb->prepare(" LIMIT %d ", $limit);
        }

        if(!empty($offset)){
            if(empty($limit)){
                return Zippy_Response_Handler::error('limit is required');
            }
            $query .= $wpdb->prepare(" OFFSET %d ", $offset);
        }

        $results = $wpdb->get_results($query);

        if (empty($results)) {
            return Zippy_Response_Handler::error('No Booking Found.');
        }


        // Prepare Data
        $data["bookings"] = $results;
        $data["count"] = count($results);
        $data["total_count"] = $total_count;


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


        $pending_items = array_filter($total, function($item) {
            return $item->booking_status == ZIPPY_BOOKING_BOOKING_STATUS_PENDING;
        });
        $onhold_items = array_filter($total, function($item) {
            return $item->booking_status == ZIPPY_BOOKING_BOOKING_STATUS_ONHOLD;
        });
        $completed_items = array_filter($total, function($item) {
            return $item->booking_status == ZIPPY_BOOKING_BOOKING_STATUS_COMPLETED;
        });
        $processing_items = array_filter($total, function($item) {
            return $item->booking_status == ZIPPY_BOOKING_BOOKING_STATUS_PROCESSING;
        });
        $cancelled_items = array_filter($total, function($item) {
            return $item->booking_status == ZIPPY_BOOKING_BOOKING_STATUS_CANCELLED;
        });
        $pending_count = count($pending_items);
        $on_hold_count = count($onhold_items);
        $completed_count = count($completed_items);
        $processing_count = count($processing_items);
        $cancelled_count = count($cancelled_items);

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