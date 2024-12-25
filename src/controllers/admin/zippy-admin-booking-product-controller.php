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



class Zippy_Admin_Booking_Product_Controller
{
    public static function get_products(WP_REST_Request $request)
    {
        try {
            // Rules
            $required_fields = [
                "keyword"                => ["required" => true, "data_type" => "string"],
                "type"                   => ["required" => true, "data_type" => "range", "allowed_values" => ["product", "category"]],
            ];
            
            // Validate Request Fields
            $validate = Zippy_Request_Validation::validate_request($required_fields, $request);
            if(!empty($validate)){
                return Zippy_Response_Handler::error($validate);
            }

            $type = sanitize_text_field($request["type"]);
            $keyword = sanitize_text_field($request["keyword"]);
            $product = null;
            
            $limit = 10;

            global $wpdb;

            $response = [];

            if($type == "product"){
                // Product    
                $sql = "
                    SELECT DISTINCT p.ID, p.post_title, pm.meta_value as sku 
                    FROM {$wpdb->posts} p
                    LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_sku'
                    WHERE p.post_type = 'product' 
                    AND p.post_status = 'publish'
                    AND (p.ID = %d OR pm.meta_value LIKE %s OR p.post_title LIKE %s)
                    LIMIT %d
                ";
            
                $results = $wpdb->get_results($wpdb->prepare(
                    $sql,
                    $keyword,
                    '%' . $wpdb->esc_like($keyword) . '%',
                    '%' . $wpdb->esc_like($keyword) . '%',
                    $limit
                ));
            
            
                if (!empty($results)) {
                    foreach ($results as $result) {
                        $product = wc_get_product($result->ID);
                        if ($product) {
                            $response[] = [
                                'id' => $product->get_id(),
                                'name' => $product->get_name()
                            ];
                        }
                    }
                }
                
            } else {
                // Category
                $sql = "
                    SELECT DISTINCT t.term_id, t.name, t.slug
                    FROM {$wpdb->terms} t
                    INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
                    WHERE tt.taxonomy = 'product_cat'
                    AND (t.term_id = %d OR t.slug LIKE %s OR t.name LIKE %s)
                    LIMIT %d
                ";
                
                $results = $wpdb->get_results($wpdb->prepare(
                    $sql,
                    $keyword,
                    '%' . $wpdb->esc_like($keyword) . '%',
                    '%' . $wpdb->esc_like($keyword) . '%',
                    $limit
                ));

                if (!empty($results)) {
                    foreach ($results as $result) {
                        $response[] = [
                            'id' => $result->term_id,
                            'name' => $result->name,
                        ];
                    }
                }
            }

            // return results
            $message = empty($response) ?  ZIPPY_BOOKING_NOT_FOUND : ZIPPY_BOOKING_SUCCESS;
            return Zippy_Response_Handler::success($response, $message);

        } catch (Exception $e) {
            return Zippy_Response_Handler::error($e->getMessage());
        }
    }
}